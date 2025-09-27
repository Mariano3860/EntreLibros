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

## run-smoke-tests.sh

Script de apoyo para ejecutar pruebas de humo tras desplegar imágenes del backend y frontend.

### Uso

```bash
./scripts/run-smoke-tests.sh "docker.io/org/proyecto-backend@sha256:..." "docker.io/org/proyecto-frontend@sha256:..."
```

### Funcionalidades

- Muestra las referencias (imagen@digest) probadas.
- Ejecuta `npm run test:backend` y `npm run test:frontend` reutilizando el entorno actual hasta contar con E2E reales.

### Notas

- Requiere que las dependencias estén instaladas (`npm ci`).
- Para los tests de backend se necesita una base de datos PostgreSQL accesible via `DATABASE_URL`.

## deploy-staging.sh

Guion que debe implementar la lógica real de despliegue a staging usando referencias `imagen@digest` generadas por los workflows.

Actualmente finaliza con error a modo de recordatorio: edítalo para invocar la herramienta de despliegue que corresponda (por ejemplo, `kubectl`, `helm`, `flyctl`, etc.).

## deploy-production.sh

Responsable de las operaciones de producción: inicio del canary, promoción a 100% y rollback.

Recibe el modo (`canary`, `promote` o `rollback`), las referencias `imagen@digest` y, para el canary, el porcentaje deseado. Al igual que `deploy-staging.sh`, hoy actúa como placeholder y termina con error hasta que se complete la automatización real.
