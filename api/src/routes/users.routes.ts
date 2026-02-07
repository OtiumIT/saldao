import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../types/worker-env.js';
import { requireAuth, getSupabaseClient } from '../lib/auth-helper.worker.js';
import { sendEmail, createWelcomeEmail } from '../services/email.service.worker.js';
import { getEnv } from '../config/env.worker.js';
import { logger } from '../lib/logger.js';
import { validateInput, createUserSchema, updateUserSchema } from '../lib/validators.js';

type WorkerContext = { Bindings: Env };

export const usersRoutes = new Hono<WorkerContext>();

// Listar empresas (para super admin escolher ao criar usuário)
usersRoutes.get('/companies', async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;

    const { supabase, profile } = authResult;
    if (!profile.is_super_admin) {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    if (!supabase) {
      return c.json([]);
    }

    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (error) {
      logger.error('Error fetching companies', error);
      return c.json({ error: 'Erro ao buscar empresas' }, 500);
    }

    return c.json(companies || []);
  } catch (error) {
    logger.error('Error listing companies', error);
    return c.json({ error: 'Erro ao listar empresas' }, 500);
  }
});

// Listar usuários
usersRoutes.get('/', async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;

    const { supabase, profile } = authResult;
    if (!profile.can_create_users && !profile.is_super_admin) {
      return c.json({ error: 'Você não tem permissão para listar usuários' }, 403);
    }

    if (!supabase) {
      return c.json([profile]);
    }

    let users;
    let error;

    if (profile.is_super_admin) {
      const result = await supabase.rpc('list_all_users');
      users = result.data;
      error = result.error;
    } else {
      // Usuário normal vê só da sua empresa
      const result = await supabase.rpc('list_users_by_company', {
        target_company_id: profile.company_id
      });
      users = result.data;
      error = result.error;
    }

    if (error) {
      logger.error('Error fetching users', error);
      return c.json({ error: 'Erro ao buscar usuários' }, 500);
    }

    return c.json(users || []);
  } catch (error) {
    logger.error('Error listing users', error);
    return c.json({ error: 'Erro ao listar usuários' }, 500);
  }
});

// Criar usuário
usersRoutes.post('/', async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;

    const { supabase, profile } = authResult;
    if (!supabase) {
      return c.json({ error: 'Gestão de usuários disponível quando Supabase estiver configurado.' }, 503);
    }

    const body = await c.req.json();
    const envConfig = getEnv(c.env);

    if (!profile.can_create_users && !profile.is_super_admin) {
      return c.json({ error: 'Você não tem permissão para criar usuários' }, 403);
    }

    // Validate input
    const validation = validateInput(createUserSchema, body);
    if (!validation.success) {
      return c.json({ error: validation.error }, 400);
    }

    const { name, email, password, role, can_create_users, company_id: requestedCompanyId } = validation.data;
    
    // Determinar company_id: super admin pode escolher, outros usam sua própria empresa
    let targetCompanyId = profile.company_id;
    if (profile.is_super_admin && requestedCompanyId) {
      targetCompanyId = requestedCompanyId;
    } else if (!profile.is_super_admin && !profile.company_id) {
      return c.json({ error: 'Usuário não está associado a uma empresa' }, 400);
    }
    
    // Criar cliente Supabase com SERVICE ROLE KEY (não anon key!)
    // Isso é necessário para criar usuários via admin API
    const supabaseAdmin = getSupabaseClient(c.env);
    
    // Verificar se realmente está usando service role key (não anon key)
    // Service role key geralmente começa com "eyJ" e tem "service_role" no payload JWT
    const keyPrefix = envConfig.supabase.serviceRoleKey.substring(0, 3);
    if (keyPrefix !== 'eyJ') {
      logger.error('Service role key format may be incorrect - should start with eyJ (JWT format)');
    }
    
    // Log para debug (sem expor a chave completa)
    logger.info('Creating user with service role key', {
      hasKey: !!envConfig.supabase.serviceRoleKey,
      keyLength: envConfig.supabase.serviceRoleKey?.length || 0,
      keyPrefix: envConfig.supabase.serviceRoleKey?.substring(0, 10) || 'N/A',
      keyEndsWith: envConfig.supabase.serviceRoleKey?.substring(envConfig.supabase.serviceRoleKey.length - 10) || 'N/A'
    });
    if (!envConfig.supabase.serviceRoleKey || envConfig.supabase.serviceRoleKey.trim() === '') {
      logger.error('SUPABASE_SERVICE_ROLE_KEY is missing or empty');
      return c.json({ 
        error: 'Erro de configuração: SUPABASE_SERVICE_ROLE_KEY não está configurado no Cloudflare Workers' 
      }, 500);
    }
    
    try {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password,
        email_confirm: true,
        user_metadata: {
          name,
        },
      });

      if (createError) {
        logger.error('Error creating user in Supabase Auth', { 
          error: createError.message,
          errorName: createError.name,
          code: createError.status,
          status: createError.status,
          email: email.toLowerCase().trim(),
          hasServiceRoleKey: !!envConfig.supabase.serviceRoleKey,
          serviceRoleKeyLength: envConfig.supabase.serviceRoleKey?.length || 0,
          serviceRoleKeyPrefix: envConfig.supabase.serviceRoleKey?.substring(0, 20) || 'N/A'
        });
        
        // Mensagens de erro mais amigáveis e específicas
        const errorMsg = createError.message.toLowerCase();
        const errorStatus = createError.status;
        
        // Email já existe
        if (errorMsg.includes('already registered') || 
            errorMsg.includes('already exists') ||
            errorMsg.includes('user already registered') ||
            errorMsg.includes('email address is already registered')) {
          return c.json({ error: 'Este email já está cadastrado' }, 400);
        }
        
        // Erro de autenticação/autorização (401/403)
        if (errorStatus === 401 || errorStatus === 403 || 
            errorMsg.includes('unauthorized') ||
            errorMsg.includes('forbidden') ||
            errorMsg.includes('invalid api key') ||
            errorMsg.includes('invalid credentials')) {
          logger.error('Authentication/Authorization error - service role key may be invalid', {
            status: errorStatus,
            message: createError.message
          });
          return c.json({ 
            error: 'Erro de configuração: A chave SUPABASE_SERVICE_ROLE_KEY pode estar inválida ou sem permissões. Verifique no Cloudflare Workers.' 
          }, 500);
        }
        
        // Erro "not allowed" - pode ser várias causas
        if (errorMsg.includes('not allowed') || 
            errorMsg.includes('user not allowed')) {
          logger.error('User not allowed error - possible causes: service role key, auth settings, or email domain restrictions', {
            status: errorStatus,
            message: createError.message,
            hasServiceRoleKey: !!envConfig.supabase.serviceRoleKey
          });
          
          // Verificar se a chave existe antes de sugerir que não está configurada
          if (!envConfig.supabase.serviceRoleKey) {
            return c.json({ 
              error: 'Erro de configuração: SUPABASE_SERVICE_ROLE_KEY não está configurado no Cloudflare Workers' 
            }, 500);
          }
          
          // Se a chave existe, o problema pode ser:
          // 1. Chave inválida
          // 2. Configuração do Supabase Auth (email domain restrictions, etc)
          // 3. Permissões insuficientes
          return c.json({ 
            error: 'Erro ao criar usuário: Verifique as configurações de autenticação no Supabase (domínios permitidos, etc) ou se a service role key tem permissões adequadas.' 
          }, 500);
        }
        
        // Outros erros
        const finalStatus = (errorStatus && errorStatus >= 400 && errorStatus < 500) ? (errorStatus as 400 | 401 | 403 | 404 | 409 | 422) : 400;
        return c.json({ 
          error: 'Erro ao criar usuário: ' + createError.message,
          details: errorStatus ? `Código: ${errorStatus}` : undefined
        }, finalStatus);
      }

      if (!newUser || !newUser.user) {
        logger.error('User creation returned no user data');
        return c.json({ error: 'Erro ao criar usuário: Dados não retornados' }, 500);
      }

      // Aguardar um pouco para o trigger criar o perfil (se existir)
      // O trigger pode criar o perfil automaticamente quando o usuário é criado no Auth
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms de espera
      
      // Verificar se o perfil já existe (pode ter sido criado por trigger ou tentativa anterior)
      let existingProfile = null;
      try {
        const { data: existingProfileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newUser.user.id)
          .maybeSingle();
        
        existingProfile = existingProfileData;
        
        if (existingProfile) {
          logger.info('Profile already exists (likely created by trigger)', {
            profileId: existingProfile.id,
            userId: newUser.user.id
          });
        }
      } catch (checkError) {
        logger.warn('Error checking existing profile', {
          error: checkError instanceof Error ? checkError.message : String(checkError)
        });
      }

      let newProfile = null;

      if (existingProfile) {
        // Perfil já existe - atualizar com os dados fornecidos
        logger.info('Profile already exists, updating instead of creating', { 
          profileId: existingProfile.id,
          userId: newUser.user.id 
        });
        
        const { data: updatedProfileData, error: updateError } = await supabase
          .from('profiles')
          .update({
            user_id: newUser.user.id,
            name: name,
            email: email,
            role: role || 'partner',
            company_id: targetCompanyId,
            can_create_users: can_create_users || false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', newUser.user.id)
          .select()
          .single();

        if (updateError || !updatedProfileData) {
          logger.error('Error updating existing profile', updateError);
          // Não deletar o usuário do Auth se o perfil já existe
          return c.json({ 
            error: 'Erro ao atualizar perfil existente: ' + (updateError?.message || 'Erro desconhecido') 
          }, 500);
        }

        newProfile = updatedProfileData;
      } else {
        // Criar novo perfil usando função RPC
        const { data: newProfileData, error: profileError } = await supabase.rpc('create_user_profile', {
          p_id: newUser.user.id,
          p_user_id: newUser.user.id,
          p_name: name,
          p_email: email,
          p_role: role || 'partner',
          p_company_id: targetCompanyId,
          p_can_create_users: can_create_users || false,
        });

        newProfile = newProfileData && newProfileData.length > 0 ? newProfileData[0] : null;

        if (profileError) {
          // Verificar se é erro de duplicata
          if (profileError.message?.includes('duplicate key') || 
              profileError.message?.includes('unique constraint') ||
              profileError.code === '23505') {
            logger.warn('Profile already exists (duplicate key error), fetching existing profile', {
              userId: newUser.user.id,
              error: profileError.message
            });
            
            // Tentar buscar o perfil existente
            const { data: existingProfileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newUser.user.id)
              .maybeSingle();
            
            if (existingProfileData) {
              newProfile = existingProfileData;
              logger.info('Found existing profile after duplicate key error');
            } else {
              // Se não encontrou, tentar remover o usuário criado
              await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
              logger.error('Profile creation failed with duplicate key but profile not found', profileError);
              return c.json({ 
                error: 'Erro ao criar perfil: perfil duplicado mas não encontrado. Tente novamente.' 
              }, 500);
            }
          } else {
            // Outro tipo de erro - remover usuário criado
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
            logger.error('Error creating profile', profileError);
            return c.json({ 
              error: 'Erro ao criar perfil do usuário: ' + (profileError?.message || 'Erro desconhecido') 
            }, 500);
          }
        }

        if (!newProfile) {
          // Se ainda não tem perfil, tentar remover o usuário criado
          await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
          logger.error('Profile creation returned no profile data');
          return c.json({ error: 'Erro ao criar perfil do usuário: Dados não retornados' }, 500);
        }
      }

      // Enviar email de boas-vindas se configurado
      const sendConfirmation = envConfig.email.sendConfirmation;
      if (sendConfirmation) {
        try {
          // Gerar link de reset de senha para o novo usuário (mais seguro que enviar senha em texto claro)
          let resetPasswordLink: string | undefined;
          try {
            const linkResult = await supabaseAdmin.auth.admin.generateLink({
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
            // Continue sem o link - usuário pode usar "esqueci minha senha"
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
    } catch (authError) {
      logger.error('Error in user creation process', authError);
      return c.json({ error: 'Erro ao criar usuário: ' + (authError instanceof Error ? authError.message : 'Erro desconhecido') }, 500);
    }
  } catch (error) {
    logger.error('Error creating user', error);
    return c.json({ error: 'Erro ao criar usuário' }, 500);
  }
});

// Atualizar usuário
usersRoutes.patch('/:id', async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;

    const { supabase, profile } = authResult;
    if (!supabase) {
      return c.json({ error: 'Gestão de usuários disponível quando Supabase estiver configurado.' }, 503);
    }
    const id = c.req.param('id');
    const body = await c.req.json();

    if (!profile.can_create_users && !profile.is_super_admin) {
      return c.json({ error: 'Você não tem permissão para atualizar usuários' }, 403);
    }

    // Validate ID
    const idValidation = validateInput(z.string().uuid(), id);
    if (!idValidation.success) {
      return c.json({ error: 'ID inválido' }, 400);
    }

    // Validate input
    const validation = validateInput(updateUserSchema, body);
    if (!validation.success) {
      return c.json({ error: validation.error }, 400);
    }

    // Buscar usuário existente
    let existingUser = null;
    if (profile.is_super_admin) {
      // Super admin pode editar qualquer usuário
      const { data } = await supabase.rpc('get_profile_by_user_id', { target_user_id: id });
      existingUser = data && data.length > 0 ? data[0] : null;
    } else {
      // Usuário normal só pode editar da sua empresa
      const { data } = await supabase.rpc('get_user_by_id_and_company', {
        target_id: id,
        target_company_id: profile.company_id
      });
      existingUser = data && data.length > 0 ? data[0] : null;
    }

    if (!existingUser) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    const validatedData = validation.data;

    // Atualizar usando função RPC
    // Se for super admin e tiver company_id, usar update direto (a função RPC não aceita company_id)
    if (profile.is_super_admin && validatedData.company_id) {
      const { data: updatedUserData, error } = await supabase
        .from('profiles')
        .update({
          name: validatedData.name ?? undefined,
          email: validatedData.email ?? undefined,
          role: validatedData.role ?? undefined,
          can_create_users: validatedData.can_create_users ?? undefined,
          company_id: validatedData.company_id,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error || !updatedUserData) {
        logger.error('Error updating user', error);
        return c.json({ error: 'Erro ao atualizar usuário' }, 500);
      }
      
      // Se email mudou, atualizar no Auth também
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const supabaseAdmin = getSupabaseClient(c.env);
        await supabaseAdmin.auth.admin.updateUserById(existingUser.user_id, {
          email: validatedData.email,
        });
      }
      
      return c.json(updatedUserData);
    }

    // Para outros casos, usar função RPC
    const { data: updatedUserData, error } = await supabase.rpc('update_user_profile', {
      p_id: id,
      p_name: validatedData.name ?? null,
      p_email: validatedData.email ?? null,
      p_role: validatedData.role ?? null,
      p_can_create_users: validatedData.can_create_users ?? null
    });

    const updatedUser = updatedUserData && updatedUserData.length > 0 ? updatedUserData[0] : null;

    if (error || !updatedUser) {
      logger.error('Error updating user', error);
      return c.json({ error: 'Erro ao atualizar usuário' }, 500);
    }

    // Se email mudou, atualizar no Auth também
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const supabaseAdmin = getSupabaseClient(c.env);
      await supabaseAdmin.auth.admin.updateUserById(existingUser.user_id, {
        email: validatedData.email,
      });
    }

    return c.json(updatedUser);
  } catch (error) {
    return c.json({ error: 'Erro ao atualizar usuário' }, 500);
  }
});

// Deletar usuário
usersRoutes.delete('/:id', async (c) => {
  try {
    const authResult = await requireAuth(c);
    if (authResult instanceof Response) return authResult;

    const { supabase, profile } = authResult;
    if (!supabase) {
      return c.json({ error: 'Gestão de usuários disponível quando Supabase estiver configurado.' }, 503);
    }
    const id = c.req.param('id');

    if (!profile.can_create_users && !profile.is_super_admin) {
      return c.json({ error: 'Você não tem permissão para deletar usuários' }, 403);
    }

    // Buscar usuário existente
    let existingUser = null;
    if (profile.is_super_admin) {
      // Super admin pode deletar qualquer usuário
      const { data } = await supabase.rpc('get_profile_by_user_id', { target_user_id: id });
      existingUser = data && data.length > 0 ? data[0] : null;
    } else {
      // Usuário normal só pode deletar da sua empresa
      const { data } = await supabase.rpc('get_user_by_id_and_company', {
        target_id: id,
        target_company_id: profile.company_id
      });
      existingUser = data && data.length > 0 ? data[0] : null;
    }

    if (!existingUser) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    // Deletar do Auth primeiro
    const supabaseAdmin = getSupabaseClient(c.env);
    await supabaseAdmin.auth.admin.deleteUser(existingUser.user_id);

    // Deletar perfil usando função RPC
    const { error } = await supabase.rpc('delete_user_profile', {
      target_id: id
    });

    if (error) {
      logger.error('Error deleting user', error);
      return c.json({ error: 'Erro ao deletar usuário' }, 500);
    }

    return c.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    logger.error('Error deleting user', error);
    return c.json({ error: 'Erro ao deletar usuário' }, 500);
  }
});
