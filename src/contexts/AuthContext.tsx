// ============================================
// NETADMIN V13 - CONTEXTO DE AUTENTICACIÓN
// Manejo de usuarios con fallback local (sin requerir Supabase)
// ============================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export type UserRole = 'admin' | 'lector';

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isLector: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// USUARIOS LOCALES (FALLBACK)
// Si Supabase no está disponible, usar estos
// ============================================
const LOCAL_USERS = [
  {
    email: 'admin@netadmin.com',
    password: 'admin123',
    nombre: 'Administrador',
    rol: 'admin' as UserRole
  },
  {
    email: 'lector@netadmin.com',
    password: 'lector123',
    nombre: 'Lector',
    rol: 'lector' as UserRole
  },
  {
    email: 'juan.rey@netadmin.com',
    password: 'juanrey123',
    nombre: 'Juan Rey',
    rol: 'lector' as UserRole
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    // Escuchar cambios de autenticación de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserData(session.user);
      } else {
        // Intentar cargar usuario demo si existe
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          setUser(JSON.parse(demoUser));
        } else {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      // Intentar obtener sesión de Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        // Para desarrollo: usuario demo desde localStorage
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          setUser(JSON.parse(demoUser));
        }
      }
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      
      // Si falla Supabase, intentar cargar demo
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (authUser: any) => {
    try {
      // Primero intentar obtener datos desde el backend (KV Store)
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;

      if (accessToken) {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2/auth/session`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const { user: userData } = await response.json();
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              nombre: userData.nombre,
              rol: userData.rol as UserRole
            });
            return;
          }
        }
      }

      // Si no hay datos en KV, usar metadata del usuario de Auth
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        nombre: authUser.user_metadata?.nombre || authUser.email?.split('@')[0] || 'Usuario',
        rol: (authUser.user_metadata?.rol || 'lector') as UserRole
      });
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      
      // Fallback: usar metadata básica
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        nombre: authUser.user_metadata?.nombre || 'Usuario',
        rol: (authUser.user_metadata?.rol || 'lector') as UserRole
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Intentando login...');
      
      // ============================================
      // PASO 1: Intentar login local (FALLBACK)
      // ============================================
      const localUser = LOCAL_USERS.find(u => u.email === email && u.password === password);
      
      if (localUser) {
        console.log('✅ Login local exitoso:', localUser.email);
        const userData: User = {
          id: `local-${localUser.email}`,
          email: localUser.email,
          nombre: localUser.nombre,
          rol: localUser.rol
        };
        setUser(userData);
        localStorage.setItem('demoUser', JSON.stringify(userData));
        return; // Login exitoso con usuario local
      }

      // ============================================
      // PASO 2: Intentar login con Supabase Auth
      // ============================================
      console.log('🔐 Intentando login con Supabase Auth...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Error de Supabase Auth:', error);
        
        // Si Supabase falla, sugerir credenciales locales
        throw new Error('Credenciales incorrectas. Usa: admin@netadmin.com / admin123');
      }

      if (data.user) {
        console.log('✅ Login con Supabase exitoso:', data.user.email);
        await loadUserData(data.user);
      }
    } catch (error: any) {
      console.error('❌ Error al iniciar sesión:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('demoUser');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aunque falle Supabase, limpiamos el usuario local
      setUser(null);
      localStorage.removeItem('demoUser');
    }
  };

  // Función para demo/desarrollo - cambiar rol sin autenticación
  const setUserRole = (role: UserRole) => {
    const demoUser: User = {
      id: 'demo-user',
      email: role === 'admin' ? 'admin@netadmin.com' : 'lector@netadmin.com',
      nombre: role === 'admin' ? 'Administrador' : 'Lector',
      rol: role
    };
    setUser(demoUser);
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
  };

  const isAdmin = user?.rol === 'admin';
  const isLector = user?.rol === 'lector';

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAdmin, 
        isLector, 
        login, 
        logout,
        setUserRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}