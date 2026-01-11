# Guía de Verificación: Sistema de Aprobación de Entregables

Esta guía detalla los pasos para verificar el flujo completo de aprobación de entregables, desde el envío del vendor hasta la liberación de fondos por parte del cliente.

## Prerrequisitos
1.  Tener un proyecto creado con al menos un hito en estado `IN_PROGRESS`.
2.  Tener acceso a una cuenta de **Vendor** (asignado al proyecto) y una cuenta de **Cliente** (dueño del proyecto).

---

## Flujo 1: Envío de Entregables (Vista Vendor)

1.  **Iniciar Sesión como Vendor**
    *   Navega a `/vendor/dashboard`.
    *   Selecciona el proyecto en curso.

2.  **Subir Archivos (Opcional)**
    *   Ve a la pestaña **"Archivos"**.
    *   Sube algunos archivos de prueba en la carpeta del hito correspondiente (si existe) o en la raíz.

3.  **Enviar a Revisión**
    *   En la pestaña "Archivos", selecciona el Hito que estás trabajando (debe decir "En Progreso").
    *   Busca el botón **"Enviar a Revisión"** (icono de avión de papel) en la parte superior derecha de la vista de archivos.
    *   Haz clic en él.
    *   Confirma la acción en el diálogo.

4.  **Verificación**
    *   Deberías ver un mensaje de éxito.
    *   El estado del hito (si se muestra en alguna parte de la UI del vendor) debería haber cambiado (internamente es `READY_FOR_REVIEW`).
    *   El botón "Enviar a Revisión" ya no debería estar visible o estar deshabilitado.

---

## Flujo 2: Revisión y Rechazo (Vista Cliente)

1.  **Iniciar Sesión como Cliente**
    *   Navega a `/client/dashboard`.
    *   Entra al mismo proyecto.

2.  **Identificar Hito para Revisión**
    *   En el Dashboard del proyecto ("Visión General"), mira la sección de **Roadmap**.
    *   El hito que el vendor envió debería tener un botón azul pulsante: **"Revisar Entregables"**.

3.  **Solicitar Cambios (Rechazo)**
    *   Haz clic en "Revisar Entregables".
    *   Se abrirá un modal. Selecciona **"Solicitar Cambios"** (pulgar abajo).
    *   Escribe un motivo (ej: "Falta el archivo de diseño final").
    *   Confirma.

4.  **Verificación**
    *   El hito debería volver a estado `CHANGES_REQUESTED`.
    *   El botón "Revisar Entregables" debería desaparecer.
    *   (Opcional) Verifica como Vendor que el botón "Enviar a Revisión" vuelve a aparecer.

---

## Flujo 3: Aprobación Final y Liberación de Fondos (Vista Cliente)

1.  **Re-envío (Simulado)**
    *   Repite el paso de envío como Vendor (ahora estará habilitado de nuevo porque se solicitaron cambios).

2.  **Aprobar Entregables**
    *   Como Cliente, vuelve al botón **"Revisar Entregables"**.
    *   Esta vez, selecciona **"Aprobar y Pagar"** (verificado/check verde).
    *   El modal te advertirá que se liberarán fondos.
    *   Confirma la acción.

3.  **Verificación Final**
    *   **UI Cliente:** El hito ahora debe mostrarse como **COMPLETADO** (verde) y **PAGADO**.
    *   **Finanzas:** Ve a la pestaña "Finanzas". El monto "Liberado/Pagado" debería haber aumentado por el valor del hito. El monto en "Escrow" debería haber disminuido.
    *   **Base de Datos (Opcional):** Se genera un registro en `DeliverableReview` con estado `APPROVED` y una transacción financiera.

---

## Ajustes de Frontend Pendientes (Mejoras UX)
Aunque funcionalmente está completo, se recomienda pulir:
1.  **Reemplazar Alerts:** En la vista del Vendor (`ClientProjectFiles`), actualmente usamos `window.alert` y `window.confirm`. Sería ideal usar el sistema de `Modal` y `Toast` para consistencia visual.
2.  **Notificaciones:** Verificar que las notificaciones (campanita) lleguen correctamente al otro usuario (actualmente implementado en backend, falta verificar visualización).
