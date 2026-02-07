/**
 * Script para regenerar usuário no Supabase Auth e atualizar todas as referências
 * 
 * Uso:
 *   npx tsx scripts/regenerate-user.ts <email>
 * 
 * Exemplo:
 *   npx tsx scripts/regenerate-user.ts jose.neto.fc@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente
// Tentar carregar do api/.env primeiro, depois da raiz
const apiEnvPath = join(__dirname, '..', 'api', '.env');
const rootEnvPath = join(__dirname, '..', '.env');

if (require('fs').existsSync(apiEnvPath)) {
  dotenv.config({ path: apiEnvPath });
} else if (require('fs').existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function regenerateUser(email: string) {
  const emailLower = email.toLowerCase().trim();
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔄 REGENERANDO USUÁRIO');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Email: ${emailLower}`);
  console.log('');

  // 1. Buscar profile pelo email
  console.log('📋 [1] Buscando profile pelo email...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', emailLower)
    .single();

  if (profileError || !profile) {
    console.error('❌ Profile não encontrado:', profileError?.message);
    return;
  }

  console.log('✅ Profile encontrado:');
  console.log(`   ID: ${profile.id}`);
  console.log(`   User ID (atual): ${profile.user_id}`);
  console.log(`   Nome: ${profile.name}`);
  console.log(`   Email: ${profile.email}`);
  console.log(`   Role: ${profile.role}`);
  console.log(`   Company ID: ${profile.company_id}`);
  console.log('');

  const oldUserId = profile.user_id;
  let newUserId = oldUserId;

  // 2. Verificar se usuário existe no Auth
  console.log('🔍 [2] Verificando se usuário existe no Supabase Auth...');
  try {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(oldUserId);
    
    if (authError || !authUser?.user) {
      console.log('⚠️ Usuário não encontrado no Auth. Criando novo usuário...');
      
      // Gerar senha temporária
      const crypto = await import('crypto');
      const tempPassword = crypto.randomBytes(16).toString('hex');
      
      // Criar usuário no Auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: emailLower,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: profile.name,
        },
      });

      if (createError || !newUser?.user) {
        console.error('❌ Erro ao criar usuário no Auth:', createError?.message);
        return;
      }

      newUserId = newUser.user.id;
      console.log(`✅ Usuário criado no Auth com ID: ${newUserId}`);
    } else {
      console.log('✅ Usuário já existe no Auth');
      console.log(`   ID: ${authUser.user.id}`);
      console.log(`   Email no Auth: ${authUser.user.email}`);
      
      // Verificar se o email está correto
      if (authUser.user.email?.toLowerCase() !== emailLower) {
        console.log('⚠️ Email no Auth difere do email no profile. Atualizando...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          authUser.user.id,
          { email: emailLower }
        );
        
        if (updateError) {
          console.error('❌ Erro ao atualizar email no Auth:', updateError.message);
        } else {
          console.log('✅ Email atualizado no Auth');
        }
      }
      
      newUserId = authUser.user.id;
    }
  } catch (error: any) {
    console.error('❌ Erro ao verificar/criar usuário no Auth:', error.message);
    return;
  }

  console.log('');

  // 3. Atualizar profile com novo user_id e email (se necessário)
  const needsUpdate = oldUserId !== newUserId || profile.email.toLowerCase() !== emailLower;
  
  if (needsUpdate) {
    console.log('🔄 [3] Atualizando profile...');
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (oldUserId !== newUserId) {
      updateData.user_id = newUserId;
    }
    
    if (profile.email.toLowerCase() !== emailLower) {
      updateData.email = emailLower;
      console.log(`   Atualizando email: "${profile.email}" → "${emailLower}"`);
    }
    
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id);

    if (updateProfileError) {
      console.error('❌ Erro ao atualizar profile:', updateProfileError.message);
      return;
    }
    
    console.log('✅ Profile atualizado');
    console.log('');
  } else {
    console.log('✅ [3] Profile já está atualizado, nenhuma mudança necessária');
    console.log('');
  }

  // 4. Atualizar todas as tabelas que referenciam o user_id antigo
  console.log('🔄 [4] Atualizando referências em todas as tabelas...');
  console.log(`   User ID antigo: ${oldUserId}`);
  console.log(`   User ID novo: ${newUserId}`);
  console.log('');

  if (oldUserId !== newUserId) {
    const tables = [
      { name: 'clients', columns: ['created_by'] },
      { name: 'projects', columns: ['created_by'] },
      { name: 'suppliers', columns: ['created_by'] },
      { name: 'labor', columns: ['created_by'] },
      { name: 'estimates', columns: ['created_by', 'approved_by'] },
      { name: 'financial_entries', columns: ['created_by', 'approved_by', 'partner_responsible_id'] },
      { name: 'financial_exits', columns: ['created_by', 'approved_by'] },
      { name: 'approval_history', columns: ['created_by'] },
    ];

    let totalUpdated = 0;

    for (const table of tables) {
      for (const column of table.columns) {
        // Contar registros a atualizar
        const { count } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true })
          .eq(column, oldUserId);

        if (count && count > 0) {
          console.log(`   📝 ${table.name}.${column}: ${count} registro(s) encontrado(s)`);
          
          // Atualizar registros
          const { error: updateError, count: updatedCount } = await supabase
            .from(table.name)
            .update({ [column]: newUserId })
            .eq(column, oldUserId)
            .select();

          if (updateError) {
            console.error(`   ❌ Erro ao atualizar ${table.name}.${column}:`, updateError.message);
          } else {
            console.log(`   ✅ ${table.name}.${column}: ${updatedCount || count} registro(s) atualizado(s)`);
            totalUpdated += count;
          }
        }
      }
    }

    console.log('');
    console.log(`✅ Total de registros atualizados: ${totalUpdated}`);
  } else {
    console.log('✅ Nenhuma atualização necessária (user_id não mudou)');
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ PROCESSO CONCLUÍDO COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Email: ${emailLower}`);
  console.log(`User ID: ${newUserId}`);
  console.log('');
  console.log('📧 O usuário pode agora solicitar recuperação de senha.');
  console.log('═══════════════════════════════════════════════════════');
}

// Executar script
const email = process.argv[2];

if (!email) {
  console.error('❌ Email é obrigatório');
  console.log('');
  console.log('Uso: npx tsx scripts/regenerate-user.ts <email>');
  console.log('');
  console.log('Exemplo:');
  console.log('  npx tsx scripts/regenerate-user.ts jose.neto.fc@gmail.com');
  process.exit(1);
}

regenerateUser(email).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
