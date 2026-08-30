## Purpose

Proteger el cierre de sesión frente a activaciones accidentales mediante una confirmación clara, cancelable y compatible con la gestión existente de la sesión.

## ADDED Requirements

### Requirement: Logout con confirmación explícita

La acción de cerrar sesión SHALL mostrar un modal de confirmación antes de invalidar la sesión. Cancelar SHALL cerrar el modal sin cambiar la sesión; confirmar SHALL cerrar la sesión y llevar a la pantalla pública correspondiente.

#### Scenario: Cancelar cierre de sesión

- **WHEN** una persona selecciona logout y luego cancela el modal
- **THEN** el modal se cierra, la sesión sigue activa y la persona permanece en la aplicación

#### Scenario: Confirmar cierre de sesión

- **WHEN** una persona confirma el logout
- **THEN** la sesión se invalida, se limpian los datos de sesión aplicables y la persona deja de acceder a las vistas protegidas
