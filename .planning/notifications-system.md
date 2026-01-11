# 📋 Sistema de Notificaciones - Planning Detallado

## 📊 Análisis de Actividades e Interacciones

### 1. PROPUESTAS (Proposals)
**Interacciones Cliente → Vendor:**
- ✅ Cliente crea propuesta de proyecto
- ✅ Cliente acepta propuesta del vendor
- ✅ Cliente rechaza propuesta del vendor
- ✅ Cliente solicita cambios en propuesta

**Interacciones Vendor → Cliente:**
- ✅ Vendor recibe nueva propuesta
- ✅ Vendor envía propuesta/cotización
- ✅ Vendor actualiza propuesta existente

### 2. PROYECTOS (Projects)
**Interacciones Cliente → Vendor:**
- ✅ Cliente crea nuevo proyecto
- ✅ Cliente actualiza detalles del proyecto
- ✅ Cliente cancela proyecto

**Interacciones Vendor → Cliente:**
- ✅ Vendor acepta proyecto
- ✅ Vendor rechaza proyecto
- ✅ Vendor completa proyecto

### 3. HITOS & ENTREGAS (Milestones & Deliverables)
**Interacciones Vendor → Cliente:**
- ✅ Vendor completa hito
- ✅ Vendor sube entregable
- ✅ Vendor actualiza entregable
- ⚠️ Recordatorio: Hito próximo a vencer (2 días antes)

**Interacciones Cliente → Vendor:**
- ✅ Cliente aprueba hito
- ✅ Cliente rechaza hito
- ✅ Cliente solicita revisión de entregable
- ✅ Cliente aprueba entregable

### 4. FINANZAS & PAGOS (Payments)
**Interacciones Vendor → Cliente:**
- 💰 Vendor solicita pago de hito
- 💰 Vendor solicita pago adicional

**Interacciones Cliente → Vendor:**
- 💰 Cliente aprueba solicitud de pago
- 💰 Cliente rechaza solicitud de pago
- ✅ Pago procesado exitosamente
- ❌ Pago fallido

### 5. MENSAJES & CONVERSACIONES (Messages)
**Ambas partes:**
- 💬 Nuevo mensaje recibido
- 💬 Mensaje en conversación de proyecto
- 💬 Respuesta a tu mensaje

### 6. CALENDARIO & EVENTOS (Calendar)
**Ambas partes:**
- 📅 Nuevo evento creado
- 📅 Invitación a evento
- ✅ Evento aceptado por la otra parte
- ❌ Evento rechazado
- 🔄 Propuesta de fecha alternativa
- ✅ Fecha alternativa aceptada
- ⚠️ Recordatorio: Evento en 24h
- ⚠️ Recordatorio: Evento en 1h

### 7. ARCHIVOS & DOCUMENTOS (Files)
**Interacciones Vendor → Cliente:**
- 📄 Vendor sube archivo al proyecto
- 📄 Vendor actualiza archivo
- 📁 Vendor crea carpeta protegida

**Interacciones Cliente → Vendor:**
- 📄 Cliente sube archivo
- 👁️ Cliente accede a carpeta protegida

### 8. CONTRATOS (Contracts)
**Ambas partes:**
- 📝 Contrato generado
- ✍️ Contrato firmado por la otra parte
- ⚠️ Recordatorio: Contrato pendiente de firma
- ✅ Contrato completado

### 9. INCIDENCIAS (Incidents)
**Ambas partes:**
- 🚨 Nueva incidencia reportada
- 📋 Incidencia asignada a ti
- ✅ Incidencia resuelta
- 🔄 Incidencia actualizada
- 🔴 Incidencia de prioridad ALTA/CRÍTICA

### 10. REVIEWS & VALORACIONES (Reviews)
**Interacciones Cliente → Vendor:**
- ⭐ Cliente deja review

**Interacciones Vendor → Cliente:**
- ⭐ Vendor responde a review

### 11. GITHUB SYNC
**Interacciones Vendor → Cliente:**
- 🔧 Nuevo commit sincronizado
- 📦 Nueva release del proyecto
- ✅ Milestone de GitHub completado

### 12. ACTIVIDAD DEL SISTEMA
**Notificaciones automáticas:**
- 👤 Nueva asignación a proyecto
- ⚠️ Proyecto próximo a deadline
- ⚠️ Presupuesto del proyecto alcanzando límite
- 🎉 Proyecto completado exitosamente

---

## 🎨 Sistema de Iconos y Colores por Categoría

```typescript
const NOTIFICATION_CONFIG = {
  //PROPUESTAS
  PROPOSAL_RECEIVED: { icon: 'description', color: '#3b82f6', bg: '#eff6ff' },
  PROPOSAL_ACCEPTED: { icon: 'check_circle', color: '#10b981', bg: '#f0fdf4' },
  PROPOSAL_REJECTED: { icon: 'cancel', color: '#ef4444', bg: '#fef2f2' },
  PROPOSAL_UPDATED: { icon: 'edit_note', color: '#f59e0b', bg: '#fffbeb' },
  
  // PROYECTOS
  PROJECT_CREATED: { icon: 'folder_open', color: '#8b5cf6', bg: '#faf5ff' },
  PROJECT_STARTED: { icon: 'play_circle', color: '#10b981', bg: '#f0fdf4' },
  PROJECT_COMPLETED: { icon: 'task_alt', color: '#10b981', bg: '#f0fdf4' },
  PROJECT_CANCELLED: { icon: 'block', color: '#ef4444', bg: '#fef2f2' },
  
  // HITOS & ENTREGAS
  MILESTONE_COMPLETED: { icon: 'flag', color: '#10b981', bg: '#f0fdf4' },
  MILESTONE_APPROVED: { icon: 'verified', color: '#10b981', bg: '#f0fdf4' },
  MILESTONE_REJECTED: { icon: 'thumb_down', color: '#ef4444', bg: '#fef2f2' },
  DELIVERABLE_UPLOADED: { icon: 'upload_file', color: '#3b82f6', bg: '#eff6ff' },
  DELIVERABLE_APPROVED: { icon: 'check_circle', color: '#10b981', bg: '#f0fdf4' },
  DEADLINE_REMINDER: { icon: 'schedule', color: '#f59e0b', bg: '#fffbeb' },
  
  // FINANZAS
  PAYMENT_REQUESTED: { icon: 'payments', color: '#8b5cf6', bg: '#faf5ff' },
  PAYMENT_APPROVED: { icon: 'account_balance', color: '#10b981', bg: '#f0fdf4' },
  PAYMENT_REJECTED: { icon: 'money_off', color: '#ef4444', bg: '#fef2f2' },
  PAYMENT_COMPLETED: { icon: 'paid', color: '#10b981', bg: '#f0fdf4' },
  PAYMENT_FAILED: { icon: 'error', color: '#ef4444', bg: '#fef2f2' },
  
  // MENSAJES
  MESSAGE_RECEIVED: { icon: 'chat', color: '#3b82f6', bg: '#eff6ff' },
  MESSAGE_REPLY: { icon: 'reply', color: '#3b82f6', bg: '#eff6ff' },
  
  // CALENDARIO
  EVENT_CREATED: { icon: 'event', color: '#3b82f6', bg: '#eff6ff' },
  EVENT_INVITATION: { icon: 'event_available', color: '#8b5cf6', bg: '#faf5ff' },
  EVENT_ACCEPTED: { icon: 'event_note', color: '#10b981', bg: '#f0fdf4' },
  EVENT_REJECTED: { icon: 'event_busy', color: '#ef4444', bg: '#fef2f2' },
  EVENT_PROPOSED: { icon: 'schedule_send', color: '#f59e0b', bg: '#fffbeb' },
  EVENT_REMINDER: { icon: 'alarm', color: '#f59e0b', bg: '#fffbeb' },
  
  // ARCHIVOS
  FILE_UPLOADED: { icon: 'cloud_upload', color: '#3b82f6', bg: '#eff6ff' },
  FILE_UPDATED: { icon: 'update', color: '#f59e0b', bg: '#fffbeb' },
  FOLDER_CREATED: { icon: 'create_new_folder', color: '#8b5cf6', bg: '#faf5ff' },
  FOLDER_ACCESS: { icon: 'folder_open', color: '#3b82f6', bg: '#eff6ff' },
  
  // CONTRATOS
  CONTRACT_GENERATED: { icon: 'contract', color: '#8b5cf6', bg: '#faf5ff' },
  CONTRACT_SIGNED: { icon: 'draw', color: '#10b981', bg: '#f0fdf4' },
  CONTRACT_REMINDER: { icon: 'edit_document', color: '#f59e0b', bg: '#fffbeb' },
  
  // INCIDENCIAS
  INCIDENT_CREATED: { icon: 'error_outline', color: '#ef4444', bg: '#fef2f2' },
  INCIDENT_ASSIGNED: { icon: 'assignment_ind', color: '#f59e0b', bg: '#fffbeb' },
  INCIDENT_RESOLVED: { icon: 'task_alt', color: '#10b981', bg: '#f0fdf4' },
  INCIDENT_UPDATED: { icon: 'update', color: '#3b82f6', bg: '#eff6ff' },
  INCIDENT_CRITICAL: { icon: 'warning', color: '#dc2626', bg: '#fef2f2' },
  
  // REVIEWS
  REVIEW_RECEIVED: { icon: 'star', color: '#f59e0b', bg: '#fffbeb' },
  REVIEW_REPLIED: { icon: 'reply', color: '#3b82f6', bg: '#eff6ff' },
  
  // GITHUB
  GITHUB_COMMIT: { icon: 'commit', color: '#6366f1', bg: '#eef2ff' },
  GITHUB_RELEASE: { icon: 'new_releases', color: '#10b981', bg: '#f0fdf4' },
  GITHUB_MILESTONE: { icon: 'military_tech', color: '#f59e0b', bg: '#fffbeb' },
  
  // SISTEMA
  SYSTEM_ASSIGNMENT: { icon: 'person_add', color: '#8b5cf6', bg: '#faf5ff' },
  SYSTEM_REMINDER: { icon: 'notifications', color: '#f59e0b', bg: '#fffbeb' },
  SYSTEM_SUCCESS: { icon: 'celebration', color: '#10b981', bg: '#f0fdf4' },
  SYSTEM_WARNING: { icon: 'warning', color: '#f59e0b', bg: '#fffbeb' },
};
```

---

## 🗄️ FASE 1: Backend - Database Schema

### Actualizar schema.prisma

Ver planning completo en artifact.

---

## 📝 Implementation Checklist (Resumen)

### Backend (15 tareas)
- Actualizar schema
- Crear service
- Crear controller
- Crear routes
- Integrar en controllers existentes

### Frontend (15 tareas)
- Crear componentes nuevos
- Actualizar componentes existentes
- Integrar en layouts
- Testing

**Total: ~30 tareas principales**

¿Procedo con la implementación?
