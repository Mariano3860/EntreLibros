# Domain Model

- **User** tiene sesión, perfil, intereses, ubicación privada y visibilidad.
- **Book** es metadata bibliográfica; **Book Listing** es la relación concreta
  de un usuario con ese libro. Un listing puede ser **Offer**, **Want**, venta
  o intercambio según sus modalidades y disponibilidad.
- **Book Corner** es un lugar comunitario con normas, horario, alcance y
  ubicación protegida; no es una publicación individual.
- **Conversation** une participantes. Un **Message** es persistido y secuencial;
  un **Message Draft** es privado por autor y conversación hasta enviarse.
- **Agreement** coordina un intercambio; sus **Agreement Versions** y
  aceptaciones son versionadas. **Outcome** registra el resultado privado de
  cada participante.
- **Notification**, **Report** y **Analytics Event** representan avisos,
  denuncias y señales mínimas. **Block** y **Follow** modifican visibilidad y
  descubrimiento.

Las tablas y migrations que concretan estos conceptos se describen en
[Database](database.md); los recorridos de negocio están en
[Request Flows](request-flows.md).
