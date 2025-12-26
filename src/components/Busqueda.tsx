import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { Search, Server, Eye, Trash2, Download, FileText, Upload } from 'lucide-react';
import groupCosLogo from 'figma:asset/f8f93340bbb2556e786df02237bc9b770f617385.png';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { generatePDF } from './PDFTemplate';
import { ImportarHojaDeVida } from './ImportarHojaDeVida';
import { useAuth } from '../contexts/AuthContext';

interface Equipment {
  id: string;
  id_hoja: string;
  hostname: string;
  activo: string;
  fecha_registro: string;
  ultima_actualizacion: string;
  usuario_creador: string;
  version: string;
  razon_social: string;
  site: string;
  gabinete: string;
  elemento: string;
  marca: string;
  modelo: string;
  serial: string;
  proveedor: string;
  fecha_compra: string;
  ubicacion_fisica: string;
  configuracion: string;
  ip_direccion: string;
  gateway: string;
  wins_dns: string;
  funciones: string;
  procesador: string;
  memoria_nvram: string;
  backup: string;
  sistema_operativo: string;
  version_firmware: string;
  dependencia: string;
  impacto_caida: string;
  nivel: string;
  congenitas: string;
  usuarios_admin: string;
  correo_admin: string;
  cargo_admin: string;
  proveedor_contacto: string;
  cargo_contacto: string;
  telefono_contacto1: string;
  telefono_contacto2: string;
  email_proveedor: string;
  contacto: string;
  responsable_proveedor: string;
  fecha_entrega: string;
  tiempo_garantia: string;
  fecha_terminacion: string;
  mantenimientos: Array<{
    fecha: string;
    tipo: string;
    descripcion: string;
    responsable: string;
  }>;
  createdAt: string;
}

export function Busqueda() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = () => {
    const data = localStorage.getItem('equipmentData');
    if (data) {
      setEquipmentList(JSON.parse(data));
    }
  };

  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesSearch = 
      (eq.hostname && eq.hostname.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.ip_direccion && eq.ip_direccion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.marca && eq.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.modelo && eq.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.ubicacion_fisica && eq.ubicacion_fisica.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.serial && eq.serial.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.razon_social && eq.razon_social.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.site && eq.site.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || eq.activo === filterType || eq.elemento === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string, hostname: string) => {
    if (confirm(`¿Estás seguro de eliminar la hoja de vida de ${hostname}?`)) {
      const updatedList = equipmentList.filter(eq => eq.id !== id);
      localStorage.setItem('equipmentData', JSON.stringify(updatedList));
      setEquipmentList(updatedList);
      toast.success('Hoja de vida eliminada correctamente');
    }
  };

  // Función eliminada - Solo se permite exportación a PDF

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'switch':
        return 'bg-rose-100 text-rose-700';
      case 'firewall':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDownloadPDF = async (equipment: Equipment) => {
    try {
      toast.loading('Generando PDF...');
      await generatePDF(equipment);
      toast.dismiss();
      toast.success('PDF generado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar PDF');
      console.error(error);
    }
  };

  const handleDownloadPDF_OLD = (equipment: Equipment) => {
    // Crear contenido HTML para PDF (versión antigua, mantener como respaldo)
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hoja de Vida - ${equipment.hostname}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #3b82f6;
              margin: 0;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              background-color: #3b82f6;
              color: white;
              padding: 8px 12px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .field-group {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            .field {
              margin-bottom: 10px;
            }
            .field-label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
              margin-bottom: 3px;
            }
            .field-value {
              color: #000;
              font-size: 14px;
            }
            .full-width {
              grid-column: 1 / -1;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HOJA DE VIDA DE EQUIPO</h1>
            <p><strong>${equipment.hostname}</strong></p>
            <p>ID: ${equipment.id_hoja || 'N/A'}</p>
          </div>

          <div class="section">
            <div class="section-title">CAMPOS BÁSICOS</div>
            <div class="field-group">
              <div class="field">
                <div class="field-label">Elemento</div>
                <div class="field-value">${equipment.elemento?.toUpperCase() || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Marca</div>
                <div class="field-value">${equipment.marca || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Modelo</div>
                <div class="field-value">${equipment.modelo || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Serial</div>
                <div class="field-value">${equipment.serial || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Nombre (Hostname)</div>
                <div class="field-value">${equipment.hostname}</div>
              </div>
              <div class="field">
                <div class="field-label">Proveedor</div>
                <div class="field-value">${equipment.proveedor || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Fecha de Compra</div>
                <div class="field-value">${equipment.fecha_compra || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Ubicación Física</div>
                <div class="field-value">${equipment.ubicacion_fisica || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ACCESOS</div>
            <div class="field-group">
              <div class="field full-width">
                <div class="field-label">Configuración</div>
                <div class="field-value">${equipment.configuracion || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">IP Dirección</div>
                <div class="field-value">${equipment.ip_direccion || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Gateway</div>
                <div class="field-value">${equipment.gateway || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">WINS/DNS</div>
                <div class="field-value">${equipment.wins_dns || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">CARACTERÍSTICAS</div>
            <div class="field-group">
              <div class="field full-width">
                <div class="field-label">Funciones</div>
                <div class="field-value">${equipment.funciones || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Procesador</div>
                <div class="field-value">${equipment.procesador || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Memoria NVRAM</div>
                <div class="field-value">${equipment.memoria_nvram || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Backup</div>
                <div class="field-value">${equipment.backup || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Sistema Operativo</div>
                <div class="field-value">${equipment.sistema_operativo || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Versión Firmware</div>
                <div class="field-value">${equipment.version_firmware || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">DEPENDENCIA</div>
            <div class="field">
              <div class="field-value">${equipment.dependencia || 'N/A'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">IMPACTO CAÍDA</div>
            <div class="field-group">
              <div class="field">
                <div class="field-label">Impacto Caída</div>
                <div class="field-value">${equipment.impacto_caida || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Nivel</div>
                <div class="field-value">${equipment.nivel || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">CONGÉNITAS</div>
            <div class="field">
              <div class="field-value">${equipment.congenitas || 'N/A'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ADMINISTRADORES</div>
            <div class="field-group">
              <div class="field">
                <div class="field-label">Usuarios Admin</div>
                <div class="field-value">${equipment.usuarios_admin || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Correo</div>
                <div class="field-value">${equipment.correo_admin || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Cargo</div>
                <div class="field-value">${equipment.cargo_admin || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">INFORMACIÓN PROVEEDOR</div>
            <div class="field-group">
              <div class="field">
                <div class="field-label">Proveedor</div>
                <div class="field-value">${equipment.proveedor_contacto || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Cargo Contacto</div>
                <div class="field-value">${equipment.cargo_contacto || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Teléfono Contacto 1</div>
                <div class="field-value">${equipment.telefono_contacto1 || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Teléfono Contacto 2</div>
                <div class="field-value">${equipment.telefono_contacto2 || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">${equipment.email_proveedor || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Contacto</div>
                <div class="field-value">${equipment.contacto || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Responsable</div>
                <div class="field-value">${equipment.responsable_proveedor || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Fecha de Entrega</div>
                <div class="field-value">${equipment.fecha_entrega || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Tiempo de Garantía</div>
                <div class="field-value">${equipment.tiempo_garantia || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Fecha de Terminación</div>
                <div class="field-value">${equipment.fecha_terminacion || 'N/A'}</div>
              </div>
            </div>
          </div>

          ${equipment.mantenimientos && equipment.mantenimientos.length > 0 ? `
          <div class="section">
            <div class="section-title">MANTENIMIENTOS</div>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Responsable</th>
                </tr>
              </thead>
              <tbody>
                ${equipment.mantenimientos.map(m => `
                  <tr>
                    <td>${m.fecha}</td>
                    <td>${m.tipo}</td>
                    <td>${m.descripcion}</td>
                    <td>${m.responsable}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">INFORMACIÓN DE REGISTRO</div>
            <div class="field-group">
              <div class="field">
                <div class="field-label">Razón Social</div>
                <div class="field-value">${equipment.razon_social || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Site</div>
                <div class="field-value">${equipment.site || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Gabinete</div>
                <div class="field-value">${equipment.gabinete || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Usuario Creador</div>
                <div class="field-value">${equipment.usuario_creador || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Fecha de Registro</div>
                <div class="field-value">${equipment.fecha_registro || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Última Actualización</div>
                <div class="field-value">${equipment.ultima_actualizacion || 'N/A'}</div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-8 h-8 text-red-600" />
              <h2 className="text-gray-900">Búsqueda de Equipos</h2>
            </div>
            <p className="text-gray-600">Encuentra hojas de vida por hostname, IP u otros criterios</p>
          </div>
          
          {/* Botón de importar - Solo para admins */}
          {isAdmin && (
            <Button
              onClick={() => setShowImportDialog(true)}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Hoja de Vida
            </Button>
          )}
        </div>
      </div>

      {/* Filtros de Búsqueda */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="search">Buscar por Hostname, IP, Marca, Modelo, Ubicación o Serie</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escribe para buscar..."
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="type">Filtrar por Tipo</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="switch">Switch</SelectItem>
                <SelectItem value="firewall">Firewall</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Resultados */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-gray-600">
          {filteredEquipment.length} {filteredEquipment.length === 1 ? 'equipo encontrado' : 'equipos encontrados'}
        </p>
        {equipmentList.length > 0 && searchTerm === '' && filterType === 'all' && (
          <div className="text-gray-500 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            📋 Mostrando todas las hojas de vida registradas
          </div>
        )}
      </div>

      {filteredEquipment.length === 0 ? (
        <Card className="p-12 text-center">
          <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">No se encontraron equipos</h3>
          <p className="text-gray-600">
            {equipmentList.length === 0 
              ? 'No hay hojas de vida registradas. Crea una nueva en el módulo "Hoja de Vida".'
              : 'Intenta con otros criterios de búsqueda o registra un nuevo equipo.'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEquipment.map((equipment) => (
            <Card key={equipment.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 h-fit">
                    <Server className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{equipment.hostname}</h3>
                      <Badge className={getTipoBadge(equipment.activo || equipment.elemento)}>
                        {(equipment.activo || equipment.elemento || '').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-gray-600">
                      <div>
                        <span className="text-gray-500">IP:</span> {equipment.ip_direccion || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Marca:</span> {equipment.marca || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Modelo:</span> {equipment.modelo || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Serial:</span> {equipment.serial || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Site:</span> {equipment.site || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Ubicación:</span> {equipment.ubicacion_fisica || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setSelectedEquipment(equipment);
                      setShowDetails(true);
                    }}
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDownloadPDF(equipment)}
                    title="Descargar PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDelete(equipment.id, equipment.hostname)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Detalles */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de {selectedEquipment?.hostname}</DialogTitle>
            <DialogDescription>
              Hoja de vida completa del equipo
            </DialogDescription>
          </DialogHeader>
          {selectedEquipment && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Campos Básicos */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b">CAMPOS BÁSICOS</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Elemento</Label>
                    <p className="text-gray-900">{selectedEquipment.elemento?.toUpperCase() || selectedEquipment.activo?.toUpperCase() || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Marca</Label>
                    <p className="text-gray-900">{selectedEquipment.marca || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Modelo</Label>
                    <p className="text-gray-900">{selectedEquipment.modelo || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Serial</Label>
                    <p className="text-gray-900">{selectedEquipment.serial || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Nombre (Hostname)</Label>
                    <p className="text-gray-900">{selectedEquipment.hostname}</p>
                  </div>
                  <div>
                    <Label>Proveedor</Label>
                    <p className="text-gray-900">{selectedEquipment.proveedor || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Fecha de Compra</Label>
                    <p className="text-gray-900">{selectedEquipment.fecha_compra || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Ubicación Física</Label>
                    <p className="text-gray-900">{selectedEquipment.ubicacion_fisica || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Accesos */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b">ACCESOS</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedEquipment.configuracion && (
                    <div className="col-span-2">
                      <Label>Configuración</Label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedEquipment.configuracion}</p>
                    </div>
                  )}
                  <div>
                    <Label>IP Dirección</Label>
                    <p className="text-gray-900">{selectedEquipment.ip_direccion || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Gateway</Label>
                    <p className="text-gray-900">{selectedEquipment.gateway || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>WINS/DNS</Label>
                    <p className="text-gray-900">{selectedEquipment.wins_dns || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Características */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b">CARACTERÍSTICAS</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedEquipment.funciones && (
                    <div className="col-span-2">
                      <Label>Funciones</Label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedEquipment.funciones}</p>
                    </div>
                  )}
                  <div>
                    <Label>Procesador</Label>
                    <p className="text-gray-900">{selectedEquipment.procesador || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Memoria NVRAM</Label>
                    <p className="text-gray-900">{selectedEquipment.memoria_nvram || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Backup</Label>
                    <p className="text-gray-900">{selectedEquipment.backup || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Sistema Operativo</Label>
                    <p className="text-gray-900">{selectedEquipment.sistema_operativo || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Versión Firmware</Label>
                    <p className="text-gray-900">{selectedEquipment.version_firmware || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Dependencia */}
              {selectedEquipment.dependencia && (
                <div>
                  <h4 className="text-gray-900 mb-3 pb-2 border-b">DEPENDENCIA</h4>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedEquipment.dependencia}</p>
                </div>
              )}

              {/* Impacto Caída */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b">IMPACTO CAÍDA</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Impacto Caída</Label>
                    <p className="text-gray-900">{selectedEquipment.impacto_caida || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Nivel</Label>
                    <p className="text-gray-900 capitalize">{selectedEquipment.nivel || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Congénitas */}
              {selectedEquipment.congenitas && (
                <div>
                  <h4 className="text-gray-900 mb-3 pb-2 border-b">CONGÉNITAS</h4>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedEquipment.congenitas}</p>
                </div>
              )}

              {/* Administradores */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b">ADMINISTRADORES</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Usuarios Admin</Label>
                    <p className="text-gray-900">{selectedEquipment.usuarios_admin || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Correo</Label>
                    <p className="text-gray-900">{selectedEquipment.correo_admin || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label>Cargo</Label>
                    <p className="text-gray-900">{selectedEquipment.cargo_admin || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Información Proveedor */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b">INFORMACIÓN PROVEEDOR</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Proveedor</Label>
                    <p className="text-gray-900">{selectedEquipment.proveedor_contacto || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Cargo Contacto</Label>
                    <p className="text-gray-900">{selectedEquipment.cargo_contacto || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Teléfono Contacto 1</Label>
                    <p className="text-gray-900">{selectedEquipment.telefono_contacto1 || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Teléfono Contacto 2</Label>
                    <p className="text-gray-900">{selectedEquipment.telefono_contacto2 || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-gray-900">{selectedEquipment.email_proveedor || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Contacto</Label>
                    <p className="text-gray-900">{selectedEquipment.contacto || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Responsable</Label>
                    <p className="text-gray-900">{selectedEquipment.responsable_proveedor || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Fecha de Entrega</Label>
                    <p className="text-gray-900">{selectedEquipment.fecha_entrega || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Tiempo de Garantía</Label>
                    <p className="text-gray-900">{selectedEquipment.tiempo_garantia || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Fecha de Terminación</Label>
                    <p className="text-gray-900">{selectedEquipment.fecha_terminacion || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Mantenimientos */}
              {selectedEquipment.mantenimientos && selectedEquipment.mantenimientos.length > 0 && (
                <div>
                  <h4 className="text-gray-900 mb-3 pb-2 border-b">MANTENIMIENTOS ({selectedEquipment.mantenimientos.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedEquipment.mantenimientos.map((mant, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                            <span className="text-xs text-blue-600">📅</span>
                            <span className="text-sm text-blue-700">{mant.fecha || 'Sin fecha'}</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className={`inline-block px-3 py-1 rounded-md text-xs ${
                            mant.tipo.includes('preventivo') ? 'bg-green-100 text-green-700' :
                            mant.tipo === 'correctivo' ? 'bg-orange-100 text-orange-700' :
                            mant.tipo === 'actualizacion' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {mant.tipo || 'Sin tipo'}
                          </div>
                        </div>
                        {mant.descripcion && (
                          <p className="text-gray-700 mb-2 text-sm">{mant.descripcion}</p>
                        )}
                        {mant.responsable && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <span>👤</span>
                            <span>{mant.responsable}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón para descargar PDF */}
              <div className="pt-4 border-t">
                <Button onClick={() => handleDownloadPDF(selectedEquipment)} className="w-full gap-2">
                  <FileText className="w-4 h-4" />
                  Descargar Hoja de Vida en PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Importación */}
      <ImportarHojaDeVida
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={loadEquipment}
      />
    </div>
  );
}