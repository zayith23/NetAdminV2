# 🔐 CÓMO ACCEDER A NETADMIN

## ✅ SISTEMA LISTO PARA USAR

**NetAdmin V13** incluye **usuarios integrados** que funcionan sin necesidad de configurar Supabase.

---

## 🎯 2 FORMAS DE ACCEDER

### **1️⃣ MODO DEMO (SIN AUTENTICACIÓN)** ⚡ **MÁS RÁPIDO - RECOMENDADO**

**Acceso instantáneo con un click:**

1. **Ejecuta la aplicación:**
   ```bash
   npm run dev
   ```

2. **Ve a:** `http://localhost:5173`

3. **Haz click en uno de los iconos:**
   - 🛡️ **Icono Escudo** → Modo Admin (acceso completo)
   - 📖 **Icono Libro** → Modo Lector (solo lectura)

4. ✅ **¡Entras inmediatamente al Dashboard!**

**Ventajas:**
- ✅ **Un solo click**
- ✅ **No requiere credenciales**
- ✅ **Ideal para pruebas rápidas**
- ✅ **Todos los módulos funcionan**
- ✅ **Datos persisten en localStorage**

---

### **2️⃣ LOGIN CON CREDENCIALES LOCALES** 🔐

**Usuarios integrados en el código:**

El sistema tiene 3 usuarios que funcionan sin configuración:

- **👤 Administrador:**
  - Email: `admin@netadmin.com`
  - Password: `admin123`
  - Rol: Admin (acceso completo)

- **📖 Lector:**
  - Email: `lector@netadmin.com`
  - Password: `lector123`
  - Rol: Lector (solo lectura)

- **👤 Juan Rey:**
  - Email: `juan.rey@netadmin.com`
  - Password: `juanrey123`
  - Rol: Lector (solo lectura)

**Para usar:**
1. Ingresa el email y password en el formulario
2. Click en "Iniciar Sesión"
3. ✅ Acceso al sistema

**Ventajas:**
- ✅ **Funciona sin Supabase**
- ✅ **Sin configuración adicional**
- ✅ **Credenciales integradas en el código**
- ✅ **Datos persisten en localStorage**

---

### **3️⃣ AUTENTICACIÓN CON SUPABASE** 🗄️ **PARA PRODUCCIÓN**

**Si quieres usar Supabase Auth real:**

#### **Paso 1: Configurar Supabase**

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Obtén las credenciales (URL, Anon Key, Service Role Key)
3. Edita `/utils/supabase/info.tsx`:

```typescript
export const projectId = 'TU_PROJECT_ID';
export const publicAnonKey = 'TU_ANON_KEY';
```

#### **Paso 2: Crear tabla en PostgreSQL**

En Supabase Dashboard → **SQL Editor**, ejecuta:

```sql
CREATE TABLE IF NOT EXISTS kv_store_6c4ea2d2 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix 
ON kv_store_6c4ea2d2 (key text_pattern_ops);

ALTER TABLE kv_store_6c4ea2d2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON kv_store_6c4ea2d2
FOR ALL USING (true) WITH CHECK (true);
```

#### **Paso 3: Desplegar Edge Function**

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

Esto creará automáticamente los usuarios en Supabase Auth.

---

## 🆚 COMPARACIÓN DE MÉTODOS

| Método | Configuración | Velocidad | Persistencia | Producción |
|--------|--------------|-----------|--------------|------------|
| **Modo Demo** | ✅ Ninguna | ⚡⚡ 1 click | 💾 localStorage | ⚠️ Solo pruebas |
| **Credenciales Locales** | ✅ Ninguna | ⚡ Instantáneo | 💾 localStorage | ⚠️ No recomendado |
| **Supabase Auth** | ⚙️ Requiere setup | 🐌 ~5 min | 🗄️ PostgreSQL | ✅ Recomendado |

---

## ❌ SI VES ERROR "Invalid login credentials"

**Solución Inmediata:**

1. **Usa modo demo:**
   - Click en icono **🛡️ Escudo** (Admin)
   - Click en icono **📖 Libro** (Lector)
   - ✅ Entras inmediatamente

2. **O verifica las credenciales locales:**
   - Email: `admin@netadmin.com`
   - Password: `admin123`
   - (Sin espacios extra, minúsculas correctas)

---

## 🔍 ¿CÓMO FUNCIONA EL SISTEMA DE AUTENTICACIÓN?

### **Flujo de Login (V13):**

```
1. Usuario ingresa email/password
     ↓
2. ¿Coincide con usuarios locales?
     ├─ ✅ SÍ → Login local exitoso
     │         (admin@, lector@, juan.rey@)
     │
     └─ ❌ NO → Intenta Supabase Auth
               ├─ ✅ Existe → Login con Supabase
               └─ ❌ No existe → Error: "Credenciales incorrectas"
```

### **Usuarios Locales (Integrados en el código):**

Ubicación: `/contexts/AuthContext.tsx`

```typescript
const LOCAL_USERS = [
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
```

---

## 🎓 CASOS DE USO RECOMENDADOS

### **🧪 Para Desarrollo y Pruebas:**
→ Usa **Modo Demo** (iconos 🛡️ y 📖)
- Un solo click para entrar
- No necesitas recordar credenciales
- Ideal para desarrollo rápido

### **🎬 Para Demostraciones:**
→ Usa **Modo Demo** (iconos 🛡️ y 📖)
- Acceso inmediato
- Impresiona a tu audiencia
- Sin formularios que llenar

### **🏢 Para Producción:**
→ Usa **Supabase Auth**
- Base de datos PostgreSQL real
- Usuarios persistentes
- Multi-dispositivo
- Escalable

---

## 📋 CHECKLIST DE VERIFICACIÓN

**Si tienes problemas, verifica:**

- [ ] ✅ Node.js instalado (`node --version`)
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Servidor corriendo (`npm run dev`)
- [ ] ✅ Puerto 5173 accesible (`http://localhost:5173`)
- [ ] ✅ Navegador actualizado (Chrome, Firefox, Edge)
- [ ] ✅ No estás en modo incógnito (para localStorage)

**Para login con credenciales:**

- [ ] ✅ Email correcto: `admin@netadmin.com`
- [ ] ✅ Password correcto: `admin123`
- [ ] ✅ No hay espacios extra al copiar/pegar
- [ ] ✅ Mayúsculas/minúsculas correctas

---

## 🎯 RESUMEN EJECUTIVO

### **¿Quieres empezar YA?**

```bash
npm run dev
```

**Opción A (Más rápido):**
1. Click en icono 🛡️ Escudo
2. ✅ ¡Listo!

**Opción B (Con credenciales):**
1. Email: `admin@netadmin.com`
2. Password: `admin123`
3. Click en "Iniciar Sesión"
4. ✅ ¡Listo!

---

## 📞 SOPORTE

Si NINGUNO de los métodos funciona:

1. **Verifica la consola del navegador** (F12 → Console)
2. **Busca errores de JavaScript**
3. **Reinicia el servidor** (`Ctrl+C` → `npm run dev`)
4. **Limpia caché del navegador** (`Ctrl+Shift+Delete`)
5. **Intenta en modo incógnito** (para descartar extensiones)

**Si aún así no funciona:**
- Revisa que estés en la versión V13
- Verifica que `AuthContext.tsx` tenga el array `LOCAL_USERS`
- Verifica que `Login.tsx` tenga los iconos de modo demo

---

## ✅ ESTADO ACTUAL: SISTEMA FUNCIONANDO

❌ **ANTES (V12):**
- Error "Invalid login credentials"
- Usuarios no existían en Supabase
- Requería configuración manual
- Confusión para nuevos usuarios

✅ **AHORA (V13):**
- ✅ Usuarios locales integrados
- ✅ Modo demo con iconos
- ✅ Funciona sin configuración
- ✅ 2 métodos de acceso simples
- ✅ Sin mostrar credenciales en pantalla (seguridad)

---

**© 2024 NetAdmin V13 - Sistema con Autenticación Local y Modo Demo**