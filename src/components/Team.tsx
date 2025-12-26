import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Mail, Phone } from 'lucide-react';

export function Team() {
  const teamMembers = [
    { 
      id: 1, 
      name: 'María García', 
      role: 'Directora de Proyecto', 
      email: 'maria@empresa.com',
      phone: '+34 600 123 456',
      status: 'Activo',
      avatar: 'MG'
    },
    { 
      id: 2, 
      name: 'Juan Pérez', 
      role: 'Desarrollador Senior', 
      email: 'juan@empresa.com',
      phone: '+34 600 234 567',
      status: 'Activo',
      avatar: 'JP'
    },
    { 
      id: 3, 
      name: 'Ana Rodríguez', 
      role: 'Diseñadora UX', 
      email: 'ana@empresa.com',
      phone: '+34 600 345 678',
      status: 'Activo',
      avatar: 'AR'
    },
    { 
      id: 4, 
      name: 'Carlos López', 
      role: 'Analista de Datos', 
      email: 'carlos@empresa.com',
      phone: '+34 600 456 789',
      status: 'Ausente',
      avatar: 'CL'
    },
    { 
      id: 5, 
      name: 'Laura Martínez', 
      role: 'Marketing Manager', 
      email: 'laura@empresa.com',
      phone: '+34 600 567 890',
      status: 'Activo',
      avatar: 'LM'
    },
    { 
      id: 6, 
      name: 'Pedro Sánchez', 
      role: 'DevOps Engineer', 
      email: 'pedro@empresa.com',
      phone: '+34 600 678 901',
      status: 'Activo',
      avatar: 'PS'
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-gray-900 mb-2">Equipo</h2>
          <p className="text-gray-600">Gestiona los miembros de tu equipo</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Añadir Miembro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                {member.avatar}
              </div>
              <Badge variant={member.status === 'Activo' ? 'default' : 'secondary'}>
                {member.status}
              </Badge>
            </div>
            
            <h3 className="text-gray-900 mb-1">{member.name}</h3>
            <p className="text-gray-600 mb-4">{member.role}</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
