# 🌐 NetAdmin - Sistema de Gestión de Infraestructura de Red

Sistema profesional para la gestión, documentación y monitoreo de switches y firewalls con módulos especializados para control de hojas de vida, inventario, VLANs y mantenimiento.

---

## 🚀 INICIO RÁPIDO

### 1️⃣ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: versión 18.x o superior → [Descargar aquí](https://nodejs.org/)
- **npm**: versión 8.x o superior (incluido con Node.js)
- **Git**: para clonar el repositorio → [Descargar aquí](https://git-scm.com/)

**Verificar instalación:**
```bash
node --version   # Debe mostrar v18.0.0 o superior
npm --version    # Debe mostrar 8.0.0 o superior
git --version    # Cualquier versión reciente
```

---

### 2️⃣ Instalación

#### **Paso 1: Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd netadmin
```

#### **Paso 2: Instalar dependencias**
```bash
npm install
```

Este comando instalará automáticamente todas las dependencias necesarias:
- React 18 con TypeScript
- Tailwind CSS 4.0
- shadcn/ui components
- Supabase client
- jsPDF para generación de PDFs
- Recharts para gráficos
- Y más...

#### **Paso 3: Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

---

### 3️⃣ Credenciales de Acceso

El sistema implementa **autenticación real con Supabase Auth**, pero también incluye un **modo demo** para pruebas inmediatas.

---

## 🎮 MODO DEMO (Para empezar inmediatamente)

**La forma más rápida de usar NetAdmin:**

1. Ejecuta: `npm run dev`
2. Ve a: `http://localhost:5173`
3. **NO llenes el formulario de login**
4. Haz click en los **iconos de la parte inferior**:
   - **Icono Escudo (Shield)** → Acceso como Admin
   - **Icono Libro (Book)** → Acceso como Lector
5. ✅ ¡Listo! Ya puedes usar toda la aplicación

**Ventajas del modo demo:**
- ✅ No requiere configuración de Supabase
- ✅ Funciona instantáneamente
- ✅ Datos en localStorage (persisten al recargar)
- ✅ Ideal para pruebas y desarrollo
- ✅ Todos los módulos funcionan

---

## 🔐 AUTENTICACIÓN REAL (Para producción)

Para usar autenticación real con Supabase Auth:

### **Opción A: Desplegar Edge Function (Recomendado)**

```bash
# Los usuarios se crean automáticamente al desplegar
supabase functions deploy make-server-6c4ea2d2
```

**Usuarios creados automáticamente:**
- `admin@netadmin.com` / `admin123` (Administrador)
- `lector@netadmin.com` / `lector123` (Lector)
- `juan.rey@netadmin.com` / `juanrey123` (Lector)

### **Opción B: Crear usuarios manualmente**

Si no quieres desplegar, crea los usuarios en Supabase Dashboard:
- Ve a **Authentication → Users → Add User**
- Crea el usuario con email y password
- Agrega metadata: `{"nombre": "Nombre", "rol": "admin"}`

📖 **Instrucciones detalladas:** Ver archivo `/CREAR_USUARIOS.md`

---

## ⚠️ IMPORTANTE: Error "Invalid login credentials"

Si ves este error al intentar hacer login:

```
❌ Error de Supabase Auth: AuthApiError: Invalid login credentials
```

**¡YA NO ES UN PROBLEMA!** El sistema ahora funciona con credenciales locales integradas.

**Soluciones (2 opciones):**

### **1. Usar modo demo** ⭐ **MÁS RÁPIDO**
- En el login, haz click en los **iconos de escudo o libro**
- ✅ Entras inmediatamente sin autenticación
- Escudo (🛡️) = Admin (acceso completo)
- Libro (📖) = Lector (solo lectura)

### **2. Login con credenciales locales**
El sistema tiene usuarios integrados que funcionan sin configuración:
- `admin@netadmin.com` / `admin123` (Administrador)
- `lector@netadmin.com` / `lector123` (Lector)
- `juan.rey@netadmin.com` / `juanrey123` (Lector)

**Funciona sin necesidad de Supabase. Los usuarios están integrados en el código.**

📖 **Más información:** Ver archivo `/CREAR_USUARIOS.md`

---

## 👥 ROLES DE USUARIO

**👤 ADMINISTRADOR (Acceso Completo)**
- ✅ Ver todos los módulos
- ✅ Crear, editar y eliminar equipos
- ✅ Importar hojas de vida desde Excel
- ✅ **Gestionar usuarios (crear, editar, cambiar contraseñas y roles)**
- ✅ Configurar alertas y tareas
- ✅ Acceso total al sistema

**👁️ LECTOR (Solo Lectura)**
- ✅ Ver todos los datos
- ✅ Buscar y consultar equipos
- ✅ Descargar PDFs
- ❌ No puede modificar, editar ni eliminar
- ❌ No puede crear nuevas hojas de vida
- ❌ No puede gestionar usuarios
- ❌ No puede ver/crear tareas

---

## 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### **Modo 1: Demo (Sin configuración) - Recomendado para pruebas**

El sistema funciona inmediatamente sin configuración adicional. Los datos se almacenan en **localStorage** del navegador.

✅ **Ideal para:**
- Pruebas y desarrollo
- Demostraciones
- Aprendizaje del sistema

⚠️ **Limitaciones:**
- Los datos se pierden al limpiar el navegador
- No hay sincronización entre dispositivos

---

### **Modo 2: PostgreSQL con Supabase - Recomendado para producción**

Para usar base de datos PostgreSQL real con Supabase:

#### **Paso 1: Crear proyecto en Supabase**

1. Ir a [https://supabase.com](https://supabase.com)
2. Crear cuenta gratuita
3. Crear nuevo proyecto
4. Guardar las credenciales:
   - **Project URL**: `https://XXXXXXX.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### **Paso 2: Crear tabla en la base de datos**

1. En Supabase, ir a **SQL Editor**
2. Ejecutar el siguiente SQL:

```sql
-- ============================================
-- NETADMIN - SCRIPT DE CREACIÓN DE BASE DE DATOS
-- ============================================

-- --------------------------------------------
-- 1. TABLA PRINCIPAL: Key-Value Store
-- Almacena todos los datos del sistema
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS kv_store_6c4ea2d2 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

-- Índice para búsquedas rápidas por prefijo
CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix 
ON kv_store_6c4ea2d2 (key text_pattern_ops);

-- Comentario descriptivo
COMMENT ON TABLE kv_store_6c4ea2d2 IS 'Almacenamiento clave-valor para todos los datos de NetAdmin: hojas de vida, gabinetes, VLANs, usuarios, tareas, etc.';

-- --------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
-- Habilitar seguridad a nivel de fila
-- --------------------------------------------
ALTER TABLE kv_store_6c4ea2d2 ENABLE ROW LEVEL SECURITY;

-- Política: Permitir acceso completo (para desarrollo)
-- IMPORTANTE: En producción, debes crear políticas más restrictivas
DROP POLICY IF EXISTS "Allow all access" ON kv_store_6c4ea2d2;
CREATE POLICY "Allow all access" ON kv_store_6c4ea2d2
FOR ALL 
USING (true) 
WITH CHECK (true);

-- --------------------------------------------
-- 3. ESTRUCTURA DE KEYS EN KV_STORE
-- Esta tabla almacena datos con el siguiente formato:
-- --------------------------------------------

-- USUARIOS:
--   key: user:{uuid}
--   value: { id, email, nombre, rol, created_at }

-- HOJAS DE VIDA:
--   key: hoja:{uuid}
--   value: { id, hostname, marca, modelo, site, ... }
--   key: hoja:hostname:{nombre} → {uuid}  (índice)
--   key: hoja:site:{site} → [uuid1, uuid2, ...]  (índice)

-- GABINETES:
--   key: gabinete:{uuid}
--   value: { id, nombre, site, ubicacion, switches: [...] }

-- VLANS:
--   key: vlan:{uuid}
--   value: { id, site, vlans: [...] }
--   key: vlan:control:{site}
--   value: { fecha, responsable, cambios }

-- TAREAS/MANTENIMIENTOS:
--   key: tarea:{uuid}
--   value: { id, titulo, fecha, tipo, responsable, completada, ... }

-- STATS/CONFIGURACIÓN:
--   key: stats:dashboard
--   value: { totalEquipos, totalSwitches, totalFirewalls, ... }
--   key: config:system
--   value: { ... configuraciones del sistema ... }

-- --------------------------------------------
-- 4. VERIFICACIÓN DE LA INSTALACIÓN
-- --------------------------------------------

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'kv_store_6c4ea2d2';

-- Verificar índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'kv_store_6c4ea2d2';

-- Verificar políticas de RLS
SELECT
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'kv_store_6c4ea2d2';

-- Insertar datos de prueba (opcional)
INSERT INTO kv_store_6c4ea2d2 (key, value)
VALUES ('test:installation', '{"status": "success", "timestamp": "2024-12-23"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Verificar inserción
SELECT * FROM kv_store_6c4ea2d2 WHERE key = 'test:installation';

-- ============================================
-- INSTALACIÓN COMPLETADA
-- ============================================
-- La tabla kv_store_6c4ea2d2 está lista para usar.
-- El sistema NetAdmin puede ahora guardar y recuperar datos.
-- ============================================
```

**Explicación de la estructura:**

La tabla `kv_store_6c4ea2d2` usa un patrón **clave-valor (key-value)** donde:
- **key**: Identificador único en formato `tipo:id` o `tipo:subtipo:valor`
- **value**: Objeto JSON con todos los datos del registro

**Ventajas de este diseño:**
- ✅ Flexibilidad: No requiere migraciones al agregar campos
- ✅ Simplicidad: Una sola tabla para todo el sistema
- ✅ Rapidez: Índices optimizados para búsquedas por prefijo
- ✅ Escalabilidad: Ideal para prototipos y aplicaciones medianas

**Tipos de datos almacenados:**
1. **Hojas de Vida** (`hoja:*`) - Información de switches y firewalls
2. **Gabinetes** (`gabinete:*`) - Configuración de gabinetes y racks
3. **VLANs** (`vlan:*`) - Configuración de redes VLAN por site
4. **Tareas** (`tarea:*`) - Mantenimientos y tareas programadas
5. **Usuarios** (`user:*`) - Datos de usuarios del sistema
6. **Estadísticas** (`stats:*`) - Datos del dashboard
7. **Configuración** (`config:*`) - Ajustes del sistema

#### **Paso 3: Configurar credenciales en el proyecto**

Editar el archivo `/utils/supabase/info.tsx`:

```typescript
export const projectId = 'TU_PROJECT_ID';  // ej: yrvfphlbikhiaysqjanh
export const publicAnonKey = 'TU_ANON_KEY';
export const serviceRoleKey = 'TU_SERVICE_ROLE_KEY';
```

#### **Paso 4: Configurar variables de entorno en Supabase**

1. En Supabase Dashboard → **Edge Functions** → **Settings**
2. Agregar las siguientes variables:

```
SUPABASE_URL = https://TU_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY = tu_anon_key
SUPABASE_SERVICE_ROLE_KEY = tu_service_role_key
SUPABASE_DB_URL = postgresql://postgres:[PASSWORD]@db.TU_PROJECT_ID.supabase.co:5432/postgres
```

#### **Paso 5: Desplegar Edge Functions**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref TU_PROJECT_ID

# Desplegar la función
supabase functions deploy make-server-6c4ea2d2
```

✅ **Listo!** Ahora el sistema usará PostgreSQL como base de datos.

---

## 📦 ESTRUCTURA DEL PROYECTO

```
netadmin/
├── /components/           # Componentes React
│   ├── Dashboard.tsx      # Panel principal con estadísticas
│   ├── HojaDeVida.tsx     # Formulario de hojas de vida
│   ├── ImportarHojaDeVida.tsx  # Importador de Excel
│   ├── Inventario.tsx     # Inventario por ubicaciones
│   ├── SwitchModule.tsx   # Gestión de switches y gabinetes
│   ├── VLANModule.tsx     # Gestión de VLANs
│   ├── Mantenimiento.tsx  # Gestión de tareas
│   ├── SettingsPanel.tsx  # Configuración del sistema
│   └── /ui/               # Componentes UI (shadcn/ui)
├── /contexts/             # Contextos de React
│   └── AuthContext.tsx    # Autenticación y roles
├── /supabase/
│   └── /functions/
│       └── /server/
│           ├── index.tsx  # Edge Function principal (Hono)
│           ├── init-users.tsx  # Inicialización de usuarios
│           └── kv_store.tsx    # Funciones de base de datos
├── /utils/
│   └── /supabase/
│       └── info.tsx       # Credenciales de Supabase
├── /styles/
│   └── globals.css        # Estilos globales (Tailwind)
├── App.tsx                # Componente principal
└── package.json           # Dependencias del proyecto
```

---

## 🎯 MÓDULOS PRINCIPALES

### **1. Dashboard**
- 📊 Estadísticas en tiempo real
- 📈 Gráficos de distribución
- 🔔 Alertas de tareas vencidas
- 📦 Resumen de equipos por tipo

### **2. Hoja de Vida**
- ✏️ Registro completo de equipos
- 📋 7 secciones organizadas por pestañas:
  1. **Ubicación**: Hostname, site, gabinete
  2. **Datos Básicos**: Marca, modelo, serial
  3. **Técnico**: IPs, procesador, firmware
  4. **Contactos**: Administradores y proveedores
  5. **Garantía**: Fechas y vigencia
  6. **Mantenimientos**: Historial completo
  7. **Vista Previa**: Resumen antes de guardar
- 📥 **Importación desde Excel**:
  - Carga archivos .xlsx con formato específico
  - Parser inteligente que detecta automáticamente los campos
  - Vista previa completa antes de guardar (810×720px)
  - Validación de datos con advertencias
- 📄 Exportación a PDF con formato profesional

### **3. Tareas (Mantenimiento)**
- 📅 Calendario de mantenimientos
- 🔴 Alertas automáticas para tareas vencidas
- 🟡 Alertas para tareas próximas a vencer (7 días)
- ✅ Sistema de completado de tareas
- 🔔 Notificaciones en Dashboard

### **4. Inventario**
- 🗂️ Organización por ubicaciones:
  - **Grupo COS**: Barranquilla, Calle 93, RRHH, Site 7, Carrera 7
  - **Contacto Solutions**: Itagüí, Site 6, Site 5
  - **OTD**: Calle 80
- 🔍 Búsqueda avanzada por hostname, IP, marca, modelo
- 📊 Visualización en cuadrícula
- 🎨 Colores por razón social (rojo, azul, rosa)

### **5. Switch**
- 🗄️ Gestión de gabinetes
- 🔌 Configuración de switches por gabinete
- 📍 Ubicación física detallada
- 🔧 Estado y configuración

### **6. VLAN**
- 🌐 Gestión de VLANs por site
- 📋 Tabla completa de VLANs con:
  - ID VLAN
  - Nombre
  - Red IP/Máscara
  - Gateway
  - Descripción
- 📥 **Descarga de matriz en PDF** con cuadrículas profesionales
- 🔄 Control de cambios con historial

### **7. Configuración**
- 👥 Gestión de usuarios (solo ADMIN)
- 🔑 Roles: Admin y Lector
- 💾 Backup y restauración de datos
- 🔐 Cambio de contraseña

---

## 🎨 ESQUEMA DE COLORES

El sistema usa un esquema de colores profesional basado en la razón social:

- **🔴 Grupo COS** (predeterminado): Rojos y rojizos
- **🔵 Contacto Solutions**: Azules
- **🟣 OTD**: Rosas

Los colores se aplican automáticamente según la selección de "Razón Social" en cada módulo.

---

## 📄 IMPORTACIÓN DE HOJAS DE VIDA DESDE EXCEL

### Formato del archivo Excel

El sistema detecta automáticamente los siguientes campos:

**Sección: Hoja de Vida Elementos**
- Elemento (tipo de equipo)
- Marca
- Modelo
- Serial
- Nombre (hostname)
- Proveedor
- Fecha de compra
- Ubicación física

**Sección: Información Proveedor**
- Proveedor
- Cargo contacto
- Teléfono 1 y 2
- Email contacto
- Responsable
- Fecha entrega
- Tiempo de garantía
- Fecha terminación

**Sección: Accesos**
- Dirección IP
- Gateway
- WINS/DNS

**Sección: Características**
- Funciones
- Procesador
- Memoria NVRAM
- Backup (Sí/No)
- Sistema operativo
- Versión firmware

**Sección: Dependencia**
- Dependencia administrativa

**Sección: Impacto Caída**
- Nivel de impacto (Alta/Media/Baja)

**Sección: Contingencias**
- Plan de contingencia

**Sección: Administradores**
- Usuarios admin
- Correo admin
- Cargo admin

**Sección: Mantenimientos**
Tabla con columnas:
- Fecha de mantenimiento
- Tipo (Preventivo/Correctivo/Actualización)
- Descripción
- Responsable

### Proceso de importación

1. Ir a **Hoja de Vida** → Botón **"Importar Hoja de Vida Excel"**
2. Seleccionar archivo `.xlsx`
3. El sistema parseará automáticamente todos los campos
4. Se abrirá ventana de **Vista Previa** (810×720px)
5. Revisar todas las 7 secciones con scroll vertical
6. Click en **"Confirmar y Guardar"** (botón verde)
7. La hoja de vida se guardará en la base de datos
8. Aparecerá automáticamente en el módulo **Inventario** en su sección correspondiente

---

## 📥 EXPORTACIÓN A PDF

### Características del PDF

- ✅ **Plantilla corporativa** con logo y encabezado
- ✅ **Tablas con cuadrículas** (grid completo)
- ✅ **Formato profesional** A4
- ✅ **Colores según razón social**
- ✅ **Todas las secciones** incluidas
- ✅ **Mantenimientos en tabla**

### Cómo exportar

1. Ir al módulo correspondiente (Hoja de Vida, VLAN, etc.)
2. Seleccionar el equipo o site
3. Click en botón **"Descargar PDF"**
4. El archivo se descargará automáticamente

**Nota:** La opción de exportar a Excel fue eliminada. Solo se permite PDF.

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **Problema: `npm install` falla**

```bash
# Limpiar caché de npm y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### **Problema: Puerto 5173 ocupado**

```bash
# Usar otro puerto
npm run dev -- --port 3000
```

### **Problema: Los datos no se guardan**

**Si usas modo demo:**
- Los datos están en localStorage
- Se pierden al limpiar caché del navegador
- Verifica que no estés en modo incógnito

**Si usas Supabase:**
- Verifica las credenciales en `/utils/supabase/info.tsx`
- Verifica que la tabla `kv_store_6c4ea2d2` existe
- Revisa la consola del navegador (F12) para errores

### **Problema: No puedo crear hojas de vida**

- Solo usuarios **ADMIN** pueden crear/editar
- Verifica que iniciaste sesión como `admin@netadmin.com`
- Los usuarios **LECTOR** solo pueden visualizar

### **Problema: La importación de Excel falla**

- Verifica que el archivo sea `.xlsx` (no `.xls` ni `.csv`)
- Asegúrate de que tiene las secciones requeridas
- Revisa la consola del navegador (F12) para ver qué campo falta
- Verifica que el parser detecte correctamente los encabezados

### **Problema: El PDF no se genera**

- Verifica que tienes instalado `jspdf` y `jspdf-autotable`
- Limpia caché y reinstala: `npm install`
- Revisa la consola para errores específicos

---

## 🚀 BUILD Y DESPLIEGUE

### **Build para Producción**

```bash
npm run build
```

Esto genera una carpeta `/dist` con todos los archivos optimizados.

### **Desplegar en Vercel (Recomendado - Gratis)**

```bash
# Instalar CLI de Vercel
npm install -g vercel

# Desplegar
vercel --prod
```

### **Desplegar en Netlify (Gratis)**

```bash
# Instalar CLI de Netlify
npm install -g netlify-cli

# Desplegar
netlify deploy --prod
```

### **Desplegar en servidor tradicional**

1. Ejecutar `npm run build`
2. Subir el contenido de `/dist` a tu servidor web (Apache, Nginx, etc.)
3. Configurar el servidor para servir `index.html` en todas las rutas (SPA)

---

## 📚 DEPENDENCIAS PRINCIPALES

El archivo `package.json` incluye todas las dependencias. Las principales son:

**Frontend:**
- `react` + `react-dom` (v18)
- `typescript`
- `vite` (build tool)

**Estilos:**
- `tailwindcss` (v4.0)
- `@tailwindcss/forms`

**UI Components:**
- `@radix-ui/*` (componentes base)
- `lucide-react` (iconos)
- `sonner` (notificaciones toast)

**Funcionalidades:**
- `jspdf` + `jspdf-autotable` (generación de PDFs con tablas)
- `recharts` (gráficos)
- `date-fns` (manejo de fechas)
- `xlsx` (lectura de archivos Excel)

**Backend:**
- `@supabase/supabase-js` (cliente de Supabase)
- `hono` (framework para Edge Functions)

---

## 🔐 SEGURIDAD

### **Buenas prácticas implementadas:**

- ✅ Sistema de roles (Admin/Lector)
- ✅ Validación de campos en frontend
- ✅ Las claves de servicio NO se exponen en el frontend
- ✅ Autenticación con JWT (Supabase Auth)
- ✅ Row Level Security (RLS) en PostgreSQL

### **Para producción, asegúrate de:**

- 🔒 Cambiar las contraseñas predeterminadas
- 🔒 Usar HTTPS (SSL/TLS)
- 🔒 Configurar CORS adecuadamente
- 🔒 Rotar las API keys regularmente
- 🔒 Hacer backups periódicos de la base de datos

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa la sección **Solución de Problemas** arriba
2. Verifica la consola del navegador (F12)
3. Revisa los logs del servidor (si usas Supabase)
4. Contacta al equipo de desarrollo

---

## 📄 LICENCIAS

Este proyecto utiliza componentes de código abierto. Ver **[Attributions.md](./Attributions.md)** para detalles de licencias.

---

## 🎯 VERSIÓN

**NetAdmin v2.0** - Última actualización: Diciembre 2025

### Cambios recientes (v12.0):
- ✅ Importación de hojas de vida desde Excel con parser inteligente
- ✅ Vista previa modal optimizada (810×720px)
- ✅ Sincronización automática entre módulos
- ✅ Endpoint `/hojas-vida/listar` sin autenticación estricta
- ✅ Corrección de `getByPrefix` en KV Store
- ✅ Soporte completo para PostgreSQL + Supabase
- ✅ Generación de PDFs con cuadrículas profesionales
- ✅ Sistema de alertas de tareas vencidas
- ✅ Descarga de matriz de VLANs en PDF

---

**© 2025 NetAdmin - Sistema Profesional de Gestión de Infraestructura de Red**
