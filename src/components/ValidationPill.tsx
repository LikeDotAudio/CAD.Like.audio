import { useUi } from '../state/useEditor';

const BASE =
  'inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] ' +
  'font-medium uppercase tracking-[0.06em]';

/** One-line summary of whether the drawing can be cut. */
export function ValidationPill() {
  const { edgeCount, validation, shapeMode } = useUi();

  if (!shapeMode) {
    if (edgeCount === 0) {
      return (
        <span className={`${BASE} border-transparent bg-paper-2 text-ink-3`}>
          · Draw to begin (SHPE Mode: OFF)
        </span>
      );
    }
    return (
      <span className={`${BASE} border-ok-line bg-ok-bg text-ok-fg`}>
        ✓ Ready (SHPE Mode: OFF)
      </span>
    );
  }

  if (edgeCount === 0) {
    return (
      <span className={`${BASE} border-transparent bg-paper-2 text-ink-3`}>· Draw to begin</span>
    );
  }
  if (validation.valid) {
    return (
      <span className={`${BASE} border-ok-line bg-ok-bg text-ok-fg`}>✓ Ready to cut</span>
    );
  }
  return (
    <span
      className={`${BASE} border-bad-line bg-bad-bg text-accent-ink`}
      title={validation.errs.join(' · ')}
    >
      ✕ {validation.errs[0]}
    </span>
  );
}
