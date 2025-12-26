// ============================================
// NETADMIN V9 - SERVIDOR BACKEND
// Gestión de hojas de vida y autenticación
// ============================================

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { initTestUsers } from './init-users.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Crear cliente de Supabase con permisos de administrador
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Inicializar usuarios de prueba al arrancar el servidor
initTestUsers().catch(console.error);

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// Registro de usuario
app.post('/make-server-6c4ea2d2/auth/signup', async (c) => {
  try {
    const { email, password, nombre, rol } = await c.req.json();

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { nombre, rol },
      // Confirmar email automáticamente (servidor de email no configurado)
      email_confirm: true
    });

    if (authError) {
      console.log('Error al crear usuario:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Guardar información adicional del usuario en KV
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      nombre,
      rol,
      created_at: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email,
        nombre,
        rol
      }
    });

  } catch (error: any) {
    console.log('Error en signup:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Verificar sesión
app.get('/make-server-6c4ea2d2/auth/session', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ user: null }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ user: null }, 401);
    }

    // Obtener información adicional del usuario desde KV
    const userData = await kv.get(`user:${user.id}`);

    return c.json({ 
      user: userData || {
        id: user.id,
        email: user.email,
        nombre: user.user_metadata?.nombre || 'Usuario',
        rol: user.user_metadata?.rol || 'lector'
      }
    });

  } catch (error: any) {
    console.log('Error en session:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// RUTAS DE HOJAS DE VIDA
// ============================================

// IMPORTAR HOJA DE VIDA DESDE DATOS PARSEADOS (Excel ya procesado en frontend)
app.post('/make-server-6c4ea2d2/hojas-vida/importar', async (c) => {
  try {
    console.log('📦 ========== ENDPOINT: IMPORTAR HOJA DE VIDA ==========');
    
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    console.log('🔐 Token recibido:', accessToken?.substring(0, 20) + '...');
    
    // Permitir en modo demo (sin autenticación estricta)
    let userId = 'demo-user';
    let userRole = 'admin';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        console.log('❌ Error de autenticación:', authError);
        return c.json({ error: 'No autorizado' }, 401);
      }

      const userData = await kv.get(`user:${user.id}`);
      if (userData?.rol !== 'admin') {
        console.log('❌ Usuario no es admin');
        return c.json({ error: 'Solo administradores pueden importar hojas de vida' }, 403);
      }
      
      userId = user.id;
      userRole = userData.rol;
    }

    const importData = await c.req.json();
    console.log('📋 Datos de importación recibidos:', importData);

    // Generar IDs únicos
    const id = crypto.randomUUID();
    const idHoja = `HV-${Date.now()}`;
    
    console.log('🆔 ID generado:', id);
    console.log('🆔 ID Hoja generado:', idHoja);

    // Crear registro completo con todos los campos
    const nuevaHoja = {
      // IDs
      id,
      id_hoja: idHoja,
      
      // Ubicación
      hostname: importData.hostname || '',
      activoTipo: importData.activoTipo || '',
      razonSocial: importData.razonSocial || 'grupo cos',
      site: importData.site || '',
      gabinete: importData.gabinete || '',
      
      // Datos Básicos
      elemento: importData.elemento || '',
      marca: importData.marca || '',
      modelo: importData.modelo || '',
      serial: importData.serial || '',
      proveedor: importData.proveedor || '',
      fechaCompra: importData.fechaCompra || '',
      
      // Técnico
      direccionIP: importData.direccionIP || '',
      gateway: importData.gateway || '',
      winsDns: importData.winsDns || '',
      funciones: importData.funciones || '',
      procesador: importData.procesador || '',
      memoriaNvram: importData.memoriaNvram || '',
      backup: importData.backup || '',
      sistemaOperativo: importData.sistemaOperativo || '',
      versionFirmware: importData.versionFirmware || '',
      dependencia: importData.dependencia || '',
      impactoCaida: importData.impactoCaida || '',
      nivel: importData.nivel || '',
      contingencias: importData.contingencias || '',
      
      // Contactos (objeto anidado)
      contactos: {
        usuarioAdmin: importData.contactos?.usuarioAdmin || '',
        correoAdmin: importData.contactos?.correoAdmin || '',
        cargoAdmin: importData.contactos?.cargoAdmin || '',
        proveedorContacto: importData.contactos?.proveedorContacto || '',
        cargoContacto: importData.contactos?.cargoContacto || '',
        telefono1: importData.contactos?.telefono1 || '',
        telefono2: importData.contactos?.telefono2 || '',
        emailProveedor: importData.contactos?.emailProveedor || '',
        responsable: importData.contactos?.responsable || ''
      },
      
      // Garantía (objeto anidado)
      garantia: {
        fechaEntrega: importData.garantia?.fechaEntrega || '',
        tiempoGarantia: importData.garantia?.tiempoGarantia || '',
        fechaTerminacion: importData.garantia?.fechaTerminacion || ''
      },
      
      // Mantenimientos (array)
      mantenimientos: importData.mantenimientos || [],
      
      // Metadata
      nombre_archivo: importData.nombre_archivo || importData.hostname || 'Importado',
      fecha_registro: new Date().toLocaleDateString('es-ES'),
      ultima_actualizacion: new Date().toISOString(),
      usuario_creador: userId,
      origen: 'excel_import',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId
    };

    console.log('💾 Guardando hoja de vida en KV...');
    console.log('📊 Datos completos a guardar:', JSON.stringify(nuevaHoja, null, 2));
    
    // Guardar en KV Store
    await kv.set(`hoja:${id}`, nuevaHoja);
    
    // Crear índice por hostname para búsqueda rápida
    if (nuevaHoja.hostname) {
      await kv.set(`hoja:hostname:${nuevaHoja.hostname}`, id);
    }
    
    // Crear índice por site para filtrado
    if (nuevaHoja.site) {
      const sitesKey = `hoja:site:${nuevaHoja.site}`;
      const existingSite = await kv.get(sitesKey) || [];
      if (Array.isArray(existingSite)) {
        existingSite.push(id);
        await kv.set(sitesKey, existingSite);
      } else {
        await kv.set(sitesKey, [id]);
      }
    }

    console.log('✅ Hoja de vida guardada exitosamente');
    
    // Verificar guardado
    const verificacion = await kv.get(`hoja:${id}`);
    console.log('🔍 Verificación - Dato recuperado:', verificacion ? '✅ OK' : '❌ ERROR');

    return c.json({ 
      success: true, 
      hoja: nuevaHoja,
      message: `Hoja de vida importada: ${nuevaHoja.hostname}`,
      id_hoja: idHoja
    });

  } catch (error: any) {
    console.error('❌ Error al importar hoja de vida:', error);
    console.error('❌ Stack trace:', error.stack);
    return c.json({ error: error.message || 'Error al importar hoja de vida' }, 500);
  }
});

// Crear hoja de vida
app.post('/make-server-6c4ea2d2/hojas-vida', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.rol !== 'admin') {
      return c.json({ error: 'Solo administradores pueden crear hojas de vida' }, 403);
    }

    const hojaData = await c.req.json();
    const id = crypto.randomUUID();
    
    const nuevaHoja = {
      ...hojaData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id
    };

    await kv.set(`hoja:${id}`, nuevaHoja);
    await kv.set(`hoja:hostname:${hojaData.hostname}`, id);

    return c.json({ success: true, hoja: nuevaHoja });

  } catch (error: any) {
    console.log('Error al crear hoja de vida:', error);
    return c.json({ error: error.message }, 500);
  }
});

// LISTAR TODAS LAS HOJAS DE VIDA (sin autenticación estricta)
app.get('/make-server-6c4ea2d2/hojas-vida/listar', async (c) => {
  try {
    console.log('📋 ========== ENDPOINT: LISTAR HOJAS DE VIDA ==========');
    
    // Obtener todas las hojas de vida del KV Store
    const hojas = await kv.getByPrefix('hoja:');
    console.log(`🔍 Total de registros encontrados con prefix 'hoja:': ${hojas.length}`);
    console.log('🔍 Primeros 5 registros:', hojas.slice(0, 5).map(h => ({ key: h.key, hasValue: !!h.value, hasId: !!h.value?.id })));
    
    // Filtrar solo las que tienen ID (no hostname mappings ni site mappings)
    const hojasList = hojas
      .filter(item => {
        const hasValue = !!item.value;
        const hasId = !!item.value?.id;
        const isDirectHoja = item.key.startsWith('hoja:') && 
                            !item.key.includes(':hostname:') && 
                            !item.key.includes(':site:');
        
        console.log(`   Key: "${item.key}" → hasValue: ${hasValue}, hasId: ${hasId}, isDirectHoja: ${isDirectHoja}`);
        
        return hasValue && hasId && isDirectHoja;
      })
      .map(item => item.value);
    
    console.log(`✅ Hojas de vida válidas encontradas: ${hojasList.length}`);
    
    if (hojasList.length > 0) {
      console.log('📝 Primera hoja de vida:', {
        id: hojasList[0].id,
        hostname: hojasList[0].hostname,
        site: hojasList[0].site,
        marca: hojasList[0].marca
      });
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    hojasList.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    console.log(`🎯 Retornando ${hojasList.length} hojas de vida`);

    return c.json({ 
      success: true,
      hojas: hojasList,
      total: hojasList.length
    });

  } catch (error: any) {
    console.error('❌ Error al listar hojas de vida:', error);
    console.error('❌ Stack trace:', error.stack);
    return c.json({ error: error.message || 'Error al listar hojas de vida' }, 500);
  }
});

// Obtener todas las hojas de vida
app.get('/make-server-6c4ea2d2/hojas-vida', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const hojas = await kv.getByPrefix('hoja:');
    // Filtrar solo las que tienen ID (no hostname mappings)
    const hojasList = hojas
      .filter(item => item.value && item.value.id)
      .map(item => item.value);

    return c.json({ hojas: hojasList });

  } catch (error: any) {
    console.log('Error al obtener hojas de vida:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Obtener hoja de vida por ID
app.get('/make-server-6c4ea2d2/hojas-vida/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const id = c.req.param('id');
    const hoja = await kv.get(`hoja:${id}`);

    if (!hoja) {
      return c.json({ error: 'Hoja de vida no encontrada' }, 404);
    }

    return c.json({ hoja });

  } catch (error: any) {
    console.log('Error al obtener hoja de vida:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Actualizar hoja de vida
app.put('/make-server-6c4ea2d2/hojas-vida/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.rol !== 'admin') {
      return c.json({ error: 'Solo administradores pueden actualizar hojas de vida' }, 403);
    }

    const id = c.req.param('id');
    const hojaData = await c.req.json();
    
    const hojaExistente = await kv.get(`hoja:${id}`);
    if (!hojaExistente) {
      return c.json({ error: 'Hoja de vida no encontrada' }, 404);
    }

    const hojaActualizada = {
      ...hojaExistente,
      ...hojaData,
      id,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    await kv.set(`hoja:${id}`, hojaActualizada);
    
    // Actualizar el mapping de hostname si cambió
    if (hojaData.hostname && hojaData.hostname !== hojaExistente.hostname) {
      await kv.del(`hoja:hostname:${hojaExistente.hostname}`);
      await kv.set(`hoja:hostname:${hojaData.hostname}`, id);
    }

    return c.json({ success: true, hoja: hojaActualizada });

  } catch (error: any) {
    console.log('Error al actualizar hoja de vida:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Eliminar hoja de vida
app.delete('/make-server-6c4ea2d2/hojas-vida/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const userData = await kv.get(`user:${user.id}`);
    if (userData?.rol !== 'admin') {
      return c.json({ error: 'Solo administradores pueden eliminar hojas de vida' }, 403);
    }

    const id = c.req.param('id');
    const hoja = await kv.get(`hoja:${id}`);
    
    if (!hoja) {
      return c.json({ error: 'Hoja de vida no encontrada' }, 404);
    }

    await kv.del(`hoja:${id}`);
    await kv.del(`hoja:hostname:${hoja.hostname}`);

    return c.json({ success: true });

  } catch (error: any) {
    console.log('Error al eliminar hoja de vida:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// ESTADÍSTICAS Y MONITOREO
// ============================================

app.get('/make-server-6c4ea2d2/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const hojas = await kv.getByPrefix('hoja:');
    const hojasList = hojas.filter(item => item.value.id);

    const stats = {
      total: hojasList.length,
      switches: hojasList.filter(h => h.value.activo === 'switch').length,
      firewalls: hojasList.filter(h => h.value.activo === 'firewall').length,
      porRazonSocial: {
        'grupo cos': hojasList.filter(h => h.value.razon_social === 'grupo cos').length,
        'otd': hojasList.filter(h => h.value.razon_social === 'otd').length,
        'contactos solutions': hojasList.filter(h => h.value.razon_social === 'contactos solutions').length,
      },
      ultimaActualizacion: new Date().toISOString()
    };

    return c.json({ stats });

  } catch (error: any) {
    console.log('Error al obtener estadísticas:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// RUTAS DE SWITCHES/GABINETES
// ============================================

// Crear gabinete con switches
app.post('/make-server-6c4ea2d2/gabinetes', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    console.log('[GABINETES POST] Recibiendo solicitud para crear gabinete...');
    console.log('[GABINETES POST] Access Token:', accessToken?.substring(0, 20) + '...');
    
    // Permitir acceso en modo demo (sin autenticación real)
    let userRole = 'admin'; // Por defecto asumimos admin para modo demo
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      // Si hay un token real, verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        console.log('[GABINETES POST] Error de autenticación:', authError);
        return c.json({ error: 'No autorizado' }, 401);
      }

      const userData = await kv.get(`user:${user.id}`);
      if (userData?.rol !== 'admin') {
        console.log('[GABINETES POST] Usuario no es admin');
        return c.json({ error: 'Solo administradores pueden crear gabinetes' }, 403);
      }
    }

    const gabineteData = await c.req.json();
    console.log('[GABINETES POST] Datos recibidos:', gabineteData);
    
    const id = crypto.randomUUID();
    
    const nuevoGabinete = {
      ...gabineteData,
      id,
      fechaRegistro: new Date().toISOString(),
      created_by: 'demo-user'
    };

    console.log('[GABINETES POST] Guardando en KV con key:', `gabinete:${id}`);
    console.log('[GABINETES POST] Datos a guardar:', nuevoGabinete);
    
    await kv.set(`gabinete:${id}`, nuevoGabinete);
    
    console.log('[GABINETES POST] Gabinete guardado exitosamente');
    
    // Verificar que se guardó correctamente
    const verificacion = await kv.get(`gabinete:${id}`);
    console.log('[GABINETES POST] Verificación - Dato recuperado:', verificacion);

    return c.json({ success: true, gabinete: nuevoGabinete });

  } catch (error: any) {
    console.error('[GABINETES POST] Error al crear gabinete:', error);
    console.error('[GABINETES POST] Stack trace:', error.stack);
    return c.json({ error: error.message }, 500);
  }
});

// Obtener todos los gabinetes
app.get('/make-server-6c4ea2d2/gabinetes', async (c) => {
  try {
    // Permitir acceso en modo demo - NO requerir autenticación para lectura
    console.log('[GABINETES] Obteniendo todos los gabinetes...');
    
    const gabinetes = await kv.getByPrefix('gabinete:');
    console.log('[GABINETES] Datos obtenidos del KV:', gabinetes);
    console.log('[GABINETES] Tipo de datos:', typeof gabinetes);
    console.log('[GABINETES] Es array?:', Array.isArray(gabinetes));
    console.log('[GABINETES] Longitud:', gabinetes?.length);
    
    if (!gabinetes || !Array.isArray(gabinetes)) {
      console.log('[GABINETES] No hay datos o el formato es incorrecto, retornando array vacío');
      return c.json({ gabinetes: [] });
    }
    
    // Ahora getByPrefix retorna objetos con { key, value }, acceder a .value
    const gabinetesList = gabinetes
      .filter(item => item.value && item.value.id)
      .map(item => item.value);
    
    console.log('[GABINETES] Gabinetes filtrados:', gabinetesList.length);
    console.log('[GABINETES] Primer gabinete:', gabinetesList[0]);

    return c.json({ gabinetes: gabinetesList });

  } catch (error: any) {
    console.error('[GABINETES] Error al obtener gabinetes:', error);
    console.error('[GABINETES] Stack trace:', error.stack);
    return c.json({ error: error.message || 'Error al obtener gabinetes' }, 500);
  }
});

// Actualizar gabinete
app.put('/make-server-6c4ea2d2/gabinetes/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Permitir acceso en modo demo
    let userRole = 'admin';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'No autorizado' }, 401);
      }

      const userData = await kv.get(`user:${user.id}`);
      if (userData?.rol !== 'admin') {
        return c.json({ error: 'Solo administradores pueden actualizar gabinetes' }, 403);
      }
    }

    const id = c.req.param('id');
    const gabineteData = await c.req.json();
    
    const gabineteExistente = await kv.get(`gabinete:${id}`);
    if (!gabineteExistente) {
      return c.json({ error: 'Gabinete no encontrado' }, 404);
    }

    const gabineteActualizado = {
      ...gabineteExistente,
      ...gabineteData,
      id,
      updated_at: new Date().toISOString(),
      updated_by: 'demo-user'
    };

    await kv.set(`gabinete:${id}`, gabineteActualizado);

    return c.json({ success: true, gabinete: gabineteActualizado });

  } catch (error: any) {
    console.log('Error al actualizar gabinete:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Eliminar gabinete
app.delete('/make-server-6c4ea2d2/gabinetes/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Permitir acceso en modo demo
    let userRole = 'admin';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'No autorizado' }, 401);
      }

      const userData = await kv.get(`user:${user.id}`);
      if (userData?.rol !== 'admin') {
        return c.json({ error: 'Solo administradores pueden eliminar gabinetes' }, 403);
      }
    }

    const id = c.req.param('id');
    const gabinete = await kv.get(`gabinete:${id}`);
    
    if (!gabinete) {
      return c.json({ error: 'Gabinete no encontrado' }, 404);
    }

    await kv.del(`gabinete:${id}`);

    return c.json({ success: true });

  } catch (error: any) {
    console.log('Error al eliminar gabinete:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================
// RUTAS DE VLANS
// ============================================

// Crear site VLAN
app.post('/make-server-6c4ea2d2/vlans', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    console.log('[VLANS POST] Recibiendo solicitud para crear site VLAN...');
    console.log('[VLANS POST] Access Token:', accessToken?.substring(0, 20) + '...');
    
    // Permitir acceso en modo demo
    let userRole = 'admin';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        console.log('[VLANS POST] Error de autenticación:', authError);
        return c.json({ error: 'No autorizado' }, 401);
      }

      const userData = await kv.get(`user:${user.id}`);
      if (userData?.rol !== 'admin') {
        console.log('[VLANS POST] Usuario no es admin');
        return c.json({ error: 'Solo administradores pueden crear VLANs' }, 403);
      }
    }

    const vlanData = await c.req.json();
    console.log('[VLANS POST] Datos recibidos:', vlanData);
    
    const id = crypto.randomUUID();
    
    const nuevoSiteVLAN = {
      ...vlanData,
      id,
      fechaRegistro: new Date().toISOString(),
      created_by: 'demo-user'
    };

    console.log('[VLANS POST] Guardando en KV con key:', `vlan:${id}`);
    console.log('[VLANS POST] Datos a guardar:', nuevoSiteVLAN);
    
    await kv.set(`vlan:${id}`, nuevoSiteVLAN);
    
    console.log('[VLANS POST] Site VLAN guardado exitosamente');
    
    // Verificar que se guardó correctamente
    const verificacion = await kv.get(`vlan:${id}`);
    console.log('[VLANS POST] Verificación - Dato recuperado:', verificacion);

    return c.json({ success: true, siteVlan: nuevoSiteVLAN });

  } catch (error: any) {
    console.error('[VLANS POST] Error al crear site VLAN:', error);
    console.error('[VLANS POST] Stack trace:', error.stack);
    return c.json({ error: error.message }, 500);
  }
});

// Obtener todos los sites VLAN
app.get('/make-server-6c4ea2d2/vlans', async (c) => {
  try {
    // Permitir acceso en modo demo - NO requerir autenticación para lectura
    console.log('[VLANS] Obteniendo todos los sites VLAN...');
    
    const vlans = await kv.getByPrefix('vlan:');
    console.log('[VLANS] Datos obtenidos del KV:', vlans);
    console.log('[VLANS] Tipo de datos:', typeof vlans);
    console.log('[VLANS] Es array?:', Array.isArray(vlans));
    console.log('[VLANS] Longitud:', vlans?.length);
    
    if (!vlans || !Array.isArray(vlans)) {
      console.log('[VLANS] No hay datos o el formato es incorrecto, retornando array vacío');
      return c.json({ vlans: [] });
    }
    
    // Ahora getByPrefix retorna objetos con { key, value }, acceder a .value
    const vlansList = vlans
      .filter(item => item.value && item.value.id && item.value.site) // Filtrar solo sites (no control de cambios)
      .map(item => item.value);
    
    console.log('[VLANS] VLANs filtradas:', vlansList.length);
    console.log('[VLANS] Primer site VLAN:', vlansList[0]);

    return c.json({ vlans: vlansList });

  } catch (error: any) {
    console.error('[VLANS] Error al obtener VLANs:', error);
    console.error('[VLANS] Stack trace:', error.stack);
    return c.json({ error: error.message || 'Error al obtener VLANs' }, 500);
  }
});

// Actualizar site VLAN
app.put('/make-server-6c4ea2d2/vlans/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Permitir acceso en modo demo
    let userRole = 'admin';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'No autorizado' }, 401);
      }

      const userData = await kv.get(`user:${user.id}`);
      if (userData?.rol !== 'admin') {
        return c.json({ error: 'Solo administradores pueden actualizar VLANs' }, 403);
      }
    }

    const id = c.req.param('id');
    const vlanData = await c.req.json();
    
    const vlanExistente = await kv.get(`vlan:${id}`);
    if (!vlanExistente) {
      return c.json({ error: 'Site VLAN no encontrado' }, 404);
    }

    const vlanActualizada = {
      ...vlanExistente,
      ...vlanData,
      id,
      updated_at: new Date().toISOString(),
      updated_by: 'demo-user'
    };

    await kv.set(`vlan:${id}`, vlanActualizada);

    return c.json({ success: true, siteVlan: vlanActualizada });

  } catch (error: any) {
    console.log('Error al actualizar site VLAN:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Eliminar site VLAN
app.delete('/make-server-6c4ea2d2/vlans/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Permitir acceso en modo demo
    let userRole = 'admin';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'No autorizado' }, 401);
      }

      const userData = await kv.get(`user:${user.id}`);
      if (userData?.rol !== 'admin') {
        return c.json({ error: 'Solo administradores pueden eliminar VLANs' }, 403);
      }
    }

    const id = c.req.param('id');
    const vlan = await kv.get(`vlan:${id}`);
    
    if (!vlan) {
      return c.json({ error: 'Site VLAN no encontrado' }, 404);
    }

    await kv.del(`vlan:${id}`);

    return c.json({ success: true });

  } catch (error: any) {
    console.log('Error al eliminar site VLAN:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Guardar/actualizar control de cambios
app.post('/make-server-6c4ea2d2/control-cambios', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Permitir acceso en modo demo
    let userRole = 'admin';
    
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

      if (authError || !user) {
        return c.json({ error: 'No autorizado' }, 401);
      }

      const userData = await kv.get(`user:${user.id}`);
      if (userData?.rol !== 'admin') {
        return c.json({ error: 'Solo administradores pueden modificar control de cambios' }, 403);
      }
    }

    const { tipo, ...controlData } = await c.req.json();
    
    const control = {
      ...controlData,
      tipo,
      updated_at: new Date().toISOString(),
      updated_by: 'demo-user'
    };

    await kv.set(`control-cambios:${tipo}`, control);

    return c.json({ success: true, control });

  } catch (error: any) {
    console.log('Error al guardar control de cambios:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Obtener controles de cambios
app.get('/make-server-6c4ea2d2/control-cambios', async (c) => {
  try {
    // Permitir acceso en modo demo - NO requerir autenticación para lectura
    console.log('[CONTROL-CAMBIOS] Obteniendo controles de cambios...');
    
    const grupoCos = await kv.get('control-cambios:grupo cos');
    const contacto = await kv.get('control-cambios:contacto solutions');
    
    console.log('[CONTROL-CAMBIOS] Grupo Cos:', grupoCos);
    console.log('[CONTROL-CAMBIOS] Contacto Solutions:', contacto);

    return c.json({ 
      grupoCos: grupoCos || null,
      contacto: contacto || null
    });

  } catch (error: any) {
    console.error('[CONTROL-CAMBIOS] Error al obtener control de cambios:', error);
    console.error('[CONTROL-CAMBIOS] Stack trace:', error.stack);
    // Retornar valores nulos en caso de error para no romper la UI
    return c.json({ 
      grupoCos: null,
      contacto: null
    });
  }
});

// Ruta de salud
app.get('/make-server-6c4ea2d2/health', (c) => {
  return c.json({ 
    status: 'ok', 
    service: 'NetAdmin Backend V12',
    timestamp: new Date().toISOString() 
  });
});

// ============================================
// RUTA PARA INICIALIZAR USUARIOS DE PRUEBA
// ============================================

// Endpoint manual para crear usuarios de prueba
app.post('/make-server-6c4ea2d2/init-users', async (c) => {
  try {
    console.log('🔧 [INIT] Iniciando creación manual de usuarios de prueba...');
    
    const testUsers = [
      {
        email: 'admin@netadmin.com',
        password: 'admin123',
        nombre: 'Administrador',
        rol: 'admin'
      },
      {
        email: 'lector@netadmin.com',
        password: 'lector123',
        nombre: 'Lector',
        rol: 'lector'
      },
      {
        email: 'juan.rey@netadmin.com',
        password: 'juanrey123',
        nombre: 'Juan Rey',
        rol: 'lector'
      }
    ];

    const results = [];
    
    for (const user of testUsers) {
      try {
        // Verificar si el usuario ya existe
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const userExists = existingUsers?.users?.some(u => u.email === user.email);
        
        if (userExists) {
          console.log(`   ⚠️ Usuario ${user.email} ya existe, omitiendo...`);
          results.push({
            email: user.email,
            status: 'already_exists',
            message: 'Usuario ya existe'
          });
          continue;
        }

        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { 
            nombre: user.nombre, 
            rol: user.rol 
          },
          email_confirm: true
        });

        if (authError) {
          console.error(`   ❌ Error al crear ${user.email}:`, authError);
          results.push({
            email: user.email,
            status: 'error',
            message: authError.message
          });
          continue;
        }

        // Guardar en KV Store
        await kv.set(`user:${authData.user.id}`, {
          id: authData.user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
          created_at: new Date().toISOString()
        });

        console.log(`   ✅ Usuario creado: ${user.email} (${user.rol})`);
        results.push({
          email: user.email,
          status: 'created',
          message: 'Usuario creado exitosamente'
        });

      } catch (error: any) {
        console.error(`   ❌ Error inesperado con ${user.email}:`, error);
        results.push({
          email: user.email,
          status: 'error',
          message: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'created' || r.status === 'already_exists').length;
    
    console.log(`\n✅ [INIT] Proceso completado: ${successCount}/${testUsers.length} usuarios disponibles\n`);

    return c.json({
      success: true,
      message: `${successCount} usuarios disponibles`,
      results,
      credentials: {
        admin: { email: 'admin@netadmin.com', password: 'admin123' },
        lector: { email: 'lector@netadmin.com', password: 'lector123' },
        juanRey: { email: 'juan.rey@netadmin.com', password: 'juanrey123' }
      }
    });

  } catch (error: any) {
    console.error('❌ [INIT] Error fatal al crear usuarios:', error);
    return c.json({ 
      success: false,
      error: error.message,
      message: 'Error al crear usuarios de prueba'
    }, 500);
  }
});

// ============================================
// RUTAS DE GESTIÓN DE USUARIOS (ADMIN)
// ============================================

// Listar todos los usuarios
app.get('/make-server-6c4ea2d2/users/list', async (c) => {
  try {
    console.log('📋 [USERS] Listando usuarios...');
    
    // Obtener todos los usuarios del KV Store
    const usersData = await kv.getByPrefix('user:');
    console.log(`   📊 Usuarios encontrados en KV: ${usersData.length}`);
    
    // Filtrar y formatear usuarios
    const users = usersData
      .filter(item => item.value && item.value.id)
      .map(item => item.value);
    
    console.log(`   ✅ Usuarios válidos: ${users.length}`);
    
    return c.json({ 
      success: true, 
      users,
      total: users.length
    });
  } catch (error: any) {
    console.error('❌ [USERS] Error al listar usuarios:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Cambiar rol de usuario
app.put('/make-server-6c4ea2d2/users/:id/role', async (c) => {
  try {
    const userId = c.req.param('id');
    const { rol } = await c.req.json();
    
    console.log(`🔄 [USERS] Cambiando rol del usuario ${userId} a ${rol}...`);
    
    // Obtener usuario actual
    const userData = await kv.get(`user:${userId}`);
    if (!userData) {
      return c.json({ error: 'Usuario no encontrado' }, 404);
    }
    
    // Actualizar rol en KV Store
    const updatedUser = {
      ...userData,
      rol,
      updated_at: new Date().toISOString()
    };
    await kv.set(`user:${userId}`, updatedUser);
    
    // Actualizar metadata en Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { nombre: userData.nombre, rol } }
    );
    
    if (authError) {
      console.error('⚠️ [USERS] Error al actualizar Auth, pero KV actualizado:', authError);
    }
    
    console.log(`   ✅ Rol actualizado: ${userData.nombre} → ${rol}`);
    
    return c.json({ 
      success: true, 
      user: updatedUser,
      message: `Rol actualizado a ${rol}` 
    });
  } catch (error: any) {
    console.error('❌ [USERS] Error al cambiar rol:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Cambiar contraseña de usuario
app.put('/make-server-6c4ea2d2/users/:id/password', async (c) => {
  try {
    const userId = c.req.param('id');
    const { password } = await c.req.json();
    
    console.log(`🔑 [USERS] Cambiando contraseña del usuario ${userId}...`);
    
    if (!password || password.length < 8) {
      return c.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
    }
    
    // Actualizar contraseña en Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { password }
    );
    
    if (authError) {
      console.error('❌ [USERS] Error al actualizar contraseña:', authError);
      return c.json({ error: authError.message }, 400);
    }
    
    // Actualizar timestamp en KV Store
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      await kv.set(`user:${userId}`, {
        ...userData,
        updated_at: new Date().toISOString()
      });
    }
    
    console.log(`   ✅ Contraseña actualizada para usuario ${userId}`);
    
    return c.json({ 
      success: true, 
      message: 'Contraseña actualizada correctamente' 
    });
  } catch (error: any) {
    console.error('❌ [USERS] Error al cambiar contraseña:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Eliminar usuario
app.delete('/make-server-6c4ea2d2/users/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    
    console.log(`🗑️ [USERS] Eliminando usuario ${userId}...`);
    
    // Verificar que no sea el admin principal
    const userData = await kv.get(`user:${userId}`);
    if (userData?.email === 'admin@netadmin.com') {
      return c.json({ error: 'No se puede eliminar el usuario administrador principal' }, 403);
    }
    
    // Eliminar de Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('⚠️ [USERS] Error al eliminar de Auth:', authError);
    }
    
    // Eliminar de KV Store
    await kv.del(`user:${userId}`);
    
    console.log(`   ✅ Usuario eliminado: ${userId}`);
    
    return c.json({ 
      success: true, 
      message: 'Usuario eliminado correctamente' 
    });
  } catch (error: any) {
    console.error('❌ [USERS] Error al eliminar usuario:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);