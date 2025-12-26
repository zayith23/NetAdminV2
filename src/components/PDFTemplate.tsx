// ============================================
// NETADMIN V11 - GENERADOR DE PDF FORMATO OFICIAL GROUPCOS
// Genera PDFs con el formato exacto de la plantilla oficial
// ============================================

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import groupCosLogo from 'figma:asset/26d33fcf7d243d0c7e3b5a560e6a523b11239644.png';
import logoContactoSolutions from 'figma:asset/5ed0fa05539b840b6fbf0a793bbf08014bf9d12d.png';

interface Equipment {
  hostname: string;
  activo: string;
  razon_social: string;
  site: string;
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
  cargo_contacto: string;
  telefono_contacto1: string;
  telefono_contacto2: string;
  email_proveedor: string;
  responsable_proveedor: string;
  fecha_entrega: string;
  tiempo_garantia: string;
  fecha_terminacion: string;
  mantenimientos?: Array<{
    fecha: string;
    tipo: string;
    descripcion: string;
    responsable: string;
  }>;
  version?: string;
  fecha_registro?: string;
}

export async function generatePDF(equipment: Equipment) {
  const doc = new jsPDF();
  let currentY = 5;

  // Detectar si es Contacto Solutions
  const isContactoSolutions = equipment.razon_social?.toLowerCase() === 'contacto solutions';
  const CONTACTO_SOLUTIONS_SITES = ['SITE 5', 'SITE 6', 'ITAGUI'];
  const isSiteContacto = CONTACTO_SOLUTIONS_SITES.includes(equipment.site?.toUpperCase());
  
  // Determinar colores según razón social
  const redColor: [number, number, number] = isContactoSolutions || isSiteContacto ? [37, 99, 235] : [186, 0, 0];
  const blackColor: [number, number, number] = [0, 0, 0];
  const whiteColor: [number, number, number] = [255, 255, 255];

  // ============================================
  // ENCABEZADO CON LOGO - FORMATO OFICIAL
  // ============================================
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  
  // PRIMERA FILA: Logo | Título | Versión
  // Rectángulo izquierdo para el logo (abarca las 2 filas verticalmente)
  doc.rect(5, currentY, 85, 25);
  
  // Cargar y añadir logo según la razón social
  const logoImg = new Image();
  logoImg.src = isContactoSolutions || isSiteContacto ? logoContactoSolutions : groupCosLogo;
  
  // Esperar a que la imagen cargue
  await new Promise<void>((resolve) => {
    logoImg.onload = () => {
      try {
        // Convertir imagen a base64 para evitar problemas de CORS
        const canvas = document.createElement('canvas');
        canvas.width = logoImg.width;
        canvas.height = logoImg.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(logoImg, 0, 0);
          const logoBase64 = canvas.toDataURL('image/png');
          // Logo centrado en el rectángulo izquierdo
          doc.addImage(logoBase64, 'PNG', 10, currentY + 5, 70, 15);
        }
        resolve();
      } catch (error) {
        console.error('Error al añadir logo al PDF:', error);
        resolve();
      }
    };
    logoImg.onerror = () => {
      console.error('Error al cargar imagen del logo');
      resolve();
    };
  });

  // Rectángulo central para título
  doc.rect(90, currentY, 85, 13);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('HOJA DE VIDA DE EQUIPOS (CONECTIVIDAD)', 132.5, currentY + 9, { align: 'center' });

  // Rectángulo derecho para versión
  doc.rect(175, currentY, 30, 13);
  doc.setFontSize(8);
  doc.text(`VERSIÓN: ${equipment.version || '01'}`, 190, currentY + 9, { align: 'center' });

  // SEGUNDA FILA: Gestión Tecnológica | Fecha
  // Rectángulo para Gestión Tecnológica
  doc.rect(90, currentY + 13, 55, 12);
  doc.setFontSize(9);
  doc.text('GESTIÓN TECNOLÓGICA', 117.5, currentY + 20, { align: 'center' });

  // Rectángulo para Fecha de emisión
  doc.rect(145, currentY + 13, 60, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const fechaEmision = new Date().toLocaleDateString('es-ES');
  doc.text(`Fecha de emisión: ${fechaEmision}`, 175, currentY + 20, { align: 'center' });

  currentY = 32;

  // ============================================
  // SECCIÓN: HOJA DE VIDA ELEMENTOS
  // ============================================
  doc.setFillColor(...redColor);
  doc.rect(5, currentY, 200, 7, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('HOJA DE VIDA ELEMENTOS', 105, currentY + 5, { align: 'center' });
  
  currentY += 7;
  doc.setTextColor(...blackColor);

  // Tabla de información básica
  const basicInfo = [
    ['Elemento', equipment.activo?.toUpperCase() || 'SWITCH'],
    ['MARCA', equipment.marca?.toUpperCase() || ''],
    ['MODELO', equipment.modelo || ''],
    ['SERIAL', equipment.serial || ''],
    ['NOMBRE', equipment.hostname || '']
  ];

  autoTable(doc, {
    startY: currentY,
    body: basicInfo,
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      halign: 'center',
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 50 },
      1: { fillColor: [255, 255, 255], cellWidth: 150 }
    },
    margin: { left: 5, right: 5 }
  });

  currentY = (doc as any).lastAutoTable?.finalY;

  // Fila combinada: PROVEEDOR, FECHA DE COMPRA, UBICACIÓN FÍSICA
  autoTable(doc, {
    startY: currentY,
    body: [[
      'PROVEEDOR', 
      equipment.proveedor || '',
      'FECHA DE COMPRA',
      equipment.fecha_compra || '',
      'UBICACIÓN FÍSICA', 
      equipment.site || ''
    ]],
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      halign: 'center',
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 30 },
      1: { fillColor: [255, 255, 255], cellWidth: 50 },
      2: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 30 },
      3: { fillColor: [255, 255, 255], cellWidth: 30 },
      4: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 30 },
      5: { fillColor: [255, 255, 255], cellWidth: 30 }
    },
    margin: { left: 5, right: 5 }
  });

  currentY = (doc as any).lastAutoTable?.finalY + 2;

  // ============================================
  // SECCIÓN: ACCESOS
  // ============================================
  doc.setFillColor(...redColor);
  doc.rect(5, currentY, 200, 7, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(10);
  doc.text('ACCESOS', 105, currentY + 5, { align: 'center' });
  
  currentY += 7;
  doc.setTextColor(...blackColor);

  // Tabla de accesos con encabezados y valores
  autoTable(doc, {
    startY: currentY,
    body: [
      ['CONFIGURACION IP', 'DIRECCION', 'GATEWAY', 'WINS/DNS'],
      [equipment.configuracion || '', equipment.ip_direccion || '', equipment.gateway || '', equipment.wins_dns || 'N/A']
    ],
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      halign: 'center',
      font: 'helvetica'
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { cellWidth: 50 }
    },
    bodyStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 255, 255] }
    },
    margin: { left: 5, right: 5 }
  });

  currentY = (doc as any).lastAutoTable?.finalY + 2;

  // ============================================
  // SECCIÓN: CARACTERÍSTICAS
  // ============================================
  doc.setFillColor(...redColor);
  doc.rect(5, currentY, 200, 7, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(10);
  doc.text('CARACTERISTICAS', 105, currentY + 5, { align: 'center' });
  
  currentY += 7;
  doc.setTextColor(...blackColor);

  const techInfo = [
    ['FUNCIONES', equipment.funciones || ''],
    ['PROCESADOR', equipment.procesador || ''],
    ['MEMORIA NVRAM', equipment.memoria_nvram || ''],
    ['BACKUP', equipment.backup || ''],
    ['SISTEMA OPERATIVO', equipment.sistema_operativo || ''],
    ['VERSION FIRMAWARE', equipment.version_firmware || '']
  ];

  autoTable(doc, {
    startY: currentY,
    body: techInfo,
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 50, halign: 'left' },
      1: { fillColor: [255, 255, 255], cellWidth: 150, halign: 'left' }
    },
    margin: { left: 5, right: 5 }
  });

  currentY = (doc as any).lastAutoTable?.finalY + 2;

  // ============================================
  // SECCIÓN: DEPENDENCIA
  // ============================================
  doc.setFillColor(...redColor);
  doc.rect(5, currentY, 200, 7, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(10);
  doc.text('DEPENDENCIA', 105, currentY + 5, { align: 'center' });
  
  currentY += 7;
  doc.setTextColor(...blackColor);

  autoTable(doc, {
    startY: currentY,
    body: [['DEPENDENCIA', equipment.dependencia || '']],
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 50, halign: 'left' },
      1: { fillColor: [255, 255, 255], cellWidth: 150, halign: 'left' }
    },
    margin: { left: 5, right: 5 }
  });

  currentY = (doc as any).lastAutoTable?.finalY + 2;

  // ============================================
  // SECCIÓN: IMPACTO CAÍDA
  // ============================================
  doc.setFillColor(...redColor);
  doc.rect(5, currentY, 200, 7, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(10);
  doc.text('IMPACTO CAIDA', 105, currentY + 5, { align: 'center' });
  
  currentY += 7;
  doc.setTextColor(...blackColor);

  autoTable(doc, {
    startY: currentY,
    body: [
      ['IMPACTO CAIDA', equipment.impacto_caida || equipment.nivel || ''],
      ['', 'Perdida de conexión al nivel de red']
    ],
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 50, halign: 'left' },
      1: { fillColor: [255, 255, 255], cellWidth: 150, halign: 'left' }
    },
    margin: { left: 5, right: 5 }
  });

  currentY = (doc as any).lastAutoTable?.finalY + 2;

  // ============================================
  // SECCIÓN: CONTINGENCIAS
  // ============================================
  doc.setFillColor(...redColor);
  doc.rect(5, currentY, 200, 7, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(10);
  doc.text('CONTINGENCIAS', 105, currentY + 5, { align: 'center' });
  
  currentY += 7;
  doc.setTextColor(...blackColor);

  autoTable(doc, {
    startY: currentY,
    body: [
      ['CONTINGENCIAS', equipment.congenitas || ''],
      ['', 'Equipo de respaldo']
    ],
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 50, halign: 'left' },
      1: { fillColor: [255, 255, 255], cellWidth: 150, halign: 'left' }
    },
    margin: { left: 5, right: 5 }
  });

  currentY = (doc as any).lastAutoTable?.finalY + 2;

  // Verificar si necesitamos nueva página
  if (currentY > 220) {
    doc.addPage();
    currentY = 10;
  }

  // ============================================
  // SECCIÓN: ADMINISTRADORES
  // ============================================
  doc.setFillColor(...redColor);
  doc.rect(5, currentY, 200, 7, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(10);
  doc.text('ADMINISTRADORES', 105, currentY + 5, { align: 'center' });
  
  currentY += 7;
  doc.setTextColor(...blackColor);

  const adminNames = (equipment.usuarios_admin || '').split('\n').filter(Boolean);
  const adminEmails = (equipment.correos_admin || '').split('\n').filter(Boolean);
  
  const adminRows: string[][] = [
    ['USUARIOS ADMIN', adminNames[0] || '', adminNames[1] || '', adminNames[2] || '', adminNames[3] || ''],
    ['CORREO', adminEmails[0] || '', adminEmails[1] || '', adminEmails[2] || '', adminEmails[3] || '']
  ];

  autoTable(doc, {
    startY: currentY,
    body: adminRows,
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      halign: 'center',
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 40 },
      1: { fillColor: [255, 255, 255], cellWidth: 40 },
      2: { fillColor: [255, 255, 255], cellWidth: 40 },
      3: { fillColor: [255, 255, 255], cellWidth: 40 },
      4: { fillColor: [255, 255, 255], cellWidth: 40 }
    },
    margin: { left: 5, right: 5 }
  });

  currentY = (doc as any).lastAutoTable?.finalY + 2;

  // ============================================
  // SECCIÓN: INFORMACIÓN PROVEEDOR
  // ============================================
  doc.setFillColor(...redColor);
  doc.rect(5, currentY, 200, 7, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(10);
  doc.text('INFORMACIÓN PROVEEDOR', 105, currentY + 5, { align: 'center' });
  
  currentY += 7;
  doc.setTextColor(...blackColor);

  const providerInfo = [
    ['Proveedor', equipment.proveedor || '', '', ''],
    ['Cargo Contacto', equipment.cargo_contacto || '', '', ''],
    ['Teléfono Contacto 1', equipment.telefono_contacto1 || '', 'Teléfono Contacto 2', equipment.telefono_contacto2 || ''],
    ['Email Contacto', equipment.email_proveedor || '', '', ''],
    ['Responsable', equipment.responsable_proveedor || '', '', ''],
    ['Fecha de Entrega', equipment.fecha_entrega || '', '', ''],
    ['Tiempo de Garantia', equipment.tiempo_garantia || '', '', ''],
    ['Fecha de Terminacion', equipment.fecha_terminacion || '', '', '']
  ];

  autoTable(doc, {
    startY: currentY,
    body: providerInfo,
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      halign: 'center',
      font: 'helvetica'
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 40 },
      1: { fillColor: [255, 255, 255], cellWidth: 60 },
      2: { fontStyle: 'bold', fillColor: [255, 255, 255], cellWidth: 40 },
      3: { fillColor: [255, 255, 255], cellWidth: 60 }
    },
    margin: { left: 5, right: 5 }
  });

  currentY = (doc as any).lastAutoTable?.finalY + 2;

  // Verificar si necesitamos nueva página para mantenimientos
  if (currentY > 200) {
    doc.addPage();
    currentY = 10;
  }

  // ============================================
  // SECCIÓN: MANTENIMIENTOS
  // ============================================
  doc.setFillColor(...redColor);
  doc.rect(5, currentY, 200, 7, 'F');
  doc.setTextColor(...whiteColor);
  doc.setFontSize(10);
  doc.text('MANTENIMIENTOS', 105, currentY + 5, { align: 'center' });
  
  currentY += 7;
  doc.setTextColor(...blackColor);

  // Encabezados de mantenimientos
  const mantHeaders = [['FECHA DE MANTENIMIENTO', 'TIPO', 'DESCRIPCIÓN', 'RESPONSABLE']];
  
  // Datos de mantenimientos
  const mantData = (equipment.mantenimientos || []).map(m => [
    m.fecha || '',
    m.tipo || '',
    m.descripcion || '',
    m.responsable || ''
  ]);

  // Si no hay mantenimientos, agregar una fila vacía
  if (mantData.length === 0) {
    mantData.push(['', '', '', '']);
  }

  autoTable(doc, {
    startY: currentY,
    head: mantHeaders,
    body: mantData,
    theme: 'grid',
    styles: { 
      fontSize: 7, 
      cellPadding: 2, 
      lineWidth: 0.5, 
      lineColor: [0, 0, 0],
      halign: 'center',
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40 },
      2: { cellWidth: 80 },
      3: { cellWidth: 40 }
    },
    margin: { left: 5, right: 5 }
  });

  // Guardar y descargar
  doc.save(`${equipment.hostname}_HojaVida.pdf`);
}
