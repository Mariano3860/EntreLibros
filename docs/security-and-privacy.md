# Security and Privacy

## Implemented

- Cookie de sesión, middleware de autenticación y autorización por propietario,
  participante, rol o bloqueo bidireccional.
- CORS para el origen configurado, comprobación de Origin en mutaciones, Helmet,
  límites de payload y errores públicos sin detalles internos.
- SQL parametrizado en repositories, timeouts para proveedores externos y
  `X-Request-Id` para correlación sin copiar datos sensibles.
- Perfiles y mapa usan proyecciones públicas: nunca exponen contraseña, correo,
  calle, altura o coordenadas exactas cuando no corresponda.

## Deployment or future work

HTTPS, secreto fuerte, red de base privada, backup/restore comprobado,
rate-limiting, MFA, email/push, retención/anonimización integral y moderación
humana requieren entorno o trabajo adicional. No se presentan como controles
locales demostrados.

Revisa `backend/src/security.ts`, `middleware/auth.ts`, `userRepository.ts`,
rutas y `backend/tests/security.test.ts`.
