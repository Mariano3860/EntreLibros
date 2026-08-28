## Purpose

Define un proceso de entrega reproducible y verificable que permita desplegar EntreLibros con configuración segura, migraciones controladas y recuperación operativa.

## ADDED Requirements

### Requirement: Artefactos de producción compatibles
Los artefactos de frontend y backend SHALL construirse con una versión de Node.js admitida por el proyecto y SHALL arrancar desde imágenes versionadas construibles desde el commit entregado.

#### Scenario: Build reproducible de una versión
- **WHEN** CI construye frontend y backend desde un commit y lockfile determinados
- **THEN** genera imágenes identificables con esa versión sin depender de imágenes privadas no publicadas previamente

### Requirement: Enrutamiento público correcto
El despliegue SHALL exponer el frontend por el puerto real del servidor web y SHALL enrutar las llamadas `/api` y Socket.IO al backend sin depender de variables inyectadas después de compilar el bundle estático.

#### Scenario: Navegación en producción
- **WHEN** un usuario abre una ruta SPA y realiza una llamada autenticada a `/api`
- **THEN** la SPA carga, la petición alcanza el backend y la cookie conserva el alcance y seguridad esperados

### Requirement: Configuración y secretos validados
El arranque de producción MUST exigir secretos no predeterminados, `NODE_ENV=production`, orígenes permitidos y conexiones de datos válidas, y MUST fallar cerrado si falta un valor obligatorio.

#### Scenario: Secreto ausente
- **WHEN** se intenta desplegar sin un secreto JWT o contraseña de base obligatorios
- **THEN** el servicio no queda listo y reporta el nombre de la configuración ausente sin revelar otros secretos

### Requirement: Migración antes de disponibilidad
El despliegue SHALL aplicar migraciones una sola vez mediante una etapa controlada y no SHALL marcar el backend como listo hasta que base, esquema y extensión PostGIS estén disponibles.

#### Scenario: Nueva versión con cambio de esquema
- **WHEN** se despliega una versión que contiene migraciones pendientes
- **THEN** las migraciones terminan antes de recibir tráfico o el despliegue se aborta sin ejecutar una aplicación incompatible

### Requirement: Recuperación y rollback verificados
El sistema SHALL disponer de procedimientos probados de backup, restauración y rollback que preserven datos de usuario y definan cómo tratar migraciones no reversibles.

#### Scenario: Versión defectuosa
- **WHEN** una verificación posterior al despliegue falla
- **THEN** operaciones puede volver a una versión compatible y restaurar datos conforme al runbook probado

