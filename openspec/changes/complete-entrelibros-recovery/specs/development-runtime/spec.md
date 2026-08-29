## Purpose

Define un entorno local determinista y diagnosticable para que cualquier colaborador pueda ejecutar EntreLibros desde un clon limpio sin depender de estado oculto de la máquina.

## ADDED Requirements

### Requirement: Herramientas reproducibles
El proyecto SHALL declarar y utilizar una única versión compatible de Node.js y SHALL instalar dependencias de forma determinista desde el lockfile.

#### Scenario: Preparación desde un clon limpio
- **WHEN** un colaborador prepara el repositorio con la versión declarada de Node.js
- **THEN** la instalación, los typechecks y los builds terminan sin advertencias de incompatibilidad de motor

### Requirement: Preflight de servicios locales
El flujo de desarrollo SHALL verificar puertos y destino de PostgreSQL antes de migrar o arrancar, y MUST fallar con un diagnóstico accionable si `localhost` apunta a una instancia sin PostGIS o a una base inesperada.

#### Scenario: PostgreSQL conflictivo en el puerto 5432
- **WHEN** otro servicio ocupa el puerto configurado o la base no ofrece PostGIS
- **THEN** el arranque se detiene antes de escribir datos e identifica el servicio, puerto y corrección esperada

### Requirement: Configuración de frontend y backend coherente
Cada modo SHALL resolver una URL de API válida que incluya el prefijo `/api`, y el modo de desarrollo MUST usar backend real salvo que mocks se habiliten explícitamente.

#### Scenario: Desarrollo con backend real
- **WHEN** se ejecuta el comando documentado de desarrollo
- **THEN** una petición del frontend a salud llega al backend configurado y no al servidor estático del puerto 3000

#### Scenario: Mocks explícitos
- **WHEN** un desarrollador habilita mocks mediante la variable documentada
- **THEN** la interfaz indica o registra claramente el modo simulado y no mezcla respuestas mock con datos reales

### Requirement: Migraciones locales y de pruebas idempotentes
El proyecto SHALL crear o actualizar las bases de desarrollo y pruebas mediante migraciones incrementales repetibles, sin borrar datos existentes de forma implícita.

#### Scenario: Migrador sin cambios pendientes
- **WHEN** se ejecuta el migrador sobre una base actualizada
- **THEN** termina correctamente sin reaplicar ni alterar migraciones registradas

### Requirement: Documentación de acceso local
La documentación SHALL distinguir credenciales de infraestructura, secretos JWT y credenciales de usuario, y MUST explicar que no existe una cuenta predeterminada recuperable.

#### Scenario: Primer acceso de un colaborador
- **WHEN** una persona sigue la guía local
- **THEN** puede registrar una cuenta válida y entiende qué valores son sólo secretos de desarrollo

