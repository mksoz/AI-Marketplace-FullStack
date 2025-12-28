<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Dev Connect - Marketplace de Soluciones de IA (FullStack)

**AI Dev Connect** es una plataforma B2B diseñada para conectar empresas que requieren soluciones de Inteligencia Artificial (Clientes) con agencias y desarrolladores especializados (Vendors). La plataforma gestiona todo el ciclo de vida: desde el descubrimiento asistido por IA hasta la negociación de contratos y gestión de proyectos.

---

## 🚀 Características Principales

- **Buscador Inteligente**: Matchmaking asistido por IA (Gemini) que analiza requerimientos y recomienda los vendors más aptos.
- **Negociación de Contratos con IA**: Sistema dinámico de versiones de contrato con un asistente legal IA integrado para redactar y mejorar cláusulas.
- **Firma Digital**: Flujo completo de aprobación y firma vinculante para ambas partes.
- **Centro de Control (Dashboard)**: Paneles personalizados para Clientes, Vendors y Administradores.
- **Sistema de Pagos (Escrow)**: Simulación de depósito y liberación de fondos vinculada a hitos.
- **Chat en Tiempo Real**: Comunicación directa entre clientes y proveedores.

---

## 🛠️ Stack Tecnológico

### Frontend (Raíz)
- **Framework**: React 19 + TypeScript
- **Tooling**: Vite
- **Estilos**: Tailwind CSS
- **IA**: Google Gemini API (Integración directa para matchmaking)
- **Iconos**: Google Material Symbols

### Backend (`/backend`)
- **Runtime**: Node.js + Express
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT (JSON Web Tokens)

---

## 📦 Estructura del Proyecto

```text
.
├── backend/                # Servidor Node.js + Prisma
│   ├── src/                # Código fuente (Controllers, Routes, Middlewares)
│   ├── prisma/             # Schema y migraciones de la Base de Datos
│   └── scripts/            # Scripts de utilidad y mantenimiento
├── components/             # Componentes React reutilizables
├── pages/                  # Vistas principales (Client, Vendor, Admin, Public)
├── services/               # Clientes de API y servicios externos
├── screenshots/            # Histórico visual del desarrollo
└── README.md               # Documentación principal
```

---

## 🚦 Guía de Inicio Rápido

### 1. Requisitos Previos
- Node.js (v18+)
- PostgreSQL (Instancia activa)

### 2. Configuración del Backend
```bash
cd backend
npm install
# Configura tu .env (DATABASE_URL)
npx prisma migrate dev
npm run dev
```

### 3. Configuración del Frontend
En una nueva terminal (en la raíz):
```bash
npm install
# Configura tu .env (GEMINI_API_KEY)
npm run dev
```

---

## 📖 Módulos del Sistema

### Módulo Público
- **Landing Page**: Explicación del servicio y buscador estilo "Airbnb".
- **Search**: Motor de búsqueda con filtros y asistente IA.
- **Auth**: Registro e inicio de sesión con roles diferenciados.

### Módulo de Cliente (`/client`)
- **Dashboard**: Estado de fondos en Escrow y proyectos activos.
- **Gestión de Propuestas**: Revisión de términos y firma de contratos.

### Módulo de Vendor (`/vendor`)
- **Pipeline Kanban**: Gestión de leads y propuestas aceptadas.
- **Contratos**: Herramienta de negociación y versionado.

### Módulo de Administrador (`/admin`)
- **Arbitraje**: Resolución de disputas asistida por IA.
- **Métricas**: Salud de la plataforma y tasas de conversión.

---

## 📄 Notas de Limpieza (QA)
Este repositorio ha sido optimizado recientemente:
- Se consolidó el historial de versiones en un flujo FullStack.
- Se eliminaron componentes redundantes y huérfanos.
- Se centralizó la documentación en este archivo.
