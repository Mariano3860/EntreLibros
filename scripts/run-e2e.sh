#!/usr/bin/env bash
set -euo pipefail

BACKEND_REFERENCE="${1:-}"
FRONTEND_REFERENCE="${2:-}"

if [[ -z "${BACKEND_REFERENCE}" || -z "${FRONTEND_REFERENCE}" ]]; then
  echo "Usage: $0 <backend-reference> <frontend-reference>" >&2
  exit 1
fi

echo "Running E2E tests against the following images:"
echo "  Backend: ${BACKEND_REFERENCE}"
echo "  Frontend: ${FRONTEND_REFERENCE}"

npm run test:backend
npm run test:frontend
