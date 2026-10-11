#!/usr/bin/env bash
# Build every release asset into dist-release/:
#   5212-Weekly-Calendar-<version>-macos.saver.zip        universal macOS screensaver bundle
#   5212-Weekly-Calendar-<version>-garmin.zip             Connect IQ watch face: one .prg per device in
#                                                         garmin/manifest.xml, plus WATCHES.md and SHA256SUMS
#   <asset>.sha256                                        SHA-256 beside each zip
#
# Usage: scripts/build-release.sh v1.1.0        (or: npm run build:release -- v1.1.0)
# Needs: Node.js, Xcode Command Line Tools, the Connect IQ SDK, Java 21, and a
# Connect IQ developer key (see garmin/README.md).
# Publish afterwards with:
#   gh release create v1.1.0 dist-release/* --title "5212 Weekly Calendar v1.1.0" --notes-file notes.md
set -euo pipefail

VERSION="${1:?usage: scripts/build-release.sh <version, e.g. v1.1.0>}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/dist-release"
PREFIX="5212-Weekly-Calendar-$VERSION"

cd "$ROOT_DIR"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo "== macOS screensaver"
npm run build:screensaver
# --norsrc: no AppleDouble "._" twins for extended attributes inside the zip.
ditto -c -k --norsrc --keepParent "build/5212 Weekly Calendar.saver" "$OUT_DIR/$PREFIX-macos.saver.zip"

echo "== Garmin watch face"
GARMIN_DIR="$OUT_DIR/$PREFIX-garmin"
mkdir -p "$GARMIN_DIR"
devices="$(grep -o 'iq:product id="[^"]*"' garmin/manifest.xml | sed -E 's/.*id="([^"]*)"/\1/')"
for device in $devices; do
  RELEASE=1 garmin/build.sh "$device"
  cp "garmin/release/5212-$device.prg" "$GARMIN_DIR/$PREFIX-garmin-$device.prg"
done
# The device-id table from garmin/README.md, so people can find their file inside the zip.
{
  printf '# 5212 watch face: which file is for which watch\n\n'
  sed -n '/<!-- devices:start -->/,/<!-- devices:end -->/p' garmin/README.md | grep -v 'devices:'
} > "$GARMIN_DIR/WATCHES.md"
(cd "$GARMIN_DIR" && shasum -a 256 ./*.prg | sed 's#\./##' > SHA256SUMS)
(cd "$OUT_DIR" && ditto -c -k --norsrc --keepParent "$PREFIX-garmin" "$PREFIX-garmin.zip" && rm -rf "$PREFIX-garmin")

echo "== checksums"
cd "$OUT_DIR"
shasum -a 256 "$PREFIX-macos.saver.zip" > "$PREFIX-macos.saver.zip.sha256"
shasum -a 256 "$PREFIX-garmin.zip" > "$PREFIX-garmin.zip.sha256"

echo "== release assets in $OUT_DIR"
ls -l "$OUT_DIR"
