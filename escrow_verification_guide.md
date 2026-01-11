# Guía de Verificación - Sistema de Escrow y Aprobación de Entregables

## 🎯 Objetivos de Verificación

1. ✅ Sistema de Escrow funcional (inicialización, depósito, consulta)
2. ✅ Validación de fondos antes de submit
3. ✅ Contador de revisiones y límite de 2 rechazos
4. ✅ Mediación automática en 3er rechazo
5. ✅ UI/UX del banner y modal de depósito

---

## 📋 Pre-requisitos

- Servidores corriendo (`npm run dev` en backend y frontend)
- Al menos 2 cuentas: 1 cliente y 1 vendor
- Un proyecto con hitos definidos y entregables

---

## 🧪 FASE 1: Verificación del Backend (API)

### 1.1 Inicializar Escrow

**Endpoint:** `POST /escrow/projects/:projectId/escrow/initialize`

**Request:**
```bash
# Como cliente, inicializa escrow
curl -X POST http://localhost:3000/api/escrow/projects/{PROJECT_ID}/escrow/initialize \
  -H "Authorization: Bearer {CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"paymentMode": "PER_MILESTONE"}'
```

**Respuesta esperada:**
```json
{
  "id": "escrow-id",
  "projectId": "...",
  "paymentMode": "PER_MILESTONE",
  "totalBudget": 50000,
  "depositedAmount": 0,
  "releasedAmount": 0
}
```

**✅ Verificar:**
- Status 201
- `paymentMode` correcto
- `totalBudget` = suma de todos los hitos
- `depositedAmount` = 0 (inicial)

---

### 1.2 Consultar Estado del Escrow

**Endpoint:** `GET /escrow/projects/:projectId/escrow`

**Request:**
```bash
curl http://localhost:3000/api/escrow/projects/{PROJECT_ID}/escrow \
  -H "Authorization: Bearer {CLIENT_OR_VENDOR_TOKEN}"
```

**Respuesta esperada:**
```json
{
  "id": "...",
  "paymentMode": "PER_MILESTONE",
  "totalBudget": 50000,
  "depositedAmount": 0,
  "releasedAmount": 0,
  "pendingAmount": 50000,
  "availableAmount": 0,
  "transactions": [],
  "project": { /* detalles del proyecto */ }
}
```

**✅ Verificar:**
- `pendingAmount` = `totalBudget` - `depositedAmount`
- `availableAmount` = `depositedAmount` - `releasedAmount`
- Accesible tanto por cliente como vendor

---

### 1.3 Depositar Fondos

**Endpoint:** `POST /escrow/projects/:projectId/escrow/deposit`

**Request (modo PER_MILESTONE):**
```bash
curl -X POST http://localhost:3000/api/escrow/projects/{PROJECT_ID}/escrow/deposit \
  -H "Authorization: Bearer {CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "milestoneId": "{MILESTONE_ID}"
  }'
```

**Respuesta esperada:**
```json
{
  "escrow": {
    "depositedAmount": 10000,
    "availableAmount": 10000
  },
  "transaction": {
    "type": "DEPOSIT",
    "amount": 10000,
    "description": "Deposit for milestone"
  }
}
```

**✅ Verificar:**
- `depositedAmount` incrementó
- Nueva transacción en historial
- Balance de `ClientAccount` decrementó
- Si no hay fondos suficientes → error 400 (o auto-deposit en simulación)

---

### 1.4 Submit con Validación de Escrow

**Endpoint:** `POST /milestones/:milestoneId/submit`

**Caso 1: SIN fondos depositados (debe fallar)**
```bash
curl -X POST http://localhost:3000/api/milestones/{MILESTONE_ID}/submit \
  -H "Authorization: Bearer {VENDOR_TOKEN}"
```

**Respuesta esperada:**
```json
{
  "message": "Client must deposit funds before reviewing deliverables",
  "requiredAmount": 10000,
  "availableAmount": 0
}
```

**✅ Verificar:** Status 400

**Caso 2: CON fondos depositados (debe funcionar)**
```bash
# Primero deposita como cliente (paso 1.3)
# Luego submit como vendor
curl -X POST http://localhost:3000/api/milestones/{MILESTONE_ID}/submit \
  -H "Authorization: Bearer {VENDOR_TOKEN}"
```

**Respuesta esperada:**
```json
{
  "milestone": {
    "status": "READY_FOR_REVIEW",
    "submittedAt": "2024-01-09T..."
  }
}
```

**✅ Verificar:** Status 200, milestone pasa a `READY_FOR_REVIEW`

---

### 1.5 Primer Rechazo

**Endpoint:** `POST /milestones/:milestoneId/review`

**Request:**
```bash
curl -X POST http://localhost:3000/api/milestones/{MILESTONE_ID}/review \
  -H "Authorization: Bearer {CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "comment": "Primera revisión - necesito cambios en el diseño"
  }'
```

**Respuesta esperada:**
```json
{
  "milestone": {
    "status": "CHANGES_REQUESTED"
  },
  "message": "Changes requested"
}
```

**✅ Verificar:**
- Status 200
- Milestone → `CHANGES_REQUESTED`
- Se creó `DeliverableReview` con `reviewNumber: 1`
- Fondos SIGUEN en escrow (no se liberan)

---

### 1.6 Re-submit y Segundo Rechazo

**Re-submit:**
```bash
curl -X POST http://localhost:3000/api/milestones/{MILESTONE_ID}/submit \
  -H "Authorization: Bearer {VENDOR_TOKEN}"
```

**Segundo Rechazo:**
```bash
curl -X POST http://localhost:3000/api/milestones/{MILESTONE_ID}/review \
  -H "Authorization: Bearer {CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "comment": "Segunda revisión - aún faltan ajustes"
  }'
```

**✅ Verificar:**
- Se creó `DeliverableReview` con `reviewNumber: 2`
- Milestone → `CHANGES_REQUESTED` de nuevo

---

### 1.7 Tercer Rechazo → Mediación

**Re-submit:**
```bash
curl -X POST http://localhost:3000/api/milestones/{MILESTONE_ID}/submit \
  -H "Authorization: Bearer {VENDOR_TOKEN}"
```

**Tercer Rechazo:**
```bash
curl -X POST http://localhost:3000/api/milestones/{MILESTONE_ID}/review \
  -H "Authorization: Bearer {CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "comment": "Tercera revisión - esto ya no es aceptable"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Maximum rejections reached. Dispute opened for admin review.",
  "requiresMediation": true
}
```

**✅ Verificar:**
- Status 200
- `requiresMediation: true`
- Milestone → `IN_DISPUTE`
- Se creó `DeliverableReview` con `status: 'DISPUTED'`
- Fondos BLOQUEADOS (ni cliente ni vendor pueden acceder)

---

### 1.8 Aprobación (flujo normal)

**Para otro milestone sin rechazos:**
```bash
curl -X POST http://localhost:3000/api/milestones/{OTHER_MILESTONE_ID}/review \
  -H "Authorization: Bearer {CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "comment": "Excelente trabajo"
  }'
```

**Respuesta esperada:**
```json
{
  "milestone": {
    "status": "COMPLETED",
    "isPaid": true
  },
  "message": "Payment released"
}
```

**✅ Verificar:**
- Milestone → `COMPLETED`
- `isPaid: true`
- Balance de `VendorAccount` incrementó
- Si hay escrow: `releasedAmount` incrementó
- Nueva transacción de tipo `RELEASE` (si hay escrow)

---

## 🖥️ FASE 2: Verificación del Frontend (UI)

### 2.1 Verificar EscrowBanner en Cliente

1. **Login como Cliente**
2. **Ir a proyecto con escrow**: `/client/projects/{PROJECT_ID}`
3. **Verificar Banner visible**:
   - ✅ Título: "Escrow Activo"
   - ✅ Badge: "Por Hito" o "Total"
   - ✅ Progress bar visual
   - ✅ Stats: Depositado, Total, Pendiente
   - ✅ Botón "Depositar" si `pendingAmount > 0`

4. **Expandir detalles** (click en flecha):
   - ✅ Cards con 4 métricas
   - ✅ Historial de transacciones
   - ✅ Scroll si hay muchas transacciones

---

### 2.2 Verificar Modal de Depósito

1. **Click en "Depositar"**
2. **Verificar modal abierto**:
   - ✅ Header gradiente azul
   - ✅ Resumen del escrow actual
   - ✅ Selector de hito (si modo PER_MILESTONE)
   - ✅ Botones rápidos de monto
   - ✅ Input manual de monto

3. **Probar Montos Rápidos**:
   - ✅ Click en botón de hito → auto-completa monto
   - ✅ Selector de hito actualiza también

4. **Depositar**:
   - ✅ Click "Depositar ${monto}"
   - ✅ Loading state
   - ✅ Toast de éxito: "💰 Fondos depositados correctamente"
   - ✅ Modal se cierra
   - ✅ Banner actualiza automáticamente (sin refresh)

5. **Validaciones**:
   - ✅ Monto = 0 → warning
   - ✅ Monto > pendiente → warning naranja
   - ✅ Sin hito seleccionado (modo PER_MILESTONE) → warning

---

### 2.3 Verificar Submit del Vendor

1. **Login como Vendor**
2. **Ir a proyecto**: `/vendor/projects/{PROJECT_ID}`
3. **Ir a Archivos → Entregables**
4. **Seleccionar milestone IN_PROGRESS con archivos**
5. **Click "Enviar a Revisión"**

**Caso A: Sin fondos en escrow**
- ✅ Error toast: "⚠️ El cliente debe depositar fondos antes de revisar"
- ✅ No cambia el status

**Caso B: Con fondos en escrow**
- ✅ Toast: "Entregables enviados correctamente"
- ✅ Status → `READY_FOR_REVIEW`

---

### 2.4 Verificar Revisión del Cliente

1. **Login como Cliente**
2. **Ir a Dashboard del proyecto**
3. **Encontrar milestone READY_FOR_REVIEW**
4. **Click "Revisar Entregables"**

**Modal de revisión:**
- ✅ Muestra título del hito
- ✅ Botones: "Aprobar" / "Solicitar Cambios"

5. **Solicitar Cambios (1ra vez)**:
   - ✅ Campo de comentario requerido
   - ✅ Toast: "Cambios solicitados correctamente"
   - ✅ Milestone → `CHANGES_REQUESTED`

6. **Re-submit vendor → Rechazar (2da vez)**:
   - ✅ Mismo flujo
   - ✅ Toast normal

7. **Re-submit vendor → Rechazar (3ra vez)**:
   - ✅ Toast especial: "⚖️ Máximo de rechazos alcanzado. Se ha abierto un caso de mediación..."
   - ✅ Milestone muestra estado: "⚖️ En Mediación"

---

### 2.5 Verificar EscrowBanner en Vendor

1. **Login como Vendor**
2. **Ir a proyecto con escrow**: `/vendor/projects/{PROJECT_ID}`
3. **Verificar Banner visible**:
   - ✅ Mismo diseño que en cliente
   - ✅ NO muestra botón "Depositar" (solo cliente puede depositar)
   - ✅ Muestra stats de escrow
   - ✅ Puede ver historial de transacciones

---

## 🐛 FASE 3: Casos Extremos

### 3.1 Proyecto sin Escrow

1. **Crear proyecto nuevo SIN inicializar escrow**
2. **Verificar**:
   - ✅ Banner NO aparece
   - ✅ Submit funciona normalmente
   - ✅ Aprobación usa flujo de `ClientAccount` tradicional
   - ✅ Sistema completamente retrocompatible

---

### 3.2 Balance Insuficiente

1. **Cliente con balance < monto a depositar**
2. **Intentar depositar**
3. **Verificar**:
   - ✅ Error: "Insufficient funds"
   - O en simulación: auto-deposit automático

---

### 3.3 Múltiples Transacciones

1. **Depositar varias veces**
2. **Aprobar varios hitos**
3. **Verificar**:
   - ✅ Historial muestra todas las transacciones
   - ✅ Colores correctos (azul DEPOSIT, verde RELEASE)
   - ✅ Montos acumulativos correctos

---

## ✅ CHECKLIST FINAL

### Backend
- [ ] Inicializar escrow funciona
- [ ] Depositar fondos actualiza escrow
- [ ] Consultar escrow devuelve datos correctos
- [ ] Submit valida escrow si existe
- [ ] Primer rechazo funciona (reviewNumber: 1)
- [ ] Segundo rechazo funciona (reviewNumber: 2)
- [ ] Tercer rechazo activa mediación (status: IN_DISPUTE)
- [ ] Aprobación libera fondos
- [ ] Proyectos sin escrow funcionan igual

### Frontend
- [ ] EscrowBanner aparece en cliente y vendor
- [ ] Banner muestra stats correctas
- [ ] Progress bar refleja depositado vs total
- [ ] Botón "Depositar" solo en cliente con pendiente > 0
- [ ] Modal de depósito funciona
- [ ] Montos rápidos funcionan
- [ ] Submit vendor muestra error si falta escrow
- [ ] Tercer rechazo muestra toast de mediación
- [ ] Estado "En Mediación" visible en UI

### UX/UI
- [ ] Diseño alineado con plataforma actual
- [ ] Responsive en móvil
- [ ] Loading states presentes
- [ ] Toasts informativos
- [ ] No hay errores en consola

---

## 🎬 Flujo Completo Recomendado

**30 minutos de testing:**

1. **(5 min)** Crear proyecto con escrow vía API
2. **(5 min)** Probar depósito via UI y API
3. **(10 min)** Ciclo completo: submit → reject → reject → reject → mediación
4. **(5 min)** Aprobar un hito y verificar release de fondos
5. **(5 min)** Verificar retrocompatibilidad con proyecto sin escrow

---

## 📊 Métricas de Éxito

- ✅ **100% endpoints funcionando**
- ✅ **UI sin errores de consola**
- ✅ **Mediación se activa en 3er rechazo**
- ✅ **Fondos protegidos en escrow**
- ✅ **Retrocompatibilidad preservada**

---

## 🆘 Troubleshooting

**Problema:** Banner no aparece
- **Solución:** Verificar que el proyecto tenga escrow inicializado (GET /escrow/projects/:id/escrow)

**Problema:** Submit pasa sin escrow
- **Solución:** Normal si no hay escrow configurado (feature es opcional)

**Problema:** Tercer rechazo no activa mediación
- **Solución:** Verificar que haya exactamente 2 reviews con status REJECTED previos

**Problema:** Modal de depósito no abre
- **Solución:** Check consola de browser, verificar imports

**Problema:** Fondos no se liberan al aprobar
- **Solución:** Verificar que hay escrow Y que vendor tiene cuenta creada
