#!/usr/bin/env sh
set -eu

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks is not installed. Install it to run secret scans locally:"
  echo "  brew install gitleaks"
  echo "  https://github.com/gitleaks/gitleaks#installing"
  exit 1
fi

exec gitleaks "$@"
