# Building and installing the macOS screensaver

The screensaver is an offline, button-free build of the watch simulator wrapped in a native macOS `ScreenSaverView`. It uses the current local time and bundles its images, JavaScript, CSS, and Indie Flower font.

## Requirements

- macOS 13 or newer
- Node.js and npm
- Xcode Command Line Tools

Install the command-line tools if needed:

```bash
xcode-select --install
```

## Build

From the repository root:

```bash
npm ci
npm run build:screensaver
```

The build performs two stages:

1. Vite creates the offline web application in `dist-screensaver/`.
2. `macos/build-screensaver.sh` compiles the native wrapper and packages both architectures in `build/5212 Weekly Calendar.saver`.

Both output directories are generated and ignored by Git.

## Install

Open the generated bundle with an absolute path:

```bash
open "$(pwd)/build/5212 Weekly Calendar.saver"
```

macOS opens the screen-saver installer. Approve replacing the existing copy when upgrading, then:

1. Open **System Settings → Screen Saver**.
2. Select **5212 Weekly Calendar**.
3. Use **Preview** to verify the installation.

After changing the simulator or native wrapper, rebuild and repeat the `open` command. macOS installs the bundle; it does not automatically follow later changes in the repository.

On macOS 26, quit System Settings and restart its legacy screensaver host after replacing an installed build:

```bash
killall legacyScreenSaver 2>/dev/null || true
```

The host memory-maps the native bundle and can continue running old code after installation. Reopen System Settings after this command.

## Verification

Before installing a new build:

```bash
npm test
npm run typecheck
npm run lint
npm run build:screensaver
```

The builder validates the property list, creates an ad-hoc code signature, and emits a universal `arm64`/`x86_64` bundle.

## Source layout

- `src/screensaver.tsx` — button-free React entry point
- `screensaver/index.html` — offline Vite document
- `vite.screensaver.config.ts` — relative-asset screensaver build
- `macos/WatchScreensaver/` — native `ScreenSaverView`, metadata, and WebKit lifecycle handling
- `macos/build-screensaver.sh` — universal bundle builder

The normal web application and screensaver share the watch rendering components under `src/components/`; screensaver-specific packaging remains outside those components.

## Troubleshooting

### The old version still appears

Rebuild, run the absolute `open` command again, and approve replacement. Quit System Settings, run `killall legacyScreenSaver 2>/dev/null || true`, and reopen System Settings.

### The screen is blank or white

Confirm that `npm run build:screensaver` completed successfully and reinstall the newly generated bundle. The native wrapper includes macOS 26 WebKit lifecycle and occlusion handling; copying only `dist-screensaver/` is not sufficient.

### The seconds hand skips beats

Install the latest native bundle rather than opening `dist-screensaver/index.html` directly. The native wrapper drives the eight-beat-per-second hand from `ScreenSaverView` because macOS can throttle JavaScript timers in the screensaver host.
