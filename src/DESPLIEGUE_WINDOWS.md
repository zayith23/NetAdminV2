# 🖥️ GUÍA DE DESPLIEGUE EN WINDOWS SERVER
## NetAdmin - Servidor IP: 10.3.106.108

Esta guía te ayudará a desplegar NetAdmin en tu servidor Windows Server con IP `10.3.106.108`.

---

## 📋 TABLA DE CONTENIDOS

1. [Requisitos Previos](#requisitos-previos)
2. [Opción 1: IIS (Internet Information Services)](#opción-1-iis-recomendado)
3. [Opción 2: Node.js con PM2](#opción-2-nodejs-con-pm2)
4. [Configuración de Firewall](#configuración-de-firewall)
5. [Configuración de Base de Datos](#configuración-de-base-de-datos)
6. [Verificación del Despliegue](#verificación-del-despliegue)
7. [Troubleshooting](#troubleshooting)

---

## 📦 REQUISITOS PREVIOS

### Software necesario en Windows Server (10.3.106.108):

1. **Windows Server** (2012 R2 o superior)
2. **Node.js 18.x o superior** → [Descargar](https://nodejs.org/)
3. **Git para Windows** → [Descargar](https://git-scm.com/download/win)
4. **IIS (Internet Information Services)** - Incluido en Windows Server
5. **URL Rewrite Module para IIS** → [Descargar](https://www.iis.net/downloads/microsoft/url-rewrite)

### Verificar versiones:

Abre **PowerShell** como Administrador y ejecuta:

```powershell
# Verificar Node.js
node --version
# Debe mostrar: v18.0.0 o superior

# Verificar npm
npm --version
# Debe mostrar: 8.0.0 o superior

# Verificar Git
git --version
# Debe mostrar: git version 2.x.x
```

---

## 🚀 OPCIÓN 1: IIS (Internet Information Services) - RECOMENDADO

Esta es la opción más común y estable para Windows Server.

### **PASO 1: Instalar IIS y módulos necesarios**

1. **Abrir "Administrador del Servidor"**
2. Click en **"Agregar roles y características"**
3. Seleccionar **"Servidor Web (IIS)"**
4. En "Características", asegúrate de seleccionar:
   - ✅ Servidor Web
   - ✅ Administración de IIS
   - ✅ ASP.NET 4.8 (o superior)
5. Click **"Instalar"**

### **PASO 2: Instalar URL Rewrite Module**

1. Descargar: https://www.iis.net/downloads/microsoft/url-rewrite
2. Ejecutar el instalador `rewrite_amd64_en-US.msi`
3. Reiniciar IIS:

```powershell
iisreset
```

### **PASO 3: Preparar la aplicación**

#### 3.1. Clonar el repositorio

Abre **PowerShell** como Administrador:

```powershell
# Crear carpeta para la aplicación
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\netadmin" -Force

# Ir a la carpeta
cd C:\inetpub\wwwroot\netadmin

# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO> .

# O si ya tienes el código, cópialo a esta carpeta
```

#### 3.2. Instalar dependencias y compilar

```powershell
# Instalar dependencias
npm install

# Compilar para producción
npm run build
```

Esto creará una carpeta `/dist` con los archivos optimizados.

#### 3.3. Mover archivos al directorio de IIS

```powershell
# Crear carpeta final en IIS
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\netadmin-prod" -Force

# Copiar archivos compilados
Copy-Item -Path "C:\inetpub\wwwroot\netadmin\dist\*" -Destination "C:\inetpub\wwwroot\netadmin-prod\" -Recurse -Force
```

### **PASO 4: Configurar sitio en IIS**

#### 4.1. Abrir IIS Manager

1. Presiona **Win + R**
2. Escribe: `inetmgr`
3. Presiona Enter

#### 4.2. Crear nuevo sitio web

1. En el panel izquierdo, expande tu servidor
2. Click derecho en **"Sites"** → **"Add Website"**
3. Llena los campos:

```
Site name: NetAdmin
Physical path: C:\inetpub\wwwroot\netadmin-prod
Binding:
  - Type: http
  - IP address: 10.3.106.108
  - Port: 80
  - Host name: (dejar vacío)
```

4. Click **"OK"**

#### 4.3. Configurar Application Pool

1. En IIS Manager, ve a **"Application Pools"**
2. Busca **"NetAdmin"**
3. Click derecho → **"Advanced Settings"**
4. Cambia:

```
.NET CLR Version: No Managed Code
Start Mode: AlwaysRunning
```

5. Click **"OK"**

### **PASO 5: Crear archivo web.config**

En la carpeta `C:\inetpub\wwwroot\netadmin-prod\`, crea un archivo llamado **`web.config`** con este contenido:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
    <httpProtocol>
      <customHeaders>
        <add name="Cache-Control" value="no-cache, no-store, must-revalidate" />
        <add name="Pragma" value="no-cache" />
        <add name="Expires" value="0" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

### **PASO 6: Configurar permisos**

En **PowerShell** como Administrador:

```powershell
# Dar permisos al usuario de IIS
icacls "C:\inetpub\wwwroot\netadmin-prod" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\wwwroot\netadmin-prod" /grant "IUSR:(OI)(CI)F" /T
```

### **PASO 7: Iniciar el sitio**

1. En IIS Manager, selecciona **"NetAdmin"** en Sites
2. Click derecho → **"Manage Website"** → **"Start"**

---

## 🚀 OPCIÓN 2: NODE.JS CON PM2 (Alternativa)

Si prefieres servir la aplicación directamente con Node.js:

### **PASO 1: Instalar PM2 globalmente**

```powershell
npm install -g pm2
npm install -g pm2-windows-service
```

### **PASO 2: Crear servidor de producción**

En la raíz del proyecto, crea un archivo **`server.js`**:

```javascript
const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 80;

// Servir archivos estáticos de la carpeta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Todas las rutas devuelven index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ NetAdmin corriendo en http://10.3.106.108:${PORT}`);
});
```

### **PASO 3: Instalar express**

```powershell
npm install express --save
```

### **PASO 4: Compilar la aplicación**

```powershell
npm run build
```

### **PASO 5: Iniciar con PM2**

```powershell
# Iniciar la aplicación
pm2 start server.js --name "netadmin"

# Configurar para que inicie automáticamente
pm2 startup
pm2 save

# Instalar como servicio de Windows
pm2-service-install
```

### **PASO 6: Gestionar la aplicación**

```powershell
# Ver estado
pm2 status

# Ver logs
pm2 logs netadmin

# Reiniciar
pm2 restart netadmin

# Detener
pm2 stop netadmin

# Ver información
pm2 info netadmin
```

---

## 🔥 CONFIGURACIÓN DE FIREWALL

Para que la aplicación sea accesible desde otros equipos en la red:

### **Opción A: Mediante interfaz gráfica**

1. Abre **"Firewall de Windows Defender con seguridad avanzada"**
2. Click en **"Reglas de entrada"** (Inbound Rules)
3. Click en **"Nueva regla..."** (New Rule)
4. Selecciona **"Puerto"** → Siguiente
5. Selecciona **"TCP"** y específica puerto **80** (y **443** si usas HTTPS)
6. Selecciona **"Permitir la conexión"**
7. Aplica a: Dominio, Privado, Público (todos)
8. Nombre: **"NetAdmin HTTP"**
9. Click **"Finalizar"**

### **Opción B: Mediante PowerShell**

Ejecuta como Administrador:

```powershell
# Permitir tráfico HTTP (puerto 80)
New-NetFirewallRule -DisplayName "NetAdmin HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Si usas HTTPS (puerto 443)
New-NetFirewallRule -DisplayName "NetAdmin HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Verificar reglas creadas
Get-NetFirewallRule -DisplayName "NetAdmin*"
```

---

## 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### **Configurar conexión a Supabase**

1. **Edita el archivo** `C:\inetpub\wwwroot\netadmin-prod\assets\index-*.js` (busca el archivo generado)

   O mejor, edita antes de compilar el archivo `/utils/supabase/info.tsx`:

```typescript
export const projectId = 'yrvfphlbikhiaysqjanh';  // Tu project ID
export const publicAnonKey = 'TU_ANON_KEY_AQUI';
```

2. **Recompila:**

```powershell
cd C:\inetpub\wwwroot\netadmin
npm run build
Copy-Item -Path "dist\*" -Destination "C:\inetpub\wwwroot\netadmin-prod\" -Recurse -Force
```

### **Configurar variables de entorno en Supabase**

1. Ve a tu proyecto Supabase: https://supabase.com
2. **Edge Functions** → **Settings** → **Secrets**
3. Agrega:

```
SUPABASE_URL = https://yrvfphlbikhiaysqjanh.supabase.co
SUPABASE_ANON_KEY = [tu_anon_key]
SUPABASE_SERVICE_ROLE_KEY = [tu_service_role_key]
```

### **Desplegar Edge Functions (Crear usuarios automáticamente)**

```powershell
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref yrvfphlbikhiaysqjanh

# Desplegar
supabase functions deploy make-server-6c4ea2d2
```

Esto creará automáticamente los usuarios:
- `admin@netadmin.com` / `admin123`
- `lector@netadmin.com` / `lector123`
- `juan.rey@netadmin.com` / `juanrey123`

---

## ✅ VERIFICACIÓN DEL DESPLIEGUE

### **1. Desde el mismo servidor (10.3.106.108)**

Abre el navegador y ve a:
- `http://localhost`
- `http://10.3.106.108`

### **2. Desde otro equipo en la red**

Abre el navegador y ve a:
- `http://10.3.106.108`

### **3. Verificar que funciona correctamente**

✅ **Si ves la pantalla de login** → ¡Funcionó!
- Haz click en el icono Escudo (modo demo Admin)
- Deberías ver el Dashboard

✅ **Si puedes navegar entre módulos** → ¡Perfecto!
- Dashboard
- Hoja de Vida
- Inventario
- Switch
- VLAN
- Mantenimiento
- Configuración

### **4. Verificar logs**

#### Con IIS:

```powershell
# Ver logs de IIS
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\*.log" -Tail 50
```

#### Con PM2:

```powershell
pm2 logs netadmin
```

---

## 🔧 TROUBLESHOOTING

### **Problema 1: No puedo acceder desde otros equipos**

**Causa:** Firewall bloqueando el puerto 80

**Solución:**

```powershell
# Verificar si el puerto está bloqueado
Test-NetConnection -ComputerName 10.3.106.108 -Port 80

# Si falla, agregar regla de firewall (ver sección anterior)
New-NetFirewallRule -DisplayName "NetAdmin HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

---

### **Problema 2: Página en blanco o "Cannot GET /"**

**Causa:** Falta el archivo `web.config` o configuración de rewrite

**Solución:**

1. Verifica que existe `C:\inetpub\wwwroot\netadmin-prod\web.config`
2. Verifica que **URL Rewrite Module** esté instalado
3. Reinicia IIS:

```powershell
iisreset
```

---

### **Problema 3: Error 403 - Forbidden**

**Causa:** Permisos incorrectos

**Solución:**

```powershell
# Dar permisos completos
icacls "C:\inetpub\wwwroot\netadmin-prod" /grant "Everyone:(OI)(CI)F" /T

# Reiniciar IIS
iisreset
```

---

### **Problema 4: Los cambios no se reflejan**

**Causa:** Caché del navegador o IIS

**Solución:**

```powershell
# Limpiar caché de IIS
Remove-Item "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Temporary ASP.NET Files\*" -Recurse -Force

# Reiniciar IIS
iisreset
```

En el navegador: `Ctrl + Shift + R` (forzar recarga)

---

### **Problema 5: "Invalid login credentials"**

**Causa:** Los usuarios no existen en Supabase Auth

**Solución 1 - Usar modo demo:**
- En el login, NO llenes el formulario
- Click en icono Escudo (Admin) o Libro (Lector)

**Solución 2 - Desplegar Edge Function:**

```powershell
supabase functions deploy make-server-6c4ea2d2
```

Esto crea los usuarios automáticamente.

---

### **Problema 6: Error al compilar (npm run build)**

**Causa:** Falta de memoria o dependencias

**Solución:**

```powershell
# Limpiar caché
npm cache clean --force
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force

# Reinstalar
npm install

# Compilar con más memoria
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## 📊 MONITOREO Y MANTENIMIENTO

### **Ver estado del sitio (IIS)**

```powershell
# Estado de sitios IIS
Get-IISSite

# Estado específico de NetAdmin
Get-IISSite -Name "NetAdmin"

# Ver bindings
Get-IISSite -Name "NetAdmin" | Select-Object -ExpandProperty Bindings
```

### **Ver estado del servicio (PM2)**

```powershell
pm2 status
pm2 monit
pm2 logs netadmin --lines 100
```

### **Actualizar la aplicación**

```powershell
# Ir a la carpeta del código fuente
cd C:\inetpub\wwwroot\netadmin

# Pull últimos cambios
git pull origin main

# Reinstalar dependencias (si hubo cambios)
npm install

# Recompilar
npm run build

# Copiar archivos actualizados
Copy-Item -Path "dist\*" -Destination "C:\inetpub\wwwroot\netadmin-prod\" -Recurse -Force

# Reiniciar IIS
iisreset

# O si usas PM2
pm2 restart netadmin
```

---

## 🔐 CONFIGURAR HTTPS (OPCIONAL PERO RECOMENDADO)

### **PASO 1: Obtener certificado SSL**

Opciones:
- **Let's Encrypt** (gratis): Usar win-acme → https://www.win-acme.com/
- **Certificado interno** (dominio local): Generar con PowerShell
- **Certificado comercial**: Comprar y descargar

### **PASO 2: Importar certificado en Windows**

```powershell
# Importar certificado .pfx
$certPassword = ConvertTo-SecureString -String "tu_password" -Force -AsPlainText
Import-PfxCertificate -FilePath "C:\ruta\certificado.pfx" -CertStoreLocation Cert:\LocalMachine\My -Password $certPassword
```

### **PASO 3: Configurar binding HTTPS en IIS**

1. Abre **IIS Manager**
2. Selecciona el sitio **"NetAdmin"**
3. Click derecho → **"Edit Bindings"**
4. Click **"Add"**
5. Configura:

```
Type: https
IP address: 10.3.106.108
Port: 443
SSL certificate: [Selecciona tu certificado]
```

6. Click **"OK"**

### **PASO 4: Redirigir HTTP a HTTPS**

Edita `web.config`:

```xml
<rewrite>
  <rules>
    <!-- Redirigir HTTP a HTTPS -->
    <rule name="HTTP to HTTPS redirect" stopProcessing="true">
      <match url="(.*)" />
      <conditions>
        <add input="{HTTPS}" pattern="off" ignoreCase="true" />
      </conditions>
      <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
    </rule>
    
    <!-- Regla existente de React Routes -->
    <rule name="React Routes" stopProcessing="true">
      <match url=".*" />
      <conditions logicalGrouping="MatchAll">
        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
      </conditions>
      <action type="Rewrite" url="/" />
    </rule>
  </rules>
</rewrite>
```

### **PASO 5: Abrir puerto 443 en firewall**

```powershell
New-NetFirewallRule -DisplayName "NetAdmin HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## 📞 COMANDOS ÚTILES DE REFERENCIA RÁPIDA

```powershell
# ============================================
# IIS
# ============================================

# Ver sitios
Get-IISSite

# Iniciar sitio
Start-IISSite -Name "NetAdmin"

# Detener sitio
Stop-IISSite -Name "NetAdmin"

# Reiniciar IIS
iisreset

# Ver logs
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\*.log" -Tail 50

# ============================================
# PM2
# ============================================

# Iniciar
pm2 start server.js --name "netadmin"

# Estado
pm2 status

# Logs
pm2 logs netadmin

# Reiniciar
pm2 restart netadmin

# Detener
pm2 stop netadmin

# ============================================
# FIREWALL
# ============================================

# Agregar regla HTTP
New-NetFirewallRule -DisplayName "NetAdmin HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Ver reglas
Get-NetFirewallRule -DisplayName "NetAdmin*"

# Eliminar regla
Remove-NetFirewallRule -DisplayName "NetAdmin HTTP"

# ============================================
# RED
# ============================================

# Verificar puerto abierto
Test-NetConnection -ComputerName 10.3.106.108 -Port 80

# Ver IP del servidor
Get-NetIPAddress -AddressFamily IPv4

# ============================================
# ACTUALIZACIÓN
# ============================================

# Paso 1: Pull código
cd C:\inetpub\wwwroot\netadmin
git pull

# Paso 2: Compilar
npm run build

# Paso 3: Copiar
Copy-Item -Path "dist\*" -Destination "C:\inetpub\wwwroot\netadmin-prod\" -Recurse -Force

# Paso 4: Reiniciar
iisreset
```

---

## ✅ CHECKLIST DE DESPLIEGUE

Usa esta lista para verificar que todo esté configurado correctamente:

- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] IIS instalado y corriendo
- [ ] URL Rewrite Module instalado
- [ ] Código clonado en `C:\inetpub\wwwroot\netadmin`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Aplicación compilada (`npm run build`)
- [ ] Archivos copiados a `C:\inetpub\wwwroot\netadmin-prod`
- [ ] Sitio creado en IIS Manager
- [ ] Archivo `web.config` creado
- [ ] Permisos configurados
- [ ] Firewall permite puerto 80
- [ ] Sitio accesible desde `http://10.3.106.108`
- [ ] Sitio accesible desde otros equipos en la red
- [ ] Modo demo funciona (iconos de login)
- [ ] Supabase configurado (si usas autenticación real)
- [ ] Edge Functions desplegadas (si usas autenticación real)

---

## 🎉 ¡DESPLIEGUE COMPLETADO!

Si seguiste todos los pasos, NetAdmin debería estar corriendo en:

```
http://10.3.106.108
```

**Acceso desde cualquier equipo en la red interna:**
1. Abre navegador
2. Ve a `http://10.3.106.108`
3. Click en icono Escudo (modo demo Admin)
4. ¡Listo!

**Para autenticación real:**
1. Despliega Edge Functions: `supabase functions deploy make-server-6c4ea2d2`
2. Los usuarios se crean automáticamente
3. Login con: `admin@netadmin.com` / `admin123`

---

**¿Necesitas ayuda adicional?** Revisa la sección de [Troubleshooting](#troubleshooting) o los logs del servidor.

**© 2024 NetAdmin - Sistema Profesional de Gestión de Infraestructura de Red**
