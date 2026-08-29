## Purpose

> MVP support scope: authentication, authorization, session/origin protections, validation and safe errors. Advanced abuse controls may be POST-MVP.

Establece controles de seguridad transversales para proteger cuentas, datos, endpoints y operación frente a accesos indebidos, abuso y dependencias vulnerables.

## ADDED Requirements

### Requirement: Autenticación y autorización de mutaciones
Todo endpoint que cree, modifique, verifique, modere o elimine recursos protegidos MUST requerir una identidad autenticada y SHALL comprobar propiedad o rol autorizado.

#### Scenario: Mutación anónima
- **WHEN** un visitante intenta crear un rincón o verificar un libro sin autenticarse
- **THEN** el sistema rechaza la operación con una clave de error internacionalizable y no cambia datos

#### Scenario: Recurso de otro usuario
- **WHEN** un usuario autenticado intenta modificar un recurso ajeno sin rol suficiente
- **THEN** el sistema responde con prohibición y registra el intento sin exponer datos privados

### Requirement: Sesión web endurecida
Las sesiones de producción MUST usar cookies `HttpOnly`, `Secure` y una política `SameSite` compatible con la arquitectura; las mutaciones SHALL estar protegidas contra CSRF y CORS SHALL aceptar sólo orígenes configurados.

#### Scenario: Origen no permitido
- **WHEN** un sitio no autorizado intenta una petición con credenciales
- **THEN** el navegador no recibe permiso CORS y el backend no procesa una mutación sin protección CSRF válida

### Requirement: Controles de abuso y cargas
Los endpoints sensibles SHALL aplicar límites de frecuencia, tamaño, tipo y complejidad adecuados, incluidos login, registro, contacto, rincones, búsquedas y adjuntos.

#### Scenario: Envíos repetidos
- **WHEN** un cliente supera el límite configurado de una operación sensible
- **THEN** el sistema responde con limitación temporal coherente y no sigue consumiendo recursos costosos

### Requirement: Dependencias con riesgo controlado
La entrega MUST bloquear vulnerabilidades críticas o altas aplicables al runtime, salvo excepción documentada con análisis, mitigación, responsable y fecha de caducidad.

#### Scenario: Auditoría de CI con vulnerabilidad aplicable
- **WHEN** el escaneo detecta una vulnerabilidad crítica o alta explotable en producción
- **THEN** la puerta de entrega falla hasta actualizar, mitigar o aprobar formalmente la excepción temporal

### Requirement: Errores y registros seguros
Las respuestas visibles SHALL usar claves de error internacionalizables y los registros MUST omitir contraseñas, tokens, cookies, secretos y datos personales innecesarios, conservando correlación para auditoría.

#### Scenario: Error interno inesperado
- **WHEN** una operación falla por una excepción interna
- **THEN** el cliente recibe un error genérico trazable y el registro contiene contexto técnico sin secretos

