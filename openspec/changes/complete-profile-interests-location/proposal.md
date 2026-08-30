## Why

El perfil ya permite editar alias, descripción, idioma y visibilidad, pero todavía no permite expresar intereses relacionados con libros ni elegir una zona general. Completar estos datos aporta contexto para las afinidades y la cercanía de publicaciones o Rincones sin exponer una dirección exacta.

## What Changes

- Incorporar una selección predefinida de intereses de libros.
- Recomendar seleccionar al menos tres intereses, sin impedir guardar el perfil con menos.
- Incorporar ciudad obligatoria y barrio opcional como zona general del perfil.
- Permitir elegir la zona mediante controles simples, sin mapa ni geolocalización en este flujo.
- Mostrar ciudad o barrio según la configuración de visibilidad de ubicación ya existente.
- Mantener ocultos los datos de dirección exacta y no agregar recomendaciones automáticas ni afinidades avanzadas en este cambio.

## Capabilities

### New Capabilities

- `profile-interests-location`: edición y exposición controlada de intereses de libros y zona general del perfil.

### Modified Capabilities

<!-- No existen especificaciones principales equivalentes en openspec/specs/. -->

## Impact

- Frontend: formulario de perfil, selector de intereses, selectores de ciudad y barrio, validaciones y presentación pública.
- Backend: modelo persistido de intereses y zona general, endpoints de lectura/actualización y sanitización de la respuesta pública.
- Base de datos: posible migración para almacenar intereses y zona, únicamente si el esquema actual no tiene campos equivalentes.
- Privacidad: reutilización de los niveles de visibilidad existentes; nunca se expondrán calle, altura ni coordenadas exactas.
- Pruebas: validaciones de perfil, persistencia, respuesta pública y casos de visibilidad.
