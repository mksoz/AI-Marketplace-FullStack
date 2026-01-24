# Guía de Despliegue en Vercel - AI Marketplace

Esta guía te llevará paso a paso para desplegar tu aplicación AI Marketplace completa (frontend + backend) en Vercel.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta en [Vercel](https://vercel.com) (gratis)
- [ ] Base de datos PostgreSQL en la nube configurada
- [ ] Código fuente en GitHub/GitLab (opcional pero recomendado)
- [ ] Variables de entorno preparadas

---

## 🗄️ Paso 1: Configurar Base de Datos PostgreSQL

Tu aplicación necesita una base de datos PostgreSQL. Aquí tienes 3 opciones gratuitas:

### Opción A: Vercel Postgres (Recomendado - Integración Nativa)

1. Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard)
2. Click en "Storage" → "Create Database"
3. Selecciona "Postgres" y sigue el wizard
4. **Copia la `DATABASE_URL`** que te proporciona

### Opción B: Neon (Serverless Postgres Gratis)

1. Crea cuenta en [Neon](https://neon.tech/)
2. Crea un nuevo proyecto
3. En la pestaña "Connection Details", copia la **Connection String**
4. Úsala como `DATABASE_URL`

### Opción C: Supabase

1. Crea cuenta en [Supabase](https://supabase.com/)
2. Crea un nuevo proyecto
3. Ve a Settings → Database → Connection String
4. Copia la string en modo "URI" y úsala como `DATABASE_URL`

**⚠️ Importante**: Guarda tu `DATABASE_URL`, la necesitarás en el siguiente paso.

---

## 🔐 Paso 2: Generar JWT Secret

Para producción, necesitas un JWT Secret seguro y aleatorio.

**En tu terminal local**, ejecuta:

```bash
openssl rand -base64 64
```

**Guarda el resultado**, lo usarás como `JWT_SECRET` en Vercel.

---

## 🚀 Paso 3: Desplegar Backend

### 3.1 Crear Proyecto de Backend en Vercel

1. Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard)
2. Click en **"Add New Project"**
3. **Importa tu repositorio** o sube la carpeta `/backend` localmente

### 3.2 Configurar el Proyecto

Durante la configuración:

- **Framework Preset**: Selecciona "Other" o "Node.js"
- **Root Directory**: Cambia a `backend` (si desplegaste el repo completo)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Configurar Variables de Entorno

Click en **"Environment Variables"** y añade:

| Variable | Valor | Ejemplo |
|---------|-------|---------|
| `DATABASE_URL` | Tu connection string de PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Igual que DATABASE_URL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | El secreto generado en Paso 2 | `tu_secreto_base64_aqui` |
| `NODE_ENV` | `production` | `production` |
| `FRONTEND_URL` | Déjalo vacío por ahora, lo actualizaremos después | (vacío) |

> **Nota**: La variable `FRONTEND_URL` la configuraremos después de desplegar el frontend

### 3.4 Desplegar

1. Click en **"Deploy"**
2. Espera a que termine el build (2-5 minutos)
3. **Copia la URL de tu backend** (ejemplo: `https://your-backend-abc123.vercel.app`)

### 3.5 Ejecutar Migraciones de Base de Datos

**Importante**: Necesitas aplicar el schema de Prisma a tu base de datos nueva.

**Opción 1 - Desde tu máquina local**:

```bash
cd backend

# Configura temporalmente tu DATABASE_URL local
export DATABASE_URL="tu_database_url_de_produccion"

# Ejecuta las migraciones
npx prisma migrate deploy

# O si prefieres solo sincronizar el schema (desarrollo)
npx prisma db push
```

**Opción 2 - Script SQL directo** (si tu proveedor lo permite):

Genera el SQL desde tu schema:

```bash
cd backend
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
```

Luego ejecuta ese SQL en tu base de datos de producción.

### 3.6 Verificar Backend

Visita `https://your-backend-abc123.vercel.app/health`

Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "..."
}
```

✅ **¡Backend desplegado con éxito!**

---

## 🎨 Paso 4: Desplegar Frontend

### 4.1 Crear Proyecto de Frontend en Vercel

1. Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard)
2. Click en **"Add New Project"**
3. **Importa tu repositorio** (si es el mismo, Vercel detectará que quieres crear otro proyecto)
   - O sube la carpeta raíz localmente

### 4.2 Configurar el Proyecto

Durante la configuración:

- **Framework Preset**: Debería detectar "Vite" automáticamente
- **Root Directory**: Déjalo en la raíz (`.`) si tu frontend está en root
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4.3 Configurar Variables de Entorno

Click en **"Environment Variables"** y añade:

| Variable | Valor | Ejemplo |
|---------|-------|---------|
| `VITE_API_URL` | **URL de tu backend** del Paso 3.4 | `https://your-backend-abc123.vercel.app` |
| `VITE_GEMINI_API_KEY` | Tu API Key de Google Gemini (opcional) | `AIza...` |

> **Importante**: Asegúrate de copiar la URL del backend **sin el `/api`** al final. Por ejemplo: `https://your-backend.vercel.app` (no `https://your-backend.vercel.app/api`)

### 4.4 Desplegar

1. Click en **"Deploy"**
2. Espera a que termine el build (1-3 minutos)
3. **Copia la URL de tu frontend** (ejemplo: `https://your-frontend-xyz789.vercel.app`)

✅ **¡Frontend desplegado con éxito!**

---

## 🔁 Paso 5: Actualizar CORS en Backend

Ahora que tienes la URL del frontend, necesitas configurarla en el backend para permitir CORS.

1. Ve al **proyecto de backend** en Vercel
2. Ve a **Settings** → **Environment Variables**
3. **Encuentra `FRONTEND_URL`** y edítala
4. **Cambia el valor** a la URL de tu frontend: `https://your-frontend-xyz789.vercel.app`
5. **Guarda** el cambio
6. Ve a **Deployments** y click en **"Redeploy"** en el último deployment

Espera 1-2 minutos a que se complete el re-despliegue.

---

## ✅ Paso 6: Verificación Final

### 6.1 Probar la Conexión

1. Abre tu frontend: `https://your-frontend-xyz789.vercel.app`
2. Intenta **registrarte** o **iniciar sesión**
3. Verifica que la autenticación funcione correctamente

### 6.2 Verificar en DevTools

Abre las DevTools del navegador (F12):

- **Console**: No deberías ver errores de CORS
- **Network**: Las peticiones a `/api` deberían ir a tu backend de Vercel y devolver 200 OK

### 6.3 Checklis de Verificación

- [ ] Frontend carga correctamente
- [ ] No hay errores de CORS en consola
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Dashboard del usuario carga
- [ ] Las imágenes/assets cargan correctamente

---

## 🎉 ¡Listo!

Tu aplicación AI Marketplace está completamente desplegada en Vercel.

### URLs Finales

- **Frontend**: `https://your-frontend-xyz789.vercel.app`
- **Backend API**: `https://your-backend-abc123.vercel.app/api`
- **Health Check**: `https://your-backend-abc123.vercel.app/health`

---

## 🔧 Troubleshooting Común

### Error: "Network Error" o "Failed to fetch"

**Causa**: El frontend no puede conectar con el backend.

**Solución**:
1. Verifica que `VITE_API_URL` en el frontend esté configurada correctamente
2. Asegúrate de que `FRONTEND_URL` en el backend esté configurada
3. Re-despliega ambos proyectos

### Error: "CORS blocked"

**Causa**: `FRONTEND_URL` no está configurada en el backend o es incorrecta.

**Solución**:
1. Ve a Settings → Environment Variables en el backend
2. Verifica que `FRONTEND_URL` sea exactamente la URL de tu frontend (sin trailing slash)
3. Re-despliega el backend

### Error: "Cannot connect to database"

**Causa**: `DATABASE_URL` no está configurada o es incorrecta.

**Solución**:
1. Verifica que `DATABASE_URL` esté en las variables de entorno del backend
2. Verifica que la connection string sea correcta
3. Asegúrate de que la base de datos esté activa y accesible desde internet

### Error: "Prisma Client not generated"

**Causa**: El build no generó el cliente de Prisma correctamente.

**Solución**:
1. Asegúrate de que el `package.json` del backend tenga:
   ```json
   "scripts": {
     "vercel-build": "prisma generate && tsc"
   }
   ```
2. Re-despliega el backend

### Las migraciones no se aplicaron

**Causa**: La base de datos está vacía, no tiene las tablas.

**Solución**:
Ejecuta desde tu máquina local:
```bash
cd backend
export DATABASE_URL="tu_production_database_url"
npx prisma db push
```

O desde Vercel CLI:
```bash
vercel env pull
cd backend
npx prisma db push
```

---

## 🚀 Siguientes Pasos

### 1. Configurar Dominio Personalizado (Opcional)

En cada proyecto de Vercel:
1. Ve a **Settings** → **Domains**
2. Añade tu dominio personalizado (ej: `app.tudominio.com` para frontend)
3. Sigue las instrucciones para configurar DNS

### 2. Monitorear tu Aplicación

- **Logs**: Ve a cada proyecto → **Deployments** → Click en un deployment → **Logs**
- **Analytics**: Vercel proporciona analytics básicos gratis
- **Errors**: Configura integraciones con Sentry para tracking de errores

### 3. Configurar Despliegue Automático

Si conectaste desde GitHub:
- Cada push a `main` desplegará automáticamente
- Los PRs crearán preview deployments

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Prisma con Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vite con Vercel](https://vitejs.dev/guide/static-deploy.html#vercel)

---

## 💡 Consejos de Producción

1. **Monitorea el uso de tu base de datos**: Las versiones gratuitas tienen límites
2. **Configura backups**: Especialmente si usas Neon o Supabase
3. **Revisa los logs regularmente**: Para detectar errores temprano
4. **Usa variables de entorno**: Nunca hardcodees secrets en el código
5. **Configura rate limiting**: Para proteger tu API (próxima mejora)

---

¿Necesitas ayuda? Revisa la sección de Troubleshooting o consulta los logs de Vercel.
