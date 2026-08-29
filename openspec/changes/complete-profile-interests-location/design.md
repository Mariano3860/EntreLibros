## Context

El perfil actual ya persiste alias, descripción, idioma y niveles de visibilidad. La nueva información debe convivir con ese formulario y con la respuesta pública existente, manteniendo la política de no exponer calle, altura ni ubicación exacta.

La motivación y el alcance funcional están en `proposal.md`; los comportamientos verificables están en `specs/profile-interests-location/spec.md`.

## Goals / Non-Goals

**Goals:**

- Incorporar intereses de libros con un catálogo estable y fácil de traducir.
- Persistir ciudad obligatoria y barrio opcional como zona general.
- Validar la relación ciudad-barrio antes de guardar.
- Reutilizar los niveles de visibilidad existentes en la proyección pública.
- Mantener el flujo de perfil como el único lugar de edición de estos datos.

**Non-Goals:**

- Recomendaciones automáticas o cálculo de afinidad.
- Ordenamiento de resultados del mapa o publicaciones.
- Geolocalización del navegador, mapa o dirección exacta en el perfil.
- Catálogo administrable de intereses o territorios.
- Importación masiva de barrios o integración con un proveedor externo.

## Decisions

### 1. Catálogo predefinido de intereses

Los intereses se representarán con valores estables del producto y etiquetas traducibles. Esto evita variaciones de texto libre y permite que futuras búsquedas o afinidades trabajen con valores comparables.

Alternativa descartada: texto libre, porque complica la consistencia y agrega moderación que no pertenece a este alcance.

### 2. Datos de zona general separados de la ubicación exacta

La ciudad y el barrio se almacenarán como atributos generales del perfil. No se reutilizarán coordenadas exactas ni se agregará geocodificación al formulario. El backend validará que el barrio pertenezca a la ciudad seleccionada.

Alternativa descartada: seleccionar un punto en el mapa, porque aumenta el riesgo de exponer una dirección y no es necesario para esta historia.

### 3. Mínimo recomendado, no obligatorio

El formulario recomendará seleccionar al menos tres intereses, pero no bloqueará el guardado con menos. Esto conserva la intención de enriquecer el perfil sin impedir que un usuario complete primero los datos esenciales.

Alternativa descartada: mínimo obligatorio, porque convertiría una mejora de afinidad en una barrera para usar la aplicación.

### 4. Reutilización de visibilidad existente

La proyección pública aplicará los niveles de ubicación ya definidos: privada, ciudad y barrio. La edición de ciudad o barrio no cambiará automáticamente la preferencia de visibilidad del usuario.

Alternativa descartada: crear una segunda preferencia específica para intereses o zonas, porque duplicaría conceptos del perfil y ampliaría el alcance.

### 5. Persistencia compatible con el esquema actual

Durante la implementación se inspeccionará el modelo existente. Si no existen campos equivalentes, los intereses podrán requerir una tabla relacionada y la zona general columnas explícitas o una entidad territorial simple. La migración deberá ser aditiva y conservar perfiles existentes con valores vacíos o derivados de forma segura.

La decisión final de columnas, tablas y nombres pertenece a la implementación y debe respetar el contrato de esta OpenSpec.

## Risks / Trade-offs

- **[Catálogo de intereses demasiado amplio]** → Mantener una primera lista breve de géneros y temas de libros, documentada y traducible.
- **[Barrio incompatible con ciudad]** → Filtrar las opciones del barrio por ciudad y validar nuevamente en backend.
- **[Perfiles existentes sin zona]** → Permitir una migración con valores nulos y pedir completar la ciudad al editar o usar funciones que requieran zona.
- **[Exposición accidental de ubicación]** → Mantener la proyección pública separada de los datos privados y cubrir los tres niveles con pruebas.
- **[Confusión entre nombre real y alias]** → Mostrar siempre el alias público en el perfil y no incorporar el nombre real a este cambio.

## Migration Plan

1. Verificar el esquema actual de usuarios y la proyección pública.
2. Agregar de forma compatible los datos de intereses y zona general si son necesarios.
3. Actualizar lectura, edición y respuesta pública con pruebas de privacidad.
4. Desplegar frontend y backend juntos para mantener compatibilidad del contrato.
5. Si fuera necesario revertir, conservar los datos nuevos sin mostrarlos hasta restaurar el cliente compatible; no eliminar información durante un rollback.

## Open Questions

No quedan decisiones de producto bloqueantes para esta OpenSpec. La lista concreta de intereses y el catálogo territorial inicial deben documentarse durante la implementación, sin convertirlos en una funcionalidad administrable ni ampliar el alcance.
