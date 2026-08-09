import type { Doc } from '../model/Doc';
import { commitCircle } from '../model/commits';

export interface DxfEntity {
  type: string;
  layer?: string;
  // LINE
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  // CIRCLE / ARC
  cx?: number;
  cy?: number;
  r?: number;
  // ARC angles in degrees
  startAngle?: number;
  endAngle?: number;
  // POLYLINE / LWPOLYLINE
  points?: { x: number; y: number; bulge?: number }[];
  isClosed?: boolean;
}

export interface DxfParseResult {
  units?: 'in' | 'mm';
  entities: DxfEntity[];
}

/**
 * Parses ASCII DXF string content into structured entities.
 */
export function parseDxf(dxfText: string): DxfParseResult {
  const lines = dxfText.split(/\r?\n/);
  let insunits: number | null = null;
  const entities: DxfEntity[] = [];

  let inHeader = false;
  let inEntities = false;
  let currentHeaderVar = '';

  let idx = 0;

  function readPair(): { code: number; value: string } | null {
    if (idx >= lines.length - 1) return null;
    const codeStr = lines[idx].trim();
    const valueStr = lines[idx + 1].trim();
    idx += 2;
    if (codeStr === '' && valueStr === '') return null;
    return { code: parseInt(codeStr, 10), value: valueStr };
  }

  while (idx < lines.length) {
    const pair = readPair();
    if (!pair) break;

    const { code, value } = pair;

    if (code === 0) {
      if (value === 'SECTION') {
        const next = readPair();
        if (next && next.code === 2) {
          if (next.value === 'HEADER') {
            inHeader = true;
            inEntities = false;
          } else if (next.value === 'ENTITIES') {
            inHeader = false;
            inEntities = true;
          } else {
            inHeader = false;
            inEntities = false;
          }
        }
        continue;
      } else if (value === 'ENDSEC') {
        inHeader = false;
        inEntities = false;
        continue;
      }
    }

    if (inHeader) {
      if (code === 9) {
        currentHeaderVar = value;
      } else if (code === 70 && currentHeaderVar === '$INSUNITS') {
        insunits = parseInt(value, 10);
      }
    } else if (inEntities) {
      if (code === 0) {
        const entityType = value.toUpperCase();
        if (['LINE', 'CIRCLE', 'ARC', 'LWPOLYLINE', 'POLYLINE'].includes(entityType)) {
          const { entity, lastPair } = parseEntity(entityType, () => readPair());
          if (entity) {
            entities.push(entity);
          }
          if (lastPair && lastPair.code === 0) {
            // Process the line that stopped the entity parsing
            idx -= 2;
          }
        }
      }
    }
  }

  let units: 'in' | 'mm' | undefined;
  if (insunits === 1 || insunits === 2) units = 'in'; // 1 = Inches, 2 = Feet
  else if (insunits === 4 || insunits === 5 || insunits === 6) units = 'mm'; // 4 = mm, 5 = cm, 6 = m

  return { units, entities };
}

function parseEntity(
  type: string,
  getNextPair: () => { code: number; value: string } | null,
): { entity: DxfEntity; lastPair: { code: number; value: string } | null } {
  const entity: DxfEntity = { type };
  const lwPoints: { x: number; y: number; bulge?: number }[] = [];
  let currentLwPoint: { x: number; y: number; bulge?: number } | null = null;
  let lastPair: { code: number; value: string } | null = null;

  while (true) {
    const pair = getNextPair();
    if (!pair) break;
    const { code, value } = pair;

    if (code === 0) {
      lastPair = pair;
      break;
    }

    const numVal = parseFloat(value);

    if (type === 'LINE') {
      if (code === 10) entity.x1 = numVal;
      else if (code === 20) entity.y1 = numVal;
      else if (code === 11) entity.x2 = numVal;
      else if (code === 21) entity.y2 = numVal;
    } else if (type === 'CIRCLE') {
      if (code === 10) entity.cx = numVal;
      else if (code === 20) entity.cy = numVal;
      else if (code === 40) entity.r = numVal;
    } else if (type === 'ARC') {
      if (code === 10) entity.cx = numVal;
      else if (code === 20) entity.cy = numVal;
      else if (code === 40) entity.r = numVal;
      else if (code === 50) entity.startAngle = numVal;
      else if (code === 51) entity.endAngle = numVal;
    } else if (type === 'LWPOLYLINE') {
      if (code === 70) {
        const flag = parseInt(value, 10);
        entity.isClosed = (flag & 1) === 1;
      } else if (code === 10) {
        if (currentLwPoint) lwPoints.push(currentLwPoint);
        currentLwPoint = { x: numVal, y: 0 };
      } else if (code === 20 && currentLwPoint) {
        currentLwPoint.y = numVal;
      } else if (code === 42 && currentLwPoint) {
        currentLwPoint.bulge = numVal;
      }
    }
  }

  if (type === 'LWPOLYLINE') {
    if (currentLwPoint) lwPoints.push(currentLwPoint);
    entity.points = lwPoints;
  }

  return { entity, lastPair };
}

/**
 * Loads parsed DXF entities into the Doc instance.
 */
export function loadDxfIntoDoc(doc: Doc, parseResult: DxfParseResult): void {
  for (const entity of parseResult.entities) {
    const groupId = doc.newGroupId();

    if (entity.type === 'LINE') {
      if (
        entity.x1 !== undefined &&
        entity.y1 !== undefined &&
        entity.x2 !== undefined &&
        entity.y2 !== undefined
      ) {
        const v1 = doc.addVertex(entity.x1, entity.y1);
        const v2 = doc.addVertex(entity.x2, entity.y2);
        doc.addLineEdge(v1, v2, groupId);
      }
    } else if (entity.type === 'CIRCLE') {
      if (entity.cx !== undefined && entity.cy !== undefined && entity.r !== undefined) {
        commitCircle(doc, entity.cx, entity.cy, entity.r);
      }
    } else if (entity.type === 'ARC') {
      if (
        entity.cx !== undefined &&
        entity.cy !== undefined &&
        entity.r !== undefined &&
        entity.startAngle !== undefined &&
        entity.endAngle !== undefined
      ) {
        const a1Rad = (entity.startAngle * Math.PI) / 180;
        const a2Rad = (entity.endAngle * Math.PI) / 180;

        const x1 = entity.cx + entity.r * Math.cos(a1Rad);
        const y1 = entity.cy + entity.r * Math.sin(a1Rad);
        const x2 = entity.cx + entity.r * Math.cos(a2Rad);
        const y2 = entity.cy + entity.r * Math.sin(a2Rad);

        const v1 = doc.addVertex(x1, y1);
        const v2 = doc.addVertex(x2, y2);
        doc.addArcEdge(v1, v2, entity.cx, entity.cy, entity.r, groupId);
      }
    } else if (entity.type === 'LWPOLYLINE' && entity.points && entity.points.length > 1) {
      const pts = entity.points;
      const count = pts.length;
      const segmentCount = entity.isClosed ? count : count - 1;

      for (let i = 0; i < segmentCount; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % count];

        const v1 = doc.addVertex(p1.x, p1.y);
        const v2 = doc.addVertex(p2.x, p2.y);

        if (p1.bulge && Math.abs(p1.bulge) > 1e-6) {
          // Arc segment from bulge = tan(theta / 4)
          const theta = 4 * Math.atan(p1.bulge);
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const d = Math.hypot(dx, dy);
          const r = Math.abs(d / (2 * Math.sin(theta / 2)));

          // Sagitta perpendicular distance
          const s = (p1.bulge * d) / 2;
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;

          // Normal vector (-dy, dx) normalized
          const nx = -dy / d;
          const ny = dx / d;

          // Center calculation
          const h = r - Math.abs(s);
          const signH = theta > 0 ? 1 : -1;
          const cx = mx + nx * h * signH;
          const cy = my + ny * h * signH;

          // Bulge > 0 means CCW from p1 to p2
          if (p1.bulge > 0) {
            doc.addArcEdge(v1, v2, cx, cy, r, groupId);
          } else {
            doc.addArcEdge(v2, v1, cx, cy, r, groupId);
          }
        } else {
          doc.addLineEdge(v1, v2, groupId);
        }
      }
    }
  }
}
