#!/usr/bin/env bash
set -euo pipefail

# Install GitHub CLI (gh) from official binary release
# Usage: ./scripts/install-gh-cli.sh [version]

GH_VERSION="${1:-2.86.0}"
ARCH="$(uname -m)"
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"

case "$ARCH" in
  x86_64)  ARCH="amd64" ;;
  aarch64) ARCH="arm64" ;;
  armv7l)  ARCH="armv6" ;;
esac

TARBALL="gh_${GH_VERSION}_${OS}_${ARCH}.tar.gz"
DOWNLOAD_URL="https://github.com/cli/cli/releases/download/v${GH_VERSION}/${TARBALL}"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"

echo "Installing gh CLI v${GH_VERSION} (${OS}/${ARCH})..."

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

curl -sL "$DOWNLOAD_URL" -o "${TMPDIR}/${TARBALL}"
tar -xzf "${TMPDIR}/${TARBALL}" -C "$TMPDIR"
cp "${TMPDIR}/gh_${GH_VERSION}_${OS}_${ARCH}/bin/gh" "${INSTALL_DIR}/gh"
chmod +x "${INSTALL_DIR}/gh"

echo "gh CLI v${GH_VERSION} installed to ${INSTALL_DIR}/gh"
gh --version
