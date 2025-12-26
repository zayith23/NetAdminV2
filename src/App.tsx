import { useState, useEffect } from 'react';
import { Home, FileText, Settings, Activity, CheckSquare, Server, Shield, Network, Share2, LogOut, User, Eye } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { HojaDeVida } from './components/HojaDeVida';
import { Inventario } from './components/Inventario';
import { SettingsPanel } from './components/SettingsPanel';
import { Monitoreo } from './components/Monitoreo';
import { Mantenimiento } from './components/Mantenimiento';
import { SwitchModule } from './components/SwitchModule';
import { VLANModule } from './components/VLANModule';
import { Login } from './components/Login';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { initializeMockData } from './components/mockData';

type ModuleType = 'dashboard' | 'hoja-vida' | 'tareas' | 'inventario' | 'switch' | 'vlan' | 'settings';

const modules = [
  { id: 'dashboard' as ModuleType, name: 'Dashboard', icon: Home },
  { id: 'hoja-vida' as ModuleType, name: 'Hoja de Vida', icon: FileText },
  { id: 'tareas' as ModuleType, name: 'Tareas', icon: CheckSquare },
  { id: 'inventario' as ModuleType, name: 'Inventario', icon: Server },
  { id: 'switch' as ModuleType, name: 'Switch', icon: Network },
  { id: 'vlan' as ModuleType, name: 'VLAN', icon: Share2 },
  { id: 'settings' as ModuleType, name: 'Configuración', icon: Settings },
];

function MainApp() {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const { user, logout, isAdmin, isLector } = useAuth();

  // Inicializar datos de ejemplo al cargar la aplicación
  useEffect(() => {
    initializeMockData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Filtrar módulos según el rol
  const availableModules = modules.filter(module => {
    // Lectores NO pueden ver "Hoja de Vida" ni "Tareas"
    if (isLector && (module.id === 'hoja-vida' || module.id === 'tareas')) {
      return false;
    }
    return true;
  });

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'hoja-vida':
        return <HojaDeVida />;
      case 'tareas':
        return <Mantenimiento />;
      case 'inventario':
        return <Inventario />;
      case 'switch':
        return <SwitchModule />;
      case 'vlan':
        return <VLANModule />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-red-600" />
              <h1 className="text-gray-900">NetAdmin</h1>
            </div>
            <p className="text-gray-600 mt-1">Sistema de Gestión de Red</p>
            <div className="mt-3">
              {isAdmin ? (
                <Badge className="bg-red-600 text-white">
                  <User className="w-3 h-3 mr-1" />
                  Administrador
                </Badge>
              ) : (
                <Badge className="bg-gray-500 text-white">
                  <Eye className="w-3 h-3 mr-1" />
                  Lector
                </Badge>
              )}
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {availableModules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{module.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  isAdmin ? 'bg-red-600' : 'bg-gray-500'
                }`}>
                  {user?.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-gray-900">{user?.nombre}</div>
                  <div className="text-gray-500">{user?.email}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {renderModule()}
        </main>
      </div>
      
      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando NetAdmin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <MainApp />;
}