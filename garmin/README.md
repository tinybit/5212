# Garmin watch face

Connect IQ watch face built from the calibrated 5212 dial in this repo.

- **Dial:** the web dial without hands, rendered by `tools/export-assets.mjs` and stored as one bitmap per screen size, plus one date-window bitmap per day (1–31).
- **Hands:** all five hands are drawn on the watch as polygons from the measured shapes in `src/components/WeeklyCalendarWatch.tsx`, because not every target can rotate bitmaps.
- **Calendar:** ISO week, weekday, and date follow the same formulas as the web dial (`source/Calendar.mc`).

| Device id       | Watch                                             | Screen           | Colours                                 |
| --------------- | ------------------------------------------------- | ---------------- | --------------------------------------- |
| `fenix6pro`     | fēnix 6 Pro / 6 Pro Solar / 6 Sapphire / quatix 6 | 260 × 260 MIP    | 64-colour palette (cream becomes white) |
| `fenix9pro47mm` | fēnix 9 Pro 47 mm                                 | 454 × 454 AMOLED | Web dial colours                        |

Behaviour that differs from the web dial:

- The seconds hand shows only while the watch is awake and steps once per second. In low-power mode the watch redraws once a minute, so the seconds hand is hidden.
- On screens with burn-in protection (AMOLED), the always-on view shows only the hour and minute hands, dim on black.

## Requirements

- Connect IQ SDK 9.2.0 and the device files above, installed with Garmin's SDK Manager.
- Java 21: `brew install openjdk@21` (the scripts use `/opt/homebrew/opt/openjdk@21`).
- A Connect IQ developer key, kept outside the repo. The default path is `~/garmin/keys/developer_key.der`; set `GARMIN_DEVELOPER_KEY` to use another one. To create one:

  ```bash
  openssl genrsa 4096 | openssl pkcs8 -topk8 -inform PEM -outform DER -nocrypt -out ~/garmin/keys/developer_key.der
  ```

- For re-exporting the dial: `npm ci` at the repo root and Google Chrome installed (Playwright drives it).

## Commands

```bash
./garmin/run.sh fenix9pro47mm          # build and load into the Connect IQ simulator
RELEASE=1 ./garmin/build.sh fenix6pro  # release build: garmin/release/5212-fenix6pro.prg
./garmin/export.sh                     # re-render the dial and date bitmaps after dial changes
```

`export.sh` writes `resources-<device>/drawables/` and `source/Generated.mc`. To add a watch, add it to `TARGETS` in `tools/export-assets.mjs` and to `manifest.xml`, then re-export.

## Installing on a watch

1. Make a release build for the watch's device id.
2. Quit Garmin Express. On macOS, open the watch with OpenMTP (watches with music use MTP, which Finder does not show).
3. Copy the `.prg` into `GARMIN/APPS` on the watch and unplug it.
4. On the watch: hold **MENU** → **Watch Face** → select **5212** → **START** → **Apply**.
