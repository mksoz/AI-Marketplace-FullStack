# AI Dev Connect - Documentación Técnica y Funcional

## 1. Visión General del Proyecto
**AI Dev Connect** es una plataforma B2B de vanguardia diseñada para conectar empresas que requieren soluciones de Inteligencia Artificial (Clientes) con agencias y desarrolladores especializados (Vendors). La plataforma actúa como un intermediario de confianza, gestionando desde el descubrimiento y la contratación hasta la gestión de proyectos y pagos seguros (Escrow).

### Roles de Usuario
- **Cliente**: Empresa que busca contratar servicios de desarrollo de IA.
- **Vendor (Proveedor)**: Agencia o desarrollador que ofrece servicios de IA.
- **Administrador**: Superusuario que supervisa la plataforma, usuarios y disputas.

---

## 2. Arquitectura Técnica

### Stack Tecnológico
El proyecto está construido como una **Single Page Application (SPA)** moderna, utilizando las últimas tecnologías del ecosistema React.

*   **Core Framework**: [React 19](https://react.dev/) - Biblioteca principal para la interfaz de usuario.
*   **Build Tool**: [Vite](https://vitejs.dev/) - Entorno de desarrollo ultrarrápido y empaquetador para producción.
*   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) - Para mayor robustez y tipado estático.
*   **Enrutamiento**: `react-router-dom` (v6) - Gestión de navegación y rutas protegidas.
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/) - Cargado vía CDN para prototipado rápido y diseño responsivo.
*   **Integración IA**: `Google Gemini API` - Potencia el chat de soporte, el "match" inteligente de proveedores y el análisis de disputas.
*   **Iconografía**: Google Material Symbols & Fonts.

### Gestión de Estado y Datos
*   **Estado Local**: Hooks de React (`useState`, `useEffect`).
*   **Persistencia**: El proyecto utiliza `localStorage` para simular una base de datos persistente (Usuarios, Sesiones, Proyectos). Esto permite probar la aplicación completa sin necesidad de un backend real configurado.
*   **Simulación (Mocking)**: Los datos iniciales y la lógica de negocio compleja (como transacciones financieras) están simulados en el frontend para facilitar demostraciones y desarrollo.

---

## 3. Guía Funcional por Módulos

### 3.1 Módulo Público (Landing & Discovery)
Accesible para visitantes no autenticados.
*   **Home**: Landing page con buscador estilo "Airbnb" y explicación visual del flujo de trabajo.
*   **Buscador (Search)**: Motor de búsqueda con filtros por industria y tamaño de equipo. Incluye un asistente de IA lateral para recomendar vendors.
*   **Perfil de Empresa**: Vista detallada de los vendors (Portafolio, valoraciones, equipo).
*   **Login/Registro**: Sistema de autenticación simulado. Soporta registro diferenciado para Clientes y Vendors (con wizard de onboarding).

### 3.2 Módulo de Cliente (/client)
Panel de control para las empresas compradoras.
*   **Dashboard**: Resumen de métricas, proyectos activos y estado financiero.
*   **Gestión de Proyectos**: Línea de tiempo interactiva para visualizar hitos del proyecto.
*   **Finanzas (Escrow)**: Sistema de depósito y liberación de fondos. El cliente deposita el dinero, que queda bloqueado (Escrow) hasta que aprueba los entregables del vendor.
*   **Revisión de Hitos**: Interfaz crítica donde el cliente aprueba o rechaza el trabajo entregado para liberar el pago.

### 3.3 Módulo de Vendor (/vendor)
Panel para agencias y desarrolladores.
*   **Pipeline de Ventas (Kanban)**: Tablero visual para gestionar leads y propuestas. Incluye un "Match Score" calculado por IA.
*   **Editor de Plantillas**: Herramienta "Drag & Drop" para crear formularios de requerimientos personalizados.
*   **Finanzas**: Control de ingresos, facturación y retiros disponibles.

### 3.4 Módulo de Administrador (/admin)
Panel de supervisión global.
*   **Dashboard de Salud**: Métricas técnicas (Latencia API, Errores) y de negocio.
*   **Resolución de Disputas**: Sistema asistido por IA que analiza contratos y evidencias para sugerir veredictos (Reembolso vs. Pago).
*   **Gestión de Usuarios**: ABM (Alta, Baja, Modificación) de usuarios con capacidad de aprobar nuevos vendors manualmente.

### 3.5 Mejoras de Experiencia Móvil (Responsive UX)
El sistema ha sido optimizado para dispositivos móviles y tabletas:
*   **Navegación Móvil**: Menú lateral adaptable ("Hamburger Menu") y barras de navegación inferiores/superiores adhesivas.
*   **Chat Optimizado**:
    *   **Vista Master-Detail**: En móviles, la lista de chats y la conversación se muestran en vistas separadas para maximizar el espacio.
    *   **Widget Flotante**: El asistente de IA es arrastrable (limitado al margen izquierdo para evitar bloqueos) y se ajusta verticalmente para no cortar el contenido.
*   **Gestión de Archivos Touch**: La navegación por carpetas soporta "Single Tap" en móviles en lugar del doble clic de escritorio.
*   **Modales Responsivos**: Las fichas de empresas y detalles se abren como "hojas inferiores" o modales completos en pantallas pequeñas.

---

## 4. Estructura del Proyecto

```
/src
  ├── components/       # Componentes reutilizables (Botones, Layouts, Headers)
  ├── pages/            # Vistas principales de la aplicación
  │   ├── client/       # Páginas específicas del rol Cliente
  │   ├── vendor/       # Páginas específicas del rol Vendor
  │   └── admin/        # Páginas específicas del rol Admin
  ├── services/         # Integraciones externas (ej. geminiService.ts)
  ├── constants.ts      # Datos simulados (Mock Data) y configuraciones
  ├── types.ts          # Definiciones de tipos TypeScript compartidos
  ├── App.tsx           # Configuración de Rutas y Navegación
  └── main.tsx          # Punto de entrada de la aplicación
```

---

## 5. Guía de Instalación y Despliegue Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local.

### Prerrequisitos
*   **Node.js**: Versión 18 o superior.
*   **npm**: Gestor de paquetes (incluido con Node.js).

### Pasos de Instalación

1.  **Clonar/Descargar el código**
    (Asumiendo que ya tienes los archivos en tu carpeta de trabajo).

2.  **Instalar Dependencias**
    Ejecuta el siguiente comando en la raíz del proyecto para descargar las librerías necesarias:
    ```bash
    npm install
    ```

3.  **Configuración de Entorno (Opcional)**
    El proyecto funciona, por defecto, con respuestas simuladas de IA. Si deseas conectarlo con la API real de Google Gemini:
    *   Crea un archivo `.env` en la raíz.
    *   Agrega tu clave: `GEMINI_API_KEY=tu_api_key_aqui`.

### Ejecutar en Desarrollo (Recomendado)
Para iniciar el servidor de desarrollo con recarga en caliente (HMR):
```bash
npm run dev
```
*   Abre tu navegador en: `http://localhost:3000`

### Compilar y Desplegar (Modo Producción)
Para verificar cómo se comportará la aplicación optimizada para producción:

1.  **Construir el proyecto (Build)**:
    ```bash
    npm run build
    ```
    *Esto generará una carpeta `dist/` con los archivos estáticos optimizados.*

2.  **Previsualizar el despliegue**:
    ```bash
    npm run preview
    ```
    *   La aplicación se servirá generalmente en: `http://localhost:4173`

### Solución de Problemas Comunes

*   **Pantalla en Blanco (White Screen)**:
    Si al iniciar ves una pantalla blanca, verifica que el archivo `index.html` contenga `<div id="root"></div>` dentro del `<body>`. Este es el punto de montaje de React.

*   **Estilos rotos**:
    Asegúrate de tener conexión a internet, ya que Tailwind CSS y las fuentes se cargan desde CDNs externos.

## 6. Guía de Despliegue en Vercel (Producción)
Para subir tu proyecto a la nube y que los agentes de IA funcionen:

1.  **Sube tu código a GitHub**. Asegúrate de que el archivo `.env` **NO** se suba (esto ya está configurado en `.gitignore`).
2.  Ve a [Vercel](https://vercel.com) e importa tu repositorio.
3.  En la pantalla de configuración del proyecto ("Configure Project"):
    *   Despliega la sección **Environment Variables**.
    *   **Key**: `GEMINI_API_KEY`
    *   **Value**: Pega tu clave real de Google Gemini (la misma que tienes en tu .env local).
4.  Haz clic en **Deploy**. Vercel construirá el proyecto y te dará una URL pública segura (`https://tu-proyecto.vercel.app`).

