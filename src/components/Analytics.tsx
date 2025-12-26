import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function Analytics() {
  const monthlyData = [
    { month: 'Ene', ventas: 4000, usuarios: 2400 },
    { month: 'Feb', ventas: 3000, usuarios: 1398 },
    { month: 'Mar', ventas: 2000, usuarios: 9800 },
    { month: 'Abr', ventas: 2780, usuarios: 3908 },
    { month: 'May', ventas: 1890, usuarios: 4800 },
    { month: 'Jun', ventas: 2390, usuarios: 3800 },
  ];

  const pieData = [
    { name: 'Producto A', value: 400 },
    { name: 'Producto B', value: 300 },
    { name: 'Producto C', value: 200 },
    { name: 'Producto D', value: 100 },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Analíticas</h2>
        <p className="text-gray-600">Visualiza el rendimiento de tu negocio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Ventas y Usuarios Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ventas" fill="#3b82f6" />
              <Bar dataKey="usuarios" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Distribución de Productos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Line Chart */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Tendencia de Crecimiento</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="usuarios" stroke="#ec4899" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
