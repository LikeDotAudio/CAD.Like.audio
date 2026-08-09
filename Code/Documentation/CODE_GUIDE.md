# CAD.LIKE.AUDIO — Code Guide

How this codebase is organised, and the rules to follow when adding to it.
The organising principle is **hyper-modularity: one function per file.**

---

## 1. The core rule

**One exported function per file. The file is named after the function.**

```
src/render/dimensions/dimH.ts        →  export function dimH(...)
src/model/doc/translateEdges.ts      →  export function translateEdges(doc, ...)
src/components/toolbar/buttons/ZoomInButton.tsx  →  export function ZoomInButton()
```

Corollaries:

- **A folder is a module.** `src/render/edges/` holds everything that draws edges,
  one file per drawing step. There is no `edges.ts` barrel alongside it.
- **No index.ts barrels.** Import the exact file you need:
  `import { dimH } from '../render/dimensions/dimH';`
  Barrels hide the module graph and re-create the monoliths this structure removes.
- **File name === export name**, including case. `drawGrid.ts` exports `drawGrid`.
  React components are `PascalCase.tsx`; everything else is `camelCase.ts`.

### Where types live

Types are not functions, so they do **not** get their own file by default:

- A type that describes one function's input or output lives **in that function's file**
  (`ArcGeom` lives in `arcGeom.ts`, `LineLineHit` in `lineLineIntersect.ts`,
  `SplineSegment` in `splineSegments.ts`).
- A type shared across a whole module gets a PascalCase file of its own
  (`src/render/edges/EdgeStyleState.ts`, `src/state/UiState.ts`,
  `src/io/browserStorage/SavedSession.ts`).
- Cross-cutting domain types stay in `src/core/types.ts`.

> **Never put `ArcGeom.ts` next to `arcGeom.ts`.** It works on Linux and breaks the
> moment someone clones on macOS or Windows, where the filesystem is case-insensitive.
> That is exactly why a type lives with the function that produces it.

### Constants

Small related constants may share one file when they are meaningless apart:
`src/render/selectionBox/handleSizes.ts`, `src/model/units/mmPerUnit.ts`,
`src/core/constants.ts`. A constant used by exactly one function belongs in that
function's file.

---

## 2. Classes are facades

Two classes hold mutable state: `Doc` (the drawing) and `EditorStore` (the editor).
Neither contains logic. Each method is a **one-line delegator** to a file that holds
the real implementation as a free function taking the instance as its first argument.

```ts
// src/model/Doc.ts — the facade
translateEdges(edgeIds: Iterable<number>, dx: number, dy: number): boolean {
  return translateEdges(this, edgeIds, dx, dy);
}

// src/model/doc/translateEdges.ts — the implementation
export function translateEdges(doc: Doc, edgeIds: Iterable<number>, dx: number, dy: number): boolean {
  ...
}
```

- `src/model/doc/` — one file per `Doc` operation (34 files).
- `src/state/actions/` — one file per `EditorStore` method (92 files).

Because call sites still say `doc.translateEdges(...)` and `store.copySelection(...)`,
the facade keeps the public API stable while the implementation stays in single-purpose
files.

**Fields on these classes are public** (marked `/** @internal */` where they are not
part of the real API) so the action files can reach them. Do not add `private` back —
it breaks the split. Treat anything marked `@internal` as off-limits from components.

The facade may keep genuinely trivial accessors inline: `get edgeCount()`,
`vertexOf(id)`, `edge(id)`. Splitting a one-line getter into a file buys nothing.

---

## 3. Directory map

```
src/
  core/         Types, constants, small pure helpers (clamp, parseMathExpression)
  geometry/     Pure maths. No Doc, no canvas, no React.
                arc/ intersect/ polygon/ spline/ distToSegment.ts
  model/        The drawing and operations on it.
                Doc.ts (facade) + doc/, commits/, topology/, units/, validate/, breakCircle/
  viewport/     Viewport (pan/zoom) and snap/
  render/       Canvas painting. One draw step per file.
                grid/ edges/ dimensions/ overlays/ selectionBox/ + Scene.ts, palette.ts
  tools/        One drawing tool per file, registered in registry.ts
  state/        EditorStore.ts (facade) + actions/, UiState.ts, useStore.ts, useUi.ts
  io/           DXF in/out, image import, browser persistence
  image/        Tracing image + calibration
  components/   React. One component per file.
                menubar/     header + one file per menu
                toolbar/     left rail + one file per button and icon
                sidebar/     layers/ and properties/, one file per row
                contextmenu/ canvas right-click menu
                layermenu/   layer-row right-click menu
                statusbar/   one file per readout
```

### Dependency direction

`components → state → model → geometry → core`, and `render` sits beside `model`
reading it. Nothing in `geometry/` may import from `model/`, `render/`, or `state/`.
Nothing in `model/` may import React or touch the DOM.

---

## 4. UI structure

### Header menus

`components/menubar/MenuBar.tsx` owns exactly one piece of state — which menu is open —
and renders one component per menu:

```
menubar/
  MenuBar.tsx            the header; references the menus, nothing else
  MenuBarButton.tsx      the "File ▾" trigger
  MenuDropdown.tsx       the panel
  MenuItem.tsx           one row: icon + label + shortcut
  MenuDivider.tsx
  MenuProps.ts           the { open, onToggle, onClose } contract
  useMenuDismiss.ts      outside-click dismissal
  menus/FileMenu.tsx  EditMenu.tsx  ModifyMenu.tsx  DimensionMenu.tsx  DrawingMenu.tsx
  menus/file/            File-menu-only parts (pickers, recent files)
  menus/drawing/         One file per settings row
```

**Adding a menu:** create `menus/YourMenu.tsx` taking `MenuProps`, add its id to
`MenuId`, and render it in `MenuBar.tsx`. Never add menu markup to `MenuBar.tsx` itself.

**Adding a menu item:** add a `<MenuItem>` row. If it needs its own state or more than
a few lines, it becomes its own file under that menu's folder.

The right-click menu (`components/contextmenu/`) reuses `MenuItem` and `MenuDivider`,
so a row looks the same in both places.

### The left palette

```
toolbar/
  VerticalToolbar.tsx    the rail
  ToolPalette.tsx        every registry tool
  GridPalette.tsx        grid mode buttons
  ZoomPalette.tsx        zoom buttons
  PaletteButton.tsx      one square cell
  PaletteGrid.tsx, PaletteHeading.tsx
  buttons/               one file per button
  icons/                 one file per icon
```

**Adding a drawing tool:** write `src/tools/yourTool.tsx` exporting a single `Tool`
object (state type, `createState`, pointer handlers, `drawPreview`, icon, title) and
register it in `src/tools/registry.ts`. It appears in the palette automatically — do
not touch `ToolPalette.tsx`.

**Adding a command button** (grid, zoom, view state — anything that is not a drawing
mode): one file in `toolbar/buttons/`, its icon in `toolbar/icons/`, rendered by the
relevant palette. Command buttons do **not** go in the tool registry: `setTool` clears
the selection and swaps the active tool, which is wrong for a view toggle.

---

## 5. Style

- **Comments explain why, not what.** Only where the reason is not obvious from the
  code. Every file gets a one-line doc comment on its export.
- **Match the surrounding code**: 2-space indent, single quotes, semicolons, trailing
  commas in multiline literals, arrow functions for callbacks.
- **Tailwind classes inline**, ordered layout → spacing → colour → state.
- **Imports** are explicit and sorted; `import type` for type-only imports
  (`verbatimModuleSyntax` is on, so this is enforced).
- `strict`, `noUnusedLocals` and `noUnusedParameters` are on. An unused import is a
  build error, so import exactly what a file uses.
- **World vs screen coordinates**: name variables so the space is obvious
  (`worldX` / `screenX`, or `w`/`s` prefixes). Screen Y is flipped relative to world Y —
  a frequent source of bugs.

---

## 6. Verifying a change

```bash
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + vite build — must be clean before you call it done
npm run dev         # http://localhost:5173
```

Type-checking is not proof the app works. For anything touching rendering, pointer
handling or the store, **drive the real app**: start `npm run dev`, open the page,
perform the interaction, and look at it. A headless Chrome + CDP script
(`Input.dispatchMouseEvent` / `Page.captureScreenshot`) works well for this and needs
no extra dependencies.

For pure geometry, a small script bundled with `npx esbuild --bundle --platform=node`
and run under Node checks the maths directly, without a browser.

---

## 7. Why this shape

The trade is deliberate: many small files, more imports, but every file has one reason
to change, a name that says what it does, and no scrolling to find it. When something
looks like it wants to be "just one more function in this file", that is the signal to
give it a file of its own.
