/** Colours and fonts used on the canvas (the DOM chrome uses Tailwind tokens). */

export const CANVAS = {
  background: '#ffffff',
  grid: '#e0e4e8',
  axis: '#ced4da',

  edge: '#1a1a1a',
  edgeSelected: '#3b82f6',
  edgeHover: '#93c5fd',
  preview: '#f97316',

  dimLine: '#3b82f6',
  dimText: '#1d4ed8',
  labelBackdrop: 'rgba(255,255,255,.9)',

  snapEndpoint: '#16a34a',
  snapEndpointFill: 'rgba(22,163,74,.15)',
  snapMidpoint: '#d97706',
  snapMidpointFill: 'rgba(217,119,6,.15)',
  cursorDot: '#3b82f6',

  danger: '#dc2626',
  dangerFill: 'rgba(220,38,38,.95)',
  warning: '#f59e0b',
  measure: '#16a34a',
  measureFill: 'rgba(22,163,74,.95)',
  calibrate: '#7c3aed',
  bounds: '#f97316',
  imageOutline: 'rgba(99,102,241,0.5)',
  white: '#ffffff',
} as const;

const UI_FONT = "'Inter', -apple-system, system-ui, sans-serif";

export const FONT = {
  marker: `bold 9px ${UI_FONT}`,
  dimension: `bold 11px ${UI_FONT}`,
  measure: `bold 12px ${UI_FONT}`,
  banner: `bold 13px ${UI_FONT}`,
} as const;
