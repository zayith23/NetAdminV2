# 🔐 INSTRUCCIONES DE AUTENTICACIÓN - NetAdmin V12

## ✅ SISTEMA IMPLEMENTADO

NetAdmin ahora cuenta con **autenticación real usando Supabase Auth** mientras mantiene el **modo demo** funcionando.

---

## 🎯 CÓMO FUNCIONA

### **Opción 1: Autenticación Real (Supabase Auth)**
- Los usuarios se crean automáticamente en Supabase Auth al iniciar el servidor
- Las credenciales son validadas contra la base de datos
- La sesión persiste entre recargas de página
- Los datos se almacenan en PostgreSQL (KV Store)

### **Opción 2: Modo Demo (Sin autenticación)**
- No requiere configuración de Supabase
- Los datos se almacenan en localStorage
- Ideal para pruebas y demostraciones
- No requiere crear usuarios

---

## 🚀 PASOS PARA PROBAR AUTENTICACIÓN REAL

### **Paso 1: Configurar Supabase** (Si aún no lo has hecho)

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea un proyecto nuevo
3. Copia las credenciales:
   - **Project URL**: `https://XXXXXXX.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. Edita el archivo `/utils/supabase/info.tsx`:
```typescript
export const projectId = 'TU_PROJECT_ID';  // ej: yrvfphlbikhiaysqjanh
export const publicAnonKey = 'TU_ANON_KEY';
export const serviceRoleKey = 'TU_SERVICE_ROLE_KEY';
```

### **Paso 2: Crear tabla en la base de datos**

En Supabase Dashboard → **SQL Editor**, ejecuta:

```sql
CREATE TABLE IF NOT EXISTS kv_store_6c4ea2d2 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix 
ON kv_store_6c4ea2d2 (key text_pattern_ops);

ALTER TABLE kv_store_6c4ea2d2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON kv_store_6c4ea2d2;
CREATE POLICY "Allow all access" ON kv_store_6c4ea2d2
FOR ALL USING (true) WITH CHECK (true);
```

### **Paso 3: Configurar variables de entorno en Supabase**

En Supabase Dashboard → **Edge Functions** → **Settings**, agrega:

```
SUPABASE_URL = https://TU_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY = tu_anon_key
SUPABASE_SERVICE_ROLE_KEY = tu_service_role_key
SUPABASE_DB_URL = postgresql://postgres:[PASSWORD]@db.TU_PROJECT_ID.supabase.co:5432/postgres
```

### **Paso 4: Desplegar Edge Function**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref TU_PROJECT_ID

# Desplegar
supabase functions deploy make-server-6c4ea2d2
```

### **Paso 5: Iniciar la aplicación**

```bash
npm run dev
```

La aplicación estará en: **http://localhost:5173**

---

## 🔑 CREDENCIALES DE PRUEBA

Cuando despliegues el Edge Function, el servidor creará automáticamente estos usuarios:

### **👤 Administrador**
```
Email: admin@netadmin.com
Password: admin123
Rol: admin
```

### **👁️ Lector**
```
Email: lector@netadmin.com
Password: lector123
Rol: lector
```

---

## ✨ PANTALLA DE LOGIN

La nueva pantalla de login tiene:

### **1. Formulario de Login Real**
- Campos de email y password
- Botón "Iniciar Sesión" que valida contra Supabase Auth
- Muestra las credenciales de prueba arriba del formulario

### **2. Modo Demo (Botones con iconos)**
- **Icono Escudo (Shield)**: Acceso demo como Admin
- **Icono Libro (BookOpen)**: Acceso demo como Lector
- Ubicados debajo del formulario con un separador

---

## 🧪 CÓMO PROBAR

### **Prueba 1: Autenticación Real**

1. Abre la aplicación: `http://localhost:5173`
2. En el formulario de login, ingresa:
   - Email: `admin@netadmin.com`
   - Password: `admin123`
3. Click en **"Iniciar Sesión"**
4. ✅ Deberías ver mensaje: "¡Bienvenido a NetAdmin!"
5. ✅ Serás redirigido al Dashboard
6. ✅ Tu sesión persistirá al recargar la página

### **Prueba 2: Login con Lector**

1. Ingresa:
   - Email: `lector@netadmin.com`
   - Password: `lector123`
2. Click en **"Iniciar Sesión"**
3. ✅ Accederás con permisos de solo lectura
4. ❌ No podrás crear/editar/eliminar

### **Prueba 3: Modo Demo (sin autenticación)**

1. En la pantalla de login, click en el icono **Escudo** (Admin Demo)
2. ✅ Accederás como Admin sin validar credenciales
3. ✅ Los datos se guardarán en localStorage (no en Supabase)

### **Prueba 4: Credenciales Incorrectas**

1. Ingresa un email o password incorrecto
2. Click en **"Iniciar Sesión"**
3. ✅ Deberías ver error: "Error al iniciar sesión"
4. ✅ No accederás al sistema

---

## 🔍 VERIFICAR QUE FUNCIONA

### **En el navegador (F12 → Console):**

**Login exitoso:**
```
🔐 Intentando login con Supabase Auth...
✅ Login exitoso: admin@netadmin.com
```

**Login fallido:**
```
🔐 Intentando login con Supabase Auth...
❌ Error de Supabase Auth: Invalid login credentials
```

### **En los logs del Edge Function (Supabase Dashboard):**

```
🚀 ========================================
🚀 INICIANDO USUARIOS DE PRUEBA
🚀 ========================================

👤 Procesando usuario: admin@netadmin.com...
   ✅ Usuario creado en Auth: admin@netadmin.com (ID: xxx-xxx-xxx)
   ✅ Datos guardados en KV Store (admin)

👤 Procesando usuario: lector@netadmin.com...
   ✅ Usuario creado en Auth: lector@netadmin.com (ID: xxx-xxx-xxx)
   ✅ Datos guardados en KV Store (lector)

✅ ========================================
✅ INICIALIZACIÓN DE USUARIOS COMPLETADA
✅ ========================================

📋 CREDENCIALES DISPONIBLES:
   👤 Admin:  admin@netadmin.com / admin123
   👁️  Lector: lector@netadmin.com / lector123
========================================
```

---

## 📊 COMPARACIÓN: Auth Real vs Modo Demo

| Característica | Autenticación Real | Modo Demo |
|---|---|---|
| **Requiere Supabase** | ✅ Sí | ❌ No |
| **Persistencia de datos** | PostgreSQL | localStorage |
| **Validación de credenciales** | ✅ Sí | ❌ No |
| **Sesión persistente** | ✅ Sí | ⚠️ Solo en navegador |
| **Seguridad** | 🔒 Alta | ⚠️ Baja (solo demo) |
| **Crear nuevos usuarios** | ✅ Sí (vía backend) | ❌ No |
| **Ideal para** | Producción | Pruebas locales |

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### **Problema: "Error al iniciar sesión" con credenciales correctas**

**Causa:** Los usuarios no se crearon en Supabase Auth

**Solución:**
1. Ve a Supabase Dashboard → **Edge Functions**
2. Busca los logs del despliegue
3. Verifica que se crearon los usuarios
4. Si no, ejecuta manualmente en SQL Editor:

```sql
-- Crear usuario admin manualmente
-- (Solo si el script automático falló)
```

O crea los usuarios desde Supabase Dashboard → **Authentication** → **Users** → **Add User**

### **Problema: "No autorizado" al usar credenciales correctas**

**Causa:** Las credenciales en `/utils/supabase/info.tsx` son incorrectas

**Solución:**
1. Verifica que `projectId`, `publicAnonKey` y `serviceRoleKey` sean correctos
2. Compara con las credenciales en Supabase Dashboard → **Settings** → **API**

### **Problema: El modo demo no funciona**

**Causa:** Error en localStorage

**Solución:**
1. Abre la consola del navegador (F12)
2. Ejecuta: `localStorage.clear()`
3. Recarga la página
4. Intenta nuevamente

---

## ✅ RESUMEN

### **Ya está implementado:**
- ✅ Autenticación real con Supabase Auth
- ✅ Creación automática de usuarios (admin y lector)
- ✅ Login con email y password
- ✅ Validación de credenciales
- ✅ Sesión persistente
- ✅ Modo demo funcionando (iconos)
- ✅ Integración con KV Store

### **Para usar autenticación real:**
1. Configura Supabase (credenciales en `/utils/supabase/info.tsx`)
2. Crea la tabla `kv_store_6c4ea2d2`
3. Despliega el Edge Function
4. Los usuarios se crean automáticamente
5. ¡Listo! Usa `admin@netadmin.com / admin123`

### **Para usar modo demo:**
1. Click en icono Escudo (Admin) o Libro (Lector)
2. ¡Listo! Sin configuración

---

**¡El sistema está listo para pruebas!** 🎉🚀✨
