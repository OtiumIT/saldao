import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../types/worker-env.js';
import { sendEmail, createResetPasswordEmail, createWelcomeEmail } from '../services/email.service.worker.js';
import { getSupabaseClient } from '../lib/auth-helper.worker.js';
import { getEnv } from '../config/env.worker.js';
import { logger } from '../lib/logger.js';
import { validateInput, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../lib/validators.js';
import { isFixedAuthEnabled, verifyFixedCredentials, createFixedAuthToken, getFixedProfileFromToken } from '../lib/fixed-auth.js';

type WorkerContext = { Bindings: Env };

export const authRoutes = new Hono<WorkerContext>();

// Login
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();

    const validation = validateInput(loginSchema, body);
    if (!validation.success) {
      return c.json({ error: validation.error }, 400);
    }

    const { email, password } = validation.data;

    // Autenticação fixa (por hora, sem Supabase)
    if (isFixedAuthEnabled(c.env)) {
      if (!verifyFixedCredentials(c.env, email, password)) {
        return c.json({ error: 'Credenciais inválidas' }, 401);
      }
      const accessToken = createFixedAuthToken(c.env);
      const config = getEnv(c.env).fixedAuth;
      return c.json({
        access_token: accessToken,
        refresh_token: accessToken,
        user: {
          id: 'fixed-user',
          email: config.email,
          name: 'Admin',
        },
      });
    }

    // Autenticar com Supabase Auth
    // NOTA: O tempo de expiração do JWT token é configurado no Supabase Dashboard:
    // Settings → Auth → JWT Settings → JWT Expiry (configurado para 86400 segundos = 24 horas)
    const supabase = getSupabaseClient(c.env);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      logger.warn('Login failed', { email });
      return c.json({ error: 'Credenciais inválidas' }, 401);
    }
    
    logger.info('Login successful', { userId: authData.user.id });

    // Buscar perfil do usuário na tabela profiles
    let profile = null;
    let profileError = null;
    
    // Usar função SQL que bypassa RLS para evitar recursão infinita
    try {
      const { data, error } = await supabase.rpc('get_profile_by_user_id', {
        target_user_id: authData.user.id
      });
      
      if (!error && data && data.length > 0) {
        profile = data[0];
      } else {
        profileError = error;
      }
    } catch (err) {
      profileError = err as Error;
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.debug('Error fetching profile by user_id', { error: message });
    }
    
    // Fallback: buscar pelo email
    if (!profile) {
      try {
        const { data, error } = await supabase.rpc('get_profile_by_email', {
          target_email: email.toLowerCase().trim()
        });
        
        if (!error && data && data.length > 0) {
          profile = data[0];
          
          // Atualizar o user_id no profile se necessário
          if (profile.user_id !== authData.user.id) {
            const { error: updateError } = await supabase.rpc('update_profile_user_id', {
              profile_id: profile.id,
              new_user_id: authData.user.id
            });
            
            if (updateError) {
              logger.error('Failed to update user_id in profile', updateError);
            } else {
              profile.user_id = authData.user.id;
            }
          }
        } else {
          profileError = error || profileError;
        }
      } catch (err) {
        profileError = err as Error;
        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.debug('Error fetching profile by email', { error: message });
      }
    }

    if (profileError || !profile) {
      logger.warn('Profile not found, attempting auto-create', { userId: authData.user.id });
      
      // Tentar criar o perfil automaticamente
      let defaultCompanyId = null;
      if (!authData.user.user_metadata?.company_id) {
        const { data: companies } = await supabase
          .from('companies')
          .select('id')
          .eq('is_active', true)
          .limit(1)
          .single();
        
        if (companies) {
          defaultCompanyId = companies.id;
        }
      } else {
        defaultCompanyId = authData.user.user_metadata.company_id;
      }
      
      try {
        const { data, error } = await supabase.rpc('create_profile', {
          p_id: authData.user.id,
          p_user_id: authData.user.id,
          p_email: email.toLowerCase().trim(),
          p_name: authData.user.user_metadata?.name || email.split('@')[0],
          p_role: authData.user.user_metadata?.role || 'partner',
          p_company_id: defaultCompanyId
        });
        
        if (!error && data && data.length > 0) {
          profile = data[0];
          logger.info('Profile auto-created', { userId: authData.user.id });
        } else {
          logger.error('Failed to auto-create profile', error);
          return c.json({ 
            error: 'Perfil do usuário não encontrado e não foi possível criar automaticamente. Contate o administrador.' 
          }, 404);
        }
      } catch (err) {
        logger.error('Exception creating profile', err);
        return c.json({ 
          error: 'Perfil do usuário não encontrado e não foi possível criar automaticamente. Contate o administrador.' 
        }, 404);
      }
    }

    // Retornar tokens e dados do usuário
    return c.json({
      access_token: authData.session?.access_token || '',
      refresh_token: authData.session?.refresh_token || '',
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
      },
    });
  } catch (error) {
    logger.error('Login error', error);
    return c.json({ error: 'Erro ao fazer login' }, 500);
  }
});

// Obter perfil do usuário autenticado
authRoutes.get('/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');

    // Perfil fixo (JWT)
    const fixedProfile = getFixedProfileFromToken(c.env, token);
    if (fixedProfile) {
      return c.json(fixedProfile);
    }

    // Verificar token e obter usuário (Supabase)
    const supabase = getSupabaseClient(c.env);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    // Buscar perfil do usuário usando função RPC (bypassa RLS)
    let profile = null;
    
    // Tentar buscar por user_id
    const { data: profileData, error: rpcError } = await supabase.rpc('get_profile_by_user_id', {
      target_user_id: user.id
    });
    
    if (!rpcError && profileData && profileData.length > 0) {
      profile = profileData[0];
    }
    
    // Fallback: buscar por email
    if (!profile && user.email) {
      const { data: profileByEmail } = await supabase.rpc('get_profile_by_email', {
        target_email: user.email
      });
      
      if (profileByEmail && profileByEmail.length > 0) {
        profile = profileByEmail[0];
      }
    }

    if (!profile) {
      return c.json({ error: 'Perfil não encontrado' }, 404);
    }

    return c.json(profile);
  } catch (error) {
    logger.error('Profile error', error);
    return c.json({ error: 'Erro ao buscar perfil' }, 500);
  }
});

// Logout
authRoutes.post('/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    // Fazer logout no Supabase
    const supabase = getSupabaseClient(c.env);
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.warn('Logout error', { error });
    }

    return c.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    logger.error('Logout error', error);
    return c.json({ error: 'Erro ao fazer logout' }, 500);
  }
});

// Criar usuário (apenas para admins)
authRoutes.post('/create-user', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const envConfig = getEnv(c.env);

    // Verificar se o usuário está autenticado e tem permissão
    const supabase = getSupabaseClient(c.env);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return c.json({ error: 'Token inválido' }, 401);
    }

    // Buscar perfil do usuário atual
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !currentProfile) {
      return c.json({ error: 'Perfil não encontrado' }, 404);
    }

    // Verificar se o usuário pode criar outros usuários
    if (!currentProfile.can_create_users) {
      return c.json({ error: 'Você não tem permissão para criar usuários' }, 403);
    }

    const { name, email, password, role, can_create_users } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: 'Nome, email e senha são obrigatórios' }, 400);
    }

    // Criar usuário no Supabase Auth
    const supabaseAdmin = getSupabaseClient(c.env);
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !newUser.user) {
      return c.json({ error: 'Erro ao criar usuário: ' + createError?.message }, 400);
    }

    // Criar perfil na tabela profiles
    const { data: newProfile, error: profileCreateError } = await supabase
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        name,
        email,
        role: role || 'partner',
        company_id: currentProfile.company_id,
        can_create_users: can_create_users || false,
      })
      .select()
      .single();

    if (profileCreateError || !newProfile) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return c.json({ error: 'Erro ao criar perfil do usuário' }, 500);
    }

    // Enviar email de boas-vindas se configurado
    const sendConfirmation = envConfig.email.sendConfirmation;
    if (sendConfirmation) {
      try {
        let resetPasswordLink: string | undefined;
        try {
          const linkResult = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: email.toLowerCase().trim(),
          });
          
          if (!linkResult.error && linkResult.data?.properties?.action_link) {
            const supabaseLink = linkResult.data.properties.action_link;
            const tokenMatch = supabaseLink.match(/[?&#]token=([^&#]+)/) 
              || supabaseLink.match(/[?&#]access_token=([^&#]+)/);
            
            if (tokenMatch) {
              const extractedToken = decodeURIComponent(tokenMatch[1]);
              resetPasswordLink = `${envConfig.server.frontendUrl}/reset-password?token=${encodeURIComponent(extractedToken)}`;
            } else {
              const properties = linkResult.data.properties as { hashed_token?: string; token?: string } | undefined;
              const directToken = properties?.hashed_token || properties?.token;
              if (directToken) {
                resetPasswordLink = `${envConfig.server.frontendUrl}/reset-password?token=${encodeURIComponent(directToken)}`;
              }
            }
          }
        } catch (linkError) {
          logger.warn('Could not generate reset password link for welcome email', { error: linkError });
        }
        
        await sendEmail({
          to: email.toLowerCase().trim(),
          subject: 'Bem-vindo ao Sistema de Gestão Financeira',
          html: createWelcomeEmail(name, email, resetPasswordLink),
        }, envConfig);
        logger.info('Welcome email sent', { email });
      } catch (emailError) {
        logger.error('Error sending welcome email', emailError);
      }
    }

    return c.json(newProfile, 201);
  } catch (error) {
    logger.error('Create user error', error);
    return c.json({ error: 'Erro ao criar usuário' }, 500);
  }
});

// Esqueci minha senha
authRoutes.post('/forgot-password', async (c) => {
  try {
    const body = await c.req.json();
    const envConfig = getEnv(c.env);

    // Validate input
    const validation = validateInput(forgotPasswordSchema, body);
    if (!validation.success) {
      return c.json({ error: validation.error }, 400);
    }

    const { email } = validation.data;

    const supabase = getSupabaseClient(c.env);
    const frontendUrl = envConfig.server.frontendUrl;
    const emailLower = email.toLowerCase().trim();

    // Verificar se o usuário existe na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email, user_id')
      .eq('email', emailLower)
      .single();

    if (profileError || !profile) {
      return c.json({ message: 'Se o email existir, você receberá um link de recuperação' });
    }

    // Verificar se o usuário existe no Supabase Auth
    let authUser = null;
    
    if (profile.user_id) {
      try {
        const { data, error } = await supabase.auth.admin.getUserById(profile.user_id);
        if (!error && data?.user) {
          authUser = data.user;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.debug('Error fetching user by id', { error: message });
      }
    }
    
    if (!authUser) {
      try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (!error && users) {
          authUser = users.find(u => 
            u.id === profile.user_id || u.email?.toLowerCase() === emailLower
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.debug('Error listing users', { error: message });
      }
    }
    
    try {
      let resetLink = '';
      
      let linkResult = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: emailLower,
      });
      
      if (linkResult.error && linkResult.error.code === 'user_not_found') {
        logger.debug('User not found in Auth, attempting to create', { email: emailLower });
        
        const randomBytes = new Uint8Array(16);
        crypto.getRandomValues(randomBytes);
        const tempPassword = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        
        const { data: createUserData, error: createUserError } = await supabase.auth.admin.createUser({
          email: emailLower,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            name: profile.name,
          },
        });
        
        if (!createUserError && createUserData?.user) {
          if (profile.user_id !== createUserData.user.id) {
            await supabase
              .from('profiles')
              .update({ user_id: createUserData.user.id })
              .eq('id', profile.id);
          }
          
          linkResult = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email: emailLower,
          });
        }
      }
      
      if (!linkResult.error && linkResult.data) {
        const supabaseLink = linkResult.data.properties?.action_link;
        
        if (supabaseLink) {
          const tokenMatch = supabaseLink.match(/[?&#]token=([^&#]+)/) 
            || supabaseLink.match(/[?&#]access_token=([^&#]+)/);
          
          if (tokenMatch) {
            const extractedToken = decodeURIComponent(tokenMatch[1]);
            resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(extractedToken)}`;
          } else {
            const propsInLink = linkResult.data.properties as { hashed_token?: string; token?: string } | undefined;
            const directToken = propsInLink?.hashed_token || propsInLink?.token;
            
            if (directToken) {
              resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(directToken)}`;
            } else {
              resetLink = supabaseLink;
            }
          }
        } else {
          const propsFallback = linkResult.data.properties as { hashed_token?: string; token?: string } | undefined;
          const directToken = propsFallback?.hashed_token || propsFallback?.token;
          
          if (directToken) {
            resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(directToken)}`;
          } else {
            resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(emailLower)}`;
          }
        }
      } else {
        logger.error('Failed to generate recovery link', linkResult.error);
        resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(emailLower)}`;
      }
      
      try {
        await sendEmail({
          to: emailLower,
          subject: 'Redefinição de Senha - Sistema de Gestão Financeira',
          html: createResetPasswordEmail(resetLink, profile.name),
        }, envConfig);
        
        logger.info('Password reset email sent', { email: emailLower });
        
        await supabase
          .from('profiles')
          .update({ password_reset_requested_at: new Date().toISOString() })
          .eq('email', emailLower);
        
        return c.json({ 
          message: 'Email de recuperação enviado com sucesso. Verifique sua caixa de entrada.',
        });
      } catch (emailErr) {
        logger.error('Failed to send password reset email', emailErr);
        return c.json({ 
          error: 'Não foi possível enviar o email de recuperação. Entre em contato com o administrador.' 
        }, 500);
      }
    } catch (error) {
      logger.error('Error processing password reset', error);
      return c.json({ error: 'Erro ao processar solicitação' }, 500);
    }
  } catch (error) {
    logger.error('Forgot password error', error);
    return c.json({ error: 'Erro ao processar solicitação' }, 500);
  }
});

// Redefinir senha
authRoutes.post('/reset-password', async (c) => {
  try {
    const body = await c.req.json();
    const envConfig = getEnv(c.env);

    // Validate input
    const validation = validateInput(resetPasswordSchema, body);
    if (!validation.success) {
      return c.json({ error: validation.error }, 400);
    }

    const { token, password, email } = validation.data;

    const supabase = getSupabaseClient(c.env);

    if (!token && email) {
      logger.debug('No token provided, attempting to generate new link', { email });
      const emailLower = email.toLowerCase().trim();
      
      try {
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: emailLower,
        });
        
        if (!linkError && linkData?.properties?.action_link) {
          const supabaseLink = linkData.properties.action_link;
          let extractedToken = '';
          
          const tokenMatch = supabaseLink.match(/[?&]token=([^&]+)/);
          if (tokenMatch) {
            extractedToken = decodeURIComponent(tokenMatch[1]);
          } else {
            const accessTokenMatch = supabaseLink.match(/[#&]access_token=([^&]+)/);
            if (accessTokenMatch) {
              extractedToken = decodeURIComponent(accessTokenMatch[1]);
            } else {
              const props = linkData.properties as { hashed_token?: string; token?: string } | undefined;
              extractedToken = props?.hashed_token || props?.token || '';
            }
          }
          
          if (extractedToken) {
            return c.json({ 
              token: extractedToken,
              message: 'Token gerado. Use este token para redefinir a senha.',
            });
          }
        }
        
        logger.warn('Could not extract token from generated link');
        return c.json({ 
          error: 'Não foi possível gerar um novo token. Solicite um novo link de recuperação.',
        }, 400);
      } catch (genError) {
        logger.error('Error generating new token', genError);
        return c.json({ 
          error: 'Não foi possível gerar um novo token. Solicite um novo link de recuperação.',
        }, 400);
      }
    }

    if (!token) {
      return c.json({ error: 'Token é obrigatório' }, 400);
    }

    try {
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });

      if (!verifyError && verifyData.user) {
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          return c.json({ error: 'Erro ao atualizar senha' }, 500);
        }

        await supabase
          .from('profiles')
          .update({ 
            last_password_change: new Date().toISOString(),
            password_reset_requested_at: null,
          })
          .eq('user_id', verifyData.user.id);

        return c.json({ message: 'Senha redefinida com sucesso' });
      }
    } catch (otpError) {
      logger.debug('OTP method failed, trying alternative', { error: otpError });
    }

    try {
      const tempSupabase = createClient(
        envConfig.supabase.url,
        envConfig.supabase.serviceRoleKey,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      const { data: { user }, error: userError } = await tempSupabase.auth.getUser();

      if (userError || !user) {
        return c.json({ error: 'Token inválido ou expirado' }, 400);
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password,
      });

      if (updateError) {
        return c.json({ error: 'Erro ao atualizar senha' }, 500);
      }

      await supabase
        .from('profiles')
        .update({ 
          last_password_change: new Date().toISOString(),
          password_reset_requested_at: null,
        })
        .eq('user_id', user.id);

      return c.json({ message: 'Senha redefinida com sucesso' });
    } catch (altError) {
      logger.error('Error resetting password', altError);
      return c.json({ error: 'Token inválido ou expirado. Solicite um novo link de recuperação.' }, 400);
    }
  } catch (error) {
    logger.error('Reset password error', error);
    return c.json({ error: 'Erro ao redefinir senha' }, 500);
  }
});
