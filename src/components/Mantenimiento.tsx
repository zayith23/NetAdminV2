// ============================================
// NETADMIN V9 - TAREAS DE MANTENIMIENTO
// Sistema de gestión de tareas con alertas
// ============================================

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Plus, CheckCircle2, Clock, AlertCircle, Edit, Trash2, AlertTriangle, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';

interface MaintenanceTask {
  id: number;
  hostname: string;
  tipo: string;
  tarea: string;
  fecha: string;
  fechaAlerta: string; // Nueva: fecha para empezar a mostrar como pendiente
  estado: 'pendiente' | 'en-progreso' | 'completada';
  prioridad: 'baja' | 'media' | 'alta';
  tecnico?: string;
  observaciones?: string;
}

export function Mantenimiento() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [formData, setFormData] = useState({
    hostname: '',
    tipo: '',
    tarea: '',
    fecha: '',
    fechaAlerta: '',
    estado: 'pendiente' as 'pendiente' | 'en-progreso' | 'completada',
    prioridad: 'media' as 'baja' | 'media' | 'alta',
    tecnico: '',
    observaciones: '',
  });

  // Cargar tareas desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('netadmin-tareas');
    if (stored) {
      setTasks(JSON.parse(stored));
    } else {
      // Datos iniciales de ejemplo
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 7);
      const farFutureDate = new Date(today);
      farFutureDate.setDate(farFutureDate.getDate() + 15);

      const initialTasks = [
        {
          id: 1,
          hostname: 'SW-CORE-01',
          tipo: 'switch',
          tarea: 'Actualización de firmware urgente',
          fecha: yesterday.toISOString().split('T')[0],
          fechaAlerta: new Date(yesterday.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estado: 'pendiente' as const,
          prioridad: 'alta' as const,
          tecnico: 'Juan Pérez'
        },
        {
          id: 2,
          hostname: 'FW-EDGE-02',
          tipo: 'firewall',
          tarea: 'Revisión de reglas de seguridad',
          fecha: today.toISOString().split('T')[0],
          fechaAlerta: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          estado: 'pendiente' as const,
          prioridad: 'alta' as const,
          tecnico: 'María García'
        },
        {
          id: 3,
          hostname: 'SW-ACCESS-10',
          tipo: 'switch',
          tarea: 'Backup de configuración',
          fecha: futureDate.toISOString().split('T')[0],
          fechaAlerta: today.toISOString().split('T')[0],
          estado: 'pendiente' as const,
          prioridad: 'media' as const,
          tecnico: 'Carlos López'
        },
        {
          id: 4,
          hostname: 'FW-DMZ-01',
          tipo: 'firewall',
          tarea: 'Verificación de logs',
          fecha: farFutureDate.toISOString().split('T')[0],
          fechaAlerta: futureDate.toISOString().split('T')[0],
          estado: 'pendiente' as const,
          prioridad: 'baja' as const,
          tecnico: 'Ana Martínez'
        },
      ];
      setTasks(initialTasks);
      localStorage.setItem('netadmin-tareas', JSON.stringify(initialTasks));
    }
  }, []);

  // Calcular estadísticas de tareas
  const getTaskStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vencidas = tasks.filter(task => {
      const taskDate = new Date(task.fecha);
      taskDate.setHours(0, 0, 0, 0);
      return task.estado !== 'completada' && taskDate < today;
    }).length;

    const pendientes = tasks.filter(task => {
      const taskDate = new Date(task.fecha);
      const alertDate = new Date(task.fechaAlerta);
      today.setHours(0, 0, 0, 0);
      taskDate.setHours(0, 0, 0, 0);
      alertDate.setHours(0, 0, 0, 0);
      return task.estado !== 'completada' && alertDate <= today && taskDate >= today;
    }).length;

    const programadas = tasks.filter(task => {
      const alertDate = new Date(task.fechaAlerta);
      alertDate.setHours(0, 0, 0, 0);
      return task.estado !== 'completada' && alertDate > today;
    }).length;

    return { vencidas, pendientes, programadas };
  };

  const stats = getTaskStats();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTask) {
      // Actualizar tarea existente
      const updatedTasks = tasks.map(task =>
        task.id === editingTask.id
          ? { ...task, ...formData, id: task.id }
          : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('netadmin-tareas', JSON.stringify(updatedTasks));
      toast.success('Tarea actualizada correctamente');
    } else {
      // Crear nueva tarea
      const newTask = {
        ...formData,
        id: Date.now(),
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('netadmin-tareas', JSON.stringify(updatedTasks));
      toast.success('Tarea creada correctamente');
    }

    // Resetear formulario
    setFormData({
      hostname: '',
      tipo: '',
      tarea: '',
      fecha: '',
      fechaAlerta: '',
      estado: 'pendiente',
      prioridad: 'media',
      tecnico: '',
      observaciones: '',
    });
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleEdit = (task: MaintenanceTask) => {
    setEditingTask(task);
    setFormData({
      hostname: task.hostname,
      tipo: task.tipo,
      tarea: task.tarea,
      fecha: task.fecha,
      fechaAlerta: task.fechaAlerta,
      estado: task.estado,
      prioridad: task.prioridad,
      tecnico: task.tecnico || '',
      observaciones: task.observaciones || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem('netadmin-tareas', JSON.stringify(updatedTasks));
      toast.success('Tarea eliminada correctamente');
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Pendiente</Badge>;
      case 'en-progreso':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">En Progreso</Badge>;
      case 'completada':
        return <Badge variant="outline" className="border-green-300 text-green-700">Completada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return <Badge className="bg-red-600 text-white">Alta</Badge>;
      case 'media':
        return <Badge className="bg-yellow-600 text-white">Media</Badge>;
      case 'baja':
        return <Badge className="bg-green-600 text-white">Baja</Badge>;
      default:
        return <Badge>Normal</Badge>;
    }
  };

  const isTaskOverdue = (fecha: string, estado: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(fecha);
    taskDate.setHours(0, 0, 0, 0);
    return estado !== 'completada' && taskDate < today;
  };

  return (
    <div className="p-8">
      {/* Header con diseño congruente */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Tareas de Mantenimiento</h1>
              <p className="text-gray-600 text-sm">Gestiona y programa las tareas de mantenimiento de equipos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas en la parte superior izquierda */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tareas Vencidas */}
        <Card className={`p-4 border-2 ${stats.vencidas > 0 ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${stats.vencidas > 0 ? 'bg-red-600' : 'bg-gray-300'}`}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-sm ${stats.vencidas > 0 ? 'text-red-700' : 'text-gray-600'}`}>Tareas Vencidas</p>
              <p className={`text-2xl font-bold ${stats.vencidas > 0 ? 'text-red-700' : 'text-gray-900'}`}>
                {stats.vencidas}
              </p>
            </div>
          </div>
        </Card>

        {/* Tareas Pendientes (en fecha de alerta) */}
        <Card className={`p-4 border-2 ${stats.pendientes > 0 ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${stats.pendientes > 0 ? 'bg-orange-600' : 'bg-gray-300'}`}>
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-sm ${stats.pendientes > 0 ? 'text-orange-700' : 'text-gray-600'}`}>Tareas Pendientes</p>
              <p className={`text-2xl font-bold ${stats.pendientes > 0 ? 'text-orange-700' : 'text-gray-900'}`}>
                {stats.pendientes}
              </p>
            </div>
          </div>
        </Card>

        {/* Tareas Programadas (aún no en fecha de alerta) */}
        <Card className="p-4 border-2 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-600">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tareas Programadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.programadas}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Tareas */}
      <div className="grid grid-cols-1 gap-4">
        {tasks.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No hay tareas programadas</h3>
            <p className="text-gray-600 mb-4">Crea tu primera tarea de mantenimiento</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Tarea
            </Button>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card 
              key={task.id} 
              className={`p-6 hover:shadow-lg transition-shadow ${
                isTaskOverdue(task.fecha, task.estado) ? 'border-l-4 border-red-500 bg-red-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-gray-900">{task.hostname}</h3>
                    {getPriorityBadge(task.prioridad)}
                    {getStatusBadge(task.estado)}
                    {isTaskOverdue(task.fecha, task.estado) && (
                      <Badge className="bg-red-600 text-white">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Vencida
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{task.tarea}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500">Tipo:</span> {task.tipo}
                    </div>
                    <div>
                      <span className="text-gray-500">Fecha:</span> {task.fecha}
                    </div>
                    <div>
                      <span className="text-gray-500">Alerta:</span> {task.fechaAlerta}
                    </div>
                    {task.tecnico && (
                      <div>
                        <span className="text-gray-500">Técnico:</span> {task.tecnico}
                      </div>
                    )}
                  </div>
                  {task.observaciones && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{task.observaciones}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(task)}
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDelete(task.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}