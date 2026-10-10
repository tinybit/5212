#!/bin/bash
# Build, start the Connect IQ simulator if needed, and load the watch face into it.
# Usage: ./run.sh [device-id]
set -euo pipefail
cd "$(dirname "$0")"

export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH="$JAVA_HOME/bin:$PATH"

SDK="$(cat "$HOME/Library/Application Support/Garmin/ConnectIQ/current-sdk.cfg")"
DEVICE="${1:-fenix6pro}"

./build.sh "$DEVICE"
if ! pgrep -f "ConnectIQ.app/Contents/MacOS/simulator" >/dev/null; then
    open "$SDK/bin/ConnectIQ.app"
    sleep 5
fi
"$SDK/bin/monkeydo" "bin/5212-$DEVICE.prg" "$DEVICE"
