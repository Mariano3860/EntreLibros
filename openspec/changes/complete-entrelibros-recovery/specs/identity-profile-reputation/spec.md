## Purpose

> MVP scope: registration, session, profile and privacy. Password recovery, ratings/reputation and other enrichment are POST-MVP unless separately approved.

Define el ciclo de vida completo de la identidad, el perfil y la reputación para que los usuarios controlen su cuenta y compartan sólo la información necesaria.

## ADDED Requirements

### Requirement: Registro y sesión consistentes
El sistema SHALL permitir registro, inicio, consulta y cierre de sesión con validación coherente, mensajes internacionalizables y contraseñas almacenadas únicamente mediante hash resistente.

#### Scenario: Registro válido
- **WHEN** una persona aporta alias, correo único y una contraseña que cumple la política
- **THEN** la cuenta se crea, se inicia una sesión segura y nunca se devuelve la contraseña ni su hash

### Requirement: Recuperación de cuenta segura
El sistema SHALL ofrecer recuperación de contraseña mediante un token de un solo uso, con expiración y respuesta que no permita enumerar correos registrados.

#### Scenario: Solicitud de recuperación
- **WHEN** alguien solicita recuperación para cualquier dirección con formato válido
- **THEN** recibe la misma respuesta pública y sólo una cuenta existente obtiene un token temporal utilizable una vez

### Requirement: Perfil y privacidad controlados
Cada usuario SHALL poder editar alias, idioma, descripción y preferencias de privacidad; la ubicación pública MUST limitarse a la granularidad consentida y nunca exponer coordenadas privadas por defecto.

#### Scenario: Perfil visto por otra persona
- **WHEN** un visitante consulta un perfil
- **THEN** sólo recibe los campos públicos y la ubicación general autorizada por el propietario

### Requirement: Reputación explicable
La reputación SHALL derivarse de intercambios completados y señales moderadas, SHALL mostrar sus componentes relevantes y MUST impedir que un mismo acuerdo genere valoraciones duplicadas.

#### Scenario: Valoración posterior al intercambio
- **WHEN** un acuerdo alcanza estado completado y una parte registra su valoración
- **THEN** la reputación se actualiza una sola vez y mantiene vínculo auditable con el acuerdo

### Requirement: Bloqueo personal
Un usuario SHALL poder bloquear y desbloquear a otro; mientras exista el bloqueo no SHALL recibir nuevas conversaciones, acuerdos ni notificaciones directas de esa persona.

#### Scenario: Contacto de usuario bloqueado
- **WHEN** una persona bloqueada intenta iniciar una conversación o acuerdo
- **THEN** la operación se rechaza sin revelar más información sobre la relación de bloqueo

