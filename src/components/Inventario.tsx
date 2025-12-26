// ============================================
// NETADMIN V12 - MÓDULO DE INVENTARIO POR SECCIONES
// Inventario organizado por ubicaciones con navegación por recuadros
// ============================================

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { Search, Server, Eye, Trash2, FileDown, FileSpreadsheet, Building2, MapPin, ArrowLeft, Package, Edit, X, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { generatePDF } from './PDFTemplate';
import { useAuth } from '../contexts/AuthContext';
import { EditarHojaDeVida } from './EditarHojaDeVida';

interface Equipment {
  id: string;
  id_hoja: string;
  hostname: string;
  nombre_archivo?: string; // Nombre original del archivo importado
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
  contingencias: string;
  contactos: string;
  garantia: string;
  mantenimientos?: Array<{
    fecha: string;
    tipo: string;
    descripcion: string;
    responsable: string;
  }>;
  createdAt: string;
}

interface Section {
  id: string;
  name: string;
  icon: any;
  razonSocial: 'grupo cos' | 'contacto solutions' | 'otd';
}

// Mapping de sites con sus razones sociales y colores
const SECCIONES: Section[] = [
  { id: 'barranquilla', name: 'Barranquilla', icon: Building2, razonSocial: 'grupo cos' },
  { id: 'calle-93', name: 'Calle 93', icon: Building2, razonSocial: 'grupo cos' },
  { id: 'rrhh', name: 'RRHH', icon: Package, razonSocial: 'grupo cos' },
  { id: 'site-7', name: 'Site 7', icon: MapPin, razonSocial: 'grupo cos' },
  { id: 'carrera-7', name: 'Carrera 7', icon: MapPin, razonSocial: 'grupo cos' },
  { id: 'itagui', name: 'Itagüí', icon: MapPin, razonSocial: 'contacto solutions' },
  { id: 'site-6', name: 'Site 6', icon: MapPin, razonSocial: 'contacto solutions' },
  { id: 'site-5', name: 'Site 5', icon: MapPin, razonSocial: 'contacto solutions' },
  { id: 'calle-80', name: 'Calle 80', icon: MapPin, razonSocial: 'otd' },
];

// Función para obtener colores según razón social
const getColorsByRazon = (razonSocial: 'grupo cos' | 'contacto solutions' | 'otd') => {
  switch (razonSocial) {
    case 'grupo cos':
      return {
        gradient: 'from-red-600 to-rose-600',
        bg: 'bg-red-600',
        border: 'border-red-300 hover:border-red-500',
        textColor: 'text-red-600',
        badgeBg: 'bg-red-100 text-red-700',
        hoverBg: 'hover:bg-red-50',
        lightBg: 'bg-red-50'
      };
    case 'contacto solutions':
      return {
        gradient: 'from-blue-600 to-cyan-600',
        bg: 'bg-blue-600',
        border: 'border-blue-300 hover:border-blue-500',
        textColor: 'text-blue-600',
        badgeBg: 'bg-blue-100 text-blue-700',
        hoverBg: 'hover:bg-blue-50',
        lightBg: 'bg-blue-50'
      };
    case 'otd':
      return {
        gradient: 'from-pink-600 to-rose-600',
        bg: 'bg-pink-600',
        border: 'border-pink-300 hover:border-pink-500',
        textColor: 'text-pink-600',
        badgeBg: 'bg-pink-100 text-pink-700',
        hoverBg: 'hover:bg-pink-50',
        lightBg: 'bg-pink-50'
      };
  }
};

export function Inventario() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadEquipment();
    
    // Escuchar cambios en el storage para recargar cuando se importe una nueva hoja de vida
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hojas-vida-updated') {
        console.log('🔄 Detectado cambio en hojas de vida, recargando...');
        loadEquipment();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar un evento personalizado en la misma ventana
    const handleCustomEvent = () => {
      console.log('🔄 Evento personalizado detectado, recargando...');
      loadEquipment();
    };
    
    window.addEventListener('hojas-vida-updated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hojas-vida-updated', handleCustomEvent);
    };
  }, []);

  const loadEquipment = async () => {
    try {
      console.log('🔄 Cargando hojas de vida desde el backend...');
      
      // Importar info de Supabase
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      // Llamar al endpoint del backend
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2/hojas-vida/listar`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (!response.ok) {
        console.error('❌ Error al cargar hojas de vida:', response.status);
        
        // Fallback a localStorage si el backend falla
        const localData = localStorage.getItem('equipmentData');
        if (localData) {
          setEquipmentList(JSON.parse(localData));
          console.log('📦 Datos cargados desde localStorage (fallback)');
        }
        return;
      }
      
      const data = await response.json();
      console.log('✅ Hojas de vida cargadas desde el backend:', data);
      
      if (data.hojas && Array.isArray(data.hojas)) {
        // Mapear los datos del backend al formato esperado por el frontend
        const equipmentData = data.hojas.map((hoja: any) => ({
          id: hoja.id,
          id_hoja: hoja.id_hoja,
          hostname: hoja.hostname,
          activo: hoja.activoTipo,
          razon_social: hoja.razonSocial,
          site: hoja.site,
          gabinete: hoja.gabinete,
          elemento: hoja.elemento,
          marca: hoja.marca,
          modelo: hoja.modelo,
          serial: hoja.serial,
          proveedor: hoja.proveedor,
          fecha_compra: hoja.fechaCompra,
          ip_direccion: hoja.direccionIP,
          gateway: hoja.gateway,
          wins_dns: hoja.winsDns,
          funciones: hoja.funciones,
          procesador: hoja.procesador,
          memoria_nvram: hoja.memoriaNvram,
          backup: hoja.backup,
          sistema_operativo: hoja.sistemaOperativo,
          version_firmware: hoja.versionFirmware,
          dependencia: hoja.dependencia,
          impacto_caida: hoja.impactoCaida,
          nivel: hoja.nivel,
          contingencias: hoja.contingencias,
          contactos: hoja.contactos,
          garantia: hoja.garantia,
          mantenimientos: hoja.mantenimientos,
          fecha_registro: hoja.fecha_registro,
          usuario_creador: hoja.usuario_creador,
        }));
        
        setEquipmentList(equipmentData);
        
        // También guardar en localStorage como cache
        localStorage.setItem('equipmentData', JSON.stringify(equipmentData));
        console.log(`✅ ${equipmentData.length} hojas de vida cargadas correctamente`);
      }
    } catch (error) {
      console.error('❌ Error al cargar hojas de vida:', error);
      
      // Fallback a localStorage
      const localData = localStorage.getItem('equipmentData');
      if (localData) {
        setEquipmentList(JSON.parse(localData));
        console.log('📦 Datos cargados desde localStorage (fallback por error)');
      }
    }
  };

  const getEquipmentBySection = (sectionId: string, search: string) => {
    return equipmentList.filter((eq) => {
      const equipmentSite = (eq.site || '').toLowerCase().trim();
      
      let matchesSection = false;
      switch (sectionId) {
        case 'barranquilla':
          matchesSection = equipmentSite.includes('barranquilla');
          break;
        case 'calle-93':
          matchesSection = equipmentSite.includes('calle 93') || equipmentSite.includes('calle93');
          break;
        case 'rrhh':
          matchesSection = equipmentSite.includes('rrhh') || equipmentSite.includes('recursos humanos');
          break;
        case 'site-7':
          matchesSection = equipmentSite.includes('site 7') || equipmentSite === 'site7';
          break;
        case 'carrera-7':
          matchesSection = equipmentSite.includes('carrera 7') || equipmentSite === 'carrera7';
          break;
        case 'itagui':
          matchesSection = equipmentSite.includes('itagui') || equipmentSite.includes('itagüí');
          break;
        case 'site-6':
          matchesSection = equipmentSite.includes('site 6') || equipmentSite === 'site6';
          break;
        case 'site-5':
          matchesSection = equipmentSite.includes('site 5') || equipmentSite === 'site5';
          break;
        case 'calle-80':
          matchesSection = equipmentSite.includes('calle 80') || equipmentSite.includes('calle80');
          break;
      }

      const matchesSearch = !search || 
        (eq.hostname && eq.hostname.toLowerCase().includes(search.toLowerCase())) ||
        (eq.ip_direccion && eq.ip_direccion.toLowerCase().includes(search.toLowerCase())) ||
        (eq.marca && eq.marca.toLowerCase().includes(search.toLowerCase())) ||
        (eq.modelo && eq.modelo.toLowerCase().includes(search.toLowerCase())) ||
        (eq.serial && eq.serial.toLowerCase().includes(search.toLowerCase())) ||
        (eq.activo && eq.activo.toLowerCase().includes(search.toLowerCase()));

      return matchesSection && matchesSearch;
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta hoja de vida?')) {
      const updatedList = equipmentList.filter(eq => eq.id !== id);
      setEquipmentList(updatedList);
      toast.success('Hoja de vida eliminada correctamente');
    }
  };

  const exportToPDF = async (equipment: Equipment) => {
    await generatePDF(equipment);
    toast.success('PDF generado correctamente');
  };

  // Función eliminada - Solo se permite exportación a PDF

  const renderEquipmentCard = (eq: Equipment) => (
    <Card key={eq.id} className="p-5 hover:shadow-lg transition-shadow border-2">
      {/* Header con nombre del archivo si fue importado */}
      {eq.nombre_archivo && eq.usuario_creador === 'Importado desde Excel' && (
        <div className="mb-3 pb-3 border-b-2 border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-600 font-semibold">DOCUMENTO IMPORTADO</span>
          </div>
          <h4 className="text-gray-900 font-bold truncate" title={eq.nombre_archivo}>
            {eq.nombre_archivo}
          </h4>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
            <Server className="w-5 h-5 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0">
            {!eq.nombre_archivo && <h4 className="text-gray-900 font-semibold truncate">{eq.hostname}</h4>}
            <p className="text-sm text-gray-600">{eq.ip_direccion || 'Sin IP'}</p>
            <p className="text-xs text-gray-500">Site: {eq.site || 'N/A'}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 items-end flex-shrink-0 ml-2">
          <Badge className={eq.activo === 'firewall' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-blue-100 text-blue-700 border border-blue-300'}>
            {eq.activo?.toUpperCase()}
          </Badge>
          {eq.usuario_creador === 'Importado desde Excel' && (
            <Badge className="bg-purple-100 text-purple-700 text-xs flex items-center gap-1 border border-purple-300">
              <FileSpreadsheet className="w-3 h-3" />
              Excel
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-1.5 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
        {eq.marca && (
          <div className="flex items-start">
            <span className="text-gray-500 min-w-[60px]">Marca:</span>
            <span className="text-gray-900 font-medium flex-1">{eq.marca}</span>
          </div>
        )}
        {eq.modelo && (
          <div className="flex items-start">
            <span className="text-gray-500 min-w-[60px]">Modelo:</span>
            <span className="text-gray-900 font-medium flex-1">{eq.modelo}</span>
          </div>
        )}
        {eq.serial && (
          <div className="flex items-start">
            <span className="text-gray-500 min-w-[60px]">Serial:</span>
            <span className="text-gray-900 font-medium flex-1 truncate" title={eq.serial}>{eq.serial}</span>
          </div>
        )}
        {!eq.marca && !eq.modelo && !eq.serial && (
          <p className="text-gray-400 text-center py-1">Sin información técnica</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 hover:bg-gray-100"
          onClick={() => {
            setSelectedEquipment(eq);
            setShowDetails(true);
          }}
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalles
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToPDF(eq)}
          className="border-2 border-red-600 text-red-600 hover:bg-red-50"
          title="Descargar PDF"
        >
          <FileDown className="w-4 h-4" />
        </Button>

        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(eq.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );

  // Vista principal: Selección de secciones
  if (!selectedSection) {
    return (
      <div className="p-8">
        {/* Header con diseño congruente */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Inventario</h1>
                <p className="text-gray-600 text-sm">Selecciona una ubicación para ver sus equipos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {SECCIONES.map((seccion) => {
            const Icon = seccion.icon;
            const count = getEquipmentBySection(seccion.id, '').length;
            const colors = getColorsByRazon(seccion.razonSocial);
            
            return (
              <Card
                key={seccion.id}
                className={`p-6 hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 border-2 ${colors.border}`}
                onClick={() => setSelectedSection(seccion.id)}
              >
                <div className="text-center">
                  <div className={`bg-gradient-to-br ${colors.gradient} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-gray-900 mb-2">{seccion.name}</h3>
                  <Badge className={colors.badgeBg}>
                    {count} equipo{count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Vista detallada: Equipos de la sección seleccionada
  const currentSection = SECCIONES.find(s => s.id === selectedSection);
  const filteredEquipment = getEquipmentBySection(selectedSection, searchTerm);

  return (
    <div className="p-8">
      {/* Header con botón de regreso */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedSection(null);
            setSearchTerm('');
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Secciones
        </Button>
        <div>
          <h2 className="text-gray-900">{currentSection?.name}</h2>
          <p className="text-gray-600">{filteredEquipment.length} equipos registrados</p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <Card className="p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar por hostname, IP, marca, modelo, serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Lista de equipos */}
      {filteredEquipment.length === 0 ? (
        <Card className="p-12 text-center">
          <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">No hay equipos en {currentSection?.name}</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'No se encontraron resultados con esos criterios de búsqueda'
              : 'Comienza registrando equipos en la sección "Hoja de Vida"'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map(renderEquipmentCard)}
        </div>
      )}

      {/* Dialog de Vista Previa Mejorado - MÁS ANCHO */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-[95vw] w-[1400px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <div>
              <DialogTitle className="text-3xl mb-2">Vista Previa - Hoja de Vida</DialogTitle>
              <DialogDescription className="text-base">
                Información completa del equipo {selectedEquipment?.hostname}
              </DialogDescription>
            </div>
          </DialogHeader>
          
          {selectedEquipment && (
            <div className="space-y-6 mt-6">
              {/* ENCABEZADO CON BADGE */}
              <Card className="p-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center">
                      <Server className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl text-gray-900 mb-1">{selectedEquipment.hostname}</h3>
                      <p className="text-gray-600">{selectedEquipment.ip_direccion}</p>
                    </div>
                  </div>
                  <Badge className={`${selectedEquipment.activo === 'firewall' ? 'bg-red-700' : 'bg-red-600'} text-white px-4 py-2 text-lg`}>
                    {selectedEquipment.activo?.toUpperCase()}
                  </Badge>
                </div>
              </Card>

              {/* INFORMACIÓN BÁSICA */}
              <Card className="p-6 border-2">
                <h3 className="text-xl text-gray-900 mb-4 pb-3 border-b-2 border-red-200 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  Información Básica
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Razón Social</span>
                      <span className="text-gray-900 font-medium">{selectedEquipment.razon_social || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Site</span>
                      <span className="text-gray-900 font-medium">{selectedEquipment.site || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Marca</span>
                      <span className="text-gray-900 font-medium">{selectedEquipment.marca || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Modelo</span>
                      <span className="text-gray-900 font-medium">{selectedEquipment.modelo || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Serial</span>
                      <span className="text-gray-900 font-medium">{selectedEquipment.serial || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Proveedor</span>
                      <span className="text-gray-900 font-medium">{selectedEquipment.proveedor || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Fecha de Compra</span>
                      <span className="text-gray-900 font-medium">{selectedEquipment.fecha_compra || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 mb-1">Gabinete</span>
                      <span className="text-gray-900 font-medium">{selectedEquipment.gabinete || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ACCESOS */}
              <Card className="p-6 border-2">
                <h3 className="text-xl text-gray-900 mb-4 pb-3 border-b-2 border-red-200 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  Accesos y Configuración de Red
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Configuración IP</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.configuracion || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Dirección IP</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.ip_direccion || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Gateway</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.gateway || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">WINS/DNS</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.wins_dns || 'N/A'}</span>
                  </div>
                </div>
              </Card>

              {/* CARACTERÍSTICAS TÉCNICAS */}
              <Card className="p-6 border-2">
                <h3 className="text-xl text-gray-900 mb-4 pb-3 border-b-2 border-red-200 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  Características Técnicas
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Funciones</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.funciones || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Procesador</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.procesador || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Memoria NVRAM</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.memoria_nvram || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Backup</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.backup || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Sistema Operativo</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.sistema_operativo || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Versión Firmware</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.version_firmware || 'N/A'}</span>
                  </div>
                </div>
              </Card>

              {/* ADMINISTRADORES */}
              <Card className="p-6 border-2">
                <h3 className="text-xl text-gray-900 mb-4 pb-3 border-b-2 border-red-200 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  Administradores del Sistema
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-2">Usuarios Administradores</span>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-900 whitespace-pre-line">{selectedEquipment.usuarios_admin || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-2">Correos Electrónicos</span>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-900 whitespace-pre-line">{selectedEquipment.correos_admin || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* INFORMACIÓN PROVEEDOR */}
              <Card className="p-6 border-2">
                <h3 className="text-xl text-gray-900 mb-4 pb-3 border-b-2 border-red-200 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  Información del Proveedor
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Cargo Contacto</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.cargo_contacto || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Email</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.email_proveedor || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Teléfono 1</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.telefono_contacto1 || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Teléfono 2</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.telefono_contacto2 || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Responsable</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.responsable_proveedor || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Tiempo de Garantía</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.tiempo_garantia || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Fecha de Entrega</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.fecha_entrega || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 mb-1">Fecha de Terminación</span>
                    <span className="text-gray-900 font-medium">{selectedEquipment.fecha_terminacion || 'N/A'}</span>
                  </div>
                </div>
              </Card>

              {/* MANTENIMIENTOS */}
              {selectedEquipment.mantenimientos && selectedEquipment.mantenimientos.length > 0 && (
                <Card className="p-6 border-2 bg-gradient-to-br from-red-50 to-rose-50">
                  <h3 className="text-xl text-gray-900 mb-4 pb-3 border-b-2 border-red-200 flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                      <Server className="w-5 h-5 text-white" />
                    </div>
                    Historial de Mantenimientos ({selectedEquipment.mantenimientos.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEquipment.mantenimientos.map((mant, idx) => (
                      <Card key={idx} className="p-4 bg-white border-2 border-red-200 hover:shadow-lg transition-shadow">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
                              <span className="text-sm text-red-700 font-medium">📅 {mant.fecha || 'Sin fecha'}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-md text-sm font-medium ${
                              mant.tipo.includes('preventivo') ? 'bg-rose-100 text-rose-700' :
                              mant.tipo === 'correctivo' ? 'bg-orange-100 text-orange-700' :
                              mant.tipo === 'actualizacion' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {mant.tipo || 'Sin tipo'}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500 block mb-1">Descripción</span>
                            <p className="text-gray-900">{mant.descripcion || 'Sin descripción'}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Responsable:</span>
                            <span className="text-gray-900 font-medium">{mant.responsable || 'No especificado'}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}

              {/* BOTÓN EDITAR AL FINAL */}
              {isAdmin && (
                <div className="flex justify-center pt-6 border-t">
                  <Button
                    onClick={() => {
                      setShowDetails(false);
                      setShowEditDialog(true);
                    }}
                    className="gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 px-8 py-3 text-lg"
                  >
                    <Edit className="w-5 h-5" />
                    Editar Hoja de Vida
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Editar Hoja de Vida</DialogTitle>
            <DialogDescription className="text-base">
              Modifica los detalles del equipo
            </DialogDescription>
          </DialogHeader>
          
          {selectedEquipment && (
            <EditarHojaDeVida
              equipment={selectedEquipment}
              onSave={(updatedEquipment) => {
                const updatedList = equipmentList.map(eq => eq.id === updatedEquipment.id ? updatedEquipment : eq);
                localStorage.setItem('equipmentData', JSON.stringify(updatedList));
                setEquipmentList(updatedList);
                toast.success('Hoja de vida actualizada correctamente');
                setShowEditDialog(false);
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}