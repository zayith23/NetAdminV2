// ============================================
// NETADMIN V12 - INICIALIZACIÓN DE USUARIOS DE PRUEBA
// Crea usuarios admin y lector en Supabase Auth y KV Store
// ============================================

import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

export async function initTestUsers() {
  console.log('🚀 ========================================');
  console.log('🚀 INICIANDO USUARIOS DE PRUEBA');
  console.log('🚀 ========================================');

  const testUsers = [
    {
      email: 'admin@netadmin.com',
      password: 'admin123',
      nombre: 'Administrador',
      rol: 'admin'
    },
    {
      email: 'lector@netadmin.com',
      password: 'lector123',
      nombre: 'Lector',
      rol: 'lector'
    },
    {
      email: 'juan.rey@netadmin.com',
      password: 'juanrey123',
      nombre: 'Juan Rey',
      rol: 'lector'
    }
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n👤 Procesando usuario: ${user.email}...`);
      
      // Intentar crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: { 
          nombre: user.nombre, 
          rol: user.rol 
        },
        email_confirm: true  // Auto-confirmar email
      });

      if (authError) {
        // Si el error es porque ya existe, obtener el usuario existente
        if (authError.message?.includes('already registered') || 
            authError.message?.includes('already exists') ||
            authError.message?.includes('User already registered') ||
            authError.message?.includes('already been registered')) {
          
          console.log(`   ⚠️  Usuario ya existe en Auth: ${user.email}`);
          
          // Intentar obtener el usuario existente
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
          
          if (!listError && users) {
            const existingUser = users.find(u => u.email === user.email);
            
            if (existingUser) {
              console.log(`   ✅ Usuario encontrado en Auth (ID: ${existingUser.id})`);
              
              // Actualizar/Guardar en KV Store
              await kv.set(`user:${existingUser.id}`, {
                id: existingUser.id,
                email: user.email,
                nombre: user.nombre,
                rol: user.rol,
                created_at: existingUser.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
              console.log(`   ✅ Datos actualizados en KV Store (${user.rol})`);
            }
          }
        } else {
          console.error(`   ❌ Error al crear usuario ${user.email}:`, authError.message);
        }
      } else if (authData?.user) {
        // Usuario creado exitosamente
        console.log(`   ✅ Usuario creado en Auth: ${user.email} (ID: ${authData.user.id})`);
        
        // Guardar datos adicionales en KV Store
        await kv.set(`user:${authData.user.id}`, {
          id: authData.user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        console.log(`   ✅ Datos guardados en KV Store (${user.rol})`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('already registered') || 
          errorMessage.includes('already exists') ||
          errorMessage.includes('User already registered') ||
          errorMessage.includes('already been registered')) {
        console.log(`   ⚠️  Usuario ya existe: ${user.email}`);
      } else {
        console.error(`   ❌ Error al procesar usuario ${user.email}:`, errorMessage);
      }
    }
  }

  console.log('\n✅ ========================================');
  console.log('✅ INICIALIZACIÓN DE USUARIOS COMPLETADA');
  console.log('✅ ========================================');
  console.log('\n📋 CREDENCIALES DISPONIBLES:');
  console.log('   👤 Admin:  admin@netadmin.com / admin123');
  console.log('   👁️  Lector: lector@netadmin.com / lector123');
  console.log('   👤 Juan Rey: juan.rey@netadmin.com / juanrey123');
  console.log('========================================\n');
}