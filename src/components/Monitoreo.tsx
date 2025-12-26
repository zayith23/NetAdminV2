import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Activity, WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export function Monitoreo() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('equipmentData');
    if (data) {
      const parsed = JSON.parse(data);
      // Simular datos de monitoreo
      const monitored = parsed.map((eq: any) => ({
        ...eq,
        status: Math.random() > 0.1 ? 'online' : 'offline',
        uptime: `${Math.floor(Math.random() * 365)} días`,
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100)
      }));
      setEquipment(monitored);
    }
  }, []);

  // Datos simulados para el gráfico
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
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Monitoreo de Red</h2>
        <p className="text-gray-600">Estado en tiempo real de los equipos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Wifi className="w-6 h-6 text-green-600" />
            <h3 className="text-gray-900">Equipos Online</h3>
          </div>
          <p className="text-gray-900">{onlineCount}</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <WifiOff className="w-6 h-6 text-red-600" />
            <h3 className="text-gray-900">Equipos Offline</h3>
          </div>
          <p className="text-gray-900">{offlineCount}</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="text-gray-900">Disponibilidad</h3>
          </div>
          <p className="text-gray-900">
            {equipment.length > 0 ? ((onlineCount / equipment.length) * 100).toFixed(1) : 0}%
          </p>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card className="p-6 mb-8">
        <h3 className="text-gray-900 mb-4">Tráfico de Red (Mbps)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="entrada" stroke="#3b82f6" strokeWidth={2} name="Entrada" />
            <Line type="monotone" dataKey="salida" stroke="#8b5cf6" strokeWidth={2} name="Salida" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Equipment Status List */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Estado de Equipos</h3>
        <div className="space-y-3">
          {equipment.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No hay equipos para monitorear</p>
          ) : (
            equipment.map((eq) => (
              <div key={eq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  {eq.status === 'online' ? (
                    <Wifi className="w-5 h-5 text-green-600" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <h4 className="text-gray-900">{eq.hostname}</h4>
                    <p className="text-gray-600">{eq.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-gray-600">CPU</p>
                    <p className="text-gray-900">{eq.cpu}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Memoria</p>
                    <p className="text-gray-900">{eq.memory}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Uptime</p>
                    <p className="text-gray-900">{eq.uptime}</p>
                  </div>
                  <Badge variant={eq.status === 'online' ? 'default' : 'destructive'}>
                    {eq.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
