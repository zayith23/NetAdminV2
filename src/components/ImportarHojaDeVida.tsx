// ============================================
// NETADMIN V9 - IMPORTADOR DE HOJAS DE VIDA
// Importa hojas de vida desde archivos Excel/CSV
// ============================================

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { VistaPreviewHojaVida } from './VistaPreviewHojaVida';

interface ImportarHojaDeVidaProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function ImportarHojaDeVida({ isOpen, onClose, onImportComplete }: ImportarHojaDeVidaProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls') && !selectedFile.name.endsWith('.csv')) {
      toast.error('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV');
      return;
    }

    setFile(selectedFile);
    setValidationErrors([]);
    setValidationWarnings([]);
    
    // Leer y previsualizar archivo
    try {
      console.log('🚀 ===== INICIANDO LECTURA DE ARCHIVO =====');
      console.log('📁 Archivo seleccionado:', selectedFile.name, selectedFile.type, selectedFile.size);
      
      const data = await readExcelFile(selectedFile);
      
      console.log('📦 Datos RAW recibidos del parser:', data);
      console.log('📦 Tipo de datos:', typeof data);
      console.log('📦 Claves del objeto:', Object.keys(data));
      
      // Si no hay hostname en el Excel, extraerlo del nombre del archivo
      if (!data.hostname || data.hostname.includes('EQUIPO_IMPORTADO')) {
        const fileName = selectedFile.name;
        const extractedHostname = fileName.replace(/\.(xlsx|xls|csv)$/i, '').trim()
          .replace(/[^a-zA-Z0-9_\-\s]/g, '')
          .replace(/[\s_]+/g, '-')
          .toUpperCase();
        data.hostname = extractedHostname;
        console.log('🏷️ Hostname extraído del nombre del archivo:', extractedHostname);
      }
      
      // Detectar ubicación automáticamente desde el nombre del archivo
      const location = detectLocationFromFileName(selectedFile.name);
      if (location) {
        data.razonSocial = location.razonSocial;
        data.site = location.site;
        console.log('📍 Ubicación detectada:', location);
        toast.success(`📍 Ubicación detectada: ${location.razonSocial} - ${location.site}`);
      }
      
      console.log('📊 Datos FINALES antes de setPreviewData:', data);
      
      // VALIDAR DATOS
      const { errors, warnings } = validateImportData(data);
      setValidationErrors(errors);
      setValidationWarnings(warnings);
      
      console.log('✅ Llamando setPreviewData con:', data);
      setPreviewData(data);
      console.log('✅ setPreviewData ejecutado');
      
      if (errors.length > 0) {
        toast.error(`⚠️ Se encontraron ${errors.length} errores de validación`);
      } else if (warnings.length > 0) {
        toast.warning(`⚠️ ${warnings.length} advertencias encontradas`);
      } else {
        toast.success('✅ Archivo válido. Revisa la vista previa.');
      }
    } catch (error) {
      console.error('❌ ERROR AL LEER ARCHIVO:', error);
      toast.error('Error al leer el archivo');
      console.error(error);
    }
  };

  // Función para detectar ubicación desde el nombre del archivo
  const detectLocationFromFileName = (fileName: string): { razonSocial: string; site: string } | null => {
    const upperName = fileName.toUpperCase();
    
    console.log('🔍 ===== DETECTANDO UBICACIÓN DESDE NOMBRE =====');
    console.log('Nombre del archivo:', fileName);
    console.log('Nombre en mayúsculas:', upperName);
    
    // Mapeo de palabras clave a ubicaciones
    const locationMap = [
      // GRUPO COS
      { keywords: ['BQ', 'SITEBQ', 'BARRANQUILLA'], razonSocial: 'grupo cos', site: 'Barranquilla' },
      { keywords: ['CLL93', 'CL93', 'CALLE93', 'SITEC93', 'C93'], razonSocial: 'grupo cos', site: 'Calle 93' },
      { keywords: ['CRA7', 'CARRERA7', 'SITECRA7', 'CR7'], razonSocial: 'grupo cos', site: 'Carrera 7' },
      { keywords: ['SITE7', 'S7'], razonSocial: 'grupo cos', site: 'Site 7' },
      
      // CONTACTO SOLUTIONS
      { keywords: ['ITG', 'ITAGUI', 'SITEITG'], razonSocial: 'contacto solutions', site: 'Itagui' },
      { keywords: ['SITE6', 'S6'], razonSocial: 'contacto solutions', site: 'Site 6' },
      { keywords: ['SITE5', 'S5'], razonSocial: 'contacto solutions', site: 'Site 5' },
      
      // OTD
      { keywords: ['CALLE80', 'CLL80', 'CL80', 'C80'], razonSocial: 'otd', site: 'Calle 80' },
    ];

    // Buscar coincidencia
    for (const location of locationMap) {
      for (const keyword of location.keywords) {
        if (upperName.includes(keyword)) {
          console.log(`✅ UBICACIÓN DETECTADA: ${location.site} (${location.razonSocial})`);
          console.log(`   Palabra clave encontrada: "${keyword}"`);
          return { razonSocial: location.razonSocial, site: location.site };
        }
      }
    }

    console.log('❌ No se detectó ubicación automáticamente');
    return null;
  };

  const readExcelFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Leer la primera hoja
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Parsear datos
          const parsedData = parseExcelData(jsonData);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const parseExcelData = (data: any[]): any => {
    console.log('📄 ========== INICIO PARSEO EXCEL (FORMATO GRUPO COS) ==========');
    console.log('📊 Total de filas encontradas:', data.length);
    console.log('📋 Primeras 15 filas del Excel:', data.slice(0, 15));

    // ========== FUNCIÓN PARA CONVERTIR NÚMEROS SERIALES DE EXCEL A DD/MM/YYYY ==========
    const convertirFechaExcel = (valor: any): string => {
      console.log(`🗓️ [convertirFechaExcel] Entrada: ${valor} (tipo: ${typeof valor})`);
      
      // Si el valor está vacío, retornar vacío
      if (!valor || valor === '' || valor === null || valor === undefined) {
        console.log(`   ⚠️ Valor vacío o nulo, retornando vacío`);
        return '';
      }
      
      // ========== CASO 1: ES UN NÚMERO (SERIAL DE EXCEL) ==========
      if (typeof valor === 'number') {
        console.log(`   📊 Detectado como número serial de Excel: ${valor}`);
        
        // Verificar que sea un número de fecha válido (entre 1 y 60000 aproximadamente)
        if (valor < 1 || valor > 100000) {
          console.log(`   ❌ Número fuera de rango válido para fechas Excel`);
          return String(valor);
        }
        
        // Excel cuenta los días desde el 1 de enero de 1900
        // Pero tiene un bug: considera 1900 como año bisiesto (no lo es)
        // Por eso restamos 2 días para compensar
        const diasDesdeEpoca = valor - 1; // Excel empieza en 1 (1 de enero de 1900)
        const milisegundosDesdeEpoca = diasDesdeEpoca * 24 * 60 * 60 * 1000;
        const excelEpoch = new Date(1899, 11, 30); // 30 de diciembre de 1899
        const fecha = new Date(excelEpoch.getTime() + milisegundosDesdeEpoca);
        
        // Validar que la fecha sea válida
        if (isNaN(fecha.getTime())) {
          console.log(`   ❌ Fecha inválida después de conversión`);
          return String(valor);
        }
        
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const año = fecha.getFullYear();
        
        const fechaFormateada = `${dia}/${mes}/${año}`;
        console.log(`   ✅ Convertido a: ${fechaFormateada}`);
        return fechaFormateada;
      }
      
      // ========== CASO 2: ES UN STRING ==========
      if (typeof valor === 'string') {
        const valorTrim = valor.trim();
        
        // Si el string es un número, convertirlo y procesar como número
        if (!isNaN(Number(valorTrim)) && valorTrim !== '') {
          console.log(`   🔄 String numérico detectado, convirtiendo a número: ${valorTrim}`);
          return convertirFechaExcel(Number(valorTrim));
        }
        
        // Si ya tiene formato de fecha (contiene "/" o "-"), intentar parsearlo
        if (valorTrim.includes('/') || valorTrim.includes('-')) {
          console.log(`   📅 Ya tiene formato de fecha: ${valorTrim}`);
          
          // Intentar parsear la fecha
          const fecha = new Date(valorTrim);
          if (!isNaN(fecha.getTime())) {
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const año = fecha.getFullYear();
            const fechaFormateada = `${dia}/${mes}/${año}`;
            console.log(`   ✅ Fecha parseada: ${fechaFormateada}`);
            return fechaFormateada;
          }
        }
        
        console.log(`   ⚠️ No se pudo convertir, retornando tal cual: ${valorTrim}`);
        return valorTrim;
      }
      
      // ========== CASO 3: OTROS TIPOS ==========
      console.log(`   ⚠️ Tipo no reconocido, convirtiendo a string`);
      return String(valor);
    };
    // ========== FIN FUNCIÓN CONVERSIÓN FECHAS ==========

    // Resultado final
    const result: any = {
      hostname: '',
      activoTipo: '',
      version: '01', // ⭐ Versión por defecto
      usuarioCreador: '', // Para mantener compatibilidad, pero no se mostrará
      razonSocial: 'grupo cos',
      site: '',
      gabinete: '',
      elemento: '',
      marca: '',
      modelo: '',
      serial: '',
      proveedor: '',
      fechaCompra: '',
      direccionIP: '',
      gateway: '',
      winsDns: '',
      funciones: '',
      procesador: '',
      memoriaNvram: '',
      backup: '',
      sistemaOperativo: '',
      versionFirmware: '',
      dependencia: '',
      impactoCaida: '',
      nivel: '',
      congenitas: '', // ⭐ Cambiado de 'contingencias' a 'congenitas'
      contactos: {
        usuarioAdmin: '',
        correoAdmin: '',
        cargoAdmin: '',
        proveedorContacto: '',
        cargoContacto: '',
        telefono1: '',
        telefono2: '',
        emailProveedor: '',
        responsable: ''
      },
      garantia: {
        fechaEntrega: '',
        tiempoGarantia: '',
        fechaTerminacion: ''
      },
      mantenimientos: []
    };

    // Función auxiliar para buscar valor por campo (mejorada)
    const buscarValor = (filaInicio: number, campo: string): string => {
      // Buscar en un rango amplio
      for (let i = filaInicio; i < Math.min(filaInicio + 50, data.length); i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        // Buscar en todas las columnas
        for (let col = 0; col < row.length - 1; col++) {
          const celda = String(row[col] || '').trim().toLowerCase()
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
            .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
          
          const campoBuscar = campo.toLowerCase()
            .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
            .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
          
          // Búsqueda exacta o contenida
          if (celda === campoBuscar || celda.includes(campoBuscar)) {
            const valor = row[col + 1];
            if (valor !== undefined && valor !== null && valor !== '') {
              const valorStr = String(valor).trim();
              // Ignorar valores genéricos
              if (valorStr && valorStr !== '-' && valorStr !== 'N/A' && valorStr !== 'n/a') {
                console.log(`   ✅ Campo "${campo}" encontrado: "${valorStr}"`);
                return valorStr;
              }
            }
          }
        }
      }
      return '';
    };

    // Función para buscar múltiples variaciones de un campo
    const buscarVariaciones = (filaInicio: number, variaciones: string[]): string => {
      for (const variacion of variaciones) {
        const valor = buscarValor(filaInicio, variacion);
        if (valor) return valor;
      }
      return '';
    };

    // PARSEAR SECCIÓN POR SECCIÓN
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      // Convertir toda la fila a string para buscar
      const filaCompleta = row.map((cell: any) => String(cell || '').trim()).join(' ').toUpperCase();

      console.log(`🔍 Fila ${i}:`, row);

      // ===== DETECTAR SECCIÓN "HOJA DE VIDA ELEMENTOS" =====
      if (filaCompleta.includes('HOJA DE VIDA') && filaCompleta.includes('ELEMENTOS')) {
        console.log('📦 ===== SECCIÓN: HOJA DE VIDA ELEMENTOS =====');
        
        result.elemento = buscarValor(i, 'Elemento');
        result.marca = buscarValor(i, 'MARCA');
        result.modelo = buscarValor(i, 'MODELO');
        result.serial = buscarValor(i, 'SERIAL');
        result.hostname = buscarValor(i, 'NOMBRE');
        result.proveedor = buscarValor(i, 'PROVEEDOR');
        result.fechaCompra = convertirFechaExcel(buscarValor(i, 'FECHA DE COMPRA'));
        result.site = buscarValor(i, 'UBICACIÓN FÍSICA') || buscarValor(i, 'UBICACION FISICA');
        
        // ⭐ Auto-detectar tipo de activo desde "elemento"
        if (result.elemento) {
          const elementoLower = result.elemento.toLowerCase();
          if (elementoLower.includes('switch')) {
            result.activoTipo = 'Switch';
          } else if (elementoLower.includes('firewall')) {
            result.activoTipo = 'Firewall';
          } else if (elementoLower.includes('router')) {
            result.activoTipo = 'Router';
          } else if (elementoLower.includes('access') || elementoLower.includes('point')) {
            result.activoTipo = 'Access Point';
          } else {
            result.activoTipo = result.elemento; // Usar el elemento tal cual
          }
          console.log(`   ⭐ Tipo de activo detectado: "${result.activoTipo}" (desde elemento: "${result.elemento}")`);
        }
        
        console.log('✅ Datos básicos extraídos:', {
          elemento: result.elemento,
          activoTipo: result.activoTipo,
          marca: result.marca,
          modelo: result.modelo,
          serial: result.serial,
          hostname: result.hostname
        });
      }

      // ===== DETECTAR SECCIÓN "ACCESOS" =====
      if (filaCompleta.includes('ACCESOS') && !filaCompleta.includes('ADMINISTRADORES')) {
        console.log('🌐 ===== SECCIÓN: ACCESOS =====');
        
        // Buscar en las siguientes filas
        for (let j = i + 1; j < Math.min(i + 10, data.length); j++) {
          const subRow = data[j];
          if (!subRow) continue;
          
          const filaTexto = subRow.map((c: any) => String(c || '').trim()).join(' ').toUpperCase();
          
          // Si encontramos la fila de encabezados (DIRECCION, GATEWAY, WINS/DNS)
          if (filaTexto.includes('DIRECCION') || filaTexto.includes('GATEWAY') || filaTexto.includes('CONFIGURACION IP')) {
            // La siguiente fila contiene los valores
            const valoresRow = data[j + 1];
            if (valoresRow) {
              // Buscar índices de columnas
              let dirIdx = -1, gwIdx = -1, dnsIdx = -1;
              
              for (let col = 0; col < subRow.length; col++) {
                const header = String(subRow[col] || '').trim().toUpperCase();
                if (header.includes('DIRECCION') || header === 'CONFIGURACION IP') dirIdx = col;
                if (header.includes('GATEWAY')) gwIdx = col;
                if (header.includes('WINS') || header.includes('DNS')) dnsIdx = col;
              }
              
              if (dirIdx >= 0) result.direccionIP = String(valoresRow[dirIdx] || '').trim();
              if (gwIdx >= 0) result.gateway = String(valoresRow[gwIdx] || '').trim();
              if (dnsIdx >= 0) result.winsDns = String(valoresRow[dnsIdx] || '').trim();
              
              console.log('✅ Accesos extraídos:', {
                ip: result.direccionIP,
                gateway: result.gateway,
                dns: result.winsDns
              });
              break;
            }
          }
        }
      }

      // ===== DETECTAR SECCIÓN "CARACTERÍSTICAS" =====
      if (filaCompleta.includes('CARACTERISTICAS')) {
        console.log('⚙️ ===== SECCIÓN: CARACTERÍSTICAS =====');
        
        result.funciones = buscarValor(i, 'FUNCIONES');
        result.procesador = buscarValor(i, 'PROCESADOR');
        result.memoriaNvram = buscarValor(i, 'MEMORIA NVRAM');
        result.backup = buscarValor(i, 'BACKUP');
        result.sistemaOperativo = buscarValor(i, 'SISTEMA OPERATIVO');
        result.versionFirmware = buscarValor(i, 'VERSION FIRMWARE') || buscarValor(i, 'VERSION');
        
        console.log('✅ Características extraídas:', {
          funciones: result.funciones?.substring(0, 50) + '...',
          procesador: result.procesador,
          memoria: result.memoriaNvram,
          so: result.sistemaOperativo
        });
      }

      // ===== DETECTAR SECCIÓN "DEPENDENCIA" =====
      if (filaCompleta.includes('DEPENDENCIA') && !filaCompleta.includes('IMPACTO')) {
        console.log('🔗 ===== SECCIÓN: DEPENDENCIA =====');
        result.dependencia = buscarValor(i, 'DEPENDENCIA');
        console.log('✅ Dependencia:', result.dependencia?.substring(0, 50) + '...');
      }

      // ===== DETECTAR SECCIÓN "IMPACTO CAÍDA" =====
      if (filaCompleta.includes('IMPACTO') && filaCompleta.includes('CAIDA')) {
        console.log('⚠️ ===== SECCIÓN: IMPACTO CAÍDA =====');
        
        // Buscar en las siguientes filas
        for (let j = i + 1; j < Math.min(i + 10, data.length); j++) {
          const subRow = data[j];
          if (!subRow) continue;
          
          const campo = String(subRow[0] || '').trim().toUpperCase();
          if (campo.includes('IMPACTO')) {
            // Puede tener múltiples columnas de valores
            const valores = [];
            for (let col = 1; col < subRow.length; col++) {
              const val = String(subRow[col] || '').trim();
              if (val) valores.push(val);
            }
            result.impactoCaida = valores.join(' - ');
            console.log('✅ Impacto caída:', result.impactoCaida);
            break;
          }
        }
      }

      // ===== DETECTAR SECCIÓN "CONTINGENCIAS" =====
      if (filaCompleta.includes('CONTINGENCIAS')) {
        console.log('🛡️ ===== SECCIÓN: CONTINGENCIAS =====');
        
        for (let j = i + 1; j < Math.min(i + 10, data.length); j++) {
          const subRow = data[j];
          if (!subRow) continue;
          
          const campo = String(subRow[0] || '').trim().toUpperCase();
          if (campo.includes('CONTINGENCIAS')) {
            const valores = [];
            for (let col = 1; col < subRow.length; col++) {
              const val = String(subRow[col] || '').trim();
              if (val) valores.push(val);
            }
            result.contingencias = valores.join(', ');
            console.log('✅ Contingencias:', result.contingencias);
            break;
          }
        }
      }

      // ===== DETECTAR SECCIÓN "ADMINISTRADORES" =====
      if (filaCompleta.includes('ADMINISTRADORES') && !filaCompleta.includes('INFORMACION')) {
        console.log('👥 ===== SECCIÓN: ADMINISTRADORES =====');
        
        // Buscar campos con múltiples variaciones
        result.contactos.usuarioAdmin = buscarVariaciones(i, [
          'USUARIOS ADMIN', 'USUARIO ADMIN', 'USUARIOS', 'ADMIN', 'ADMINISTRADOR'
        ]);
        
        result.contactos.correoAdmin = buscarVariaciones(i, [
          'CORREO', 'EMAIL', 'CORREO ELECTRONICO', 'E-MAIL'
        ]);
        
        result.contactos.cargoAdmin = buscarVariaciones(i, [
          'CARGO ADMIN', 'CARGO ADMINISTRADOR', 'CARGO', 'PUESTO'
        ]);
        
        console.log('✅ Administradores extraídos:', {
          usuarios: result.contactos.usuarioAdmin,
          correos: result.contactos.correoAdmin,
          cargo: result.contactos.cargoAdmin
        });
      }

      // ===== DETECTAR SECCIÓN "INFORMACIÓN PROVEEDOR" O "GARANTIA" =====
      if (filaCompleta.includes('INFORMACION') && filaCompleta.includes('PROVEEDOR') || 
          filaCompleta.includes('GARANTIA') || 
          filaCompleta.includes('PROVEEDOR')) {
        console.log('🏢 ===== SECCIÓN: INFORMACIÓN PROVEEDOR Y GARANTÍA =====');
        
        result.contactos.proveedorContacto = buscarVariaciones(i, [
          'Proveedor', 'PROVEEDOR', 'Proveedor Contacto', 'Proveedor de Contacto'
        ]);
        
        result.contactos.cargoContacto = buscarVariaciones(i, [
          'Cargo Contacto', 'Cargo del Contacto', 'Cargo', 'Puesto Contacto'
        ]);
        
        result.contactos.telefono1 = buscarVariaciones(i, [
          'Teléfono Contacto 1', 'Telefono Contacto 1', 'Telefono 1', 'Tel 1', 'Teléfono 1'
        ]);
        
        result.contactos.telefono2 = buscarVariaciones(i, [
          'Teléfono Contacto 2', 'Telefono Contacto 2', 'Telefono 2', 'Tel 2', 'Teléfono 2'
        ]);
        
        result.contactos.emailProveedor = buscarVariaciones(i, [
          'Email Contacto', 'Email del Contacto', 'Correo Contacto', 'E-mail Contacto', 'Email'
        ]);
        
        result.contactos.responsable = buscarVariaciones(i, [
          'Responsable', 'Responsable del Equipo', 'Encargado'
        ]);
        
        // GARANTÍA
        result.garantia.fechaEntrega = convertirFechaExcel(buscarVariaciones(i, [
          'Fecha de Entrega', 'Fecha Entrega', 'Entrega'
        ]));
        
        result.garantia.tiempoGarantia = buscarVariaciones(i, [
          'Tiempo de Garantía', 'Tiempo de Garantia', 'Tiempo Garantia', 'Garantia', 'Garantía'
        ]);
        
        result.garantia.fechaTerminacion = convertirFechaExcel(buscarVariaciones(i, [
          'Fecha de Terminación', 'Fecha de Terminacion', 'Fecha Terminacion', 'Terminacion'
        ]));
        
        console.log('✅ Información completa extraída:', {
          proveedor: result.contactos.proveedorContacto,
          cargoContacto: result.contactos.cargoContacto,
          telefono1: result.contactos.telefono1,
          telefono2: result.contactos.telefono2,
          email: result.contactos.emailProveedor,
          responsable: result.contactos.responsable,
          garantia: {
            fechaEntrega: result.garantia.fechaEntrega,
            tiempo: result.garantia.tiempoGarantia,
            fechaFin: result.garantia.fechaTerminacion
          }
        });
      }

      // ===== DETECTAR SECCIÓN "MANTENIMIENTOS" =====
      if (filaCompleta.includes('MANTENIMIENTOS')) {
        console.log('🔧 ===== SECCIÓN: MANTENIMIENTOS =====');
        console.log(`   Sección encontrada en fila ${i}`);
        
        // Buscar la fila de encabezados (puede estar en las siguientes 5 filas)
        for (let j = i + 1; j < Math.min(i + 10, data.length); j++) {
          const headerRow = data[j];
          if (!headerRow || headerRow.length === 0) continue;
          
          const headerTexto = headerRow.map((c: any) => String(c || '').trim()).join(' ').toUpperCase();
          
          console.log(`   🔍 Fila ${j} (buscando encabezados):`, headerRow);
          console.log(`   Texto completo: "${headerTexto}"`);
          
          // Si encontramos encabezados de mantenimiento
          if ((headerTexto.includes('FECHA') && headerTexto.includes('TIPO')) || 
              headerTexto.includes('FECHA DE MANTENIMIENTO') ||
              headerTexto.includes('DESCRIPCION')) {
            console.log(`   ✅ Encabezados de mantenimientos encontrados en fila ${j}`);
            console.log(`   Encabezados:`, headerRow);
            
            // Identificar índices de columnas
            let fechaIdx = -1, tipoIdx = -1, descIdx = -1, respIdx = -1;
            
            for (let col = 0; col < headerRow.length; col++) {
              const header = String(headerRow[col] || '').trim().toUpperCase()
                .replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I')
                .replace(/Ó/g, 'O').replace(/Ú/g, 'U');
              
              console.log(`      Columna ${col}: "${header}"`);
              
              if (header.includes('FECHA')) {
                fechaIdx = col;
                console.log(`      ✅ Fecha en columna ${col}`);
              }
              if (header.includes('TIPO')) {
                tipoIdx = col;
                console.log(`      ✅ Tipo en columna ${col}`);
              }
              if (header.includes('DESCRIPCION')) {
                descIdx = col;
                console.log(`      ✅ Descripción en columna ${col}`);
              }
              if (header.includes('RESPONSABLE')) {
                respIdx = col;
                console.log(`      ✅ Responsable en columna ${col}`);
              }
            }
            
            console.log(`   📊 Índices finales:`, { fechaIdx, tipoIdx, descIdx, respIdx });
            
            // Si no se encontraron índices, usar posiciones por defecto (columnas 0, 1, 2, 3)
            if (fechaIdx === -1 && tipoIdx === -1 && descIdx === -1 && respIdx === -1) {
              console.log('   ⚠️ No se encontraron encabezados, usando posiciones por defecto');
              fechaIdx = 0;
              tipoIdx = 1;
              descIdx = 2;
              respIdx = 3;
            }
            
            // Leer filas de datos (empezar desde la siguiente fila)
            console.log(`   📖 Leyendo datos de mantenimiento desde fila ${j + 1}...`);
            
            for (let k = j + 1; k < data.length; k++) {
              const dataRow = data[k];
              
              console.log(`      🔍 Fila ${k}:`, dataRow);
              
              if (!dataRow || dataRow.length === 0) {
                console.log(`      ⏹️ Fila vacía, fin de tabla de mantenimientos`);
                break;
              }
              
              // Verificar que la primera celda tenga contenido
              const primeraCelda = String(dataRow[0] || '').trim();
              
              if (!primeraCelda) {
                console.log(`      ⏹️ Primera celda vacía, fin de tabla`);
                break;
              }
              
              // Verificar si la primera celda parece una fecha o tiene contenido válido
              const esFilaDatos = primeraCelda.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || 
                                  primeraCelda.match(/\d{4}-\d{2}-\d{2}/) ||
                                  primeraCelda.length > 0;
              
              if (!esFilaDatos) {
                console.log(`      ⏹️ No parece fila de datos válida`);
                break;
              }
              
              // Extraer valores
              const fecha = fechaIdx >= 0 ? String(dataRow[fechaIdx] || '').trim() : '';
              const tipo = tipoIdx >= 0 ? String(dataRow[tipoIdx] || '').trim() : '';
              const descripcion = descIdx >= 0 ? String(dataRow[descIdx] || '').trim() : '';
              const responsable = respIdx >= 0 ? String(dataRow[respIdx] || '').trim() : '';
              
              console.log(`      📝 Datos extraídos:`, { fecha, tipo, descripcion, responsable });
              
              // Si al menos hay fecha o tipo, es un mantenimiento válido
              if (fecha || tipo) {
                const mantenimiento = {
                  fecha: convertirFechaExcel(fecha), // ⭐ Convertir fecha de Excel a DD/MM/YYYY
                  tipo: tipo,
                  descripcion: descripcion,
                  responsable: responsable
                };
                
                result.mantenimientos.push(mantenimiento);
                console.log(`      ✅ Mantenimiento #${result.mantenimientos.length} agregado:`, mantenimiento);
              } else {
                console.log(`      ⏭️ Fila sin fecha ni tipo, ignorando`);
              }
            }
            
            console.log(`   🎉 Total de mantenimientos encontrados: ${result.mantenimientos.length}`);
            break;
          }
        }
      }
    }

    console.log('\n🎉 ========== PARSEO COMPLETADO ==========');
    console.log('📦 RESULTADO FINAL:');
    console.log('   Hostname:', result.hostname);
    console.log('   Tipo Activo:', result.activoTipo);
    console.log('   Razón Social:', result.razonSocial);
    console.log('   Site:', result.site);
    console.log('   📧 ADMINISTRADORES:', {
      usuarios: result.contactos.usuarioAdmin,
      correos: result.contactos.correoAdmin,
      cargo: result.contactos.cargoAdmin
    });
    console.log('   🏢 PROVEEDOR:', {
      contacto: result.contactos.proveedorContacto,
      cargo: result.contactos.cargoContacto,
      email: result.contactos.emailProveedor,
      telefono1: result.contactos.telefono1,
      telefono2: result.contactos.telefono2,
      responsable: result.contactos.responsable
    });
    console.log('   🛡️ GARANTÍA:', {
      fechaEntrega: result.garantia.fechaEntrega,
      tiempo: result.garantia.tiempoGarantia,
      fechaFin: result.garantia.fechaTerminacion
    });
    console.log('   🔧 Mantenimientos:', result.mantenimientos.length, 'registros');
    console.log('========================================\n');
    
    return result;
  };

  // VALIDACIÓN DE DATOS IMPORTADOS
  const validateImportData = (data: any): { errors: string[], warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('🔍 ========== VALIDANDO DATOS IMPORTADOS ==========');

    // CAMPOS OBLIGATORIOS
    if (!data.hostname || data.hostname.trim() === '') {
      errors.push('❌ El campo "Hostname" es obligatorio');
    }

    if (!data.marca || data.marca.trim() === '') {
      warnings.push('⚠️ Se recomienda especificar la "Marca" del equipo');
    }

    if (!data.modelo || data.modelo.trim() === '') {
      warnings.push('⚠️ Se recomienda especificar el "Modelo" del equipo');
    }

    if (!data.site || data.site.trim() === '') {
      warnings.push('⚠️ No se detectó el "Site" (ubicación física)');
    }

    if (!data.direccionIP || data.direccionIP.trim() === '') {
      warnings.push('⚠️ No se especificó la "Dirección IP"');
    }

    // Validar formato de IP si existe
    if (data.direccionIP) {
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipPattern.test(data.direccionIP.trim())) {
        errors.push(`❌ La dirección IP "${data.direccionIP}" no tiene un formato válido`);
      }
    }

    // Validar que el activo sea switch o firewall
    if (data.activoTipo) {
      const activoLower = data.activoTipo.toLowerCase().trim();
      if (activoLower !== 'switch' && activoLower !== 'firewall') {
        warnings.push(`⚠️ El tipo de activo "${data.activoTipo}" no es estándar (se esperaba "Switch" o "Firewall")`);
      }
    }

    console.log('Errores encontrados:', errors);
    console.log('Advertencias encontradas:', warnings);
    console.log('========== FIN VALIDACIÓN ==========\n');

    return { errors, warnings };
  };

  const handleImport = async () => {
    if (!previewData) {
      toast.error('No hay datos para importar');
      return;
    }

    setImporting(true);

    try {
      console.log('🚀 ===== ENVIANDO DATOS AL BACKEND =====');
      console.log('📦 Datos a enviar:', previewData);
      
      // Obtener info de Supabase
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const importPayload = {
        ...previewData,
        nombre_archivo: file?.name.replace(/\.(xlsx|xls|csv)$/i, '').trim() || previewData.hostname,
      };
      
      console.log('📤 Payload final:', importPayload);
      console.log('🔗 URL del backend:', `https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2/hojas-vida/importar`);
      
      // Enviar al backend
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6c4ea2d2/hojas-vida/importar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(importPayload),
      });
      
      console.log('📡 Respuesta del servidor - Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        throw new Error(errorData.error || 'Error al importar');
      }
      
      const result = await response.json();
      console.log('✅ Respuesta exitosa del servidor:', result);
      
      const siteInfo = previewData.site ? ` → Site: ${previewData.site}` : '';
      toast.success(`✅ Hoja de vida importada: ${result.hoja.hostname}${siteInfo}`);
      toast.success(`🆔 ID Hoja: ${result.id_hoja}`);
      
      // Disparar evento para que el módulo Inventario se refresque
      console.log('🔔 Disparando evento de actualización de hojas de vida...');
      window.dispatchEvent(new Event('hojas-vida-updated'));
      localStorage.setItem('hojas-vida-updated', Date.now().toString());
      
      // Resetear formulario
      setFile(null);
      setPreviewData(null);
      setImporting(false);
      
      // Notificar y cerrar
      onImportComplete();
      onClose();
    } catch (error: any) {
      console.error('❌ Error al importar:', error);
      toast.error(`Error: ${error.message}`);
      setImporting(false);
    }
  };

  return (
    <>
      {/* Dialog de importación - solo se muestra si NO hay previewData */}
      <Dialog open={isOpen && !previewData} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              Importar Hoja de Vida
            </DialogTitle>
            <DialogDescription className="text-base">
              Carga un archivo Excel con los datos completos de tu equipo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Área de carga de archivo mejorada */}
            <Card className="p-8 border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-lg text-blue-600 hover:text-blue-700 font-semibold">
                      Selecciona tu archivo Excel
                    </span>
                    <span className="text-gray-600 block mt-1"> o arrastra y suelta aquí</span>
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span>.xlsx</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span>.xls</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span>.csv</span>
                  </div>
                </div>
              </div>

              {file && (
                <div className="mt-6 flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setPreviewData(null);
                    }}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </Card>

            {/* Información del formato */}
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-2 text-lg">Formato del archivo Excel</p>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Primera columna: nombres de los campos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Segunda columna: valores correspondientes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Mantenimientos en tabla: Fecha | Tipo | Descripción | Responsable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Fechas en formato DD/MM/YYYY</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {previewData && (
        <VistaPreviewHojaVida
          data={previewData}
          onConfirm={handleImport}
          onCancel={() => {
            setPreviewData(null);
            setFile(null);
          }}
          isLoading={importing}
        />
      )}
    </>
  );
}