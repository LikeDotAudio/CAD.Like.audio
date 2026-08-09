/**
 * Central Colors Style
 * Single central source of truth for all window, panel, sidebar, menu, button, and canvas colors.
 */

export const COLORS = {
  // Window & Panel Backgrounds
  windowBg: '#1e1e1e',          // Main canvas / dark workspace background
  panelBg: '#252526',           // Header, sidebars, status bar & panel container background
  cardBg: '#1e1e1e',            // Inner cards, layer list container, input backgrounds
  headerBg: '#2d2d2d',          // Section title bars & menu dropdown headers

  // Borders & Dividers
  borderDark: '#333333',        // Outer panel dividers & main section borders
  borderMedium: '#3c3c3c',      // Input & button borders
  borderLight: '#454545',       // Dropdown menu borders & popover outlines

  // Interactive States & Accents — the whole UI is built around this orange.
  accent: '#f4902c',            // R244 G144 B44: active tool, selected row, focus ring
  accentHover: '#ffa552',       // Hover state for solid-accent buttons
  accentTint: 'rgba(244,144,44,0.18)', // Hover wash for menu rows on dark panels
  onAccent: '#1e1e1e',          // Text and icons sitting on an accent fill
  hoverBg: '#383838',           // General button hover background
  buttonBg: '#2d2d2d',          // Default tool & control button background

  // Typography / Text Colors
  textPrimary: '#ffffff',       // Primary white headings & active text
  textSecondary: '#cccccc',     // Standard UI text & labels
  textMuted: '#888888',         // Subtle hints, coordinates & unit labels
  textDisabled: '#666666',      // Disabled text & buttons

  // Status & Validation Indicators
  okGreenBg: 'rgba(20, 83, 45, 0.3)',
  okGreenBorder: 'rgba(22, 101, 52, 0.5)',
  okGreenText: '#4ade80',

  dangerRedBg: 'rgba(127, 29, 29, 0.3)',
  dangerRedBorder: 'rgba(153, 27, 27, 0.5)',
  dangerRedText: '#f87171',

  // Canvas Viewport Colors
  canvasBg: '#1e1e1e',
  canvasGrid: '#2d2d2d',
  canvasAxis: '#454545',
  canvasEdgeDefault: '#ffffff',
  canvasEdgeSelected: '#38bdf8',
  canvasEdgeHover: '#7dd3fc',
  canvasPreview: '#f4902c',
  canvasHandle: '#f4902c',   // Endpoint / midpoint / corner grips
  canvasBounds: '#f4902c',   // Drawing extents box
} as const;

export default COLORS;
