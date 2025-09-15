#!/usr/bin/env bash
set -euo pipefail

BACKEND_REFERENCE="${1:-}"
FRONTEND_REFERENCE="${2:-}"

if [[ -z "${BACKEND_REFERENCE}" || -z "${FRONTEND_REFERENCE}" ]]; then
  echo "Usage: $0 <backend-reference> <frontend-reference>" >&2
  exit 1
fi

echo "Staging deployment is not yet configured for EntreLibros." >&2
echo "Implement the rollout logic in scripts/deploy-staging.sh to deploy ${BACKEND_REFERENCE} and ${FRONTEND_REFERENCE}." >&2
exit 1
