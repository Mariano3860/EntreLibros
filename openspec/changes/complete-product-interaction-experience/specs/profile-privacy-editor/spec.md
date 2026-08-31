## Purpose

Dar a cada lector una edición de perfil completa y segura para identidad, intereses e información geográfica sin exponer más ubicación de la elegida.

## ADDED Requirements

### Requirement: Edición ampliada de perfil
Una persona autenticada SHALL poder actualizar foto de perfil, nombre visible, biografía, intereses y ubicación estructurada por país, ciudad, barrio y calle opcional. La edición SHALL validar datos y conservar los valores confirmados al volver a abrir el perfil.

#### Scenario: Actualizar intereses y foto
- **WHEN** una persona modifica sus intereses y confirma una foto de perfil válida
- **THEN** el perfil muestra los cambios guardados y conserva un fallback si la imagen no está disponible

### Requirement: Visibilidad geográfica granular
El perfil SHALL permitir elegir qué nivel geográfico hacer público: ninguno, país, ciudad o barrio. La calle SHALL permanecer privada y solo podrá utilizarse para operaciones internas autorizadas, como geocodificación o cálculo aproximado.

#### Scenario: Publicar solo la ciudad
- **WHEN** una persona selecciona ciudad como máximo nivel público
- **THEN** visitantes ven país y ciudad, pero no barrio ni calle

#### Scenario: Perfil con ubicación privada
- **WHEN** una persona selecciona no publicar ubicación
- **THEN** las respuestas públicas y las cards sociales no exponen país, ciudad, barrio ni calle

