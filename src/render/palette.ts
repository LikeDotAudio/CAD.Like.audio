/** Colours and fonts used on the canvas (the DOM chrome uses Tailwind tokens). */

export const CANVAS = {
  background: '#1e1e1e',
  grid: '#2d2d2d',
  axis: '#454545',

  edge: '#ffffff',
  edgeSelected: '#38bdf8',
  edgeHover: '#7dd3fc',
  preview: '#f97316',

  dimLine: '#38bdf8',
  dimText: '#60a5fa',
  labelBackdrop: 'rgba(30,30,30,.9)',

  snapEndpoint: '#22c55e',
  snapEndpointFill: 'rgba(34,197,94,.25)',
  snapMidpoint: '#f59e0b',
  snapMidpointFill: 'rgba(245,158,11,.25)',
  cursorDot: '#38bdf8',

  danger: '#ef4444',
  dangerFill: 'rgba(239,68,68,.95)',
  warning: '#f59e0b',
  measure: '#22c55e',
  measureFill: 'rgba(34,197,94,.95)',
  calibrate: '#a855f7',
  bounds: '#f97316',
  imageOutline: 'rgba(129,140,248,0.6)',
  white: '#ffffff',
} as const;

const UI_FONT = "'Inter', -apple-system, system-ui, sans-serif";

export const FONT = {
  marker: `bold 9px ${UI_FONT}`,
  dimension: `bold 11px ${UI_FONT}`,
  measure: `bold 12px ${UI_FONT}`,
  banner: `bold 13px ${UI_FONT}`,
} as const;
