# CAD.LIKE.AUDIO

A 2D CAD sketcher that runs entirely in your browser. Draw a part, check that it
can actually be cut, and export it as DXF — no install, no account, no server.

Free to anyone who needs it, under the MIT licence.

---

## What it is

It's a drafting tool for people who need a real outline out the other end: a
panel, a faceplate, a bracket, a rack ear. You sketch with lines, arcs and
circles, the app tells you whether the shape is a closed loop a cutter can
follow, and you download a DXF.

Everything happens on your machine. The page is a static bundle — HTML, CSS and
JavaScript. There is no backend, nothing is uploaded, and your drawing never
leaves the browser.

**True arcs, not polygons.** A circle is stored as two real half-arcs with a
centre and a radius, not as a hundred tiny line segments. Cut a piece out of it
and what's left is still curved. An untouched circle exports as a DXF `CIRCLE`
entity and a trimmed one as `ARC` entities, so the toolpath your fabricator
generates is smooth rather than faceted.

## How it loads

Open the page and it's ready — there's no project to create or file to pick.

- **Your last drawing comes back on its own.** The editor saves each change to
  the browser's IndexedDB (with a localStorage fallback) and restores it on the
  next visit. You'll see *"Restored previous session from browser memory."*
- **Recent files** under `File ▸ Recent Files` are cached in the browser too, so
  reopening a DXF or a tracing image doesn't mean digging through folders.
- **The build revision** sits in the bottom-right corner as `YYYYMMDD.HH.MM`,
  stamped when the bundle was compiled — next to a link back to this repository.
  It tells you which build you're actually looking at after a deploy.

### Running it yourself

Everything lives in `Code/` — the repository root holds only this README and the
licence.

```bash
cd Code
npm install
npm run dev      # http://localhost:5173
```

```bash
cd Code
npm run build    # typecheck + bundle into Code/dist/
npm run preview  # serve the built bundle locally
```

`Code/dist/` is plain static output. Drop it on GitHub Pages, S3, nginx, a NAS, a
USB stick — anywhere that serves files. Nothing needs to run server-side.

Pushing to `main` builds it and publishes `Code/dist/` over FTPS
(`.github/workflows/deploy.yml`).

### Layout

```
LICENSE
README.md
.github/workflows/    CI: build and deploy
Code/
  src/                application source
  dist/               build output
  Documentation/      code guide
  index.html          entry point
  package.json  tsconfig.json  vite.config.ts
```

## What it does

**Drawing** — line, polyline, rectangle, circle (by centre, by 2 points, by 3
points), ellipse, smooth curve, line at a given angle, line perpendicular to
another, tangent line, and parallel/offset lines. Type exact dimensions as you
draw instead of eyeballing them.

**Editing** — drag the orange grips on a selected shape: an endpoint grip moves
that point, a midpoint grip moves the whole segment. Select several things and a
dashed net appears with corner handles that scale the selection. Rotate, scale,
flip, offset and trim from the `Modify` menu. `Explode` breaks a joined outline
into pieces you can move one at a time.

**Copy from a reference point** (`Ctrl+Shift+C`) — pick the exact point you want
to copy *from*, then paste puts that point under your cursor, snapped onto
existing geometry. Far more precise than copy-and-nudge.

**Snapping** — the cursor sticks to endpoints and midpoints of existing
geometry, with an optional grid snap on top. Hold `Shift` for orthogonal.

**Layers** — add, rename, recolour (standard DXF/ACI colours), show, hide and
lock. Move a selection to another layer, or select everything on one. Layers
survive the DXF round trip.

**Grid** — ruled lines, dots, or off, at a spacing you choose, with automatic
10× and 100× emphasis as you zoom.

**SHPE mode** — validation for cuttability. It flags loose ends and crossings,
checks every outline is a simple closed loop, and refuses to call the drawing
exportable when there's more than one outer boundary or nesting deeper than
shape-inside-hole. Turn it on from the `Drawing` menu.

**DXF in and out** — open a DXF (with a unit-conversion prompt on import) and
export as DXF R2000 with your units written into the header.

**Tracing images** — drop a photo or screenshot underneath the drawing, then
calibrate the scale by clicking two points whose real distance you know, and
trace over it at true size.

## Keyboard

| Key | Tool | | Key | Action |
|---|---|---|---|---|
| `S` | Select | | `Ctrl+C` | Copy |
| `L` | Line | | `Ctrl+Shift+C` | Copy from a reference point |
| `A` | Line at angle | | `Ctrl+X` | Cut |
| `O` | Orthogonal line | | `Ctrl+V` | Paste at cursor |
| `T` | Tangent line | | `Ctrl+A` | Select all |
| `P` | Polyline | | `Ctrl+Z` | Undo |
| `V` | Curve | | `Delete` | Delete selection |
| `R` | Rectangle | | `Esc` | Cancel / deselect |
| `C` | Circle | | `Shift` | Orthogonal constraint |
| `2` `3` | Circle by 2 / 3 points | | `Space`+drag | Pan |
| `E` | Ellipse | | middle-drag | Pan |
| `B` | Break / trim | | scroll | Zoom |
| `M` | Measure | | | |

Parallel and Rotate are on the toolbar and the `Modify` menu; their letters are
currently taken by Polyline and Rectangle. A polyline is finished with a
double-click on its last point — `Esc` discards it.

## Built with

React 19, TypeScript and Vite, with Tailwind CSS v4 for the interface. The
drawing surface is a plain `<canvas>` painted imperatively, so panning and
dragging never wait on a React render.

The codebase is deliberately hyper-modular — one function per file. If you're
going to work on it, read **[Code/Documentation/CODE_GUIDE.md](Code/Documentation/CODE_GUIDE.md)**
first: it explains the layout, where a new tool or menu goes, and why the two
state classes are thin facades over per-operation files.

## Licence

MIT — see [LICENSE](LICENSE).

Use it, fork it, sell what you make with it, put it in your own product. No fee,
no attribution required in your output files, no strings. It's here for anyone
who needs to cut a shape.
