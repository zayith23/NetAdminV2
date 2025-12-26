// ============================================
// NETADMIN V13 - COMPONENTE DE LOGIN
// Login simplificado con credenciales locales
// ============================================

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Shield, BookOpen, Network } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, setUserRole } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('¡Bienvenido a NetAdmin!', {
        description: 'Sesión iniciada correctamente'
      });
    } catch (error: any) {
      console.error('Error en login:', error);
      
      toast.error('Credenciales incorrectas', {
        description: 'Verifica tu email y contraseña o usa modo demo',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para modo demo - Admin
  const handleDemoAdmin = () => {
    setUserRole('admin');
    toast.success('Modo Demo: Administrador', {
      description: 'Acceso completo sin autenticación'
    });
  };

  // Función para modo demo - Lector
  const handleDemoLector = () => {
    setUserRole('lector');
    toast.success('Modo Demo: Lector', {
      description: 'Solo visualización sin autenticación'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-4">
      <Card className="w-full max-w-sm p-6 shadow-2xl bg-white border-2 border-red-200 relative">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-xl">
              <Network className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-red-700 mb-1 text-2xl">NetAdmin</h1>
          <p className="text-red-600 text-sm">Sistema de Gestión de Red</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 mb-4">
          <div>
            <Label htmlFor="email" className="text-red-700 font-medium text-sm">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="mt-1 h-10 border-red-200 focus:border-red-600 focus:ring-red-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-red-700 font-medium text-sm">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 h-10 border-red-200 focus:border-red-600 focus:ring-red-600"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-10 font-semibold shadow-lg" 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        {/* Separador */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-red-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-red-600 font-semibold">Modo Demo (Sin autenticación)</span>
          </div>
        </div>

        {/* Iconos de modo demo centrados */}
        <div className="flex justify-center gap-3 mb-4">
          {/* Icono Admin Demo */}
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="group relative p-3 rounded-lg transition-all border-2 border-red-300 bg-white hover:bg-red-50 hover:border-red-500 shadow-sm hover:shadow-md"
            title="Modo Demo: Administrador"
          >
            <Shield className="w-6 h-6 text-red-600" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Demo Admin
            </div>
          </button>

          {/* Icono Lector Demo */}
          <button
            type="button"
            onClick={handleDemoLector}
            className="group relative p-3 rounded-lg transition-all border-2 border-red-300 bg-white hover:bg-red-50 hover:border-red-500 shadow-sm hover:shadow-md"
            title="Modo Demo: Lector"
          >
            <BookOpen className="w-6 h-6 text-red-600" />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Demo Lector
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-red-600 font-medium">NetAdmin V2.0 - 2025</p>
        </div>
      </Card>
    </div>
  );
}