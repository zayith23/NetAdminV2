// ============================================
// NETADMIN V9 - COMPONENTE VISTA PREVIA
// Vista detallada de hoja de vida (solo lectura)
// ============================================

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Server, Network, Users, Wrench } from 'lucide-react';

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
}

interface VistaPreviaProps {
  equipment: Equipment;
}

const DataField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <div className="text-sm font-medium text-gray-500">{label}</div>
    <div className="text-base text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">{value || 'N/A'}</div>
  </div>
);

export function VistaPrevia({ equipment }: VistaPreviaProps) {
  return (
    <div className="space-y-8 max-w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-xl shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Server className="w-10 h-10" />
              <h2 className="text-white text-3xl">{equipment.hostname}</h2>
            </div>
            <div className="flex items-center gap-6 text-red-100 text-lg">
              <span>ID: {equipment.id_hoja || 'N/A'}</span>
              <span>•</span>
              <span>Razón Social: {equipment.razon_social || 'N/A'}</span>
              <span>•</span>
              <span>Site: {equipment.site || 'N/A'}</span>
            </div>
          </div>
          <Badge className={`text-lg px-6 py-2 ${
            equipment.activo === 'firewall' || equipment.elemento === 'firewall'
              ? 'bg-red-500'
              : 'bg-rose-500'
          } text-white`}>
            {(equipment.activo || equipment.elemento || 'N/A').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Tabs with Content */}
      <Tabs defaultValue="ubicacion" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-14 bg-red-50 border-2 border-red-200">
          <TabsTrigger value="ubicacion" className="text-base data-[state=active]:bg-red-600 data-[state=active]:text-white">Ubicación</TabsTrigger>
          <TabsTrigger value="basico" className="text-base data-[state=active]:bg-red-600 data-[state=active]:text-white">Datos Básicos</TabsTrigger>
          <TabsTrigger value="tecnico" className="text-base data-[state=active]:bg-red-600 data-[state=active]:text-white">Técnico</TabsTrigger>
          <TabsTrigger value="contactos" className="text-base data-[state=active]:bg-red-600 data-[state=active]:text-white">Contactos</TabsTrigger>
          <TabsTrigger value="mantenimiento" className="text-base data-[state=active]:bg-red-600 data-[state=active]:text-white">Mantenimiento</TabsTrigger>
        </TabsList>

        {/* Ubicación */}
        <TabsContent value="ubicacion" className="mt-6">
          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-red-600" />
              <h3 className="text-gray-900 text-2xl">Información de Registro</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DataField label="ID Hoja de Vida" value={equipment.id_hoja} />
              <DataField label="Hostname" value={equipment.hostname} />
              <DataField label="Tipo de Equipo" value={(equipment.activo || equipment.elemento || '').toUpperCase()} />
              <DataField label="Razón Social" value={(equipment.razon_social || '').toUpperCase()} />
              <DataField label="Site" value={(equipment.site || '').toUpperCase()} />
              <DataField label="Gabinete" value={equipment.gabinete} />
              <DataField label="Fecha de Registro" value={equipment.fecha_registro} />
              <DataField label="Última Actualización" value={equipment.ultima_actualizacion} />
              <DataField label="Usuario Creador" value={equipment.usuario_creador} />
            </div>
          </Card>
        </TabsContent>

        {/* Datos Básicos */}
        <TabsContent value="basico" className="mt-6">
          <div className="space-y-6">
            <Card className="p-8 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Network className="w-6 h-6 text-red-600" />
                <h3 className="text-gray-900 text-2xl">Información del Equipo</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataField label="Elemento" value={(equipment.elemento || equipment.activo || '').toUpperCase()} />
                <DataField label="Marca" value={equipment.marca} />
                <DataField label="Modelo" value={equipment.modelo} />
                <DataField label="Serial" value={equipment.serial} />
                <DataField label="Proveedor" value={equipment.proveedor} />
                <DataField label="Fecha de Compra" value={equipment.fecha_compra} />
                <div className="md:col-span-2">
                  <DataField label="Ubicación Física" value={equipment.ubicacion_fisica} />
                </div>
              </div>
            </Card>

            <Card className="p-8 border-2 border-gray-200">
              <h3 className="text-gray-900 text-2xl mb-6">Accesos y Red</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataField label="IP Dirección" value={equipment.ip_direccion} />
                <DataField label="Gateway" value={equipment.gateway} />
                <DataField label="WINS/DNS" value={equipment.wins_dns} />
                {equipment.configuracion && (
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-sm font-medium text-gray-500">Configuración</div>
                    <div className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg border-2 border-gray-200 whitespace-pre-wrap">
                      {equipment.configuracion}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Técnico */}
        <TabsContent value="tecnico" className="mt-6">
          <div className="space-y-6">
            <Card className="p-8 border-2 border-gray-200">
              <h3 className="text-gray-900 text-2xl mb-6">Características Técnicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataField label="Procesador" value={equipment.procesador} />
                <DataField label="Memoria NVRAM" value={equipment.memoria_nvram} />
                <DataField label="Sistema Operativo" value={equipment.sistema_operativo} />
                <DataField label="Versión Firmware" value={equipment.version_firmware} />
                <DataField label="Backup" value={equipment.backup ? equipment.backup.toUpperCase() : 'N/A'} />
                {equipment.funciones && (
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-sm font-medium text-gray-500">Funciones</div>
                    <div className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                      {equipment.funciones}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-8 border-2 border-gray-200">
              <h3 className="text-gray-900 text-2xl mb-6">Dependencia e Impacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {equipment.dependencia && (
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-sm font-medium text-gray-500">Dependencia</div>
                    <div className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                      {equipment.dependencia}
                    </div>
                  </div>
                )}
                {equipment.impacto_caida && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">Impacto Caída</div>
                    <div className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                      {equipment.impacto_caida}
                    </div>
                  </div>
                )}
                <DataField label="Nivel de Impacto" value={equipment.nivel ? equipment.nivel.toUpperCase() : 'N/A'} />
                {equipment.congenitas && (
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-sm font-medium text-gray-500">Congénitas</div>
                    <div className="text-base text-gray-900 bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                      {equipment.congenitas}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Contactos */}
        <TabsContent value="contactos" className="mt-6">
          <div className="space-y-6">
            <Card className="p-8 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-red-600" />
                <h3 className="text-gray-900 text-2xl">Administradores</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DataField label="Usuarios Admin" value={equipment.usuarios_admin} />
                <DataField label="Correo Admin" value={equipment.correo_admin} />
                <DataField label="Cargo Admin" value={equipment.cargo_admin} />
              </div>
            </Card>

            <Card className="p-8 border-2 border-gray-200">
              <h3 className="text-gray-900 text-2xl mb-6">Información del Proveedor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DataField label="Proveedor" value={equipment.proveedor_contacto} />
                <DataField label="Cargo Contacto" value={equipment.cargo_contacto} />
                <DataField label="Teléfono 1" value={equipment.telefono_contacto1} />
                <DataField label="Teléfono 2" value={equipment.telefono_contacto2} />
                <DataField label="Email" value={equipment.email_proveedor} />
                <DataField label="Responsable" value={equipment.responsable_proveedor} />
                <DataField label="Fecha de Entrega" value={equipment.fecha_entrega} />
                <DataField label="Tiempo de Garantía" value={equipment.tiempo_garantia} />
                <DataField label="Fecha de Terminación" value={equipment.fecha_terminacion} />
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Mantenimiento */}
        <TabsContent value="mantenimiento" className="mt-6">
          <Card className="p-8 border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-6 h-6 text-red-600" />
              <h3 className="text-gray-900 text-2xl">Historial de Mantenimientos</h3>
            </div>
            {equipment.mantenimientos && equipment.mantenimientos.length > 0 ? (
              <div className="space-y-5">
                {equipment.mantenimientos.map((mant, index) => (
                  <div 
                    key={index}
                    className="bg-white border-l-4 border-red-500 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                        <Calendar className="w-5 h-5 text-red-600" />
                        <span className="text-base font-medium text-red-700">{mant.fecha || 'Sin fecha'}</span>
                      </div>
                      <span className={`px-4 py-2 rounded-lg text-base font-medium border ${
                        mant.tipo === 'preventivo-logico' ? 'bg-rose-100 text-rose-700 border-rose-300' :
                        mant.tipo === 'preventivo-fisico' ? 'bg-red-100 text-red-700 border-red-300' :
                        mant.tipo === 'correctivo' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                        mant.tipo === 'actualizacion' ? 'bg-red-200 text-red-800 border-red-400' :
                        mant.tipo === 'revision' ? 'bg-rose-200 text-rose-800 border-rose-400' :
                        'bg-gray-100 text-gray-700 border-gray-300'
                      }`}>
                        {mant.tipo ? (
                          mant.tipo === 'preventivo-logico' ? 'Preventivo (Lógico)' :
                          mant.tipo === 'preventivo-fisico' ? 'Preventivo (Físico)' :
                          mant.tipo === 'correctivo' ? 'Correctivo' :
                          mant.tipo === 'actualizacion' ? 'Actualización' :
                          mant.tipo === 'revision' ? 'Revisión' :
                          mant.tipo
                        ) : 'Sin tipo'}
                      </span>
                    </div>
                    
                    {mant.descripcion && (
                      <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{mant.descripcion}</p>
                      </div>
                    )}
                    
                    {mant.responsable && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Users className="w-5 h-5 text-red-600" />
                        <span className="text-base">
                          <strong>Responsable:</strong> {mant.responsable}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay mantenimientos registrados</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}