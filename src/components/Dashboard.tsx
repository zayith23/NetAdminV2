import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Server, Shield, Activity, AlertTriangle, Wifi, WifiOff, Edit, Trash2, FileDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { generatePDF } from './PDFTemplate';

interface Equipment {
  id: string;
  hostname: string;
  tipo: string;
  ip: string;
  status: 'online' | 'offline';
  uptime: string;
  cpu: number;
  memory: number;
}

export function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    switches: 0,
    firewalls: 0,
    online: 0
  });

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = localStorage.getItem('equipmentData');
    if (data) {
      const equipmentList = JSON.parse(data);
      setStats({
        total: equipmentList.length,
        switches: equipmentList.filter((e: any) => e.activo === 'switch').length,
        firewalls: equipmentList.filter((e: any) => e.activo === 'firewall').length,
        online: Math.floor(equipmentList.length * 0.95) // Simulado
      });

      // Simular datos de monitoreo
      const monitored = equipmentList.map((eq: any) => ({
        ...eq,
        status: Math.random() > 0.1 ? 'online' : 'offline',
        uptime: `${Math.floor(Math.random() * 365)} días`,
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100)
      }));
      setEquipment(monitored);

      // Obtener los 5 documentos más recientes
      const sortedDocs = [...equipmentList]
        .sort((a, b) => new Date(b.createdAt || b.fecha_registro).getTime() - new Date(a.createdAt || a.fecha_registro).getTime())
        .slice(0, 5);
      setRecentDocuments(sortedDocs);
    }
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para eliminar');
      return;
    }
    if (confirm('¿Estás seguro de eliminar esta hoja de vida?')) {
      const data = localStorage.getItem('equipmentData');
      if (data) {
        const equipmentList = JSON.parse(data);
        const updated = equipmentList.filter((eq: any) => eq.id !== id);
        localStorage.setItem('equipmentData', JSON.stringify(updated));
        toast.success('Hoja de vida eliminada correctamente');
        loadData(); // Recargar datos
      }
    }
  };

  const handleDownloadPDF = async (doc: any) => {
    try {
      await generatePDF(doc);
      toast.success('PDF generado correctamente');
    } catch (error) {
      toast.error('Error al generar PDF');
    }
  };

  const statsData = [
    { label: 'Total Equipos', value: stats.total, icon: Server, color: 'text-red-600' },
    { label: 'Switches', value: stats.switches, icon: Activity, color: 'text-rose-600' },
    { label: 'Firewalls', value: stats.firewalls, icon: Shield, color: 'text-red-700' },
    { label: 'Equipos Online', value: stats.online, icon: Activity, color: 'text-orange-600' },
  ];

  const recentActivity = [
    { device: 'SW-CORE-01', action: 'Hoja de vida actualizada', time: 'Hace 5 minutos' },
    { device: 'FW-EDGE-02', action: 'Nuevo equipo registrado', time: 'Hace 15 minutos' },
    { device: 'SW-ACCESS-10', action: 'Configuración modificada', time: 'Hace 1 hora' },
    { device: 'FW-DMZ-01', action: 'Firmware actualizado', time: 'Hace 2 horas' },
  ];

  // Datos simulados para el gráfico de tráfico
  const trafficData = [
    { time: '00:00', entrada: 45, salida: 32 },
    { time: '04:00', entrada: 28, salida: 18 },
    { time: '08:00', entrada: 78, salida: 65 },
    { time: '12:00', entrada: 92, salida: 88 },
    { time: '16:00', entrada: 85, salida: 72 },
    { time: '20:00', entrada: 68, salida: 55 },
  ];

  const onlineCount = equipment.filter(e => e.status === 'online').length;
  const offlineCount = equipment.filter(e => e.status === 'offline').length;

  return (
    <div className="p-8">
      {/* Header con diseño congruente */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Dashboard</h1>
              <p className="text-gray-600 text-sm">Resumen de la infraestructura de red y monitoreo en tiempo real</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - DISEÑO UNIFICADO Y DINÁMICO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Equipos */}
        <Card className="p-6 border-2 border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-red-100">
              <Server className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-red-700 mb-1">{stats.total}</p>
          <p className="text-gray-600">Total Equipos</p>
        </Card>

        {/* Switches */}
        <Card className="p-6 border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-rose-100">
              <Activity className="w-6 h-6 text-rose-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-rose-700 mb-1">{stats.switches}</p>
          <p className="text-gray-600">Switches</p>
        </Card>

        {/* Firewalls */}
        <Card className="p-6 border-2 border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-red-100">
              <Shield className="w-6 h-6 text-red-700" />
            </div>
          </div>
          <p className="text-4xl font-bold text-red-800 mb-1">{stats.firewalls}</p>
          <p className="text-gray-600">Firewalls</p>
        </Card>

        {/* Equipos Online */}
        <Card className="p-6 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-orange-100">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-orange-700 mb-1">{stats.online}</p>
          <p className="text-gray-600">Equipos Online</p>
        </Card>
      </div>

      {/* Monitoreo: Summary Cards - DISEÑO UNIFICADO Y DINÁMICO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-green-100">
              <Wifi className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-green-700 mb-1">{onlineCount}</p>
          <p className="text-gray-600">En Funcionamiento</p>
        </Card>

        <Card className="p-6 border-2 border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-red-100">
              <WifiOff className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-red-700 mb-1">{offlineCount}</p>
          <p className="text-gray-600">Fuera de Servicio</p>
        </Card>

        <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-4xl font-bold text-blue-700 mb-1">
            {equipment.length > 0 ? ((onlineCount / equipment.length) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-gray-600">Disponibilidad Total</p>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card className="p-6 mb-8 border-2 border-red-100">
        <h3 className="text-gray-900 mb-4 text-xl">Tráfico de Red (Mbps)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="entrada" stroke="#dc2626" strokeWidth={2} name="Entrada" />
            <Line type="monotone" dataKey="salida" stroke="#f87171" strokeWidth={2} name="Salida" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">
                    <span>{activity.device}</span> - {activity.action}
                  </p>
                  <p className="text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Alertas del Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium">Firmware desactualizado</p>
                <p className="text-gray-600">2 equipos requieren actualización</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <Activity className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium">Mantenimiento programado</p>
                <p className="text-gray-600">SW-CORE-01 - 25 Oct 2025</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
              <Shield className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium">Sistema operando normalmente</p>
                <p className="text-gray-600">Todos los firewalls activos</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Equipment Status List */}
      <Card className="p-6 border-2 border-red-100">
        <h3 className="text-gray-900 mb-4 text-xl">Estado de Equipos en Tiempo Real</h3>
        <div className="space-y-3">
          {equipment.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No hay equipos para monitorear</p>
          ) : (
            equipment.slice(0, 10).map((eq) => (
              <div key={eq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-300 transition-colors">
                <div className="flex items-center gap-4">
                  {eq.status === 'online' ? (
                    <Wifi className="w-5 h-5 text-green-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <h4 className="text-gray-900 font-medium">{eq.hostname}</h4>
                    <p className="text-gray-600 text-sm">{eq.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">CPU</p>
                    <p className="text-gray-900 font-medium">{eq.cpu}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Memoria</p>
                    <p className="text-gray-900 font-medium">{eq.memory}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Uptime</p>
                    <p className="text-gray-900 font-medium">{eq.uptime}</p>
                  </div>
                  <Badge className={eq.status === 'online' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                    {eq.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
        {equipment.length > 10 && (
          <p className="text-center text-gray-500 mt-4 text-sm">
            Mostrando 10 de {equipment.length} equipos
          </p>
        )}
      </Card>

      {/* Documentos Recientes */}
      {recentDocuments.length > 0 && (
        <Card className="p-6 border-2 border-red-100 mt-8">
          <h3 className="text-gray-900 mb-4 text-xl">Documentos Recientes</h3>
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-300 transition-colors">
                <div className="flex items-center gap-4">
                  <Server className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="text-gray-900 font-medium">{doc.hostname}</h4>
                    <p className="text-gray-600 text-sm">{doc.ip_direccion || doc.ip || 'N/A'}</p>
                  </div>
                  <Badge className={doc.activo === 'firewall' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}>
                    {doc.activo?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(doc)}
                    className="border-2 border-red-600 text-red-600 hover:bg-red-50"
                    title="Descargar PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="border-2 border-red-600 text-red-600 hover:bg-red-100"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}