// ============================================
// NETADMIN V9 - MÓDULO DE SWITCHES
// Gestión de gabinetes con múltiples switches
// ============================================

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Network, Plus, Edit, Trash2, MapPin, Building2, X, Server, FileText, Search, ChevronDown, ChevronUp, ArrowLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { gabineteApi } from '../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoGroupCos from 'figma:asset/aafb32ca9b8d189382fa924f4d3825b962f52208.png';
import logoContactoSolutions from 'figma:asset/5ed0fa05539b840b6fbf0a793bbf08014bf9d12d.png';

interface SwitchData {
  direccionIP: string;
  hostname: string;
  modelo: string;
  campanas: string;
}

interface Gabinete {
  id: string;
  razonSocial: 'grupo cos' | 'contacto solutions';
  site: string;
  nombreGabinete: string;
  switches: SwitchData[];
  fechaRegistro: string;
}

// Interface para Control de Cambios
interface ControlCambios {
  tipo: 'grupo cos' | 'contacto solutions';
  actualizacion: string;
  elaboradoPor: string;
  fechaElaboracion: string;
  fechaRevision: string;
  aprobadoPor: string;
  fechaAprobacion: string;
}

// Sites por razón social
const sitesPorRazon = {
  'grupo cos': [
    'Barranquilla',
    'Calle 80',
    'Calle 93',
    'RRHH',
    'Site 7',
    'Carrera 7',
    'Segmentación Switch'
  ],
  'contacto solutions': [
    'Itagüí',
    'Site 6',
    'Site 5'
  ]
};

// Sites de Contacto Solutions (para determinar colores)
const CONTACTO_SOLUTIONS_SITES = ['Itagüí', 'Site 6', 'Site 5'];

// Todos los sites disponibles
const ALL_SITES = [
  ...sitesPorRazon['grupo cos'],
  ...sitesPorRazon['contacto solutions']
];

export function SwitchModule() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [gabinetes, setGabinetes] = useState<Gabinete[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGabinete, setEditingGabinete] = useState<Gabinete | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGabinetes, setExpandedGabinetes] = useState<Set<string>>(new Set());
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  
  // Estados para Control de Cambios
  const [controlCambiosGrupoCos, setControlCambiosGrupoCos] = useState<ControlCambios | null>(null);
  const [controlCambiosContacto, setControlCambiosContacto] = useState<ControlCambios | null>(null);
  const [showEditControlGrupoCos, setShowEditControlGrupoCos] = useState(false);
  const [showEditControlContacto, setShowEditControlContacto] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    razonSocial: 'grupo cos' as 'grupo cos' | 'contacto solutions',
    site: '',
    nombreGabinete: ''
  });

  const [switchesForm, setSwitchesForm] = useState<SwitchData[]>([
    { direccionIP: '', hostname: '', modelo: '', campanas: '' }
  ]);

  // Estado del formulario de Control de Cambios
  const [controlForm, setControlForm] = useState({
    actualizacion: '',
    elaboradoPor: '',
    fechaElaboracion: '',
    fechaRevision: '',
    aprobadoPor: '',
    fechaAprobacion: ''
  });

  // Cargar gabinetes del localStorage
  useEffect(() => {
    loadGabinetes();
  }, []);

  const loadGabinetes = async () => {
    try {
      console.log('[SWITCH FRONTEND] Iniciando carga de gabinetes...');
      const data = await gabineteApi.getAll();
      console.log('[SWITCH FRONTEND] Gabinetes recibidos del API:', data);
      console.log('[SWITCH FRONTEND] Tipo de dato:', typeof data);
      console.log('[SWITCH FRONTEND] Es array?:', Array.isArray(data));
      console.log('[SWITCH FRONTEND] Cantidad de gabinetes:', data?.length || 0);
      
      setGabinetes(data || []);
      
      if (data && data.length > 0) {
        toast.success(`${data.length} gabinete(s) cargado(s) correctamente`);
      }
    } catch (error: any) {
      console.error('[SWITCH FRONTEND] Error al cargar gabinetes:', error);
      console.error('[SWITCH FRONTEND] Detalles del error:', error.message, error.stack);
      // Inicializar con array vacío para evitar errores en la UI
      setGabinetes([]);
      // Solo mostrar error si es un error real del servidor, no si simplemente no hay datos
      toast.info('Módulo de Switch iniciado. Puedes agregar tu primer gabinete.');
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedGabinetes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGabinetes(newExpanded);
  };

  const handleRazonChange = (value: string) => {
    setFormData({
      ...formData,
      razonSocial: value as 'grupo cos' | 'contacto solutions',
      site: ''
    });
  };

  const handleAddSwitch = () => {
    setSwitchesForm([...switchesForm, { direccionIP: '', hostname: '', modelo: '', campanas: '' }]);
    toast.success('Nuevo switch agregado al formulario');
  };

  const handleRemoveSwitch = (index: number) => {
    if (switchesForm.length === 1) {
      toast.error('Debe haber al menos un switch');
      return;
    }
    const updated = switchesForm.filter((_, i) => i !== index);
    setSwitchesForm(updated);
    toast.info('Switch eliminado del formulario');
  };

  const handleSwitchChange = (index: number, field: keyof SwitchData, value: string) => {
    const updated = [...switchesForm];
    updated[index][field] = value;
    setSwitchesForm(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos del gabinete
    if (!formData.razonSocial || !formData.site || !formData.nombreGabinete) {
      toast.error('Completa todos los campos del gabinete');
      return;
    }

    // Validar que todos los switches tengan datos
    const allSwitchesFilled = switchesForm.every(
      sw => sw.direccionIP && sw.hostname && sw.modelo && sw.campanas
    );

    if (!allSwitchesFilled) {
      toast.error('Completa todos los campos de los switches');
      return;
    }

    try {
      if (editingGabinete) {
        // Editar gabinete existente
        const gabineteData = {
          razonSocial: formData.razonSocial,
          site: formData.site,
          nombreGabinete: formData.nombreGabinete,
          switches: switchesForm,
          fechaRegistro: editingGabinete.fechaRegistro
        };
        
        await gabineteApi.update(editingGabinete.id, gabineteData);
        toast.success('Gabinete actualizado correctamente');
      } else {
        // Crear nuevo gabinete
        const nuevoGabinete = {
          razonSocial: formData.razonSocial,
          site: formData.site,
          nombreGabinete: formData.nombreGabinete,
          switches: switchesForm
        };
        
        await gabineteApi.create(nuevoGabinete);
        toast.success(`Gabinete registrado con ${switchesForm.length} switch(es)`);
      }

      // Recargar gabinetes desde la base de datos
      await loadGabinetes();
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar gabinete:', error);
      toast.error(error.message || 'Error al guardar gabinete');
    }
  };

  const handleEdit = (gab: Gabinete) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para editar');
      return;
    }
    setEditingGabinete(gab);
    setFormData({
      razonSocial: gab.razonSocial,
      site: gab.site,
      nombreGabinete: gab.nombreGabinete
    });
    setSwitchesForm(gab.switches);
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para eliminar');
      return;
    }
    
    if (confirm('¿Estás seguro de eliminar este gabinete y todos sus switches?')) {
      try {
        await gabineteApi.delete(id);
        toast.success('Gabinete eliminado correctamente');
        
        // Recargar gabinetes desde la base de datos
        await loadGabinetes();
      } catch (error: any) {
        console.error('Error al eliminar gabinete:', error);
        toast.error(error.message || 'Error al eliminar gabinete');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      razonSocial: 'grupo cos',
      site: '',
      nombreGabinete: ''
    });
    setSwitchesForm([{ direccionIP: '', hostname: '', modelo: '', campanas: '' }]);
    setEditingGabinete(null);
    setShowAddDialog(false);
  };

  // Función auxiliar para convertir imagen a base64
  const getImageBase64 = (imgSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          reject(new Error('No se pudo obtener contexto del canvas'));
        }
      };
      img.onerror = reject;
      img.src = imgSrc;
    });
  };

  // Exportar site individual a PDF
  const exportSiteToPDF = async (siteName: string) => {
    const gabinetesSite = gabinetes.filter(gab => gab.site === siteName);
    
    if (gabinetesSite.length === 0) {
      toast.error('No hay gabinetes para exportar en este site');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Determinar si es Contacto Solutions (azul) o Grupo Cos (rojo)
      const isContacto = CONTACTO_SOLUTIONS_SITES.includes(siteName);
      const colorPrimario = isContacto ? [37, 99, 235] : [220, 38, 38];
      const colorSecundario = isContacto ? [29, 78, 216] : [185, 28, 28];
      
      // Pre-cargar logos
      let logoGroupCosBase64: string | null = null;
      let logoContactoSolutionsBase64: string | null = null;
      
      try {
        logoGroupCosBase64 = await getImageBase64(logoGroupCos);
      } catch (e) {
        console.warn('No se pudo cargar logo Grupo Cos:', e);
      }
      
      try {
        logoContactoSolutionsBase64 = await getImageBase64(logoContactoSolutions);
      } catch (e) {
        console.warn('No se pudo cargar logo Contacto Solutions:', e);
      }
      
      // ============================================
      // ENCABEZADO DEL DOCUMENTO
      // ============================================
      
      if (!isContacto) {
        // ============================================
        // LAYOUT PARA GRUPO COS
        // ============================================
        
        // Logo en la esquina superior derecha
        if (logoGroupCosBase64) {
          doc.addImage(logoGroupCosBase64, 'PNG', 155, 10, 45, 18);
        } else {
          // Fallback: rectángulo con texto
          doc.setFillColor(220, 38, 38);
          doc.rect(155, 10, 45, 18, 'F');
          doc.setFontSize(14);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text('GroupCos', 177.5, 20, { align: 'center' });
        }

        // Tabla de información del documento
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        
        // Fila 1: Título
        doc.rect(10, 10, 140, 9);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text('Accesos Red de Distribución y Acceso Capa 2', 80, 16, { align: 'center' });
        
        doc.rect(10, 19, 140, 9);
        doc.text('Gestión Tecnológica y Diseño', 80, 25, { align: 'center' });

        // Columna derecha: Versión y Fecha
        doc.rect(150, 10, 50, 9);
        doc.text('Versión 01', 175, 16, { align: 'center' });
        
        doc.rect(150, 19, 50, 9);
        const fechaEmision = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
        doc.text(`Fecha de Emisión ${fechaEmision}`, 175, 25, { align: 'center' });
        
      } else {
        // ============================================
        // LAYOUT PARA CONTACTO SOLUTIONS
        // ============================================
        
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        
        // Recuadro del logo (izquierda superior)
        doc.rect(10, 10, 80, 18);
        
        // Logo Contacto Solutions dentro del recuadro
        if (logoContactoSolutionsBase64) {
          doc.addImage(logoContactoSolutionsBase64, 'PNG', 15, 11.5, 70, 15);
        } else {
          // Fallback: texto
          doc.setFillColor(37, 99, 235);
          doc.rect(10, 10, 80, 18, 'F');
          doc.setFontSize(12);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text('Contacto Solutions', 50, 20, { align: 'center' });
        }
        
        // Título central
        doc.rect(90, 10, 60, 9);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text('Matriz de Switches', 120, 16, { align: 'center' });
        
        // Subtítulo
        doc.rect(90, 19, 60, 9);
        doc.text('Gestión Tecnológica y Diseño', 120, 25, { align: 'center' });

        // Versión
        doc.rect(150, 10, 50, 9);
        doc.text('Versión 01', 175, 16, { align: 'center' });
        
        // Fecha de emisión
        doc.rect(150, 19, 50, 9);
        const fechaEmisionCS = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
        doc.text(`Fecha de Emisión ${fechaEmisionCS}`, 175, 25, { align: 'center' });
      }

      let yPosition = 40;

      // ============================================
      // ITERAR SOBRE GABINETES DEL SITE
      // ============================================
      
      gabinetesSite.forEach((gab, gabIndex) => {
        // Verificar espacio para nuevo gabinete
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        // ============================================
        // ENCABEZADO DEL GABINETE
        // ============================================
        
        doc.setFillColor(...colorPrimario);
        doc.rect(10, yPosition, 190, 8, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(gab.nombreGabinete.toUpperCase(), 105, yPosition + 5.5, { align: 'center' });
        
        yPosition += 10;

        // ============================================
        // TABLA DE SWITCHES
        // ============================================
        
        const switchData = gab.switches.map(sw => [
          sw.direccionIP,
          sw.modelo,
          sw.hostname,
          sw.campanas
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Dirección IP', 'Modelo', 'Hostname', 'Campañas']],
          body: switchData,
          theme: 'grid',
          headStyles: { 
            fillColor: colorSecundario,
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 8,
            textColor: [0, 0, 0]
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 35 },
            1: { halign: 'center', cellWidth: 50 },
            2: { halign: 'center', cellWidth: 45 },
            3: { halign: 'left', cellWidth: 60 }
          },
          margin: { left: 10, right: 10 },
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.5
        });

        yPosition = (doc as any).lastAutoTable.finalY + 8;
      });

      const fileName = `switches_${siteName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success(`PDF de ${siteName} descargado correctamente`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  // ============================================
  // FUNCIONES CONTROL DE CAMBIOS
  // ============================================

  const handleSaveControlGrupoCos = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!controlForm.actualizacion || !controlForm.elaboradoPor || !controlForm.fechaElaboracion ||
        !controlForm.fechaRevision || !controlForm.aprobadoPor || !controlForm.fechaAprobacion) {
      toast.error('Completa todos los campos obligatorios del control de cambios');
      return;
    }

    try {
      const controlData: ControlCambios = {
        tipo: 'grupo cos',
        ...controlForm
      };
      localStorage.setItem('controlCambiosSwitchGrupoCos', JSON.stringify(controlData));
      setControlCambiosGrupoCos(controlData);
      toast.success('Control de Cambios de Grupo COS guardado correctamente');
      setShowEditControlGrupoCos(false);
      resetControlForm();
    } catch (error: any) {
      console.error('Error al guardar control de cambios:', error);
      toast.error('Error al guardar el control de cambios');
    }
  };

  const handleSaveControlContacto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!controlForm.actualizacion || !controlForm.elaboradoPor || !controlForm.fechaElaboracion ||
        !controlForm.fechaRevision || !controlForm.aprobadoPor || !controlForm.fechaAprobacion) {
      toast.error('Completa todos los campos obligatorios del control de cambios');
      return;
    }

    try {
      const controlData: ControlCambios = {
        tipo: 'contacto solutions',
        ...controlForm
      };
      localStorage.setItem('controlCambiosSwitchContacto', JSON.stringify(controlData));
      setControlCambiosContacto(controlData);
      toast.success('Control de Cambios de Contacto Solutions guardado correctamente');
      setShowEditControlContacto(false);
      resetControlForm();
    } catch (error: any) {
      console.error('Error al guardar control de cambios:', error);
      toast.error('Error al guardar el control de cambios');
    }
  };

  const openEditControlGrupoCos = () => {
    if (!isAdmin) {
      toast.error('No tienes permisos para editar');
      return;
    }
    if (controlCambiosGrupoCos) {
      setControlForm({
        actualizacion: controlCambiosGrupoCos.actualizacion || '',
        elaboradoPor: controlCambiosGrupoCos.elaboradoPor || '',
        fechaElaboracion: controlCambiosGrupoCos.fechaElaboracion || '',
        fechaRevision: controlCambiosGrupoCos.fechaRevision || '',
        aprobadoPor: controlCambiosGrupoCos.aprobadoPor || '',
        fechaAprobacion: controlCambiosGrupoCos.fechaAprobacion || ''
      });
    }
    setShowEditControlGrupoCos(true);
  };

  const openEditControlContacto = () => {
    if (!isAdmin) {
      toast.error('No tienes permisos para editar');
      return;
    }
    if (controlCambiosContacto) {
      setControlForm({
        actualizacion: controlCambiosContacto.actualizacion || '',
        elaboradoPor: controlCambiosContacto.elaboradoPor || '',
        fechaElaboracion: controlCambiosContacto.fechaElaboracion || '',
        fechaRevision: controlCambiosContacto.fechaRevision || '',
        aprobadoPor: controlCambiosContacto.aprobadoPor || '',
        fechaAprobacion: controlCambiosContacto.fechaAprobacion || ''
      });
    }
    setShowEditControlContacto(true);
  };

  const resetControlForm = () => {
    setControlForm({
      actualizacion: '',
      elaboradoPor: '',
      fechaElaboracion: '',
      fechaRevision: '',
      aprobadoPor: '',
      fechaAprobacion: ''
    });
  };

  // Cargar controles de cambios al iniciar
  useEffect(() => {
    const grupoCosData = localStorage.getItem('controlCambiosSwitchGrupoCos');
    const contactoData = localStorage.getItem('controlCambiosSwitchContacto');
    
    if (grupoCosData) {
      setControlCambiosGrupoCos(JSON.parse(grupoCosData));
    }
    if (contactoData) {
      setControlCambiosContacto(JSON.parse(contactoData));
    }
  }, []);

  // Filtrar gabinetes por búsqueda
  const filteredGabinetes = gabinetes.filter(gab => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    const matchGabinete = gab.nombreGabinete.toLowerCase().includes(search);
    const matchSite = gab.site.toLowerCase().includes(search);
    const matchRazon = gab.razonSocial.toLowerCase().includes(search);
    const matchSwitches = gab.switches.some(sw =>
      sw.direccionIP.toLowerCase().includes(search) ||
      sw.hostname.toLowerCase().includes(search) ||
      sw.modelo.toLowerCase().includes(search) ||
      sw.campanas.toLowerCase().includes(search)
    );
    
    return matchGabinete || matchSite || matchRazon || matchSwitches;
  });

  // Filtrar gabinetes del site actual si hay uno seleccionado
  const getCurrentSiteGabinetes = () => {
    if (!selectedSite) return [];
    return filteredGabinetes.filter(gab => gab.site === selectedSite);
  };

  // Calcular total de switches
  const totalSwitches = gabinetes.reduce((acc, gab) => acc + gab.switches.length, 0);

  // Abrir dialog para agregar gabinete con site pre-seleccionado
  const openAddDialogForSite = (siteName: string) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para agregar gabinetes');
      return;
    }
    
    // Determinar razón social del site
    const razonSocial = CONTACTO_SOLUTIONS_SITES.includes(siteName) 
      ? 'contacto solutions' 
      : 'grupo cos';
    
    setFormData({
      razonSocial,
      site: siteName,
      nombreGabinete: ''
    });
    setSwitchesForm([{ direccionIP: '', hostname: '', modelo: '', campanas: '' }]);
    setEditingGabinete(null);
    setShowAddDialog(true);
  };

  // Componente de tarjeta de gabinete
  const GabineteCard = ({ gab }: { gab: Gabinete }) => {
    const isExpanded = expandedGabinetes.has(gab.id);
    const isGrupoCos = gab.razonSocial === 'grupo cos';
    
    const colorClasses = isGrupoCos
      ? 'border-red-300 bg-gradient-to-br from-red-50 to-white hover:border-red-500'
      : 'border-blue-300 bg-gradient-to-br from-blue-50 to-white hover:border-blue-500';
    
    const badgeClasses = isGrupoCos
      ? 'bg-red-100 text-red-700 border-red-300'
      : 'bg-blue-100 text-blue-700 border-blue-300';
    
    const iconColor = isGrupoCos ? 'text-red-600' : 'text-blue-600';
    const buttonBgClasses = isGrupoCos
      ? 'bg-gradient-to-br from-red-600 to-red-700'
      : 'bg-gradient-to-br from-blue-600 to-blue-700';

    return (
      <Card className={`border-2 ${colorClasses} transition-all hover:shadow-xl overflow-hidden`}>
        {/* Header de la tarjeta - Siempre visible */}
        <div
          onClick={() => toggleExpanded(gab.id)}
          className="p-5 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-14 h-14 ${buttonBgClasses} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Server className="w-7 h-7 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{gab.nombreGabinete}</h3>
                  <Badge variant="outline" className={badgeClasses}>
                    {gab.switches.length} switch{gab.switches.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>

                {!isExpanded && (
                  <p className="text-xs text-gray-500">
                    Click para ver detalles de los switches
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {isAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(gab);
                    }}
                    className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(gab.id);
                    }}
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              {isExpanded ? (
                <ChevronUp className={`w-6 h-6 ${iconColor}`} />
              ) : (
                <ChevronDown className={`w-6 h-6 ${iconColor}`} />
              )}
            </div>
          </div>
        </div>

        {/* Contenido expandible - Switches */}
        {isExpanded && (
          <div className="px-5 pb-5 pt-2 border-t border-gray-200 bg-white/50">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Network className={`w-4 h-4 ${iconColor}`} />
              Switches del Gabinete
            </h4>
            <div className="space-y-3">
              {gab.switches.map((sw, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 ${buttonBgClasses} rounded flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <h5 className="font-medium text-gray-900">Switch {idx + 1}</h5>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">IP:</span>
                      <span className="ml-2 font-medium text-gray-900">{sw.direccionIP}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Hostname:</span>
                      <span className="ml-2 font-medium text-gray-900">{sw.hostname}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Modelo:</span>
                      <span className="ml-2 font-medium text-gray-900">{sw.modelo}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Campañas:</span>
                      <span className="ml-2 font-medium text-gray-900">{sw.campanas}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  // ============================================
  // VISTA DE DASHBOARD - MOSTRAR SITES
  // ============================================
  if (!selectedSite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Network className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 text-2xl">Gestión de Switches</h1>
                <p className="text-gray-600 text-sm">{gabinetes.length} gabinete(s) • {totalSwitches} switch(es) en total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Sites */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_SITES.map(siteName => {
            const gabinetesCount = gabinetes.filter(gab => gab.site === siteName).length;
            const switchesCount = gabinetes
              .filter(gab => gab.site === siteName)
              .reduce((acc, gab) => acc + gab.switches.length, 0);
            
            const isContacto = CONTACTO_SOLUTIONS_SITES.includes(siteName);
            const colors = isContacto
              ? {
                  gradient: 'from-blue-600 to-cyan-600',
                  border: 'border-blue-300 hover:border-blue-500',
                  bg: 'bg-blue-600',
                  badgeBg: 'bg-blue-100 text-blue-700',
                  chevronColor: 'text-blue-600'
                }
              : {
                  gradient: 'from-red-600 to-rose-600',
                  border: 'border-red-300 hover:border-red-500',
                  bg: 'bg-red-600',
                  badgeBg: 'bg-red-100 text-red-700',
                  chevronColor: 'text-red-600'
                };

            return (
              <Card
                key={siteName}
                onClick={() => setSelectedSite(siteName)}
                className={`border-2 ${colors.border} transition-all cursor-pointer hover:shadow-lg group`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center`}>
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className={`w-6 h-6 ${colors.chevronColor} group-hover:translate-x-1 transition-transform`} />
                  </div>

                  <div>
                    <h3 className="text-gray-900 mb-1">{siteName}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={colors.badgeBg}>
                        {gabinetesCount} gabinete{gabinetesCount !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-gray-600">
                        {switchesCount} switch{switchesCount !== 1 ? 'es' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CONTROL DE CAMBIOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Control de Cambios - GRUPO COS */}
          <Card className="border-2 border-red-300">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  <h2 className="">Control de Cambios</h2>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  GRUPO COS
                </Badge>
              </div>
            </div>

            <div className="p-6">
              {controlCambiosGrupoCos ? (
                <div className="space-y-4">
                  <div className="border-2 border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-600 mb-3">📋 Registro de Control</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-gray-500">Actualización:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.actualizacion}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Elaborado por:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.elaboradoPor}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de elaboración:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.fechaElaboracion}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de revisión:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.fechaRevision}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Aprobado por:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.aprobadoPor}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de aprobación:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.fechaAprobacion}</p>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <Button
                      onClick={openEditControlGrupoCos}
                      variant="outline"
                      size="sm"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay control de cambios configurado</p>
                  {isAdmin && (
                    <Button
                      onClick={() => setShowEditControlGrupoCos(true)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Control
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Control de Cambios - CONTACTO SOLUTIONS */}
          <Card className="border-2 border-blue-300">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  <h2 className="">Control de Cambios</h2>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  CONTACTO SOLUTIONS
                </Badge>
              </div>
            </div>

            <div className="p-6">
              {controlCambiosContacto ? (
                <div className="space-y-4">
                  <div className="border-2 border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-600 mb-3">📋 Registro de Control</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-gray-500">Actualización:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.actualizacion}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Elaborado por:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.elaboradoPor}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de elaboración:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.fechaElaboracion}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de revisión:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.fechaRevision}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Aprobado por:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.aprobadoPor}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de aprobación:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.fechaAprobacion}</p>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <Button
                      onClick={openEditControlContacto}
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No hay control de cambios configurado</p>
                  {isAdmin && (
                    <Button
                      onClick={() => setShowEditControlContacto(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Control
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Dialogs globales para Control de Cambios */}
        <Dialog open={showEditControlGrupoCos} onOpenChange={setShowEditControlGrupoCos}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                Control de Cambios - GRUPO COS
              </DialogTitle>
              <DialogDescription>
                Configura el control de cambios para Grupo COS
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveControlGrupoCos} className="space-y-4">
              <div className="border-2 border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información de Control de Cambios
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gc-sw-actualizacion">Actualización *</Label>
                    <Input
                      id="gc-sw-actualizacion"
                      value={controlForm.actualizacion}
                      onChange={(e) => setControlForm({ ...controlForm, actualizacion: e.target.value })}
                      placeholder="Descripción de la actualización"
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gc-sw-elaboradoPor">Elaborado por *</Label>
                    <Input
                      id="gc-sw-elaboradoPor"
                      value={controlForm.elaboradoPor}
                      onChange={(e) => setControlForm({ ...controlForm, elaboradoPor: e.target.value })}
                      placeholder="Nombre de quien elabora"
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="gc-sw-fechaElaboracion">Fecha de elaboración *</Label>
                    <Input
                      id="gc-sw-fechaElaboracion"
                      type="date"
                      value={controlForm.fechaElaboracion}
                      onChange={(e) => setControlForm({ ...controlForm, fechaElaboracion: e.target.value })}
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gc-sw-fechaRevision">Fecha de revisión *</Label>
                    <Input
                      id="gc-sw-fechaRevision"
                      type="date"
                      value={controlForm.fechaRevision}
                      onChange={(e) => setControlForm({ ...controlForm, fechaRevision: e.target.value })}
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="gc-sw-aprobadoPor">Aprobado por *</Label>
                    <Input
                      id="gc-sw-aprobadoPor"
                      value={controlForm.aprobadoPor}
                      onChange={(e) => setControlForm({ ...controlForm, aprobadoPor: e.target.value })}
                      placeholder="Nombre de quien aprueba"
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gc-sw-fechaAprobacion">Fecha de aprobación *</Label>
                    <Input
                      id="gc-sw-fechaAprobacion"
                      type="date"
                      value={controlForm.fechaAprobacion}
                      onChange={(e) => setControlForm({ ...controlForm, fechaAprobacion: e.target.value })}
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditControlGrupoCos(false);
                    resetControlForm();
                  }}
                  className="border-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditControlContacto} onOpenChange={setShowEditControlContacto}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-600">
                Control de Cambios - CONTACTO SOLUTIONS
              </DialogTitle>
              <DialogDescription>
                Configura el control de cambios para Contacto Solutions
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveControlContacto} className="space-y-4">
              <div className="border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-600 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información de Control de Cambios
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cs-sw-actualizacion">Actualización *</Label>
                    <Input
                      id="cs-sw-actualizacion"
                      value={controlForm.actualizacion}
                      onChange={(e) => setControlForm({ ...controlForm, actualizacion: e.target.value })}
                      placeholder="Descripción de la actualización"
                      required
                      className="border-2 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cs-sw-elaboradoPor">Elaborado por *</Label>
                    <Input
                      id="cs-sw-elaboradoPor"
                      value={controlForm.elaboradoPor}
                      onChange={(e) => setControlForm({ ...controlForm, elaboradoPor: e.target.value })}
                      placeholder="Nombre de quien elabora"
                      required
                      className="border-2 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="cs-sw-fechaElaboracion">Fecha de elaboración *</Label>
                    <Input
                      id="cs-sw-fechaElaboracion"
                      type="date"
                      value={controlForm.fechaElaboracion}
                      onChange={(e) => setControlForm({ ...controlForm, fechaElaboracion: e.target.value })}
                      required
                      className="border-2 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cs-sw-fechaRevision">Fecha de revisión *</Label>
                    <Input
                      id="cs-sw-fechaRevision"
                      type="date"
                      value={controlForm.fechaRevision}
                      onChange={(e) => setControlForm({ ...controlForm, fechaRevision: e.target.value })}
                      required
                      className="border-2 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="cs-sw-aprobadoPor">Aprobado por *</Label>
                    <Input
                      id="cs-sw-aprobadoPor"
                      value={controlForm.aprobadoPor}
                      onChange={(e) => setControlForm({ ...controlForm, aprobadoPor: e.target.value })}
                      placeholder="Nombre de quien aprueba"
                      required
                      className="border-2 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cs-sw-fechaAprobacion">Fecha de aprobación *</Label>
                    <Input
                      id="cs-sw-fechaAprobacion"
                      type="date"
                      value={controlForm.fechaAprobacion}
                      onChange={(e) => setControlForm({ ...controlForm, fechaAprobacion: e.target.value })}
                      required
                      className="border-2 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditControlContacto(false);
                    resetControlForm();
                  }}
                  className="border-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ============================================
  // VISTA DE DETALLE DEL SITE SELECCIONADO
  // ============================================
  const currentSiteGabinetes = getCurrentSiteGabinetes();
  const isContactoSite = CONTACTO_SOLUTIONS_SITES.includes(selectedSite);
  const siteColors = isContactoSite
    ? {
        gradient: 'from-blue-600 to-cyan-600',
        bg: 'bg-blue-600',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-600',
        hoverBg: 'hover:bg-blue-50'
      }
    : {
        gradient: 'from-red-600 to-rose-600',
        bg: 'bg-red-600',
        textColor: 'text-red-600',
        borderColor: 'border-red-600',
        hoverBg: 'hover:bg-red-50'
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedSite(null);
                  setSearchTerm('');
                }}
                className={`${siteColors.textColor} ${siteColors.hoverBg}`}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </Button>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className={`w-12 h-12 bg-gradient-to-br ${siteColors.gradient} rounded-lg flex items-center justify-center`}>
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">{selectedSite}</h1>
                <p className="text-gray-600 text-sm">{currentSiteGabinetes.length} gabinete(s) configurado(s)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  onClick={() => openAddDialogForSite(selectedSite)}
                  className={`bg-gradient-to-r ${siteColors.gradient} hover:opacity-90 text-white`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Agregar Gabinete
                </Button>
              )}
              {currentSiteGabinetes.length > 0 && (
                <Button
                  onClick={() => exportSiteToPDF(selectedSite)}
                  variant="outline"
                  className={`border-2 ${siteColors.borderColor} ${siteColors.textColor} ${siteColors.hoverBg}`}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Exportar PDF
                </Button>
              )}
            </div>
          </div>

          {/* Barra de búsqueda */}
          {currentSiteGabinetes.length > 0 && (
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${siteColors.textColor} w-5 h-5`} />
              <Input
                type="text"
                placeholder="Buscar por nombre, IP, hostname, modelo o campañas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 border-2 border-gray-300 focus:${siteColors.borderColor}`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Lista de Gabinetes del Site */}
      {currentSiteGabinetes.length > 0 ? (
        <div className="grid gap-4">
          {currentSiteGabinetes.map(gab => (
            <GabineteCard key={gab.id} gab={gab} />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-white">
          <Server className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          {searchTerm ? (
            <p className="text-gray-500 text-lg">No se encontraron gabinetes que coincidan con "{searchTerm}"</p>
          ) : (
            <>
              <p className="text-gray-500 text-lg mb-4">No hay gabinetes en este site</p>
              {isAdmin && (
                <Button
                  onClick={() => openAddDialogForSite(selectedSite)}
                  className={`bg-gradient-to-r ${siteColors.gradient} text-white`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar primer gabinete
                </Button>
              )}
            </>
          )}
        </Card>
      )}

      {/* Dialog para Agregar/Editar Gabinete con Switches */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center">
                <Network className="w-6 h-6 text-white" />
              </div>
              {editingGabinete ? 'Editar Gabinete' : 'Registrar Nuevo Gabinete con Switches'}
            </DialogTitle>
            <DialogDescription>
              Completa la información del gabinete y agrega todos los switches que contiene
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECCIÓN 1: DATOS DEL GABINETE */}
            <Card className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                Datos del Gabinete
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Razón Social */}
                <div>
                  <Label htmlFor="razonSocial">Razón Social *</Label>
                  <Select
                    value={formData.razonSocial}
                    onValueChange={handleRazonChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grupo cos">Grupo Cos</SelectItem>
                      <SelectItem value="contacto solutions">Contacto Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Site */}
                <div>
                  <Label htmlFor="site">Site / Ubicación *</Label>
                  <Select
                    value={formData.site}
                    onValueChange={(value) => setFormData({ ...formData, site: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sitesPorRazon[formData.razonSocial].map(site => (
                        <SelectItem key={site} value={site}>{site}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nombre del Gabinete */}
                <div>
                  <Label htmlFor="nombreGabinete">Nombre del Gabinete *</Label>
                  <Input
                    id="nombreGabinete"
                    value={formData.nombreGabinete}
                    onChange={(e) => setFormData({ ...formData, nombreGabinete: e.target.value })}
                    placeholder="Ej: Gabinete Principal A"
                  />
                </div>
              </div>
            </Card>

            {/* SECCIÓN 2: SWITCHES DEL GABINETE */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-red-600" />
                  Switches del Gabinete
                </h3>
                <Button
                  type="button"
                  onClick={handleAddSwitch}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Plus className="w-4 h-4" />
                  Agregar otro switch
                </Button>
              </div>

              <div className="space-y-4">
                {switchesForm.map((sw, index) => (
                  <Card key={index} className="p-4 bg-gray-50 border-2 border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-700">Switch {index + 1}</h4>
                      {switchesForm.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSwitch(index)}
                          className="hover:bg-red-100"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Dirección IP *</Label>
                        <Input
                          value={sw.direccionIP}
                          onChange={(e) => handleSwitchChange(index, 'direccionIP', e.target.value)}
                          placeholder="192.168.1.1"
                        />
                      </div>

                      <div>
                        <Label>Hostname *</Label>
                        <Input
                          value={sw.hostname}
                          onChange={(e) => handleSwitchChange(index, 'hostname', e.target.value)}
                          placeholder="SW-CORE-01"
                        />
                      </div>

                      <div>
                        <Label>Modelo *</Label>
                        <Input
                          value={sw.modelo}
                          onChange={(e) => handleSwitchChange(index, 'modelo', e.target.value)}
                          placeholder="Cisco Catalyst 9300"
                        />
                      </div>

                      <div>
                        <Label>Campañas *</Label>
                        <Input
                          value={sw.campanas}
                          onChange={(e) => handleSwitchChange(index, 'campanas', e.target.value)}
                          placeholder="Ventas, Soporte, Call Center"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
              >
                <Server className="w-4 h-4 mr-2" />
                {editingGabinete ? 'Actualizar Gabinete' : `Registrar Gabinete (${switchesForm.length} switches)`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}