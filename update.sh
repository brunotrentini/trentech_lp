#!/usr/bin/env bash

# Atualiza a branch atual e recria o contêiner da aplicação.
# Uso na VPS, dentro da pasta trentech-lp: ./update.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Erro: este script deve estar dentro do repositório Git."
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Erro: há alterações locais em arquivos rastreados pelo Git."
  echo "Revise com: git status"
  exit 1
fi

BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  echo "Erro: o repositório está em detached HEAD. Selecione uma branch antes de atualizar."
  exit 1
fi

echo "Atualizando branch '$BRANCH'..."
git pull --ff-only

echo "Reconstruindo e iniciando a aplicação com Docker Compose..."
docker compose up -d --build --remove-orphans
docker compose ps
