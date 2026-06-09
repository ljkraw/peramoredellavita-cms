#!/usr/bin/env bash

set -euo pipefail

EMAIL="${1:-}"
ROLE="${2:-developer}"
USERNAME="${3:-}"
REPO="${GITHUB_REPO:-ljkraw/peramoredellavita-cms}"
WORKFLOW_FILE="admin-user.yml"
REF="${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD)}"

if [[ -z "$EMAIL" ]]; then
  echo "Usage: $0 <email> [role] [username]" >&2
  exit 1
fi

STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

ARGS=(-f "email=$EMAIL" -f "role=$ROLE")
if [[ -n "$USERNAME" ]]; then
  ARGS+=(-f "username=$USERNAME")
fi

gh workflow run "$WORKFLOW_FILE" -R "$REPO" --ref "$REF" "${ARGS[@]}" >/dev/null

echo "Workflow dispatched for $EMAIL. Waiting for run..."

RUN_ID=""
for _ in $(seq 1 30); do
  RUN_ID="$(
    gh run list \
      -R "$REPO" \
      --workflow "$WORKFLOW_FILE" \
      --limit 20 \
      --json databaseId,createdAt \
      --jq ".[] | select(.createdAt >= \"$STARTED_AT\") | .databaseId" \
      | head -n 1
  )"

  if [[ -n "$RUN_ID" ]]; then
    break
  fi

  sleep 2
done

if [[ -z "$RUN_ID" ]]; then
  echo "Could not resolve GitHub Actions run ID." >&2
  exit 1
fi

gh run watch "$RUN_ID" -R "$REPO" --exit-status
gh run view "$RUN_ID" -R "$REPO" --log=false
