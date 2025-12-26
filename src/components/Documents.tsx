import { Card } from './ui/card';
import { Button } from './ui/button';
import { FileText, Plus, Search } from 'lucide-react';
import { Input } from './ui/input';

export function Documents() {
  const documents = [
    { id: 1, name: 'Informe Anual 2024', type: 'PDF', date: '22 Oct 2024', size: '2.4 MB' },
    { id: 2, name: 'Presentación Cliente', type: 'PPT', date: '20 Oct 2024', size: '5.1 MB' },
    { id: 3, name: 'Propuesta Proyecto', type: 'DOC', date: '18 Oct 2024', size: '1.2 MB' },
    { id: 4, name: 'Análisis Mercado', type: 'XLS', date: '15 Oct 2024', size: '3.8 MB' },
    { id: 5, name: 'Contrato Servicios', type: 'PDF', date: '12 Oct 2024', size: '890 KB' },
    { id: 6, name: 'Manual Usuario', type: 'PDF', date: '10 Oct 2024', size: '4.2 MB' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-gray-900 mb-2">Documentos</h2>
          <p className="text-gray-600">Gestiona y organiza tus archivos</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Documento
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Buscar documentos..." 
            className="pl-10"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 mb-1 truncate">{doc.name}</h4>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
                <p className="text-gray-500 mt-1">{doc.date}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
