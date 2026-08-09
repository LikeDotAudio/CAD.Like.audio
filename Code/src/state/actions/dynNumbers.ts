import type { EditorStore } from '../EditorStore';
import { parseMathExpression } from '../../core/parseMathExpression';

export function dynNumbers(store: EditorStore): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const [key, raw] of Object.entries(store.dynValues)) {
    const n = parseMathExpression(raw);
    out[key] = n;
  }
  return out;

}
