import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Search, Send } from 'lucide-react';
import { useState } from 'react';

export function Messages() {
  const [selectedChat, setSelectedChat] = useState(1);

  const chats = [
    { id: 1, name: 'María García', lastMessage: 'Perfecto, nos vemos mañana', time: '10:30', unread: 2, avatar: 'MG' },
    { id: 2, name: 'Juan Pérez', lastMessage: 'He terminado el informe', time: '09:15', unread: 0, avatar: 'JP' },
    { id: 3, name: 'Ana Rodríguez', lastMessage: '¿Cuándo podemos reunirnos?', time: 'Ayer', unread: 1, avatar: 'AR' },
    { id: 4, name: 'Equipo Desarrollo', lastMessage: 'Nueva actualización disponible', time: 'Ayer', unread: 5, avatar: 'ED' },
  ];

  const messages = [
    { id: 1, sender: 'María García', content: 'Hola, ¿cómo va el proyecto?', time: '10:15', isMine: false },
    { id: 2, sender: 'Tú', content: 'Muy bien, vamos por buen camino', time: '10:20', isMine: true },
    { id: 3, sender: 'María García', content: '¿Podemos hacer una reunión mañana?', time: '10:25', isMine: false },
    { id: 4, sender: 'Tú', content: 'Perfecto, nos vemos mañana', time: '10:30', isMine: true },
  ];

  return (
    <div className="p-8 h-full">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-2">Mensajes</h2>
        <p className="text-gray-600">Comunícate con tu equipo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <Card className="p-4 flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar conversaciones..." className="pl-9" />
            </div>
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat === chat.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                    {chat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-gray-900 truncate">{chat.name}</h4>
                      <span className="text-gray-500">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <Badge className="ml-2">{chat.unread}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                MG
              </div>
              <div>
                <h3 className="text-gray-900">María García</h3>
                <p className="text-gray-500">En línea</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isMine
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`mt-1 ${message.isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input placeholder="Escribe un mensaje..." className="flex-1" />
              <Button size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
