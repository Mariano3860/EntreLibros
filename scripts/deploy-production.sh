#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-}"
BACKEND_REFERENCE="${2:-}"
FRONTEND_REFERENCE="${3:-}"
PERCENTAGE="${4:-}"

if [[ -z "${MODE}" || -z "${BACKEND_REFERENCE}" || -z "${FRONTEND_REFERENCE}" ]]; then
  cat <<USAGE >&2
Usage:
  $0 canary <backend-reference> <frontend-reference> <percentage>
  $0 promote <backend-reference> <frontend-reference>
  $0 rollback <backend-reference> <frontend-reference>
USAGE
  exit 1
fi

case "${MODE}" in
  canary)
    if [[ -z "${PERCENTAGE}" ]]; then
      echo "ERROR: Provide a canary percentage as the fourth argument." >&2
      exit 1
    fi
    ACTION="Start canary rollout (${PERCENTAGE}%)"
    ;;
  promote)
    ACTION="Promote canary to 100%"
    ;;
  rollback)
    ACTION="Rollback to previous digests"
    ;;
  *)
    echo "ERROR: Unknown mode '${MODE}'." >&2
    exit 1
    ;;
esac

echo "${ACTION} for EntreLibros is not yet automated." >&2
echo "Implement the production deployment logic inside scripts/deploy-production.sh" \
  "to handle ${MODE} using ${BACKEND_REFERENCE} and ${FRONTEND_REFERENCE}." >&2
exit 1
