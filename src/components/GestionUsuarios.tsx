// ============================================
// NETADMIN V12 - GESTIÓN DE USUARIOS
// ADMIN puede cambiar contraseñas y roles
// ============================================

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2, Edit, Shield, Eye, Key, UserCog } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'lector';
  created_at: string;
}

export function GestionUsuarios() {
  const { isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  // Formularios
  const [createForm, setCreateForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'lector' as 'admin' | 'lector',
  });

  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState({
    rol: 'lector' as 'admin' | 'lector',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Cargar usuarios
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Intentar cargar desde backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2/users/list`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.users || []);
      } else {
        console.error('Error al cargar usuarios desde backend');
        // Fallback a usuarios de ejemplo
        setUsuarios([
          {
            id: '1',
            nombre: 'Administrador',
            email: 'admin@netadmin.com',
            rol: 'admin',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            nombre: 'Lector',
            email: 'lector@netadmin.com',
            rol: 'lector',
            created_at: new Date().toISOString(),
          },
          {
            id: '3',
            nombre: 'Juan Rey',
            email: 'juan.rey@netadmin.com',
            rol: 'lector',
            created_at: new Date().toISOString(),
          }
        ]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // Usuarios de ejemplo
      setUsuarios([
        {
          id: '1',
          nombre: 'Administrador',
          email: 'admin@netadmin.com',
          rol: 'admin',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          nombre: 'Lector',
          email: 'lector@netadmin.com',
          rol: 'lector',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          nombre: 'Juan Rey',
          email: 'juan.rey@netadmin.com',
          rol: 'lector',
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Crear usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error('Solo los administradores pueden crear usuarios');
      return;
    }

    if (createForm.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(createForm)
        }
      );

      if (response.ok) {
        toast.success(`Usuario ${createForm.nombre} creado exitosamente`);
        setCreateForm({ nombre: '', email: '', password: '', rol: 'lector' });
        setIsCreateDialogOpen(false);
        loadUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error('Error al crear usuario');
    }
  };

  // Abrir diálogo de edición
  const handleOpenEditDialog = (usuario: Usuario) => {
    setEditingUser(usuario);
    setEditForm({ rol: usuario.rol });
    setIsEditDialogOpen(true);
  };

  // Cambiar rol del usuario
  const handleChangeRole = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2/users/${editingUser.id}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ rol: editForm.rol })
        }
      );

      if (response.ok) {
        toast.success(`Rol actualizado: ${editingUser.nombre} ahora es ${editForm.rol === 'admin' ? 'Administrador' : 'Lector'}`);
        setIsEditDialogOpen(false);
        loadUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al cambiar rol');
      }
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      toast.error('Error al cambiar rol');
    }
  };

  // Abrir diálogo de cambio de contraseña
  const handleOpenPasswordDialog = (usuario: Usuario) => {
    setEditingUser(usuario);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setIsPasswordDialogOpen(true);
  };

  // Cambiar contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2/users/${editingUser.id}/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ password: passwordForm.newPassword })
        }
      );

      if (response.ok) {
        toast.success(`Contraseña actualizada para ${editingUser.nombre}`);
        setIsPasswordDialogOpen(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      toast.error('Error al cambiar contraseña');
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (usuario: Usuario) => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden eliminar usuarios');
      return;
    }

    if (usuario.email === 'admin@netadmin.com') {
      toast.error('No se puede eliminar el usuario administrador principal');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2/users/${usuario.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        toast.success(`Usuario ${usuario.nombre} eliminado`);
        loadUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">Acceso Restringido</h3>
          <p className="text-gray-600">Solo los administradores pueden gestionar usuarios</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-red-600" />
            <h2 className="text-gray-900">Gestión de Usuarios</h2>
          </div>
          <p className="text-gray-600">Administra usuarios, roles y contraseñas del sistema</p>
        </div>
        
        {/* Botón Crear Usuario */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Registra un nuevo usuario y asigna su rol de acceso
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="juan.perez@empresa.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
              </div>

              <div>
                <Label htmlFor="rol">Rol *</Label>
                <Select 
                  value={createForm.rol} 
                  onValueChange={(value: 'admin' | 'lector') => setCreateForm({ ...createForm, rol: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600" />
                        <span>Administrador (acceso completo)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="lector">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span>Lector (solo lectura)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Usuarios */}
      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Cargando usuarios...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {usuarios.map((usuario) => (
            <Card key={usuario.id} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                    usuario.rol === 'admin' ? 'bg-red-600' : 'bg-gray-500'
                  }`}>
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{usuario.nombre}</h3>
                      {usuario.rol === 'admin' ? (
                        <Badge className="bg-red-600 text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          Administrador
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-400 text-gray-700">
                          <Eye className="w-3 h-3 mr-1" />
                          Lector
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{usuario.email}</p>
                    <p className="text-xs text-gray-500">
                      Creado: {new Date(usuario.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {/* Cambiar Rol */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEditDialog(usuario)}
                    title="Cambiar rol"
                  >
                    <UserCog className="w-4 h-4 mr-1" />
                    Cambiar Rol
                  </Button>

                  {/* Cambiar Contraseña */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenPasswordDialog(usuario)}
                    title="Cambiar contraseña"
                  >
                    <Key className="w-4 h-4 mr-1" />
                    Contraseña
                  </Button>

                  {/* Eliminar */}
                  {usuario.email !== 'admin@netadmin.com' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(usuario)}
                      title="Eliminar usuario"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog: Cambiar Rol */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Cambia el nivel de acceso de {editingUser?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nuevo Rol</Label>
              <Select 
                value={editForm.rol} 
                onValueChange={(value: 'admin' | 'lector') => setEditForm({ rol: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-600" />
                      <span>Administrador</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="lector">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span>Lector</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleChangeRole} className="bg-red-600 hover:bg-red-700">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cambiar Contraseña */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Establece una nueva contraseña para {editingUser?.nombre}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 py-4">
            <div>
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                <Key className="w-4 h-4 mr-2" />
                Cambiar Contraseña
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Información de Permisos */}
      <Card className="mt-6 p-6">
        <h3 className="text-gray-900 mb-4">Permisos por Rol</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-red-600" />
              <h4 className="text-gray-900">Administrador</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Crear, editar y eliminar hojas de vida
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Gestionar usuarios (crear, editar, eliminar)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Cambiar contraseñas y roles
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Crear y gestionar tareas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Acceso completo al sistema
              </li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-gray-600" />
              <h4 className="text-gray-900">Lector</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Ver dashboard y estadísticas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Buscar y consultar equipos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Descargar PDFs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                NO puede crear/editar/eliminar
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                NO puede gestionar usuarios
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
