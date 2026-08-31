## Why

La recreación visual del prototipo sustituyó el consumo de datos y mutaciones de las vistas principales por `PrototypeContext` y un catálogo en memoria. El backend y los clientes HTTP/Socket.IO existentes conservan una parte importante de esas capacidades, pero hoy no llegan a la nueva interfaz. Hay que recuperar esa funcionalidad sin degradar la composición, densidad ni interacciones visuales ya aceptadas.

## What Changes

- Relevar y publicar una matriz trazable entre cada región e interacción de la interfaz del prototipo, su fuente actual de datos, las rutas/eventos reales disponibles y la decisión: reconectar, adaptar de forma compatible o diferir por ausencia real de backend.
- Sustituir el estado de demostración de cada capacidad ya soportada por consultas, mutaciones y eventos reales, manteniendo la interfaz visual como contrato prioritario y adaptando el backend de forma compatible cuando sus respuestas no basten para esa presentación.
- Mantener MSW y datos deterministas sólo para desarrollo, pruebas y regiones explícitamente diferidas; en modo API real no se mostrarán datos ficticios como si fueran persistidos.
- Preservar las rutas, anatomía, estados locales de carga/vacío/error y acciones visibles del prototipo mientras se conectan autenticación, perfil, libros, comunidad, mapa, mensajería, acuerdos, notificaciones y tiempo real que ya existan.
- Registrar los huecos de producto que el backend no soporta todavía como límites explícitos para una propuesta futura, sin convertir este cambio en la implementación de funcionalidades nuevas no existentes.

## Capabilities

### New Capabilities

- `prototype-backend-reconnection`: Contrato para inventariar, integrar y verificar datos, acciones y eventos reales detrás de la interfaz visual del prototipo sin alterar su experiencia observable.

### Modified Capabilities

- `ideal-prototype-mock-experience`: Delimita el uso de MSW para que sea explícitamente de demostración/prueba o de capacidades diferidas, y no oculte desconexiones cuando se usa la API real.

## Impact

- Afecta `frontend/src/features/prototype`, las páginas y componentes visuales, servicios y hooks de `frontend/src/api`, configuración de modo API, handlers MSW y pruebas del frontend.
- Afecta las rutas, servicios, repositorios y eventos Socket.IO existentes de `backend/src` sólo cuando se requiera una adaptación compatible para satisfacer el modelo de vista definido por el frontend.
- Requiere una comprobación integrada con API, PostgreSQL y Socket.IO, además de una comprobación de navegador contra las referencias visuales locales; no introduce en esta fase funcionalidades de backend que la matriz clasifique como ausentes.
