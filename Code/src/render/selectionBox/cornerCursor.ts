/** Diagonal resize cursor matching a corner: 0/2 run one way, 1/3 the other. */
export function cornerCursor(index: number): string {
  return index % 2 === 0 ? 'nwse-resize' : 'nesw-resize';
}
