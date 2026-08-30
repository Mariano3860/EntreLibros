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

### Contrato inspeccionado

- `users` ya contiene la identidad, el idioma, la ubicación exacta PostGIS y
  `location_visibility`; esos datos seguirán teniendo responsabilidades
  separadas.
- El perfil autenticado se lee desde `GET /api/user/profile` y se actualiza
  mediante `PATCH /api/user/profile`. La página existente de perfil será el
  único formulario de edición.
- La proyección pública se genera en `findPublicProfileById` y actualmente
  redondea coordenadas. Para esta capacidad se agregará la zona general a esa
  proyección según la visibilidad, pero las coordenadas exactas no se
  incorporarán a la respuesta pública de perfil.
- El mapa y los datos de demostración ya usan las ciudades Buenos Aires y La
  Plata, y barrios como Palermo, Chacarita, Villa Crespo, Caballito, Almagro y
  Tolosa. Es la referencia territorial existente que se reutiliza en el
  formulario.

### Catálogo inicial del MVP

Los valores persistidos son claves estables; sus etiquetas se traducen en el
frontend.

- Intereses: `fiction`, `fantasy`, `science-fiction`, `history`, `romance`,
  `children`, `essay` y `poetry`.
- Buenos Aires: Palermo, Chacarita, Villa Crespo, Caballito, Almagro,
  Parque Patricios, Barracas y Colegiales.
- La Plata: Tolosa.

La lista es deliberadamente breve y estática. No se agregará una pantalla de
administración ni se permitirá texto libre. Un barrio vacío es válido; una
ciudad desconocida o una combinación ciudad-barrio no incluida será inválida.

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

Como no existen campos equivalentes, se agregará una migración append-only con
`interests TEXT[] NOT NULL DEFAULT '{}'`, `city TEXT` y `neighborhood TEXT`.
La lista de intereses se valida contra el catálogo estable y la relación
ciudad-barrio contra el catálogo territorial del backend. Los perfiles
existentes conservarán intereses vacíos y zona nula hasta que el usuario la
complete; no se derivará una ciudad a partir de coordenadas.

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
