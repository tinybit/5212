#!/bin/bash
# Build the watch face for one device (default: fenix6pro).
# Usage: ./build.sh [device-id]
# RELEASE=1 ./build.sh   strips debug data and writes release/5212-<device>.prg (the file to copy to the watch).
set -euo pipefail
cd "$(dirname "$0")"

# Homebrew's openjdk@21 is keg-only, so point at it directly.
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH="$JAVA_HOME/bin:$PATH"

SDK="$(cat "$HOME/Library/Application Support/Garmin/ConnectIQ/current-sdk.cfg")"
DEVICE="${1:-fenix6pro}"
# Connect IQ developer key; kept outside the repo.
KEY="${GARMIN_DEVELOPER_KEY:-$HOME/garmin/keys/developer_key.der}"

if [ "${RELEASE:-0}" = "1" ]; then
    OUT="release/5212-$DEVICE.prg"
    FLAGS=(-r)
else
    OUT="bin/5212-$DEVICE.prg"
    FLAGS=()
fi
mkdir -p "$(dirname "$OUT")"
"$SDK/bin/monkeyc" -d "$DEVICE" -f monkey.jungle -o "$OUT" -y "$KEY" -w ${FLAGS[@]+"${FLAGS[@]}"}
echo "built $OUT"
