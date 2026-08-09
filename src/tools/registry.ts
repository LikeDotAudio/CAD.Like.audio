import type { ToolId } from '../core/types';
import { breakTool } from './breakTool';
import { circleTool } from './circleTool';
import { ellipseTool } from './ellipseTool';
import { lineTool } from './lineTool';
import { measureTool } from './measureTool';
import { parallelTool } from './parallelTool';
import { polylineTool } from './polylineTool';
import { rectTool } from './rectTool';
import { selectTool } from './selectTool';
import { splineTool } from './splineTool';
import type { AnyTool } from './types';

/** Toolbar order. */
export const TOOLS: AnyTool[] = [
  selectTool,
  lineTool,
  parallelTool,
  polylineTool,
  splineTool,
  rectTool,
  circleTool,
  ellipseTool,
  breakTool,
  measureTool,
];

const BY_ID = new Map<ToolId, AnyTool>(TOOLS.map((t) => [t.id, t]));

export function getTool(id: ToolId): AnyTool {
  const tool = BY_ID.get(id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}

/** Lower-case key → tool id, for the single-letter shortcuts. */
export const SHORTCUTS: Record<string, ToolId> = Object.fromEntries(
  TOOLS.map((t) => [t.shortcut, t.id]),
);
