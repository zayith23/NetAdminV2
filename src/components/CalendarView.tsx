import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 22)); // October 22, 2025

  const events = [
    { id: 1, title: 'Reunión de Equipo', date: '22 Oct', time: '10:00 AM', color: 'bg-blue-500' },
    { id: 2, title: 'Presentación Cliente', date: '23 Oct', time: '2:00 PM', color: 'bg-purple-500' },
    { id: 3, title: 'Revisión de Proyecto', date: '24 Oct', time: '11:00 AM', color: 'bg-green-500' },
    { id: 4, title: 'Llamada con Proveedor', date: '25 Oct', time: '3:30 PM', color: 'bg-orange-500' },
  ];

  const monthYear = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-gray-900 mb-2">Calendario</h2>
          <p className="text-gray-600">Organiza tus eventos y reuniones</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 capitalize">{monthYear}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 1;
              const isCurrentDay = day === 22;
              const isInMonth = day > 0 && day <= 31;
              
              return (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center rounded-lg ${
                    isInMonth
                      ? isCurrentDay
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 cursor-pointer'
                      : 'text-gray-300'
                  }`}
                >
                  {isInMonth ? day : ''}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">Próximos Eventos</h3>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex gap-3">
                <div className={`w-1 rounded-full ${event.color}`}></div>
                <div className="flex-1">
                  <h4 className="text-gray-900">{event.title}</h4>
                  <p className="text-gray-600">{event.date}</p>
                  <p className="text-gray-500">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
