#!/bin/bash
# Re-render the dial and date bitmaps from the web dial in this repo.
# It builds the offline screensaver page (dist-screensaver/, git-ignored) and
# screenshots it with Playwright through the installed Google Chrome.
# MIP (64-colour) screens get the dial reduced to the palette's four greys; AMOLED screens get full colour.
set -euo pipefail
cd "$(dirname "$0")"
REPO="$(cd .. && pwd)"

(cd "$REPO" && ./node_modules/.bin/vite build --config vite.screensaver.config.ts --logLevel warn)
node tools/export-assets.mjs "$REPO" "$PWD" "$PWD/preview"
