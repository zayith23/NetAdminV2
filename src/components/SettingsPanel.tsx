import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Settings } from 'lucide-react';
import { GestionUsuarios } from './GestionUsuarios';
import { BackupRestore } from './BackupRestore';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPanel() {
  const { isAdmin } = useAuth();

  return (
    <div className="p-8">
      {/* Header con diseño congruente */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Configuración</h1>
              <p className="text-gray-600 text-sm">Gestiona tus preferencias y ajustes del sistema</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          {isAdmin && <TabsTrigger value="backup">🔒 Backup</TabsTrigger>}
          {isAdmin && <TabsTrigger value="usuarios">Gestión de Usuarios</TabsTrigger>}
        </TabsList>

        <TabsContent value="perfil" className="mt-6">
          <div className="max-w-3xl space-y-6">
            {/* Profile Settings */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Perfil de Usuario</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input id="firstName" defaultValue="Usuario" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input id="lastName" defaultValue="Demo" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="usuario@email.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" defaultValue="+57 300 123 4567" />
                </div>
                <Button>Guardar Cambios</Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notificaciones" className="mt-6">
          <div className="max-w-3xl space-y-6">
            {/* Notifications */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Notificaciones</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Notificaciones por Email</p>
                    <p className="text-gray-600">Recibe actualizaciones por correo electrónico</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Notificaciones Push</p>
                    <p className="text-gray-600">Recibe notificaciones en tiempo real</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900">Actualizaciones de Producto</p>
                    <p className="text-gray-600">Recibe información sobre nuevas funciones</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seguridad" className="mt-6">
          <div className="max-w-3xl space-y-6">
            {/* Security */}
            <Card className="p-6">
              <h3 className="text-gray-900 mb-4">Seguridad</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button variant="outline">Cambiar Contraseña</Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="backup" className="mt-6">
            <div className="max-w-3xl">
              <BackupRestore />
            </div>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="usuarios" className="mt-6">
            <GestionUsuarios />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}