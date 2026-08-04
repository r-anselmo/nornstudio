# Design sources

Artwork that is committed as a binary but authored as vector. Nothing here is
imported by the app — these are the sources the checked-in assets came from, so
a brand change does not mean re-tracing anything.

## `app/apple-icon.png`

iOS home screen icons must be PNG, so unlike the favicon this one cannot be
served as SVG. Regenerate it from `design/apple-icon.svg` after any change:

```bash
sips -s format png design/apple-icon.svg --out /tmp/norn-apple-1024.png
sips -z 180 180 /tmp/norn-apple-1024.png --out app/apple-icon.png
```

`sips` is built into macOS and reads SVG through CoreSVG, so this needs no
dependencies. Two gotchas it will not warn you about clearly:

- **CoreSVG rejects a file whose XML comments contain a double hyphen.** `--`
  is illegal inside an XML comment, which is why the regeneration commands live
  in this file rather than inside the SVG. The error surfaces as
  `Error: Cannot extract image from file` with a `parser error` above it.
- **`sips` silently writes nothing if `--out` points outside the working
  directory** on some paths. Run it from the repo root, as above.

`app/apple-icon.test.ts` checks the result is a valid 180×180 PNG, so a failed
regeneration cannot ship unnoticed.

## Why the source is not under `app/`

Anything matching `apple-icon.*` inside `app/` becomes an icon route. Keeping
the SVG here stops Next emitting a second, competing `<link rel="apple-touch-icon">`.

## `app/icon.svg` and `app/icon.png`

The browser favicon has no separate source — `app/icon.svg` *is* the source,
served as-is. It is the rounded variant; browsers do not mask favicons, so the
rounding has to be in the artwork rather than left to the client.

`app/icon.png` is the same artwork rasterised, and it is not optional:
**Safari does not support SVG favicons.** With only the SVG declared, Safari
ignores the tag, falls back to probing `/favicon.ico`, finds nothing, and keeps
displaying whatever icon it had cached — which looks exactly like the favicon
never changed. Both are declared, and each browser takes the one it can read.

Regenerate it from the SVG after any change:

```bash
sips -s format png app/icon.svg --out /tmp/norn-icon-1024.png
sips -z 192 192 /tmp/norn-icon-1024.png --out app/icon.png
```
