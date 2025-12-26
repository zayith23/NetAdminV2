// ============================================
// NETADMIN - EDITAR HOJA DE VIDA
// Componente para editar hojas de vida existentes
// ============================================

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState } from 'react';
import { Save, X, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface MantenimientoItem {
  fecha: string;
  tipo: string;
  descripcion: string;
  responsable: string;
}

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
  correos_admin: string;
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
  mantenimientos?: MantenimientoItem[];
  createdAt: string;
}

interface EditarHojaDeVidaProps {
  equipment: Equipment;
  onSave: (equipment: Equipment) => void;
  onCancel: () => void;
}

export function EditarHojaDeVida({ equipment, onSave, onCancel }: EditarHojaDeVidaProps) {
  const [formData, setFormData] = useState<Equipment>(equipment);
  const [activeTab, setActiveTab] = useState('ubicacion');
  const [newMantenimiento, setNewMantenimiento] = useState<MantenimientoItem>({
    fecha: '',
    tipo: '',
    descripcion: '',
    responsable: ''
  });

  const handleInputChange = (field: keyof Equipment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedEquipment = {
      ...formData,
      ultima_actualizacion: new Date().toISOString()
    };
    
    onSave(updatedEquipment);
    toast.success('Hoja de vida actualizada exitosamente');
  };

  const getSiteOptions = () => {
    const razonSocial = formData.razon_social;
    const activo = formData.activo;
    
    if (razonSocial === 'grupo cos') {
      if (activo === 'switch') {
        return ['RRHH', 'Barranquilla', 'Caracol', 'Site 7', 'Site 6', 'Itagüí', 'Calle 80'];
      }
      return ['Barranquilla', 'Caracol', 'Site 7', 'Site 6', 'Itagüí', 'Calle 80'];
    }
    if (razonSocial === 'otd') {
      return ['OTD Principal', 'OTD Secundaria'];
    }
    if (razonSocial === 'contactos solutions') {
      return ['Contactos Main', 'Contactos Backup'];
    }
    return [];
  };

  const handleAddMantenimiento = () => {
    if (!newMantenimiento.fecha || !newMantenimiento.tipo) {
      toast.error('Por favor completa al menos la fecha y el tipo de mantenimiento');
      return;
    }

    const mantenimientos = formData.mantenimientos || [];
    setFormData(prev => ({
      ...prev,
      mantenimientos: [...mantenimientos, newMantenimiento]
    }));

    setNewMantenimiento({
      fecha: '',
      tipo: '',
      descripcion: '',
      responsable: ''
    });

    toast.success('Mantenimiento agregado');
  };

  const handleRemoveMantenimiento = (index: number) => {
    const mantenimientos = formData.mantenimientos || [];
    setFormData(prev => ({
      ...prev,
      mantenimientos: mantenimientos.filter((_, i) => i !== index)
    }));
    toast.success('Mantenimiento eliminado');
  };

  const handleNextTab = () => {
    const tabs = ['ubicacion', 'basico', 'tecnico', 'contactos', 'mantenimiento'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const siteOptions = getSiteOptions();

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Botones de acción */}
      <div className="flex gap-4 justify-end sticky top-0 bg-white p-6 z-10 border-b-2 border-red-200 shadow-md rounded-b-lg">
        <Button type="submit" className="gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 px-8 py-6 text-base font-medium shadow-lg">
          <Save className="w-5 h-5" />
          Guardar Cambios
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="px-8 py-6 text-base border-2 hover:bg-gray-50">
          Cancelar
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleNextTab}
          className="gap-2 px-8 py-6 text-base border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-600"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5 h-16 bg-red-50 border-2 border-red-200 p-1">
          <TabsTrigger value="ubicacion" className="text-base font-medium data-[state=active]:bg-red-600 data-[state=active]:text-white">Ubicación</TabsTrigger>
          <TabsTrigger value="basico" className="text-base font-medium data-[state=active]:bg-red-600 data-[state=active]:text-white">Datos Básicos</TabsTrigger>
          <TabsTrigger value="tecnico" className="text-base font-medium data-[state=active]:bg-red-600 data-[state=active]:text-white">Técnico</TabsTrigger>
          <TabsTrigger value="contactos" className="text-base font-medium data-[state=active]:bg-red-600 data-[state=active]:text-white">Contactos</TabsTrigger>
          <TabsTrigger value="mantenimiento" className="text-base font-medium data-[state=active]:bg-red-600 data-[state=active]:text-white">Mantenimiento</TabsTrigger>
        </TabsList>

        {/* UBICACIÓN */}
        <TabsContent value="ubicacion" className="space-y-8 mt-8">
          <Card className="p-10 border-2 border-red-100 shadow-lg">
            <h3 className="text-2xl text-gray-900 mb-8 pb-4 border-b-2 border-red-200 font-semibold">Información de Registro</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label htmlFor="hostname" className="text-base font-medium mb-2 block">Hostname *</Label>
                <Input
                  id="hostname"
                  value={formData.hostname}
                  onChange={(e) => handleInputChange('hostname', e.target.value)}
                  required
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="activo" className="text-base font-medium mb-2 block">Tipo de Equipo *</Label>
                <Select value={formData.activo} onValueChange={(value) => handleInputChange('activo', value)}>
                  <SelectTrigger className="h-12 text-base border-2 focus:border-red-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="switch">Switch</SelectItem>
                    <SelectItem value="firewall">Firewall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="razon_social" className="text-base font-medium mb-2 block">Razón Social *</Label>
                <Select value={formData.razon_social} onValueChange={(value) => handleInputChange('razon_social', value)}>
                  <SelectTrigger className="h-12 text-base border-2 focus:border-red-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grupo cos">Grupo Cos</SelectItem>
                    <SelectItem value="otd">OTD</SelectItem>
                    <SelectItem value="contactos solutions">Contactos Solutions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="site" className="text-base font-medium mb-2 block">Site *</Label>
                <Select value={formData.site} onValueChange={(value) => handleInputChange('site', value)}>
                  <SelectTrigger className="h-12 text-base border-2 focus:border-red-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {siteOptions.map((site) => (
                      <SelectItem key={site} value={site}>{site}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="gabinete" className="text-base font-medium mb-2 block">Gabinete</Label>
                <Input
                  id="gabinete"
                  value={formData.gabinete}
                  onChange={(e) => handleInputChange('gabinete', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* DATOS BÁSICOS */}
        <TabsContent value="basico" className="space-y-8 mt-8">
          <Card className="p-10 border-2 border-red-100 shadow-lg">
            <h3 className="text-2xl text-gray-900 mb-8 pb-4 border-b-2 border-red-200 font-semibold">Datos del Equipo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="marca" className="text-base font-medium mb-2 block">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="modelo" className="text-base font-medium mb-2 block">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="serial" className="text-base font-medium mb-2 block">Serial</Label>
                <Input
                  id="serial"
                  value={formData.serial}
                  onChange={(e) => handleInputChange('serial', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="proveedor" className="text-base font-medium mb-2 block">Proveedor</Label>
                <Input
                  id="proveedor"
                  value={formData.proveedor}
                  onChange={(e) => handleInputChange('proveedor', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="fecha_compra" className="text-base font-medium mb-2 block">Fecha de Compra</Label>
                <Input
                  id="fecha_compra"
                  type="date"
                  value={formData.fecha_compra}
                  onChange={(e) => handleInputChange('fecha_compra', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
            </div>
          </Card>

          <Card className="p-10 border-2 border-red-100 shadow-lg">
            <h3 className="text-2xl text-gray-900 mb-8 pb-4 border-b-2 border-red-200 font-semibold">Configuración de Red</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="configuracion" className="text-base font-medium mb-2 block">Configuración IP</Label>
                <Input
                  id="configuracion"
                  value={formData.configuracion}
                  onChange={(e) => handleInputChange('configuracion', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="ip_direccion" className="text-base font-medium mb-2 block">Dirección IP</Label>
                <Input
                  id="ip_direccion"
                  value={formData.ip_direccion}
                  onChange={(e) => handleInputChange('ip_direccion', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="gateway" className="text-base font-medium mb-2 block">Gateway</Label>
                <Input
                  id="gateway"
                  value={formData.gateway}
                  onChange={(e) => handleInputChange('gateway', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="wins_dns" className="text-base font-medium mb-2 block">WINS/DNS</Label>
                <Input
                  id="wins_dns"
                  value={formData.wins_dns}
                  onChange={(e) => handleInputChange('wins_dns', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TÉCNICO */}
        <TabsContent value="tecnico" className="space-y-8 mt-8">
          <Card className="p-10 border-2 border-red-100 shadow-lg">
            <h3 className="text-2xl text-gray-900 mb-8 pb-4 border-b-2 border-red-200 font-semibold">Características Técnicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="funciones" className="text-base font-medium mb-2 block">Funciones</Label>
                <Textarea
                  id="funciones"
                  value={formData.funciones}
                  onChange={(e) => handleInputChange('funciones', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="procesador" className="text-base font-medium mb-2 block">Procesador</Label>
                <Input
                  id="procesador"
                  value={formData.procesador}
                  onChange={(e) => handleInputChange('procesador', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="memoria_nvram" className="text-base font-medium mb-2 block">Memoria NVRAM</Label>
                <Input
                  id="memoria_nvram"
                  value={formData.memoria_nvram}
                  onChange={(e) => handleInputChange('memoria_nvram', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="backup" className="text-base font-medium mb-2 block">Backup</Label>
                <Select value={formData.backup} onValueChange={(value) => handleInputChange('backup', value)}>
                  <SelectTrigger className="h-12 text-base border-2 focus:border-red-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Si">Sí</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="sistema_operativo" className="text-base font-medium mb-2 block">Sistema Operativo</Label>
                <Input
                  id="sistema_operativo"
                  value={formData.sistema_operativo}
                  onChange={(e) => handleInputChange('sistema_operativo', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="version_firmware" className="text-base font-medium mb-2 block">Versión Firmware</Label>
                <Input
                  id="version_firmware"
                  value={formData.version_firmware}
                  onChange={(e) => handleInputChange('version_firmware', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* CONTACTOS */}
        <TabsContent value="contactos" className="space-y-8 mt-8">
          <Card className="p-10 border-2 border-red-100 shadow-lg">
            <h3 className="text-2xl text-gray-900 mb-8 pb-4 border-b-2 border-red-200 font-semibold">Administradores</h3>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <Label htmlFor="usuarios_admin" className="text-base font-medium mb-2 block">Usuarios Administradores</Label>
                <Textarea
                  id="usuarios_admin"
                  value={formData.usuarios_admin}
                  onChange={(e) => handleInputChange('usuarios_admin', e.target.value)}
                  rows={4}
                  placeholder="Ingresa los nombres de los administradores (uno por línea)"
                  className="resize-none"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="correos_admin" className="text-base font-medium mb-2 block">Correos Electrónicos</Label>
                <Textarea
                  id="correos_admin"
                  value={formData.correos_admin}
                  onChange={(e) => handleInputChange('correos_admin', e.target.value)}
                  rows={4}
                  placeholder="Ingresa los correos electrónicos (uno por línea)"
                  className="resize-none"
                />
              </div>
            </div>
          </Card>

          <Card className="p-10 border-2 border-red-100 shadow-lg">
            <h3 className="text-2xl text-gray-900 mb-8 pb-4 border-b-2 border-red-200 font-semibold">Información del Proveedor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="cargo_contacto" className="text-base font-medium mb-2 block">Cargo Contacto</Label>
                <Input
                  id="cargo_contacto"
                  value={formData.cargo_contacto}
                  onChange={(e) => handleInputChange('cargo_contacto', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email_proveedor" className="text-base font-medium mb-2 block">Email</Label>
                <Input
                  id="email_proveedor"
                  type="email"
                  value={formData.email_proveedor}
                  onChange={(e) => handleInputChange('email_proveedor', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="telefono_contacto1" className="text-base font-medium mb-2 block">Teléfono 1</Label>
                <Input
                  id="telefono_contacto1"
                  value={formData.telefono_contacto1}
                  onChange={(e) => handleInputChange('telefono_contacto1', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="telefono_contacto2" className="text-base font-medium mb-2 block">Teléfono 2</Label>
                <Input
                  id="telefono_contacto2"
                  value={formData.telefono_contacto2}
                  onChange={(e) => handleInputChange('telefono_contacto2', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="responsable_proveedor" className="text-base font-medium mb-2 block">Responsable</Label>
                <Input
                  id="responsable_proveedor"
                  value={formData.responsable_proveedor}
                  onChange={(e) => handleInputChange('responsable_proveedor', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="tiempo_garantia" className="text-base font-medium mb-2 block">Tiempo de Garantía</Label>
                <Input
                  id="tiempo_garantia"
                  value={formData.tiempo_garantia}
                  onChange={(e) => handleInputChange('tiempo_garantia', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="fecha_entrega" className="text-base font-medium mb-2 block">Fecha de Entrega</Label>
                <Input
                  id="fecha_entrega"
                  type="date"
                  value={formData.fecha_entrega}
                  onChange={(e) => handleInputChange('fecha_entrega', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="fecha_terminacion" className="text-base font-medium mb-2 block">Fecha de Terminación</Label>
                <Input
                  id="fecha_terminacion"
                  type="date"
                  value={formData.fecha_terminacion}
                  onChange={(e) => handleInputChange('fecha_terminacion', e.target.value)}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* MANTENIMIENTO */}
        <TabsContent value="mantenimiento" className="space-y-8 mt-8">
          <Card className="p-10 border-2 border-red-100 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg">
            <h3 className="text-2xl text-gray-900 mb-8 pb-4 border-b-2 border-red-200 font-semibold">Agregar Nuevo Mantenimiento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-lg shadow-md">
              <div className="space-y-3">
                <Label htmlFor="mant_fecha" className="text-base font-medium mb-2 block">Fecha</Label>
                <Input
                  id="mant_fecha"
                  type="date"
                  value={newMantenimiento.fecha}
                  onChange={(e) => setNewMantenimiento({...newMantenimiento, fecha: e.target.value})}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="mant_tipo" className="text-base font-medium mb-2 block">Tipo de Mantenimiento</Label>
                <Select value={newMantenimiento.tipo} onValueChange={(value) => setNewMantenimiento({...newMantenimiento, tipo: value})}>
                  <SelectTrigger className="h-12 text-base border-2 focus:border-red-500">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventivo">Preventivo</SelectItem>
                    <SelectItem value="correctivo">Correctivo</SelectItem>
                    <SelectItem value="actualizacion">Actualización</SelectItem>
                    <SelectItem value="inspeccion">Inspección</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="mant_responsable" className="text-base font-medium mb-2 block">Responsable</Label>
                <Input
                  id="mant_responsable"
                  value={newMantenimiento.responsable}
                  onChange={(e) => setNewMantenimiento({...newMantenimiento, responsable: e.target.value})}
                  className="h-12 text-base border-2 focus:border-red-500"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="mant_descripcion" className="text-base font-medium mb-2 block">Descripción</Label>
                <Textarea
                  id="mant_descripcion"
                  value={newMantenimiento.descripcion}
                  onChange={(e) => setNewMantenimiento({...newMantenimiento, descripcion: e.target.value})}
                  rows={3}
                  placeholder="Describe el mantenimiento realizado"
                  className="resize-none"
                />
              </div>
            </div>
            <Button type="button" onClick={handleAddMantenimiento} className="mt-8 gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 px-8 py-6 text-base font-medium shadow-lg">
              <Plus className="w-5 h-5" />
              Agregar Mantenimiento
            </Button>
          </Card>

          {formData.mantenimientos && formData.mantenimientos.length > 0 && (
            <Card className="p-10 border-2 border-red-100 shadow-lg">
              <h3 className="text-2xl text-gray-900 mb-8 pb-4 border-b-2 border-red-200 font-semibold">Mantenimientos Registrados ({formData.mantenimientos.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {formData.mantenimientos.map((mant, index) => (
                  <div key={index} className="border-2 border-red-200 rounded-lg p-8 bg-gradient-to-br from-red-50 to-white shadow-sm hover:shadow-md transition-shadow relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 hover:bg-red-100"
                      onClick={() => handleRemoveMantenimiento(index)}
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </Button>
                    <div className="pr-10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full">
                          <span className="text-sm text-red-700">📅</span>
                          <span className="text-base text-red-700 font-medium">{mant.fecha || 'Sin fecha'}</span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className={`inline-block px-4 py-2 rounded-md text-sm font-medium ${
                          mant.tipo.includes('preventivo') ? 'bg-rose-100 text-rose-700' :
                          mant.tipo === 'correctivo' ? 'bg-orange-100 text-orange-700' :
                          mant.tipo === 'actualizacion' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {mant.tipo || 'Sin tipo'}
                        </div>
                      </div>
                      {mant.descripcion && (
                        <p className="text-gray-700 mb-3 text-base">{mant.descripcion}</p>
                      )}
                      {mant.responsable && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span>👤</span>
                          <span className="font-medium">{mant.responsable}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </form>
  );
}