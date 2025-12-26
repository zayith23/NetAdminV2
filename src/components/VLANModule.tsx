// ============================================
// NETADMIN V9 - MÓDULO DE VLAN
// Gestión de VLANs por site con control de cambios
// ============================================

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Network, Plus, Edit, Trash2, Search, X, FileText, MapPin, Shield, ArrowLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { vlanApi, controlCambiosApi } from '../lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoGroupCos from 'figma:asset/26d33fcf7d243d0c7e3b5a560e6a523b11239644.png';
import logoContactoSolutions from 'figma:asset/5ed0fa05539b840b6fbf0a793bbf08014bf9d12d.png';

// Interface para una VLAN individual
interface VLAN {
  id: string;
  idVlan: string;
  campana: string;
  direccionRed: string;
  gateway: string;
  observaciones: string;
}

// Interface para un site con múltiples VLANs
interface SiteVLAN {
  id: string;
  site: string;
  vlans: VLAN[];
  fechaRegistro: string;
}

// Interface para Control de Cambios
interface ControlCambios {
  tipo: 'grupo cos' | 'contacto solutions';
  idVlan: string;
  campana: string;
  direccionRed: string;
  gateway: string;
  observaciones: string;
  // Campos de auditoría
  actualizacion: string;
  elaboradoPor: string;
  fechaElaboracion: string;
  fechaRevision: string;
  aprobadoPor: string;
  fechaAprobacion: string;
}

// Lista de sites disponibles
const SITES = [
  'SITE 7',
  'CRA 7',
  'CALLE 93',
  'BARRANQUILLA',
  'CALLE 80',
  'SITE 5',
  'SITE 6',
  'ITAGUI'
];

// Sites de Contacto Solutions (azul)
const CONTACTO_SOLUTIONS_SITES = ['SITE 5', 'SITE 6', 'ITAGUI'];

// Función helper para determinar colores por site
const getSiteColors = (siteName: string) => {
  const isContacto = CONTACTO_SOLUTIONS_SITES.includes(siteName);
  
  if (isContacto) {
    return {
      cardBorder: 'border-gray-200 hover:border-blue-500',
      cardBg: 'from-white to-blue-50',
      iconBg: 'from-blue-600 to-cyan-600',
      badgeBg: 'bg-blue-100 text-blue-700 border-blue-300',
      chevronColor: 'text-blue-600'
    };
  } else {
    return {
      cardBorder: 'border-gray-200 hover:border-red-500',
      cardBg: 'from-white to-red-50',
      iconBg: 'from-red-600 to-rose-600',
      badgeBg: 'bg-red-100 text-red-700 border-red-300',
      chevronColor: 'text-red-600'
    };
  }
};

export function VLANModule() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [sitesVLAN, setSitesVLAN] = useState<SiteVLAN[]>([]);
  const [controlCambiosGrupoCos, setControlCambiosGrupoCos] = useState<ControlCambios | null>(null);
  const [controlCambiosContacto, setControlCambiosContacto] = useState<ControlCambios | null>(null);
  
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVLAN, setEditingVLAN] = useState<VLAN | null>(null);
  
  const [showEditControlGrupoCos, setShowEditControlGrupoCos] = useState(false);
  const [showEditControlContacto, setShowEditControlContacto] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Estado del formulario de VLANs
  const [vlansForm, setVlansForm] = useState<Omit<VLAN, 'id'>[]>([
    { idVlan: '', campana: '', direccionRed: '', gateway: '', observaciones: '' }
  ]);

  // Estado para una sola VLAN (editar individual)
  const [singleVLANForm, setSingleVLANForm] = useState({
    idVlan: '',
    campana: '',
    direccionRed: '',
    gateway: '',
    observaciones: ''
  });

  // Estado para Control de Cambios
  const [controlForm, setControlForm] = useState({
    idVlan: '',
    campana: '',
    direccionRed: '',
    gateway: '',
    observaciones: '',
    actualizacion: '',
    elaboradoPor: '',
    fechaElaboracion: '',
    fechaRevision: '',
    aprobadoPor: '',
    fechaAprobacion: ''
  });

  // Cargar datos de la base de datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('[VLAN FRONTEND] Iniciando carga de datos...');
      
      // Cargar sites con VLANs
      const sitesData = await vlanApi.getAll();
      console.log('[VLAN FRONTEND] Sites VLAN recibidos del API:', sitesData);
      console.log('[VLAN FRONTEND] Tipo de dato:', typeof sitesData);
      console.log('[VLAN FRONTEND] Es array?:', Array.isArray(sitesData));
      console.log('[VLAN FRONTEND] Cantidad de sites:', sitesData?.length || 0);
      
      setSitesVLAN(sitesData || []);
      
      if (sitesData && sitesData.length > 0) {
        toast.success(`${sitesData.length} site(s) VLAN cargado(s) correctamente`);
      }

      // Cargar controles de cambios
      const controlesData = await controlCambiosApi.getAll();
      console.log('[VLAN FRONTEND] Controles de cambios cargados:', controlesData);
      setControlCambiosGrupoCos(controlesData?.grupoCos || null);
      setControlCambiosContacto(controlesData?.contacto || null);
    } catch (error: any) {
      console.error('[VLAN FRONTEND] Error al cargar VLANs:', error);
      console.error('[VLAN FRONTEND] Detalles del error:', error.message, error.stack);
      // Inicializar con arrays/objetos vacíos para evitar errores en la UI
      setSitesVLAN([]);
      setControlCambiosGrupoCos(null);
      setControlCambiosContacto(null);
      // Solo mostrar error si es un error real del servidor, no si simplemente no hay datos
      toast.info('Módulo de VLAN iniciado. Puedes agregar tu primer site.');
    }
  };

  const handleAddVLAN = () => {
    setVlansForm([
      ...vlansForm,
      { idVlan: '', campana: '', direccionRed: '', gateway: '', observaciones: '' }
    ]);
    toast.success('Nueva VLAN agregada al formulario');
  };

  const handleRemoveVLAN = (index: number) => {
    if (vlansForm.length === 1) {
      toast.error('Debe haber al menos una VLAN');
      return;
    }
    const updated = vlansForm.filter((_, i) => i !== index);
    setVlansForm(updated);
    toast.info('VLAN eliminada del formulario');
  };

  const handleVLANChange = (index: number, field: keyof Omit<VLAN, 'id'>, value: string) => {
    const updated = [...vlansForm];
    updated[index][field] = value;
    setVlansForm(updated);
  };

  const handleSubmitSite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSite) {
      toast.error('Selecciona un site');
      return;
    }

    const allVLANsFilled = vlansForm.every(
      vlan => vlan.idVlan && vlan.campana && vlan.direccionRed && vlan.gateway
    );

    if (!allVLANsFilled) {
      toast.error('Completa todos los campos obligatorios de las VLANs');
      return;
    }

    try {
      const siteData = sitesVLAN.find(s => s.site === selectedSite);

      if (siteData) {
        // Agregar VLANs al site existente
        const newVLANs = vlansForm.map((vlan, idx) => ({
          id: `vlan_${Date.now()}_${idx}`,
          ...vlan
        }));
        
        const updatedSite = {
          ...siteData,
          vlans: [...siteData.vlans, ...newVLANs]
        };

        await vlanApi.update(siteData.id, updatedSite);
        toast.success(`${vlansForm.length} VLAN(s) agregada(s) al site`);
      } else {
        // Crear nuevo site
        const nuevoSite: Omit<SiteVLAN, 'id' | 'fechaRegistro'> = {
          site: selectedSite,
          vlans: vlansForm.map((vlan, idx) => ({
            id: `vlan_${Date.now()}_${idx}`,
            ...vlan
          }))
        };

        await vlanApi.create(nuevoSite);
        toast.success(`Site registrado con ${vlansForm.length} VLANs`);
      }

      await loadData();
      resetForm();
    } catch (error: any) {
      console.error('Error al guardar site:', error);
      toast.error(error.message || 'Error al guardar');
    }
  };

  const handleEditVLAN = (vlan: VLAN) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para editar');
      return;
    }
    setEditingVLAN(vlan);
    setSingleVLANForm({
      idVlan: vlan.idVlan,
      campana: vlan.campana,
      direccionRed: vlan.direccionRed,
      gateway: vlan.gateway,
      observaciones: vlan.observaciones
    });
    setShowAddDialog(true);
  };

  const handleSubmitEditVLAN = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingVLAN || !selectedSite) return;

    if (!singleVLANForm.idVlan || !singleVLANForm.campana || !singleVLANForm.direccionRed || !singleVLANForm.gateway) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      const siteData = sitesVLAN.find(s => s.site === selectedSite);
      if (!siteData) return;

      const updatedSite = {
        ...siteData,
        vlans: siteData.vlans.map(vlan =>
          vlan.id === editingVLAN.id
            ? { ...vlan, ...singleVLANForm }
            : vlan
        )
      };

      await vlanApi.update(siteData.id, updatedSite);
      toast.success('VLAN actualizada correctamente');
      await loadData();
      resetForm();
    } catch (error: any) {
      console.error('Error al actualizar VLAN:', error);
      toast.error(error.message || 'Error al actualizar');
    }
  };

  const handleDeleteVLAN = async (vlanId: string) => {
    if (!isAdmin || !selectedSite) {
      toast.error('No tienes permisos para eliminar');
      return;
    }
    
    if (confirm('¿Estás seguro de eliminar esta VLAN?')) {
      try {
        const siteData = sitesVLAN.find(s => s.site === selectedSite);
        if (!siteData) return;

        const updatedSite = {
          ...siteData,
          vlans: siteData.vlans.filter(vlan => vlan.id !== vlanId)
        };

        await vlanApi.update(siteData.id, updatedSite);
        toast.success('VLAN eliminada correctamente');
        await loadData();
      } catch (error: any) {
        console.error('Error al eliminar VLAN:', error);
        toast.error(error.message || 'Error al eliminar');
      }
    }
  };

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para eliminar');
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar el site ${siteName} y todas sus VLANs?`)) {
      try {
        await vlanApi.delete(siteId);
        toast.success('Site eliminado correctamente');
        await loadData();
        if (selectedSite === siteName) {
          setSelectedSite(null);
        }
      } catch (error: any) {
        console.error('Error al eliminar site:', error);
        toast.error(error.message || 'Error al eliminar');
      }
    }
  };

  const resetForm = () => {
    setVlansForm([{ idVlan: '', campana: '', direccionRed: '', gateway: '', observaciones: '' }]);
    setSingleVLANForm({ idVlan: '', campana: '', direccionRed: '', gateway: '', observaciones: '' });
    setEditingVLAN(null);
    setShowAddDialog(false);
  };

  // Control de Cambios - Guardar/Editar
  const handleSaveControlGrupoCos = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!controlForm.idVlan || !controlForm.campana || !controlForm.direccionRed || !controlForm.gateway ||
        !controlForm.actualizacion || !controlForm.elaboradoPor || !controlForm.fechaElaboracion ||
        !controlForm.fechaRevision || !controlForm.aprobadoPor || !controlForm.fechaAprobacion) {
      toast.error('Completa todos los campos obligatorios del control de cambios');
      return;
    }

    try {
      await controlCambiosApi.save({
        tipo: 'grupo cos',
        ...controlForm
      });

      toast.success(controlCambiosGrupoCos ? 'Control de Cambios actualizado' : 'Control de Cambios creado');
      await loadData();
      setShowEditControlGrupoCos(false);
      resetControlForm();
    } catch (error: any) {
      console.error('Error al guardar control de cambios:', error);
      toast.error(error.message || 'Error al guardar');
    }
  };

  const handleSaveControlContacto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!controlForm.idVlan || !controlForm.campana || !controlForm.direccionRed || !controlForm.gateway ||
        !controlForm.actualizacion || !controlForm.elaboradoPor || !controlForm.fechaElaboracion ||
        !controlForm.fechaRevision || !controlForm.aprobadoPor || !controlForm.fechaAprobacion) {
      toast.error('Completa todos los campos obligatorios del control de cambios');
      return;
    }

    try {
      await controlCambiosApi.save({
        tipo: 'contacto solutions',
        ...controlForm
      });

      toast.success(controlCambiosContacto ? 'Control de Cambios actualizado' : 'Control de Cambios creado');
      await loadData();
      setShowEditControlContacto(false);
      resetControlForm();
    } catch (error: any) {
      console.error('Error al guardar control de cambios:', error);
      toast.error(error.message || 'Error al guardar');
    }
  };

  const openEditControlGrupoCos = () => {
    if (!isAdmin) {
      toast.error('No tienes permisos para editar');
      return;
    }
    if (controlCambiosGrupoCos) {
      setControlForm({
        idVlan: controlCambiosGrupoCos.idVlan,
        campana: controlCambiosGrupoCos.campana,
        direccionRed: controlCambiosGrupoCos.direccionRed,
        gateway: controlCambiosGrupoCos.gateway,
        observaciones: controlCambiosGrupoCos.observaciones,
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
        idVlan: controlCambiosContacto.idVlan,
        campana: controlCambiosContacto.campana,
        direccionRed: controlCambiosContacto.direccionRed,
        gateway: controlCambiosContacto.gateway,
        observaciones: controlCambiosContacto.observaciones,
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
      idVlan: '',
      campana: '',
      direccionRed: '',
      gateway: '',
      observaciones: '',
      actualizacion: '',
      elaboradoPor: '',
      fechaElaboracion: '',
      fechaRevision: '',
      aprobadoPor: '',
      fechaAprobacion: ''
    });
  };

  // Exportar a PDF
  const exportToPDF = () => {
    if (sitesVLAN.length === 0 && !controlCambiosGrupoCos && !controlCambiosContacto) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.setTextColor(220, 38, 38);
      doc.text('REPORTE DE VLANS - NETADMIN', 105, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 105, 22, { align: 'center' });

      let yPosition = 35;

      // VLANs por site
      sitesVLAN.forEach((site) => {
        // Verificar si necesitamos nueva página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Determinar color según el site
        const isContactoSite = CONTACTO_SOLUTIONS_SITES.includes(site.site);
        const siteColor = isContactoSite ? [37, 99, 235] : [220, 38, 38];

        // Header del site
        doc.setFillColor(...siteColor);
        doc.rect(10, yPosition, 190, 8, 'F');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(`SITE: ${site.site}`, 15, yPosition + 6);
        
        yPosition += 12;

        // Info del site
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Total VLANs: ${site.vlans.length}`, 15, yPosition);
        yPosition += 8;

        // Cada VLAN
        site.vlans.forEach((vlan, idx) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(10);
          doc.setTextColor(0);
          doc.setFont(undefined, 'bold');
          doc.text(`VLAN ${idx + 1}:`, 15, yPosition);
          
          doc.setFont(undefined, 'normal');
          doc.setFontSize(9);
          yPosition += 5;

          doc.text(`ID: ${vlan.idVlan}`, 20, yPosition);
          doc.text(`Campaña: ${vlan.campana}`, 70, yPosition);
          yPosition += 5;

          doc.text(`Red: ${vlan.direccionRed}`, 20, yPosition);
          doc.text(`Gateway: ${vlan.gateway}`, 100, yPosition);
          yPosition += 5;

          if (vlan.observaciones) {
            doc.text(`Obs: ${vlan.observaciones.substring(0, 80)}`, 20, yPosition);
            yPosition += 5;
          }

          yPosition += 2;
        });

        yPosition += 5;
      });

      // Control de Cambios
      if (controlCambiosGrupoCos || controlCambiosContacto) {
        if (yPosition > 220) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(220, 38, 38);
        doc.text('CONTROL DE CAMBIOS', 105, yPosition, { align: 'center' });
        yPosition += 10;

        if (controlCambiosGrupoCos) {
          doc.setFillColor(220, 38, 38);
          doc.rect(10, yPosition, 190, 8, 'F');
          doc.setFontSize(11);
          doc.setTextColor(255, 255, 255);
          doc.text('GRUPO COS', 15, yPosition + 6);
          yPosition += 12;

          doc.setFontSize(9);
          doc.setTextColor(0);
          doc.text(`ID VLAN: ${controlCambiosGrupoCos.idVlan}`, 15, yPosition);
          doc.text(`Campaña: ${controlCambiosGrupoCos.campana}`, 70, yPosition);
          yPosition += 5;
          doc.text(`Red: ${controlCambiosGrupoCos.direccionRed}`, 15, yPosition);
          doc.text(`Gateway: ${controlCambiosGrupoCos.gateway}`, 100, yPosition);
          yPosition += 5;
          if (controlCambiosGrupoCos.observaciones) {
            doc.text(`Obs: ${controlCambiosGrupoCos.observaciones}`, 15, yPosition);
            yPosition += 5;
          }
          yPosition += 8;
        }

        if (controlCambiosContacto) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFillColor(37, 99, 235); // Azul para Contacto Solutions
          doc.rect(10, yPosition, 190, 8, 'F');
          doc.setFontSize(11);
          doc.setTextColor(255, 255, 255);
          doc.text('CONTACTO SOLUTIONS', 15, yPosition + 6);
          yPosition += 12;

          doc.setFontSize(9);
          doc.setTextColor(0);
          doc.text(`ID VLAN: ${controlCambiosContacto.idVlan}`, 15, yPosition);
          doc.text(`Campaña: ${controlCambiosContacto.campana}`, 70, yPosition);
          yPosition += 5;
          doc.text(`Red: ${controlCambiosContacto.direccionRed}`, 15, yPosition);
          doc.text(`Gateway: ${controlCambiosContacto.gateway}`, 100, yPosition);
          yPosition += 5;
          if (controlCambiosContacto.observaciones) {
            doc.text(`Obs: ${controlCambiosContacto.observaciones}`, 15, yPosition);
          }
        }
      }

      const fileName = `vlans_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF. Por favor intenta de nuevo.');
    }
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

  // Exportar site individual a PDF con formato específico
  const exportSiteToPDF = async (siteName: string) => {
    const siteData = sitesVLAN.find(s => s.site === siteName);
    if (!siteData || siteData.vlans.length === 0) {
      toast.error('No hay VLANs para exportar en este site');
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Determinar si es Contacto Solutions (azul) o Grupo Cos (rojo)
      const isContacto = CONTACTO_SOLUTIONS_SITES.includes(siteName);
      const primaryColor = isContacto ? [37, 99, 235] : [220, 38, 38]; // Azul o Rojo
      const companyName = isContacto ? 'Contacto Solutions' : 'GroupCos';
      
      // Header con logo y secciones
      let yPos = 10;
      
      // Configuración de bordes
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      
      // Sección 1: Logo (más ancho)
      doc.rect(10, yPos, 60, 30);
      
      // Insertar logo
      try {
        if (isContacto) {
          // Para Contacto Solutions, usar logo azul
          const logoBase64 = await getImageBase64(logoContactoSolutions);
          doc.addImage(logoBase64, 'PNG', 15, yPos + 8, 50, 14);
        } else {
          // Para Grupo Cos, usar logo rojo
          const logoBase64 = await getImageBase64(logoGroupCos);
          doc.addImage(logoBase64, 'PNG', 15, yPos + 5, 50, 20);
        }
      } catch (e) {
        // Si falla la imagen, usar texto como fallback
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(companyName, 40, yPos + 18, { align: 'center' });
      }
      
      // Sección 2: Matriz de VLAN
      doc.rect(70, yPos, 35, 15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text('Matriz de VLAN', 87.5, yPos + 10, { align: 'center' });
      
      // Sección 3: Versión 01
      doc.rect(105, yPos, 35, 15);
      doc.setFontSize(9);
      doc.text('Versión 01', 122.5, yPos + 10, { align: 'center' });
      
      // Fila inferior del encabezado
      // Sección 4: Gestión Tecnológica y Diseño
      doc.rect(70, yPos + 15, 70, 15);
      doc.setFontSize(8);
      doc.text('Gestión Tecnológica y Diseño', 105, yPos + 23, { align: 'center' });
      
      // Sección 5: Fecha de Emisión
      doc.rect(140, yPos, 70, 15);
      doc.setFontSize(8);
      doc.text('Fecha de Emisión', 175, yPos + 10, { align: 'center' });
      
      // Fecha actual
      doc.rect(140, yPos + 15, 70, 15);
      const today = new Date().toLocaleDateString('es-CO');
      doc.setFontSize(9);
      doc.text(today, 175, yPos + 23, { align: 'center' });

      yPos = 50;

      // Título de la sección de VLANs con fondo dinámico
      doc.setFillColor(...primaryColor);
      doc.rect(10, yPos, 190, 10, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`VLANS ${siteName}`, 105, yPos + 7, { align: 'center' });
      
      yPos += 12;

      // Preparar datos para la tabla
      const tableData = siteData.vlans.map(vlan => [
        vlan.idVlan,
        vlan.campana,
        vlan.direccionRed,
        vlan.gateway,
        vlan.observaciones || ''
      ]);

      // Crear tabla con autoTable
      autoTable(doc, {
        startY: yPos,
        head: [['ID Vlan', 'Campaña', 'Dirección de red', 'Gateway (FW)', 'Observaciones']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },  // ID Vlan
          1: { cellWidth: 35 },                     // Campaña
          2: { cellWidth: 35, halign: 'center' },  // Dirección de red
          3: { cellWidth: 30, halign: 'center' },  // Gateway
          4: { cellWidth: 'auto' }                  // Observaciones (auto-ajusta)
        },
        margin: { left: 10, right: 10 }
      });

      // Obtener la posición Y final de la tabla
      yPos = (doc as any).lastAutoTable.finalY + 10;

      // Control de Cambios según razón social
      yPos += 10;
      
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTROL DE CAMBIOS', 105, yPos, { align: 'center' });
      yPos += 8;

      // Mostrar ambos controles de cambios
      if (controlCambiosGrupoCos) {
        doc.setFillColor(220, 38, 38);
        doc.rect(10, yPos, 190, 8, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text('GRUPO COS', 15, yPos + 6);
        yPos += 10;

        doc.setFontSize(9);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        doc.text(`ID VLAN: ${controlCambiosGrupoCos.idVlan}`, 15, yPos);
        doc.text(`Campaña: ${controlCambiosGrupoCos.campana}`, 70, yPos);
        yPos += 5;
        doc.text(`Red: ${controlCambiosGrupoCos.direccionRed}`, 15, yPos);
        doc.text(`Gateway: ${controlCambiosGrupoCos.gateway}`, 100, yPos);
        yPos += 5;
        if (controlCambiosGrupoCos.observaciones) {
          doc.text(`Obs: ${controlCambiosGrupoCos.observaciones}`, 15, yPos);
          yPos += 5;
        }
        yPos += 5;
      }

      if (controlCambiosContacto) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFillColor(220, 38, 38);
        doc.rect(10, yPos, 190, 8, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTACTO SOLUTIONS', 15, yPos + 6);
        yPos += 10;

        doc.setFontSize(9);
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        doc.text(`ID VLAN: ${controlCambiosContacto.idVlan}`, 15, yPos);
        doc.text(`Campaña: ${controlCambiosContacto.campana}`, 70, yPos);
        yPos += 5;
        doc.text(`Red: ${controlCambiosContacto.direccionRed}`, 15, yPos);
        doc.text(`Gateway: ${controlCambiosContacto.gateway}`, 100, yPos);
        yPos += 5;
        if (controlCambiosContacto.observaciones) {
          doc.text(`Obs: ${controlCambiosContacto.observaciones}`, 15, yPos);
        }
      }

      const fileName = `matriz_vlan_${siteName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success(`PDF de ${siteName} descargado correctamente`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF. Por favor intenta de nuevo.');
    }
  };

  // Obtener data del site seleccionado
  const getCurrentSiteData = () => {
    return sitesVLAN.find(s => s.site === selectedSite);
  };

  // Filtrar VLANs por término de búsqueda
  const getFilteredVLANs = () => {
    const siteData = getCurrentSiteData();
    if (!siteData) return [];

    if (!searchTerm) return siteData.vlans;

    const search = searchTerm.toLowerCase();
    return siteData.vlans.filter(vlan =>
      vlan.idVlan.toLowerCase().includes(search) ||
      vlan.campana.toLowerCase().includes(search) ||
      vlan.direccionRed.toLowerCase().includes(search) ||
      vlan.gateway.toLowerCase().includes(search) ||
      vlan.observaciones.toLowerCase().includes(search)
    );
  };

  // Vista principal: Grid de sites
  if (!selectedSite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <Network className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-gray-900">Gestión de VLANs</h1>
                  <p className="text-gray-600 text-sm">Selecciona un site para ver sus VLANs</p>
                </div>
              </div>

              {/* Botón Descargar PDF */}
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="gap-2 border-2 border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700"
                size="lg"
              >
                <FileText className="w-5 h-5" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Grid de Sites */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {SITES.map(siteName => {
            const siteData = sitesVLAN.find(s => s.site === siteName);
            const vlanCount = siteData?.vlans.length || 0;
            const colors = getSiteColors(siteName);

            return (
              <Card
                key={siteName}
                onClick={() => setSelectedSite(siteName)}
                className={`p-6 cursor-pointer hover:shadow-xl transition-all border-2 ${colors.cardBorder} bg-gradient-to-br ${colors.cardBg} group`}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${colors.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-gray-900 mb-1">{siteName}</h3>
                    <Badge className={colors.badgeBg}>
                      {vlanCount} VLAN{vlanCount !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <ChevronRight className={`w-6 h-6 ${colors.chevronColor} group-hover:translate-x-1 transition-transform`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* CONTROL DE CAMBIOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Control de Cambios - GRUPO COS */}
          <Card className="border-2 border-red-300">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">ID VLAN:</span>
                      <p className="text-red-600">{controlCambiosGrupoCos.idVlan}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Campaña:</span>
                      <p className="text-gray-900">{controlCambiosGrupoCos.campana}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Red:</span>
                      <p className="text-gray-900">{controlCambiosGrupoCos.direccionRed}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Gateway:</span>
                      <p className="text-gray-900">{controlCambiosGrupoCos.gateway}</p>
                    </div>
                  </div>
                  {controlCambiosGrupoCos.observaciones && (
                    <div>
                      <span className="text-xs text-gray-500">Observaciones:</span>
                      <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.observaciones}</p>
                    </div>
                  )}
                  
                  <div className="border-t-2 border-red-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-red-600 mb-3">📋 Registro de Control</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-gray-500">Actualización:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.actualizacion || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Elaborado por:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.elaboradoPor || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de elaboración:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.fechaElaboracion || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de revisión:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.fechaRevision || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Aprobado por:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.aprobadoPor || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de aprobación:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosGrupoCos.fechaAprobacion || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <Button
                      onClick={openEditControlGrupoCos}
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 border-red-600 text-red-600 hover:bg-red-50"
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
                  <Shield className="w-6 h-6" />
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">ID VLAN:</span>
                      <p className="text-blue-600">{controlCambiosContacto.idVlan}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Campaña:</span>
                      <p className="text-gray-900">{controlCambiosContacto.campana}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Red:</span>
                      <p className="text-gray-900">{controlCambiosContacto.direccionRed}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Gateway:</span>
                      <p className="text-gray-900">{controlCambiosContacto.gateway}</p>
                    </div>
                  </div>
                  {controlCambiosContacto.observaciones && (
                    <div>
                      <span className="text-xs text-gray-500">Observaciones:</span>
                      <p className="text-gray-900 text-sm">{controlCambiosContacto.observaciones}</p>
                    </div>
                  )}
                  
                  <div className="border-t-2 border-blue-200 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-blue-600 mb-3">📋 Registro de Control</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-gray-500">Actualización:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.actualizacion || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Elaborado por:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.elaboradoPor || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de elaboración:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.fechaElaboracion || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de revisión:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.fechaRevision || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Aprobado por:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.aprobadoPor || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Fecha de aprobación:</span>
                        <p className="text-gray-900 text-sm">{controlCambiosContacto.fechaAprobacion || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <Button
                      onClick={openEditControlContacto}
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 border-blue-600 text-blue-600 hover:bg-blue-50"
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
                  <Shield className="w-5 h-5" />
                  Información de Control de Cambios
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gc-vlan-actualizacion">Actualización *</Label>
                    <Input
                      id="gc-vlan-actualizacion"
                      value={controlForm.actualizacion}
                      onChange={(e) => setControlForm({ ...controlForm, actualizacion: e.target.value })}
                      placeholder="Descripción de la actualización"
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gc-vlan-elaboradoPor">Elaborado por *</Label>
                    <Input
                      id="gc-vlan-elaboradoPor"
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
                    <Label htmlFor="gc-vlan-fechaElaboracion">Fecha de elaboración *</Label>
                    <Input
                      id="gc-vlan-fechaElaboracion"
                      type="date"
                      value={controlForm.fechaElaboracion}
                      onChange={(e) => setControlForm({ ...controlForm, fechaElaboracion: e.target.value })}
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gc-vlan-fechaRevision">Fecha de revisión *</Label>
                    <Input
                      id="gc-vlan-fechaRevision"
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
                    <Label htmlFor="gc-vlan-aprobadoPor">Aprobado por *</Label>
                    <Input
                      id="gc-vlan-aprobadoPor"
                      value={controlForm.aprobadoPor}
                      onChange={(e) => setControlForm({ ...controlForm, aprobadoPor: e.target.value })}
                      placeholder="Nombre de quien aprueba"
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gc-vlan-fechaAprobacion">Fecha de aprobación *</Label>
                    <Input
                      id="gc-vlan-fechaAprobacion"
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
                  <Shield className="w-5 h-5" />
                  Información de Control de Cambios
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cs-vlan-actualizacion">Actualización *</Label>
                    <Input
                      id="cs-vlan-actualizacion"
                      value={controlForm.actualizacion}
                      onChange={(e) => setControlForm({ ...controlForm, actualizacion: e.target.value })}
                      placeholder="Descripción de la actualización"
                      required
                      className="border-2 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cs-vlan-elaboradoPor">Elaborado por *</Label>
                    <Input
                      id="cs-vlan-elaboradoPor"
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
                    <Label htmlFor="cs-vlan-fechaElaboracion">Fecha de elaboración *</Label>
                    <Input
                      id="cs-vlan-fechaElaboracion"
                      type="date"
                      value={controlForm.fechaElaboracion}
                      onChange={(e) => setControlForm({ ...controlForm, fechaElaboracion: e.target.value })}
                      required
                      className="border-2 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cs-vlan-fechaRevision">Fecha de revisión *</Label>
                    <Input
                      id="cs-vlan-fechaRevision"
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
                    <Label htmlFor="cs-vlan-aprobadoPor">Aprobado por *</Label>
                    <Input
                      id="cs-vlan-aprobadoPor"
                      value={controlForm.aprobadoPor}
                      onChange={(e) => setControlForm({ ...controlForm, aprobadoPor: e.target.value })}
                      placeholder="Nombre de quien aprueba"
                      required
                      className="border-2 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cs-vlan-fechaAprobacion">Fecha de aprobación *</Label>
                    <Input
                      id="cs-vlan-fechaAprobacion"
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

  // Vista de detalle de un site
  const currentSiteData = getCurrentSiteData();
  const filteredVLANs = getFilteredVLANs();

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
                className="text-red-600 hover:bg-red-50"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </Button>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">{selectedSite}</h1>
                <p className="text-gray-600 text-sm">{currentSiteData?.vlans.length || 0} VLAN(s) configuradas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Agregar VLANs
                </Button>
              )}
              {currentSiteData && currentSiteData.vlans.length > 0 && (
                <>
                  <Button
                    onClick={() => exportSiteToPDF(selectedSite)}
                    variant="outline"
                    className="border-2 border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Exportar PDF
                  </Button>
                  {isAdmin && (
                    <Button
                      onClick={() => currentSiteData && handleDeleteSite(currentSiteData.id, selectedSite)}
                      variant="outline"
                      className="border-2 border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Eliminar Site
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Barra de búsqueda */}
          {currentSiteData && currentSiteData.vlans.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por ID, campaña, red, gateway u observaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-gray-300 focus:border-red-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Lista de VLANs */}
      {filteredVLANs.length > 0 ? (
        <div className="grid gap-4">
          {filteredVLANs.map((vlan, index) => (
            <Card key={vlan.id} className="border-2 border-gray-200 hover:border-red-500 transition-all">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">ID VLAN</span>
                      <p className="text-red-600">{vlan.idVlan}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Campaña</span>
                      <p className="text-gray-900">{vlan.campana}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Dirección de Red</span>
                      <p className="text-gray-900">{vlan.direccionRed}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Gateway</span>
                      <p className="text-gray-900">{vlan.gateway}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditVLAN(vlan)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVLAN(vlan.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {vlan.observaciones && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Observaciones</span>
                    <p className="text-gray-900 text-sm mt-1">{vlan.observaciones}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : currentSiteData && currentSiteData.vlans.length > 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">No se encontraron VLANs</h3>
          <p className="text-gray-600 mb-4">
            No hay resultados para "{searchTerm}"
          </p>
          <Button
            onClick={() => setSearchTerm('')}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Limpiar búsqueda
          </Button>
        </Card>
      ) : (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300">
          <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">No hay VLANs configuradas</h3>
          <p className="text-gray-600 mb-4">
            Comienza agregando VLANs a este site
          </p>
          {isAdmin && (
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Primera VLAN
            </Button>
          )}
        </Card>
      )}

      {/* Dialog para agregar/editar VLANs */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {editingVLAN ? 'Editar VLAN' : `Agregar VLANs a ${selectedSite}`}
            </DialogTitle>
            <DialogDescription>
              {editingVLAN 
                ? 'Modifica los datos de la VLAN' 
                : 'Completa la información de las VLANs. Puedes agregar múltiples VLANs a la vez.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editingVLAN ? handleSubmitEditVLAN : handleSubmitSite}>
            {editingVLAN ? (
              /* Formulario de edición de una sola VLAN */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-idVlan">ID VLAN *</Label>
                    <Input
                      id="edit-idVlan"
                      value={singleVLANForm.idVlan}
                      onChange={(e) => setSingleVLANForm({ ...singleVLANForm, idVlan: e.target.value })}
                      placeholder="Ej: 100"
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-campana">Campaña *</Label>
                    <Input
                      id="edit-campana"
                      value={singleVLANForm.campana}
                      onChange={(e) => setSingleVLANForm({ ...singleVLANForm, campana: e.target.value })}
                      placeholder="Ej: Campaña Principal"
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-direccionRed">Dirección de Red *</Label>
                    <Input
                      id="edit-direccionRed"
                      value={singleVLANForm.direccionRed}
                      onChange={(e) => setSingleVLANForm({ ...singleVLANForm, direccionRed: e.target.value })}
                      placeholder="Ej: 192.168.1.0/24"
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-gateway">Gateway (FW) *</Label>
                    <Input
                      id="edit-gateway"
                      value={singleVLANForm.gateway}
                      onChange={(e) => setSingleVLANForm({ ...singleVLANForm, gateway: e.target.value })}
                      placeholder="Ej: 192.168.1.1"
                      required
                      className="border-2 border-gray-300 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-observaciones">Observaciones</Label>
                  <Textarea
                    id="edit-observaciones"
                    value={singleVLANForm.observaciones}
                    onChange={(e) => setSingleVLANForm({ ...singleVLANForm, observaciones: e.target.value })}
                    placeholder="Observaciones opcionales"
                    rows={3}
                    className="border-2 border-gray-300 focus:border-red-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            ) : (
              /* Formulario de múltiples VLANs */
              <div className="space-y-6">
                {vlansForm.map((vlan, index) => (
                  <Card key={index} className="p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-red-600 text-white">VLAN {index + 1}</Badge>
                      {vlansForm.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveVLAN(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`idVlan-${index}`}>ID VLAN *</Label>
                          <Input
                            id={`idVlan-${index}`}
                            value={vlan.idVlan}
                            onChange={(e) => handleVLANChange(index, 'idVlan', e.target.value)}
                            placeholder="Ej: 100"
                            required
                            className="border-2 border-gray-300 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`campana-${index}`}>Campaña *</Label>
                          <Input
                            id={`campana-${index}`}
                            value={vlan.campana}
                            onChange={(e) => handleVLANChange(index, 'campana', e.target.value)}
                            placeholder="Ej: Campaña Principal"
                            required
                            className="border-2 border-gray-300 focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`direccionRed-${index}`}>Dirección de Red *</Label>
                          <Input
                            id={`direccionRed-${index}`}
                            value={vlan.direccionRed}
                            onChange={(e) => handleVLANChange(index, 'direccionRed', e.target.value)}
                            placeholder="Ej: 192.168.1.0/24"
                            required
                            className="border-2 border-gray-300 focus:border-red-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`gateway-${index}`}>Gateway (FW) *</Label>
                          <Input
                            id={`gateway-${index}`}
                            value={vlan.gateway}
                            onChange={(e) => handleVLANChange(index, 'gateway', e.target.value)}
                            placeholder="Ej: 192.168.1.1"
                            required
                            className="border-2 border-gray-300 focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`observaciones-${index}`}>Observaciones</Label>
                        <Textarea
                          id={`observaciones-${index}`}
                          value={vlan.observaciones}
                          onChange={(e) => handleVLANChange(index, 'observaciones', e.target.value)}
                          placeholder="Observaciones opcionales"
                          rows={2}
                          className="border-2 border-gray-300 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddVLAN}
                  className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Otra VLAN
                </Button>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Guardar {vlansForm.length} VLAN{vlansForm.length > 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
