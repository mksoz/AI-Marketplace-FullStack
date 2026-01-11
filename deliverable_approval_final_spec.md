# Sistema de Aprobación de Entregables - Especificación Final
## Contexto: Plataforma B2B para Soluciones de IA

---

## 🎯 PRINCIPIOS FUNDAMENTALES

1. **Flexibilidad Financiera:** Cliente elige depositar hito por hito o todo al inicio
2. **Máximo 2 Rechazos:** Tercer rechazo requiere mediación de plataforma
3. **Adaptado a Software:** Preview enfocado en código, documentación, demos (NO diseño gráfico)
4. **Límites Claros:** Despliegue en entorno del cliente = Fuera de scope de plataforma

---

## 📊 FLUJO COMPLETO DEL SISTEMA

### **FASE 0: Configuración de Proyecto (Setup Inicial)**

**Momento:** Cuando vendor acepta propuesta y configura roadmap

**Decisión del Cliente:**
```
┌─────────────────────────────────────────────┐
│  ¿Cómo deseas depositar fondos?             │
│                                             │
│  ○ Por Hito (Recomendado)                   │
│    → Depositas al inicio de cada hito       │
│    → Menos riesgo inicial                   │
│                                             │
│  ○ Todo al Inicio                           │
│    → Un solo depósito                       │
│    → Vendor tiene garantía total            │
│         │
└─────────────────────────────────────────────┘
```

**Implementación Técnica:**
```typescript
interface ProjectPaymentMode {
  mode: 'PER_MILESTONE' | 'UPFRONT_ALL';
  totalBudget: number;
  escrowStatus: {
    deposited: number;      // Cuánto está en escrow actualmente
    released: number;       // Cuánto se ha liberado al vendor
    pending: number;        // Cuánto falta por depositar
  };
}

// Ejemplo: Proyecto $50,000 con 5 hitos
// MODO 1: PER_MILESTONE
{
  mode: 'PER_MILESTONE',
  totalBudget: 50000,
  escrowStatus: { deposited: 10000, released: 0, pending: 40000 }
  // Solo Hito 1 ($10k) está en escrow
}

// MODO 2: UPFRONT_ALL
{
  mode: 'UPFRONT_ALL',
  totalBudget: 50000,
  escrowStatus: { deposited: 50000, released: 0, pending: 0 }
  // Todo el presupuesto ya está en escrow desde el inicio
}
```

---

### **FASE 1: Inicio de Hito**

#### **Opción A: Modo "Por Hito"**
1. Vendor marca hito como `IN_PROGRESS`
2. **Cliente recibe notificación:** "Deposita $X para desbloquear trabajo en Hito 1"
3. Cliente deposita → Fondos en `ESCROW_HELD`
4. Vendor puede empezar a trabajar

#### **Opción B: Modo "Todo al Inicio"**
1. Vendor marca hito como `IN_PROGRESS`
2. **NO hay solicitud de depósito** (ya está todo en escrow)
3. Sistema asigna automáticamente fondos del hito desde el pool
4. Vendor trabaja

---

### **FASE 2: Desarrollo y Entregables (Vendor)**

**Tipos de Entregables en Proyectos de IA/Software:**

```typescript
enum DeliverableType {
  // Diseño & Arquitectura
  TECHNICAL_SPECS = 'Especificaciones Técnicas (PDF, MD)',
  ARCHITECTURE_DIAGRAM = 'Diagramas de Arquitectura',
  UI_MOCKUPS = 'Mockups UI/UX (Figma, Adobe XD)',
  
  // Desarrollo
  SOURCE_CODE = 'Código Fuente (GitHub/GitLab link)',
  TRAINED_MODELS = 'Modelos IA Entrenados (.h5, .pkl, .pth)',
  API_ENDPOINTS = 'APIs Implementadas (Swagger/Postman)',
  
  // Testing & Documentación
  TEST_RESULTS = 'Resultados de Tests (Coverage, Performance)',
  TECHNICAL_DOCS = 'Documentación Técnica',
  USER_MANUAL = 'Manual de Usuario',
  
  // Demo & Validación
  DEMO_VIDEO = 'Video Demo de Funcionalidad',
  SANDBOX_ACCESS = 'Acceso a Sandbox/Staging',
  
  // Implementación (IMPORTANTE: Límite de plataforma)
  DEPLOYMENT_GUIDE = 'Guía de Despliegue',
  // ❌ NO: PRODUCTION_DEPLOYMENT (Fuera de scope)
}
```

**Vendor sube archivos a carpeta protegida:**
- Carpeta está **BLOQUEADA** (cliente no puede ver ni descargar)
- Sistema detecta tipos de archivo automáticamente
- Vendor puede añadir descripción/notas por archivo

---

### **FASE 3: Solicitud de Revisión (Vendor → Cliente)**

**Vendor clickea: "Enviar a Revisión"**

**Validaciones del Sistema ANTES de permitir envío:**
```typescript
// Reglas de Negocio
const canSubmit = {
  hasFiles: deliverableFolder.files.length > 0,
  hasRequiredTypes: checkRequiredDeliverables(milestone), 
  escrowStatus: milestone.escrowAmount > 0, // Dinero ya depositado
  previousReviewsCount: milestone.reviews.length < 3 // Máximo 3 intentos
};
```

**Si todo OK:**
1. Milestone → `READY_FOR_REVIEW`
2. Se genera **Preview Package Automático** (ver siguiente sección)
3. Cliente recibe notificación: "Entregables listos para revisión"

---

### **FASE 4: Preview Inteligente para Cliente**

**Problema:** En software no aplica "ver miniatura" como en diseño gráfico.

**Solución: Preview Estructurado con Evidencia**

```typescript
interface DeliverablePreview {
  // 1. Metadata SIEMPRE Visible (sin descargar)
  fileStructure: {
    name: string;
    type: DeliverableType;
    size: string;
    lastModified: Date;
    description?: string; // Vendor puede añadir
  }[];
  
  // 2. Evidencia Automática según Tipo
  evidence: {
    // Si hay código fuente
    codeStats?: {
      linesOfCode: number;
      languages: string[];
      lastCommit: { date: Date; message: string };
      testsIncluded: boolean;
    };
    
    // Si hay modelos ML
    modelInfo?: {
      algorithm: string;
      trainingAccuracy: number;
      fileSize: string;
      framework: 'TensorFlow' | 'PyTorch' | 'Scikit-learn';
    };
    
    // Si hay documentación
    docsPreview?: {
      tableOfContents: string[];
      firstPages: string[]; // URLs a imágenes de primeras 2 páginas
      wordCount: number;
    };
    
    // Si hay demo/video
    videoPreview?: {
      thumbnail: string;
      duration: number;
      streamUrl: string; // Cliente puede ver video pero no descargar
    };
  };
  
  // 3. Sandbox Access (si aplica)
  sandboxAccess?: {
    url: string;
    credentials: { username: string; password: string };
    expiresIn: Date; // 7 días para revisión
  };
}
```

**Ejemplo Concreto - Hito "Desarrollo de Chatbot IA":**

Cliente puede ver SIN descargar:
- ✅ **Estructura:** 
  - `chatbot_model.h5` (85 MB) - Modelo entrenado
  - `api_endpoints.py` (2,340 líneas)
  - `test_results.pdf` (12 páginas)
  - `demo_video.mp4` (3:45 min)

- ✅ **Estadísticas:**
  - Código: 15,420 líneas (Python 89%, JavaScript 11%)
  - Tests: 87% coverage
  - Último commit: hace 2 horas "Fixed edge case in NLP"

- ✅ **Evidencia Funcional:**
  - Video demo mostrando chatbot respondiendo
  - Acceso a sandbox: `https://staging.proyecto.com` (válido 7 días)
  - Documentación: Ver índice + primeras 2 páginas

- ❌ **NO puede:**
  - Descargar código fuente completo
  - Descargar modelo entrenado
  - Copiar documentación completa

---

### **FASE 5: Decisión del Cliente**

**Cliente tiene 3 opciones:**

#### **Opción 1: APROBAR ✅**
```
┌─────────────────────────────────────────────┐
│  ✅ Aprobar Entregables                     │
│                                             │
│  Esto liberará $10,000 al vendor            │
│  y desbloqueará la carpeta completa.        │
│                                             │
│  [Cancelar]  [Confirmar Aprobación]         │
└─────────────────────────────────────────────┘
```

**Acciones del Sistema:**
1. Milestone → `COMPLETED`
2. Fondos `ESCROW_HELD` → Transfer a `VendorAccount`
3. Carpeta desbloquea: Cliente puede descargar TODO
4. Se crea registro `DeliverableReview` (status: APPROVED)
5. Notificación a Vendor: "💰 Pago liberado"

---

#### **Opción 2: RECHAZAR (1ra o 2da vez) 🔧**
```
┌─────────────────────────────────────────────┐
│  🔧 Solicitar Cambios (Revisión #1)         │
│                                             │
│  Describe los cambios requeridos:          │
│  ┌─────────────────────────────────────┐   │
│  │ El modelo tiene baja precisión con  │   │
│  │ nombres latinos. Necesito que lo    │   │
│  │ re-entrenes con dataset español.    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Cancelar]  [Enviar Solicitud]             │
└─────────────────────────────────────────────┘
```

**Acciones del Sistema:**
1. Milestone → `CHANGES_REQUESTED`
2. Fondos **SIGUEN en ESCROW** (mismo dinero, no se vuelve a depositar)
3. Se crea registro `DeliverableReview` (status: REJECTED, comment: "...")
4. Carpeta sigue BLOQUEADA
5. Vendor recibe notificación con feedback detallado
6. Vendor corrige y RE-ENVÍA (vuelve a Fase 3)

**Límite:** Máximo 2 rechazos "automáticos"

---

#### **Opción 3: RECHAZAR (3ra vez) ⚖️ MEDIACIÓN**
```
┌─────────────────────────────────────────────┐
│  ⚠️ Tercera Solicitud de Cambios            │
│                                             │
│  Has rechazado este entregable 2 veces.    │
│  Un tercer rechazo abrirá un ticket de     │
│  mediación con el equipo de la plataforma. │
│                                             │
│  ¿Estás seguro de que deseas continuar?    │
│                                             │
│  Describe la disputa:                       │
│  ┌─────────────────────────────────────┐   │
│  │ El vendor no cumple con los         │   │
│  │ requisitos originales del proyecto. │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Volver]  [Abrir Mediación]                │
└─────────────────────────────────────────────┘
```

**Acciones del Sistema:**
1. Milestone → `IN_DISPUTE`
2. Fondos **BLOQUEADOS en ESCROW** (ni vendor ni cliente)
3. Se crea registro `DeliverableReview` (status: DISPUTED)
4. Se crea ticket en `AdminDisputes`
5. **Admin de plataforma revisa:**
   - Propuesta original
   - Historial de reviews
   - Evidencia de ambas partes
6. **Admin decide:**
   - Aprobar → Fondos al vendor
   - Rechazar → Fondos devueltos a cliente
   - Parcial → Split del monto (e.g. 60% vendor, 40% cliente)

---

### **FASE 6: Protecciones Temporales**

#### **Auto-Aprobación por Inactividad del Cliente**
```
Timeline:
Día 0: Vendor envía a revisión
Día 3: Recordatorio automático a cliente
Día 5: Recordatorio urgente
Día 6: Advertencia final
Día 7: AUTO-APROBACIÓN
```

**Lógica:**
```typescript
// Cron job diario
if (milestone.status === 'READY_FOR_REVIEW' && daysSinceSubmission >= 7) {
  // Auto-aprobar
  await approveMilestone(milestone.id, { 
    approvedBy: 'SYSTEM',
    reason: 'Auto-approved due to client inactivity'
  });
  
  // Notificar a ambos
  await notify(client, 'Entregables auto-aprobados por inactividad');
  await notify(vendor, 'Fondos liberados automáticamente');
}
```

**Excepción:** Si hay mediación activa, NO aplicar auto-aprobación

---

## 🏗️ ESTRUCTURA TÉCNICA

### **Estados de Milestone (Ampliados)**
```typescript
enum MilestoneStatus {
  PENDING = 'Pendiente',
  IN_PROGRESS = 'En Progreso',
  READY_FOR_REVIEW = 'Listo para Revisión',
  CHANGES_REQUESTED = 'Cambios Solicitados',
  IN_DISPUTE = 'En Disputa (Mediación)',
  COMPLETED = 'Completado',
  PAID = 'Pagado'
}
```

### **Modelo de DeliverableReview (Actualizado)**
```prisma
model DeliverableReview {
  id          String   @id @default(cuid())
  milestoneId String
  milestone   Milestone @relation(fields: [milestoneId], references: [id])
  
  reviewerId  String   // userId del cliente
  reviewer    User     @relation(fields: [reviewerId], references: [id])
  
  status      ReviewStatus  // APPROVED, REJECTED, DISPUTED
  comment     String
  
  reviewNumber Int      // 1ra, 2da, 3ra review
  
  // Para mediación
  disputeResolution String?  @db.Text
  resolvedBy        String?  // Admin userId
  resolvedAt        DateTime?
  
  createdAt   DateTime @default(now())
  
  @@index([milestoneId])
}

enum ReviewStatus {
  APPROVED
  REJECTED
  DISPUTED
}
```

### **Modelo de Escrow (Nuevo)**
```prisma
model ProjectEscrow {
  id              String   @id @default(cuid())
  projectId       String   @unique
  project         Project  @relation(fields: [projectId], references: [id])
  
  paymentMode     PaymentMode  // PER_MILESTONE | UPFRONT_ALL
  totalBudget     Float
  
  // Tracking financiero
  depositedAmount Float    @default(0)  // Cuánto está en escrow
  releasedAmount  Float    @default(0)  // Cuánto se liberó al vendor
  pendingAmount   Float                 // Calculado: totalBudget - depositedAmount
  
  // Historial de transacciones
  transactions    EscrowTransaction[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model EscrowTransaction {
  id          String   @id @default(cuid())
  escrowId    String
  escrow      ProjectEscrow @relation(fields: [escrowId], references: [id])
  
  type        TransactionType  // DEPOSIT, RELEASE, REFUND
  amount      Float
  milestoneId String?          // Si es por un hito específico
  
  description String
  createdAt   DateTime @default(now())
}

enum PaymentMode {
  PER_MILESTONE
  UPFRONT_ALL
}

enum TransactionType {
  DEPOSIT     // Cliente → Escrow
  RELEASE     // Escrow → Vendor
  REFUND      // Escrow → Cliente (en caso de disputa)
}
```

---

## 🎬 CASOS EXTREMOS CUBIERTOS

### **Caso 1: Cliente Sin Fondos (Modo Por Hito)**
**Escenario:** Hito 2 en progreso, cliente no deposita

**Solución:**
- Vendor puede seguir trabajando (bajo su riesgo)
- Sistema muestra banner: "⚠️ Fondos no depositados para este hito"
- Vendor puede pausar trabajo hasta que cliente deposite
- Vendor puede cancelar hito sin penalización

### **Caso 2: Vendor Malicioso**
**Escenario:** Vendor sube archivos vacíos/corruptos

**Solución:**
- Cliente ve preview y detecta inmediatamente (fileSize: 0 KB)
- Rechaza con evidencia
- Si se repite en mediación, Admin penaliza al vendor
- Fondos devueltos al cliente

### **Caso 3: Cliente Malintencionado (Rechazos Infinitos)**
**Escenario:** Cliente rechaza 10 veces para obtener trabajo gratis

**Solución:**
- Solo 2 rechazos automáticos
- Tercer rechazo = Mediación obligatoria
- Admin revisa historial de cliente
- Si abuse pattern → Fondos liberados a vendor + warning a cliente

### **Caso 4: Despliegue Final Fallido**
**Escenario:** Vendor entregó todo, pero al desplegar en producción del cliente falló

**Solución:**
```
┌─────────────────────────────────────────────┐
│  🚨 Límite de Responsabilidad               │
│                                             │
│  La plataforma cubre:                       │
│  ✅ Código fuente funcional                 │
│  ✅ Tests pasando                           │
│  ✅ Documentación completa                  │
│  ✅ Funcionamiento en Sandbox               │
│                                             │
│  NO cubre:                                  │
│  ❌ Despliegue en entorno productivo        │
│  ❌ Configuración de infraestructura        │
│  ❌ Mantenimiento post-entrega              │
│                                             │
│  Esto debe acordarse FUERA de la plataforma│
└─────────────────────────────────────────────┘
```

**Implementación:**
- Milestone tipo "Despliegue" → Checkbox de cliente: "Entiendo que esto está fuera de plataforma"
- Cierre del proyecto requiere confirmación de ambas partes
- Posible: Soporte post-entrega como proyecto separado

### **Caso 5: Proyecto Cancelado a Mitad**
**Escenario:** Cliente quiere cancelar proyecto después de 2 hitos completados

**Solución:**
- Hitos `COMPLETED/PAID` → Vendor ya cobró (justo)
- Hito `IN_PROGRESS` con fondos en escrow:
  - Si no hay entregables → Refund completo a cliente
  - Si hay trabajo parcial → Mediación para determinar % de pago
- Hitos futuros `PENDING` → Cancelados sin cargo

---

## 🎨 UX/UI ESPECÍFICA

### **Para Cliente - Dashboard de Hito**
```
┌───────────────────────────────────────────────────────┐
│ Hito 2: Desarrollo Backend API                        │
│ Estado: 🟡 Listo para Revisión                         │
│                                                        │
│ ┌─────────────────────────────────────────────────┐  │
│ │ 💰 Fondos en Escrow: $12,000                     │  │
│ │ 📁 Entregables: 18 archivos                      │  │
│ │ 📅 Enviado hace: 1 día                           │  │
│ │ ⏰ Auto-aprobación en: 6 días                    │  │
│ └─────────────────────────────────────────────────┘  │
│                                                        │
│ Preview de Entregables:                                │
│ ┌─────────────────────────────────────────────────┐  │
│ │ 📄 api_server.py (3,240 líneas)                  │  │
│ │    Descripción: FastAPI con 15 endpoints        │  │
│ │                                                  │  │
│ │ 🧠 model_predictor.pkl (142 MB)                  │  │
│ │    Algoritmo: Random Forest                     │  │
│ │    Accuracy: 94.2%                              │  │
│ │                                                  │  │
│ │ 🎥 demo_api.mp4 (4:23 min)                       │  │
│ │    [▶️ Reproducir Video]                         │  │
│ │                                                  │  │
│ │ 🔗 Sandbox: https://staging.proyecto.com         │  │
│ │    User: demo@test.com | Pass: Demo2024         │  │
│ └─────────────────────────────────────────────────┘  │
│                                                        │
│ [🔧 Solicitar Cambios]  [✅ Aprobar y Liberar Fondos] │
└───────────────────────────────────────────────────────┘
```

### **Para Vendor - Dashboard de Hito**
```
┌───────────────────────────────────────────────────────┐
│ Hito 2: Desarrollo Backend API                        │
│ Estado: 🟡 En Revisión del Cliente                     │
│                                                        │
│ ┌─────────────────────────────────────────────────┐  │
│ │ 💰 Fondos Protegidos: $12,000                    │  │
│ │ 📊 Intentos de Revisión: 1/3                     │  │
│ │ 📅 Enviado: hace 1 día                           │  │
│ │ ⏰ Auto-aprobación en: 6 días                    │  │
│ └─────────────────────────────────────────────────┘  │
│                                                        │
│ 📁 Entregables Enviados: (BLOQUEADOS)                  │
│ • api_server.py (3,240 líneas)                         │
│ • model_predictor.pkl (142 MB)                         │
│ • demo_api.mp4 (4:23 min)                              │
│ • + 15 archivos más                                    │
│                                                        │
│ ⚠️ No puedes editar archivos mientras está en revisión │
│                                                        │
│ Historial de Revisiones:                               │
│ └─ Revisión #1: Pendiente...                           │
└───────────────────────────────────────────────────────┘
```

---

## ✅ VALIDACIÓN FINAL - CHECKLIST

Antes de implementar, confirma:

- [ ] **Flexibilidad de Pago:** Cliente puede elegir modo al inicio
- [ ] **Máximo 2 Rechazos Automáticos:** Tercero va a mediación
- [ ] **Preview Adaptado a Software:** Stats de código, sandbox, demos
- [ ] **Límite Claro:** Despliegue productivo fuera de scope
- [ ] **Auto-Aprobación:** 7 días sin respuesta
- [ ] **Escrow Único:** Mismo dinero para múltiples revisiones
- [ ] **Mediación por Admin:** Casos de disputa tienen resolución
- [ ] **Protección Vendor:** Trabajo asegurado antes de empezar
- [ ] **Protección Cliente:** Preview antes de aprobar

---

## 🚀 FASES DE IMPLEMENTACIÓN SUGERIDAS

### **Fase 1: MVP (Semana 1)**
- [ ] Modelo `ProjectEscrow` y `DeliverableReview`
- [ ] Flujo básico: Submit → Approve/Reject → Release
- [ ] Preview simple (metadata + filesize)
- [ ] Máximo 2 rechazos

### **Fase 2: Seguridad (Semana 2)**
- [ ] Bloqueo/Desbloqueo de carpetas
- [ ] Auto-aprobación a los 7 días
- [ ] Notificaciones de recordatorio

### **Fase 3: Inteligencia (Semana 3)**
- [ ] Preview avanzado (stats de código, sandbox)
- [ ] Sistema de mediación para Admin
- [ ] Dashboard de escrow

### **Fase 4: Pulido (Semana 4)**
- [ ] UX/UI final
- [ ] Tests E2E
- [ ] Documentación para clientes/vendors

---

## 📝 NOTAS FINALES

**Diferenciadores de tu Plataforma vs Competencia:**
1. **Flexibilidad de Pago:** Nadie más ofrece modo "por hito" vs "todo al inicio"
2. **Preview Inteligente:** Adaptado específicamente a proyectos de IA/ML
3. **Límites Claros:** Transparencia sobre qué cubre y qué no
4. **Mediación Activa:** No es solo automatización, hay humanos cuando se necesita

**Riesgos Mitigados:**
✅ Cliente no puede robar trabajo (carpetas bloqueadas)  
✅ Vendor no pierde tiempo sin garantía (escrow previo)  
✅ Disputas infinitas (máximo 2 intentos + mediación)  
✅ Clientes fantasma (auto-aprobación)

---

¿Esta especificación captura correctamente tu visión? ¿Hay algo que quieras ajustar antes de empezar la implementación?
