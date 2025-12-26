// ============================================
// NETADMIN V12 - CONFIGURACIÓN DE SUPABASE
// Cliente de conexión a PostgreSQL con Auth
// ============================================

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Construir URL desde projectId
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = publicAnonKey;

// Crear cliente de Supabase para autenticación y datos
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'netadmin-auth-token',
  }
});