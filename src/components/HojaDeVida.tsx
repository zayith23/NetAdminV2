import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState, useEffect } from 'react';
import { Save, FileText, X, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ImportarHojaDeVida } from './ImportarHojaDeVida';

interface MantenimientoItem {
  fecha: string;
  tipo: string;
  descripcion: string;
  responsable: string;
}

interface HojaVidaData {
  // Ubicación del archivo
  id_hoja: string;
  hostname: string;
  activo: string; // 'firewall' o 'switch'
  fecha_registro: string;
  ultima_actualizacion: string;
  usuario_creador: string;
  version: string;
  razon_social: string; // 'grupo cos', 'otd', 'contactos solutions'
  site: string;
  gabinete: string;
  
  // Campos básicos
  elemento: string;
  marca: string;
  modelo: string;
  serial: string;
  proveedor: string;
  fecha_compra: string;
  
  // Características Técnicas
  procesador: string;
  memoria_nvram: string;
  sistema_operativo: string;
  version_firmware: string;
  backup: string; // ⭐ Por defecto en "Si"
  funciones: string;
  
  // Dependencia
  dependencia: string;
  
  // Impacto Caída
  impacto_caida: string;
  nivel: string;
  
  // Congénitas
  congenitas: string;
  
  // Administradores
  usuarios_admin: string;
  correo_admin: string;
  cargo_admin: string;
  
  // Información Proveedor
  proveedor_contacto: string;
  cargo_contacto: string;
  telefono_contacto1: string;
  telefono_contacto2: string;
  email_proveedor: string;
  responsable_proveedor: string;
  fecha_entrega: string;
  tiempo_garantia: string;
  fecha_terminacion: string;
  
  // Mantenimientos
  mantenimientos: MantenimientoItem[];
}

export function HojaDeVida() {
  const [formData, setFormData] = useState<HojaVidaData>({
    // Ubicación
    id_hoja: '',
    hostname: '',
    activo: '',
    fecha_registro: new Date().toISOString().split('T')[0],
    ultima_actualizacion: new Date().toISOString().split('T')[0],
    usuario_creador: '',
    version: '1.0',
    razon_social: '',
    site: '',
    gabinete: '',
    
    // Campos
    elemento: '',
    marca: '',
    modelo: '',
    serial: '',
    proveedor: '',
    fecha_compra: '',
    
    // Características Técnicas
    procesador: '',
    memoria_nvram: '',
    sistema_operativo: '',
    version_firmware: '',
    backup: 'si', // ⭐ Por defecto en "Si"
    funciones: '',
    
    // Dependencia
    dependencia: '',
    
    // Impacto
    impacto_caida: '',
    nivel: '',
    
    // Congénitas
    congenitas: '',
    
    // Administradores
    usuarios_admin: '',
    correo_admin: '',
    cargo_admin: '',
    
    // Proveedor
    proveedor_contacto: '',
    cargo_contacto: '',
    telefono_contacto1: '',
    telefono_contacto2: '',
    email_proveedor: '',
    responsable_proveedor: '',
    fecha_entrega: '',
    tiempo_garantia: '',
    fecha_terminacion: '',
    
    // Mantenimientos
    mantenimientos: []
  });

  const [newMantenimiento, setNewMantenimiento] = useState<MantenimientoItem>({
    fecha: '',
    tipo: '',
    descripcion: '',
    responsable: ''
  });

  const handleInputChange = (field: keyof HojaVidaData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Obtener opciones de site basadas en razon_social y activo
  const getSiteOptions = () => {
    if (!formData.razon_social) return [];
    
    switch (formData.razon_social) {
      case 'contactos solutions':
        return ['site 6', 'itawi'];
      case 'grupo cos':
        const baseOptions = ['barranquilla', 'caracol', 'site7'];
        // Si activo es switch Y razon_social es grupo cos, agregar RRHH
        if (formData.activo === 'switch') {
          return [...baseOptions, 'RRHH'];
        }
        return baseOptions;
      case 'otd':
        return ['calle 80'];
      default:
        return [];
    }
  };

  // Limpiar site cuando cambie razon_social o activo
  useEffect(() => {
    const siteOptions = getSiteOptions();
    if (formData.site && !siteOptions.includes(formData.site)) {
      setFormData(prev => ({ ...prev, site: '' }));
    }
  }, [formData.razon_social, formData.activo]);

  const handleAddMantenimiento = () => {
    // ⭐ CAMBIO V7: Agregar mantenimiento sin validación - permite campos vacíos
    setFormData(prev => ({
      ...prev,
      mantenimientos: [...prev.mantenimientos, newMantenimiento]
    }));
    
    setNewMantenimiento({
      fecha: '',
      tipo: '',
      descripcion: '',
      responsable: ''
    });
    
    toast.success('✅ Mantenimiento agregado', {
      duration: 2000,
      style: {
        background: '#10b981',
        color: '#ffffff',
        border: '2px solid #059669',
      }
    });
  };

  const handleRemoveMantenimiento = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mantenimientos: prev.mantenimientos.filter((_, i) => i !== index)
    }));
    toast.success('Mantenimiento eliminado');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.hostname || !formData.elemento) {
      toast.error('Por favor completa los campos requeridos: Hostname y Elemento');
      return;
    }

    // Generar ID si no existe
    if (!formData.id_hoja) {
      formData.id_hoja = `HV-${Date.now()}`;
    }

    // Actualizar fecha de última actualización
    formData.ultima_actualizacion = new Date().toISOString().split('T')[0];

    // Obtener datos existentes del localStorage
    const existingData = localStorage.getItem('equipmentData');
    const equipmentList = existingData ? JSON.parse(existingData) : [];
    
    // Agregar nuevo equipo
    const newEquipment = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    equipmentList.push(newEquipment);
    
    // Guardar en localStorage
    localStorage.setItem('equipmentData', JSON.stringify(equipmentList));
    
    // ⭐ CAMBIO V7: Pop-up de guardado exitoso más visible y atractivo
    toast.success(`✅ ¡Hoja de Vida Guardada Exitosamente!`, {
      description: `ID: ${formData.id_hoja} | Hostname: ${formData.hostname}`,
      duration: 4000,
      style: {
        background: '#10b981',
        color: '#ffffff',
        border: '3px solid #059669',
        fontSize: '16px',
        fontWeight: '600',
      }
    });
    
    // Limpiar formulario
    setFormData({
      id_hoja: '',
      hostname: '',
      activo: '',
      fecha_registro: new Date().toISOString().split('T')[0],
      ultima_actualizacion: new Date().toISOString().split('T')[0],
      usuario_creador: '',
      version: '1.0',
      razon_social: '',
      site: '',
      gabinete: '',
      elemento: '',
      marca: '',
      modelo: '',
      serial: '',
      proveedor: '',
      fecha_compra: '',
      procesador: '',
      memoria_nvram: '',
      sistema_operativo: '',
      version_firmware: '',
      backup: 'si', // ⭐ Por defecto en "Si"
      funciones: '',
      dependencia: '',
      impacto_caida: '',
      nivel: '',
      congenitas: '',
      usuarios_admin: '',
      correo_admin: '',
      cargo_admin: '',
      proveedor_contacto: '',
      cargo_contacto: '',
      telefono_contacto1: '',
      telefono_contacto2: '',
      email_proveedor: '',
      responsable_proveedor: '',
      fecha_entrega: '',
      tiempo_garantia: '',
      fecha_terminacion: '',
      mantenimientos: []
    });
  };

  const siteOptions = getSiteOptions();

  const [activeTab, setActiveTab] = useState('ubicacion');
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleNextTab = () => {
    const tabs = ['ubicacion', 'basico', 'tecnico', 'contactos', 'mantenimiento'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      // Scroll to top suavemente
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="p-8 pb-24">
      {/* Header con diseño congruente */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Hoja de Vida</h1>
              <p className="text-gray-600 text-sm">Registra la información completa de switches y firewalls</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Barra de botones fija */}
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 z-10 shadow-lg">
          <div className="flex gap-4 max-w-6xl justify-between items-center">
            <div className="flex gap-4">
              <Button type="submit" className="gap-2 bg-red-600 hover:bg-red-700">
                <Save className="w-4 h-4" />
                Guardar Hoja de Vida
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleNextTab}
                className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-600"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              onClick={() => setShowImportDialog(true)}
              className="gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
            >
              <Upload className="w-5 h-5" />
              Importar Archivo Excel
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
            <TabsTrigger value="basico">Datos Básicos</TabsTrigger>
            <TabsTrigger value="tecnico">Técnico</TabsTrigger>
            <TabsTrigger value="contactos">Contactos</TabsTrigger>
            <TabsTrigger value="mantenimiento">Mantenimiento</TabsTrigger>
          </TabsList>

          {/* UBICACIÓN DEL ARCHIVO */}
          <TabsContent value="ubicacion">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Información de Registro</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="id_hoja">ID Hoja de Vida</Label>
                    <Input
                      id="id_hoja"
                      value={formData.id_hoja}
                      onChange={(e) => handleInputChange('id_hoja', e.target.value)}
                      placeholder="Auto-generado si está vacío"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hostname">Hostname *</Label>
                    <Input
                      id="hostname"
                      value={formData.hostname}
                      onChange={(e) => handleInputChange('hostname', e.target.value)}
                      placeholder="SW-CORE-01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="activo">Tipo de Equipo *</Label>
                    <Select value={formData.activo} onValueChange={(value) => handleInputChange('activo', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="firewall">Firewall</SelectItem>
                        <SelectItem value="switch">Switch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="version">Versión</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => handleInputChange('version', e.target.value)}
                      placeholder="1.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="usuario_creador">Usuario Creador</Label>
                    <Input
                      id="usuario_creador"
                      value={formData.usuario_creador}
                      onChange={(e) => handleInputChange('usuario_creador', e.target.value)}
                      placeholder="Nombre del usuario"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_registro">Fecha de Registro</Label>
                    <Input
                      id="fecha_registro"
                      type="date"
                      value={formData.fecha_registro}
                      onChange={(e) => handleInputChange('fecha_registro', e.target.value)}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Ubicación y Organización</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razon_social">Razón Social *</Label>
                    <Select value={formData.razon_social} onValueChange={(value) => handleInputChange('razon_social', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar razón social" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grupo cos">Grupo COS</SelectItem>
                        <SelectItem value="otd">OTD</SelectItem>
                        <SelectItem value="contactos solutions">Contactos Solutions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="site">Site *</Label>
                    <Select 
                      value={formData.site} 
                      onValueChange={(value) => handleInputChange('site', value)}
                      disabled={!formData.razon_social}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.razon_social ? "Seleccionar site" : "Primero selecciona razón social"} />
                      </SelectTrigger>
                      <SelectContent>
                        {siteOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* DATOS BÁSICOS */}
          <TabsContent value="basico">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Campos Básicos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="elemento">Elemento *</Label>
                    <Select value={formData.elemento} onValueChange={(value) => handleInputChange('elemento', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar elemento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="switch">Switch</SelectItem>
                        <SelectItem value="firewall">Firewall</SelectItem>
                        <SelectItem value="router">Router</SelectItem>
                        <SelectItem value="access-point">Access Point</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* ========== CAMPO DINÁMICO: GABINETE (Switch) / RACK (Firewall) ========== */}
                  <div>
                    <Label htmlFor="gabinete">
                      {formData.activo === 'switch' ? 'Gabinete *' : formData.activo === 'firewall' ? 'Rack *' : 'Gabinete/Rack *'}
                    </Label>
                    <Input
                      id="gabinete"
                      value={formData.gabinete}
                      onChange={(e) => handleInputChange('gabinete', e.target.value)}
                      placeholder={formData.activo === 'switch' ? 'Gabinete 3' : 'Rack 3'}
                      required
                    />
                  </div>
                  {/* ========== FIN CAMPO DINÁMICO ========== */}
                  <div>
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => handleInputChange('marca', e.target.value)}
                      placeholder="Cisco, Fortinet, Huawei"
                    />
                  </div>
                  <div>
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => handleInputChange('modelo', e.target.value)}
                      placeholder="Catalyst 3850"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serial">Serial</Label>
                    <Input
                      id="serial"
                      value={formData.serial}
                      onChange={(e) => handleInputChange('serial', e.target.value)}
                      placeholder="SN123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <Input
                      id="proveedor"
                      value={formData.proveedor}
                      onChange={(e) => handleInputChange('proveedor', e.target.value)}
                      placeholder="Proveedor del equipo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_compra">Fecha de Compra</Label>
                    <Input
                      id="fecha_compra"
                      type="date"
                      value={formData.fecha_compra}
                      onChange={(e) => handleInputChange('fecha_compra', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* TÉCNICO */}
          <TabsContent value="tecnico">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Características Técnicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="procesador">Procesador</Label>
                    <Input
                      id="procesador"
                      value={formData.procesador}
                      onChange={(e) => handleInputChange('procesador', e.target.value)}
                      placeholder="Intel Xeon, ARM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memoria_nvram">Memoria NVRAM</Label>
                    <Input
                      id="memoria_nvram"
                      value={formData.memoria_nvram}
                      onChange={(e) => handleInputChange('memoria_nvram', e.target.value)}
                      placeholder="512 MB"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sistema_operativo">Sistema Operativo</Label>
                    <Input
                      id="sistema_operativo"
                      value={formData.sistema_operativo}
                      onChange={(e) => handleInputChange('sistema_operativo', e.target.value)}
                      placeholder="IOS, FortiOS"
                    />
                  </div>
                  <div>
                    <Label htmlFor="version_firmware">Versión Firmware</Label>
                    <Input
                      id="version_firmware"
                      value={formData.version_firmware}
                      onChange={(e) => handleInputChange('version_firmware', e.target.value)}
                      placeholder="15.2.4"
                    />
                  </div>
                  {/* ========== CAMBIO V6: Campo Backup ahora es Select ========== */}
                  <div>
                    <Label htmlFor="backup">Backup</Label>
                    <Select value={formData.backup} onValueChange={(value) => handleInputChange('backup', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Si</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* ========== FIN CAMBIO V6 ========== */}
                  <div className="md:col-span-2">
                    <Label htmlFor="funciones">Funciones</Label>
                    <Textarea
                      id="funciones"
                      value={formData.funciones}
                      onChange={(e) => handleInputChange('funciones', e.target.value)}
                      placeholder="Descripción de las funciones del equipo"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Dependencia e Impacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="dependencia">Dependencia</Label>
                    <Textarea
                      id="dependencia"
                      value={formData.dependencia}
                      onChange={(e) => handleInputChange('dependencia', e.target.value)}
                      placeholder="Equipos o sistemas de los que depende"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="impacto_caida">Impacto Caída</Label>
                    <Textarea
                      id="impacto_caida"
                      value={formData.impacto_caida}
                      onChange={(e) => handleInputChange('impacto_caida', e.target.value)}
                      placeholder="Impacto en caso de falla"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nivel">Nivel de Impacto</Label>
                    <Select value={formData.nivel} onValueChange={(value) => handleInputChange('nivel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critico">Crítico</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="medio">Medio</SelectItem>
                        <SelectItem value="bajo">Bajo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="congenitas">Congénitas</Label>
                    <Textarea
                      id="congenitas"
                      value={formData.congenitas}
                      onChange={(e) => handleInputChange('congenitas', e.target.value)}
                      placeholder="Problemas conocidos o características especiales"
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* CONTACTOS */}
          <TabsContent value="contactos">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Administradores</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="usuarios_admin">Usuarios Admin</Label>
                    <Input
                      id="usuarios_admin"
                      value={formData.usuarios_admin}
                      onChange={(e) => handleInputChange('usuarios_admin', e.target.value)}
                      placeholder="admin, root"
                    />
                  </div>
                  <div>
                    <Label htmlFor="correo_admin">Correo Admin</Label>
                    <Input
                      id="correo_admin"
                      type="email"
                      value={formData.correo_admin}
                      onChange={(e) => handleInputChange('correo_admin', e.target.value)}
                      placeholder="admin@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargo_admin">Cargo Admin</Label>
                    <Input
                      id="cargo_admin"
                      value={formData.cargo_admin}
                      onChange={(e) => handleInputChange('cargo_admin', e.target.value)}
                      placeholder="Administrador de Red"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Información del Proveedor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proveedor_contacto">Proveedor</Label>
                    <Input
                      id="proveedor_contacto"
                      value={formData.proveedor_contacto}
                      onChange={(e) => handleInputChange('proveedor_contacto', e.target.value)}
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cargo_contacto">Cargo Contacto</Label>
                    <Input
                      id="cargo_contacto"
                      value={formData.cargo_contacto}
                      onChange={(e) => handleInputChange('cargo_contacto', e.target.value)}
                      placeholder="Gerente de Ventas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono_contacto1">Teléfono Contacto 1</Label>
                    <Input
                      id="telefono_contacto1"
                      value={formData.telefono_contacto1}
                      onChange={(e) => handleInputChange('telefono_contacto1', e.target.value)}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono_contacto2">Teléfono Contacto 2</Label>
                    <Input
                      id="telefono_contacto2"
                      value={formData.telefono_contacto2}
                      onChange={(e) => handleInputChange('telefono_contacto2', e.target.value)}
                      placeholder="+57 300 123 4568"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email_proveedor">Email</Label>
                    <Input
                      id="email_proveedor"
                      type="email"
                      value={formData.email_proveedor}
                      onChange={(e) => handleInputChange('email_proveedor', e.target.value)}
                      placeholder="contacto@proveedor.com"
                    />
                  </div>
                  {/* ========== CAMBIO V6: Campo "Contacto" eliminado ========== */}
                  <div>
                    <Label htmlFor="responsable_proveedor">Responsable</Label>
                    <Input
                      id="responsable_proveedor"
                      value={formData.responsable_proveedor}
                      onChange={(e) => handleInputChange('responsable_proveedor', e.target.value)}
                      placeholder="Responsable del proveedor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_entrega">Fecha de Entrega</Label>
                    <Input
                      id="fecha_entrega"
                      type="date"
                      value={formData.fecha_entrega}
                      onChange={(e) => handleInputChange('fecha_entrega', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiempo_garantia">Tiempo de Garantía</Label>
                    <Input
                      id="tiempo_garantia"
                      value={formData.tiempo_garantia}
                      onChange={(e) => handleInputChange('tiempo_garantia', e.target.value)}
                      placeholder="12 meses, 2 años"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_terminacion">Fecha de Terminación</Label>
                    <Input
                      id="fecha_terminacion"
                      type="date"
                      value={formData.fecha_terminacion}
                      onChange={(e) => handleInputChange('fecha_terminacion', e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* MANTENIMIENTO */}
          <TabsContent value="mantenimiento">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-gray-900 mb-4">Agregar Mantenimiento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="mant_fecha">Fecha de Mantenimiento</Label>
                    <Input
                      id="mant_fecha"
                      type="date"
                      value={newMantenimiento.fecha}
                      onChange={(e) => setNewMantenimiento({...newMantenimiento, fecha: e.target.value})}
                    />
                  </div>
                  {/* ========== CAMBIO V6: Tipos de Mantenimiento actualizados ========== */}
                  <div>
                    <Label htmlFor="mant_tipo">Tipo</Label>
                    <Select 
                      value={newMantenimiento.tipo} 
                      onValueChange={(value) => setNewMantenimiento({...newMantenimiento, tipo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventivo-logico">Preventivo (lógico)</SelectItem>
                        <SelectItem value="preventivo-fisico">Preventivo (preveer futuras averías en dispositivos y fibras ópticas a causa de la suciedad)</SelectItem>
                        <SelectItem value="correctivo">Correctivo</SelectItem>
                        <SelectItem value="actualizacion">Actualización</SelectItem>
                        <SelectItem value="revision">Revisión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* ========== FIN CAMBIO V6 ========== */}
                  <div>
                    <Label htmlFor="mant_responsable">Responsable</Label>
                    <Input
                      id="mant_responsable"
                      value={newMantenimiento.responsable}
                      onChange={(e) => setNewMantenimiento({...newMantenimiento, responsable: e.target.value})}
                      placeholder="Nombre del responsable"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="mant_descripcion">Descripción</Label>
                    <Textarea
                      id="mant_descripcion"
                      value={newMantenimiento.descripcion}
                      onChange={(e) => setNewMantenimiento({...newMantenimiento, descripcion: e.target.value})}
                      placeholder="Descripción del mantenimiento realizado"
                      rows={2}
                    />
                  </div>
                </div>
                <Button type="button" onClick={handleAddMantenimiento}>
                  Agregar Mantenimiento
                </Button>
              </Card>

              {formData.mantenimientos.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-gray-900 mb-4">Mantenimientos Registrados ({formData.mantenimientos.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.mantenimientos.map((mant, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => handleRemoveMantenimiento(index)}
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                        <div className="pr-8">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
                              <span className="text-xs text-red-600">📅</span>
                              <span className="text-sm text-red-700">{mant.fecha || 'Sin fecha'}</span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className={`inline-block px-3 py-1 rounded-md text-xs ${
                              mant.tipo.includes('preventivo') ? 'bg-rose-100 text-rose-700' :
                              mant.tipo === 'correctivo' ? 'bg-orange-100 text-orange-700' :
                              mant.tipo === 'actualizacion' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {mant.tipo || 'Sin tipo'}
                            </div>
                          </div>
                          {mant.descripcion && (
                            <p className="text-gray-700 mb-2 text-sm line-clamp-2">{mant.descripcion}</p>
                          )}
                          {mant.responsable && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <span>👤</span>
                              <span>{mant.responsable}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </form>

      {/* Diálogo de Importación */}
      <ImportarHojaDeVida
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={() => {
          setShowImportDialog(false);
          toast.success('Archivo importado correctamente');
        }}
      />
    </div>
  );
}