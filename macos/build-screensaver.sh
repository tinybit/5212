#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/dist-screensaver"
BUILD_DIR="$ROOT_DIR/build"
BUNDLE="$BUILD_DIR/5212 Weekly Calendar.saver"
CONTENTS="$BUNDLE/Contents"
MACOS_DIR="$CONTENTS/MacOS"
RESOURCES_DIR="$CONTENTS/Resources"

if [[ ! -f "$WEB_DIR/index.html" ]]; then
  echo "Missing screensaver web build. Run: npm run build:screensaver:web" >&2
  exit 1
fi

rm -rf "$BUNDLE"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR/web"

cp "$ROOT_DIR/macos/WatchScreensaver/Info.plist" "$CONTENTS/Info.plist"
cp -R "$WEB_DIR/." "$RESOURCES_DIR/web/"

xcrun clang \
  -fobjc-arc \
  -fmodules \
  -bundle \
  -arch arm64 \
  -arch x86_64 \
  -mmacosx-version-min=13.0 \
  -framework Cocoa \
  -framework ScreenSaver \
  -framework WebKit \
  "$ROOT_DIR/macos/WatchScreensaver/WatchScreenSaverView.m" \
  -o "$MACOS_DIR/WatchScreensaver"

codesign --force --sign - --timestamp=none "$BUNDLE"
plutil -lint "$CONTENTS/Info.plist"

echo "Built: $BUNDLE"
echo "Install: open \"$BUNDLE\""
echo "Tahoe reload: quit System Settings, then run: killall legacyScreenSaver 2>/dev/null || true"
