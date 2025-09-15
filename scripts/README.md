# Scripts de Documentación

Este directorio contiene scripts automatizados para mantener la documentación del proyecto actualizada.

## update-backlog-prs.js

Script que actualiza automáticamente la sección de "PRs mergeadas" en `docs/backlog.md` extrayendo información de la API de GitHub.

### Uso

```bash
# Configurar token de GitHub (opcional, para evitar rate limits)
export GITHUB_TOKEN=tu_token_aqui

# Ejecutar el script
node scripts/update-backlog-prs.js
```

### Funcionalidades

- Extrae todas las PRs mergeadas del repositorio
- Categoriza automáticamente por tipo (feat, fix, docs, etc.)
- Formatea la información en tabla Markdown
- Actualiza el archivo `docs/backlog.md` preservando el resto del contenido

### Requisitos

- Node.js 16+
- Dependencia `@octokit/rest` (ya incluida en el proyecto)
- Token de GitHub (opcional pero recomendado)

### Integración con workflows

Este script puede ser integrado en un workflow de CI/CD para mantener la documentación siempre actualizada:

```yaml
- name: Update backlog with merged PRs
  run: |
    npm ci
    node scripts/update-backlog-prs.js
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Futuras mejoras

- Script para generar changelog automático
- Análisis de cobertura de tests y actualización de métricas
- Validación automática de documentación vs código real
- Generación de métricas de desarrollo (PRs por tipo, velocidad, etc.)
- Orquestación de despliegues canary y smoke tests end-to-end

## run-e2e.sh

Script de apoyo para ejecutar un smoke test end-to-end tras desplegar imágenes del backend y frontend.

### Uso

```bash
./scripts/run-e2e.sh "ghcr.io/org/proyecto-backend@sha256:..." "ghcr.io/org/proyecto-frontend@sha256:..."
```

### Funcionalidades

- Muestra las referencias (imagen@digest) probadas.
- Ejecuta `npm run test:backend` y `npm run test:frontend` reutilizando el entorno actual.

### Notas

- Requiere que las dependencias estén instaladas (`npm ci`).
- Para los tests de backend se necesita una base de datos PostgreSQL accesible via `DATABASE_URL`.
