// ============================================
// NETADMIN V9 - SISTEMA DE BACKUP Y RESTAURACIÓN
// Puerta trasera para recuperación de datos
// ============================================

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Download, Upload, Database, AlertTriangle, CheckCircle, FileJson } from 'lucide-react';
import { toast } from 'sonner';

export function BackupRestore() {
  const [importing, setImporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('netadmin-last-backup')
  );

  // ============================================
  // EXPORTAR BACKUP (Descargar todos los datos)
  // ============================================
  const handleExportBackup = () => {
    try {
      // Obtener todos los datos de localStorage
      const equipos = localStorage.getItem('netadmin-equipos') || '[]';
      const tareas = localStorage.getItem('netadmin-tareas') || '[]';
      const usuarios = localStorage.getItem('netadmin-usuarios') || '[]';
      const config = localStorage.getItem('netadmin-config') || '{}';

      // Crear objeto de backup completo
      const backupData = {
        version: '9.0',
        fecha: new Date().toISOString(),
        datos: {
          equipos: JSON.parse(equipos),
          tareas: JSON.parse(tareas),
          usuarios: JSON.parse(usuarios),
          config: JSON.parse(config)
        },
        estadisticas: {
          total_equipos: JSON.parse(equipos).length,
          total_tareas: JSON.parse(tareas).length,
          total_usuarios: JSON.parse(usuarios).length
        }
      };

      // Convertir a JSON con formato legible
      const jsonString = JSON.stringify(backupData, null, 2);
      
      // Crear blob y descargar
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Nombre del archivo con fecha y hora
      const fechaArchivo = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.href = url;
      link.download = `netadmin-backup-${fechaArchivo}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Guardar fecha del último backup
      const ahora = new Date().toLocaleString('es-CO');
      localStorage.setItem('netadmin-last-backup', ahora);
      setLastBackup(ahora);

      toast.success('✅ Backup creado exitosamente', {
        description: `${backupData.estadisticas.total_equipos} equipos, ${backupData.estadisticas.total_tareas} tareas guardadas`
      });

    } catch (error) {
      console.error('Error al exportar backup:', error);
      toast.error('❌ Error al crear backup');
    }
  };

  // ============================================
  // IMPORTAR BACKUP (Restaurar datos)
  // ============================================
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        // Validar estructura del backup
        if (!backupData.version || !backupData.datos) {
          throw new Error('Archivo de backup inválido');
        }

        // Confirmar antes de restaurar
        const confirmar = window.confirm(
          `⚠️ ADVERTENCIA: Esto reemplazará TODOS los datos actuales.\n\n` +
          `Backup del: ${new Date(backupData.fecha).toLocaleString('es-CO')}\n` +
          `Equipos: ${backupData.estadisticas?.total_equipos || 0}\n` +
          `Tareas: ${backupData.estadisticas?.total_tareas || 0}\n` +
          `Usuarios: ${backupData.estadisticas?.total_usuarios || 0}\n\n` +
          `¿Deseas continuar?`
        );

        if (!confirmar) {
          setImporting(false);
          toast.info('Restauración cancelada');
          return;
        }

        // Restaurar datos
        if (backupData.datos.equipos) {
          localStorage.setItem('netadmin-equipos', JSON.stringify(backupData.datos.equipos));
        }
        if (backupData.datos.tareas) {
          localStorage.setItem('netadmin-tareas', JSON.stringify(backupData.datos.tareas));
        }
        if (backupData.datos.usuarios) {
          localStorage.setItem('netadmin-usuarios', JSON.stringify(backupData.datos.usuarios));
        }
        if (backupData.datos.config) {
          localStorage.setItem('netadmin-config', JSON.stringify(backupData.datos.config));
        }

        setImporting(false);

        toast.success('✅ Datos restaurados exitosamente', {
          description: 'Recarga la página para ver los cambios'
        });

        // Recargar la página después de 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } catch (error) {
        console.error('Error al importar backup:', error);
        toast.error('❌ Error al restaurar backup', {
          description: 'El archivo puede estar corrupto o tener un formato inválido'
        });
        setImporting(false);
      }
    };

    reader.onerror = () => {
      toast.error('❌ Error al leer el archivo');
      setImporting(false);
    };

    reader.readAsText(file);
  };

  // ============================================
  // EXPORTAR BACKUP DE EMERGENCIA (Simple)
  // ============================================
  const handleQuickBackup = () => {
    try {
      const allData: { [key: string]: any } = {};
      
      // Copiar TODO el localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('netadmin-')) {
          allData[key] = localStorage.getItem(key);
        }
      }

      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const fechaArchivo = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.href = url;
      link.download = `netadmin-emergency-backup-${fechaArchivo}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('✅ Backup de emergencia creado');

    } catch (error) {
      console.error('Error en backup de emergencia:', error);
      toast.error('❌ Error al crear backup de emergencia');
    }
  };

  // ============================================
  // LIMPIAR TODOS LOS DATOS
  // ============================================
  const handleClearAll = () => {
    const confirmar = window.confirm(
      '⚠️⚠️⚠️ PELIGRO ⚠️⚠️⚠️\n\n' +
      'Esto ELIMINARÁ TODOS los datos de NetAdmin:\n' +
      '- Todos los equipos\n' +
      '- Todas las tareas\n' +
      '- Todos los usuarios\n' +
      '- Toda la configuración\n\n' +
      '¿Estás COMPLETAMENTE seguro?\n\n' +
      'Escribe "ELIMINAR TODO" para confirmar'
    );

    if (!confirmar) return;

    const confirmacionTexto = window.prompt('Escribe "ELIMINAR TODO" para confirmar:');
    
    if (confirmacionTexto === 'ELIMINAR TODO') {
      // Eliminar todos los datos de NetAdmin
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('netadmin-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast.success('✅ Todos los datos han sido eliminados');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      toast.error('Confirmación incorrecta. Datos no eliminados.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">🔒 Backup y Restauración</h2>
        <p className="text-gray-600">
          Exporta y restaura todos los datos de NetAdmin de forma segura
        </p>
      </div>

      {/* Alerta de información */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Los backups incluyen: equipos, tareas, usuarios y configuraciones. 
          Se recomienda crear un backup antes de cualquier cambio importante.
        </AlertDescription>
      </Alert>

      {/* Último backup */}
      {lastBackup && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-900">Último backup creado:</p>
              <p className="text-green-700">{lastBackup}</p>
            </div>
          </div>
        </Card>
      )}

      {/* ========== EXPORTAR BACKUP ========== */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Download className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-gray-900 mb-1">Exportar Backup Completo</h3>
              <p className="text-gray-600 text-sm mb-4">
                Descarga un archivo JSON con todos tus datos. Guárdalo en un lugar seguro.
              </p>
              <Button onClick={handleExportBackup} className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Descargar Backup
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ========== IMPORTAR BACKUP ========== */}
      <Card className="p-6 border-orange-200 bg-orange-50">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Upload className="w-6 h-6 text-orange-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-gray-900 mb-1">Restaurar desde Backup</h3>
              <p className="text-gray-600 text-sm mb-4">
                ⚠️ Esto reemplazará TODOS los datos actuales con los del backup.
              </p>
              <div className="space-y-3">
                <div>
                  <Label 
                    htmlFor="backup-file" 
                    className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {importing ? 'Restaurando...' : 'Seleccionar Archivo de Backup'}
                  </Label>
                  <input
                    id="backup-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                    disabled={importing}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Formatos aceptados: .json
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ========== BACKUP DE EMERGENCIA ========== */}
      <Card className="p-6 border-purple-200 bg-purple-50">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <FileJson className="w-6 h-6 text-purple-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-gray-900 mb-1">🚨 Backup de Emergencia</h3>
              <p className="text-gray-600 text-sm mb-4">
                Copia de seguridad rápida de TODO el localStorage completo (incluye datos no procesados).
              </p>
              <Button 
                onClick={handleQuickBackup} 
                variant="outline"
                className="w-full sm:w-auto border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <FileJson className="w-4 h-4 mr-2" />
                Backup de Emergencia
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ========== ZONA PELIGROSA ========== */}
      <Card className="p-6 border-red-300 bg-red-50">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-red-900 mb-1">⚠️ Zona Peligrosa</h3>
              <p className="text-red-700 text-sm mb-4">
                Eliminar permanentemente TODOS los datos de NetAdmin. Esta acción NO se puede deshacer.
              </p>
              <Button 
                onClick={handleClearAll} 
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Eliminar Todos los Datos
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ========== INSTRUCCIONES ========== */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-gray-900 mb-3">📖 Instrucciones de Uso</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-medium">1️⃣ Crear Backup Regular:</p>
            <p className="text-gray-600 pl-6">
              Haz clic en "Descargar Backup" para exportar todos tus datos en formato JSON.
              Guarda este archivo en un lugar seguro (Drive, Dropbox, etc).
            </p>
          </div>
          
          <div>
            <p className="font-medium">2️⃣ Restaurar Datos:</p>
            <p className="text-gray-600 pl-6">
              Haz clic en "Seleccionar Archivo de Backup", elige tu archivo .json y confirma.
              La página se recargará automáticamente.
            </p>
          </div>

          <div>
            <p className="font-medium">3️⃣ Backup de Emergencia:</p>
            <p className="text-gray-600 pl-6">
              Si algo sale mal, usa "Backup de Emergencia" para hacer una copia rápida
              de TODO el localStorage sin procesar.
            </p>
          </div>

          <div>
            <p className="font-medium text-red-600">⚠️ Recomendaciones:</p>
            <ul className="text-gray-600 pl-6 list-disc list-inside space-y-1">
              <li>Crea un backup ANTES de actualizar versiones</li>
              <li>Crea backups semanales o después de cambios importantes</li>
              <li>Guarda múltiples versiones de backup</li>
              <li>Nombra tus backups con fechas claras</li>
              <li>Prueba restaurar en un ambiente de prueba primero</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
