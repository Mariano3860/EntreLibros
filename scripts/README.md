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