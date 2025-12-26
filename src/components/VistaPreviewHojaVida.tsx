// ============================================
// VISTA PREVIA MODAL - HOJA DE VIDA
// Dimensiones: 810px × 720px (reducido 10%)
// Diseño: Vertical, sin scroll horizontal
// ============================================

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Database, 
  Network, 
  Settings, 
  Users, 
  Shield, 
  Wrench,
  Calendar,
  Phone,
  Mail,
  User,
  Package,
  HardDrive,
  Globe,
  X,
  Cpu,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

interface VistaPreviewHojaVidaProps {
  data: any;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VistaPreviewHojaVida({ data, onConfirm, onCancel, isLoading = false }: VistaPreviewHojaVidaProps) {
  console.log('🖼️ ========== VISTA PREVIA RECIBIENDO DATOS ==========');
  console.log('📦 Data recibida:', data);
  console.log('📦 Mantenimientos:', data?.mantenimientos);
  console.log('========== FIN VERIFICACIÓN VISTA PREVIA ==========');
  
  // Determinar si es firewall
  const isFirewall = (data.activoTipo || '').toLowerCase().includes('firewall');
  
  // Componente: Campo individual
  const Field = ({ label, value, icon: Icon }: { 
    label: string; 
    value: any; 
    icon?: any;
  }) => (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <label className="text-sm text-gray-600 font-semibold">{label}</label>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5">
        {value && value !== '' ? (
          <p className="text-sm text-gray-900 break-words">{value}</p>
        ) : (
          <span className="text-sm text-gray-400 italic">Sin información</span>
        )}
      </div>
    </div>
  );

  // ⭐ Componente especial para el campo Gabinete (con mensaje personalizado)
  const GabineteField = ({ label, value, icon: Icon }: { 
    label: string; 
    value: any; 
    icon?: any;
  }) => (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <label className="text-sm text-gray-600 font-semibold">{label}</label>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5">
        {value && value !== '' ? (
          <p className="text-sm text-gray-900 break-words">{value}</p>
        ) : (
          <span className="text-sm text-orange-600 italic font-semibold">Este campo debes ingresarlo manualmente o añadirlo en el archivo importado</span>
        )}
      </div>
    </div>
  );

  // Componente: Sección con tarjeta
  const Section = ({ 
    title, 
    icon: Icon, 
    children, 
    bgColor = 'bg-red-50'
  }: { 
    title: string; 
    icon: any; 
    children: React.ReactNode; 
    bgColor?: string;
  }) => (
    <Card 
      className="overflow-hidden border border-gray-200 rounded-lg mb-5"
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <div className={`${bgColor} px-4 py-3 border-b border-gray-200`}>
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 text-gray-700" />
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-5 bg-white">
        {children}
      </div>
    </Card>
  );

  return (
    <>
      {/* OVERLAY OSCURO */}
      <div 
        className="fixed inset-0 z-40" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onCancel}
      ></div>
      
      {/* VENTANA MODAL CENTRADA - 900×800px */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div 
          className="bg-white pointer-events-auto flex flex-col rounded-xl"
          style={{ 
            width: '810px',
            height: '720px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}
        >
          
          {/* ========== HEADER FIJO ========== */}
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Vista Previa - Hoja de Vida</h1>
              <p className="text-sm text-gray-600 mt-0.5">Revisa la información antes de guardar</p>
            </div>
            <button
              onClick={onCancel}
              className="w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>

          {/* ========== CONTENIDO CON SCROLL VERTICAL ========== */}
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5"
            style={{ 
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc'
            }}
          >
            
            {/* ========== 1. ENCABEZADO DEL EQUIPO ========== */}
            <Card 
              className={`${isFirewall ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'} text-white border-0 overflow-hidden rounded-lg mb-5`}
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-12 h-12" />
                    <div>
                      <p className="text-xs uppercase tracking-widest opacity-80 mb-1">Equipo de Red</p>
                      <h2 className="text-xl font-bold">{data.hostname || '(Sin nombre)'}</h2>
                      <p className="text-sm opacity-90 mt-1.5 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {data.direccionIP || 'Sin IP'}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    className={`${isFirewall ? 'bg-red-700' : 'bg-green-700'} text-white px-4 py-2 font-bold text-sm`}
                    style={{ height: '32px' }}
                  >
                    {data.activoTipo || 'ACTIVO'}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* ========== 2. UBICACIÓN - INFORMACIÓN DE REGISTRO ========== */}
            <Section title="Ubicación (Información de Registro)" icon={MapPin} bgColor="bg-red-50">
              <Field label="ID Hoja de Vida" value={data.idHoja} icon={Database} />
              <Field label="Hostname" value={data.hostname} icon={HardDrive} />
              <Field label="Tipo de Equipo (Activo)" value={data.activoTipo} icon={Package} />
              <Field label="Versión" value={data.version} icon={Package} />
              <Field label="Fecha de Registro" value={data.fechaRegistro} icon={Calendar} />
              <Field label="Razón Social" value={data.razonSocial} icon={Package} />
              <Field label="Site" value={data.site} icon={MapPin} />
            </Section>

            {/* ========== 3. DATOS BÁSICOS - CAMPOS BÁSICOS ========== */}
            <Section title="Datos Básicos (Campos Básicos)" icon={Database} bgColor="bg-red-50">
              <Field label="Elemento" value={data.elemento} icon={Package} />
              <GabineteField 
                label={isFirewall ? "Rack" : "Gabinete"} 
                value={data.gabinete} 
                icon={Database} 
              />
              <Field label="Marca" value={data.marca} icon={Package} />
              <Field label="Modelo" value={data.modelo} icon={HardDrive} />
              <Field label="Serial" value={data.serial} icon={Database} />
              <Field label="Proveedor" value={data.proveedor} icon={Package} />
              <Field label="Fecha de Compra" value={data.fechaCompra} icon={Calendar} />
            </Section>

            {/* ========== 4. TÉCNICO - CARACTERÍSTICAS TÉCNICAS, DEPENDENCIA E IMPACTO ========== */}
            <Section title="Técnico" icon={Settings} bgColor="bg-red-50">
              {/* Características Técnicas */}
              <div className="bg-red-100 border-l-4 border-red-500 rounded px-4 py-3 mb-4">
                <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Características Técnicas
                </h4>
              </div>
              <Field label="Procesador" value={data.procesador} icon={Cpu} />
              <Field label="Memoria NVRAM" value={data.memoriaNvram} icon={Database} />
              <Field label="Sistema Operativo" value={data.sistemaOperativo} icon={Settings} />
              <Field label="Versión Firmware/Software" value={data.versionFirmware} icon={Package} />
              <Field label="Backup" value={data.backup} icon={Shield} />
              <Field label="Funciones" value={data.funciones} icon={Settings} />

              {/* Dependencia e Impacto */}
              <div className="bg-red-100 border-l-4 border-red-500 rounded px-4 py-3 mb-4 mt-6">
                <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Dependencia e Impacto
                </h4>
              </div>
              <Field label="Dependencia" value={data.dependencia} icon={Network} />
              <Field label="Impacto Caída" value={data.impactoCaida} icon={AlertTriangle} />
              <Field label="Nivel de Impacto" value={data.nivel} icon={AlertCircle} />
              <Field label="Congénitas" value={data.congenitas} icon={Shield} />
            </Section>

            {/* ========== 5. CONTACTO - ADMINISTRADORES E INFORMACIÓN PROVEEDOR (CON GARANTÍA) ========== */}
            <Section title="Contacto" icon={Users} bgColor="bg-red-50">
              {/* Administradores */}
              <div className="bg-red-100 border-l-4 border-red-500 rounded px-4 py-3 mb-4">
                <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Administradores (Máx. 2)
                </h4>
              </div>
              <Field label="Usuario(s) Administrador(es)" value={data.contactos?.usuarioAdmin || data.usuariosAdmin} icon={User} />
              <Field label="Correo(s) Electrónico(s)" value={data.contactos?.correoAdmin || data.correoAdmin} icon={Mail} />
              <Field label="Cargo Admin" value={data.contactos?.cargoAdmin || data.cargoAdmin} icon={User} />

              {/* Información Proveedor (incluye Garantía) */}
              <div className="bg-red-100 border-l-4 border-red-500 rounded px-4 py-3 mb-4 mt-6">
                <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Información Proveedor
                </h4>
              </div>
              <Field label="Proveedor Contacto" value={data.contactos?.proveedorContacto || data.proveedorContacto} icon={Package} />
              <Field label="Cargo Contacto" value={data.contactos?.cargoContacto || data.cargoContacto} icon={User} />
              <Field label="Email" value={data.contactos?.emailProveedor || data.emailProveedor} icon={Mail} />
              <Field label="Teléfono 1" value={data.contactos?.telefono1 || data.telefonoContacto1} icon={Phone} />
              <Field label="Teléfono 2" value={data.contactos?.telefono2 || data.telefonoContacto2} icon={Phone} />
              <Field label="Responsable" value={data.contactos?.responsable || data.responsableProveedor} icon={User} />
              
              {/* Garantía (sin subtítulo, integrado con Proveedor) */}
              <Field label="Fecha de Entrega" value={data.garantia?.fechaEntrega || data.fechaEntrega} icon={Calendar} />
              <Field label="Tiempo de Garantía" value={data.garantia?.tiempoGarantia || data.tiempoGarantia} icon={Shield} />
              <Field label="Fecha de Terminación" value={data.garantia?.fechaTerminacion || data.fechaTerminacion} icon={Calendar} />
            </Section>

            {/* ========== 6. MANTENIMIENTO - MANTENIMIENTOS ========== */}
            <Section 
              title={`Mantenimientos (${data.mantenimientos?.length || 0})`}
              icon={Wrench} 
              bgColor="bg-red-50"
            >
              {data.mantenimientos && data.mantenimientos.length > 0 ? (
                <div className="space-y-4">
                  {data.mantenimientos.map((mant: any, idx: number) => {
                    const isPreventivo = mant.tipo?.toLowerCase().includes('preventivo');
                    const isActualizacion = mant.tipo?.toLowerCase().includes('actualizacion') || 
                                           mant.tipo?.toLowerCase().includes('actualización');
                    
                    return (
                      <Card 
                        key={idx} 
                        className="border-l-4 border-red-500 bg-red-50 overflow-hidden rounded-lg"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isPreventivo ? 'bg-green-500' :
                                isActualizacion ? 'bg-blue-500' :
                                'bg-purple-500'
                              }`}
                            >
                              {isPreventivo ? (
                                <span className="text-2xl">🔧</span>
                              ) : isActualizacion ? (
                                <span className="text-2xl">🔄</span>
                              ) : (
                                <Wrench className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Badge 
                                className={`text-xs px-3 py-1 mb-2 ${
                                  isPreventivo ? 'bg-green-100 text-green-800' :
                                  isActualizacion ? 'bg-blue-100 text-blue-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}
                                style={{ height: '24px' }}
                              >
                                {mant.tipo || 'Sin tipo'}
                              </Badge>
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-4 h-4" />
                                <span className="font-semibold text-sm">{mant.fecha || 'Sin fecha'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 mb-3">
                            <p className="text-sm text-gray-900 break-words leading-relaxed">
                              {mant.descripcion || 'Sin descripción'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-4 h-4" />
                            <span className="text-sm"><strong>Responsable:</strong> {mant.responsable || 'Sin responsable'}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500 font-semibold">No hay mantenimientos registrados</p>
                </div>
              )}
            </Section>

            {/* ========== BOTONES (DENTRO DEL CONTENIDO) ========== */}
            <div className="flex items-center gap-4 pt-6 pb-4">
              <Button
                onClick={onCancel}
                disabled={isLoading}
                variant="outline"
                className="flex-1 font-bold border-2 transition-all rounded-lg"
                style={{ 
                  borderColor: '#F44336',
                  color: '#F44336',
                  backgroundColor: 'white',
                  height: '48px'
                }}
              >
                <XCircle className="w-5 h-5 mr-2" />
                <span>Cancelar Importación</span>
              </Button>

              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 font-bold transition-all rounded-lg"
                style={{ 
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  height: '48px'
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Confirmar y Guardar</span>
                  </>
                )}
              </Button>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}