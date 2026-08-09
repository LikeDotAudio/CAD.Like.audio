import type { Scene } from './Scene';
import { CANVAS } from './palette';

/**
 * Helper to compute grid levels.
 * Minor level: base step in world units (gridSize * 10^k).
 * Level step on screen must be at least minPx (e.g. 8px) to be rendered readable.
 */
function getGridLevels(gridSize: number, zoom: number, minPx = 8) {
  const baseStep = gridSize > 0 ? gridSize : 1;
  const screenStepBase = baseStep * zoom;

  // Find k such that screenStepBase * 10^k >= minPx
  let k = 0;
  let screenStep = screenStepBase;
  if (screenStep < minPx) {
    k = Math.ceil(Math.log10(minPx / screenStepBase));
    screenStep = screenStepBase * Math.pow(10, k);
  }

  const level0World = baseStep * Math.pow(10, k);     // Minor grid size (e.g. 1 when zoomed in, 10, 100...)
  const level1World = level0World * 10;                // Major grid size (e.g. 10 when minor is 1, 100, 1000...)
  const level2World = level1World * 10;                // Super major grid size

  return {
    minorWorld: level0World,
    majorWorld: level1World,
    superWorld: level2World,
    minorScreen: level0World * zoom,
    majorScreen: level1World * zoom,
    superScreen: level2World * zoom,
  };
}

/** Background, grid lines/dots (minor, major 10x, super 100x), and world axes. */
export function drawGrid({ ctx, view, gridSize, gridMode = 'lines' }: Scene): void {
  const { width: W, height: H } = view;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = CANVAS.background;
  ctx.fillRect(0, 0, W, H);

  const levels = getGridLevels(gridSize, view.zoom, 8);

  // Convert screen boundaries to world coordinates
  const minWorld = view.toWorld(0, H);
  const maxWorld = view.toWorld(W, 0);

  const leftW = Math.min(minWorld.x, maxWorld.x);
  const rightW = Math.max(minWorld.x, maxWorld.x);
  const bottomW = Math.min(minWorld.y, maxWorld.y);
  const topW = Math.max(minWorld.y, maxWorld.y);

  if (gridMode === 'dots') {
    // DOTS MODE: Draw dots at minor, major, and super grid intersections
    const stepW = levels.minorWorld;
    const startX = Math.floor(leftW / stepW) * stepW;
    const endX = Math.ceil(rightW / stepW) * stepW;
    const startY = Math.floor(bottomW / stepW) * stepW;
    const endY = Math.ceil(topW / stepW) * stepW;

    const eps = stepW * 0.001;

    for (let wx = startX; wx <= endX; wx += stepW) {
      const isSuperX = Math.abs(wx % levels.superWorld) < eps || Math.abs((wx % levels.superWorld) - levels.superWorld) < eps;
      const isMajorX = Math.abs(wx % levels.majorWorld) < eps || Math.abs((wx % levels.majorWorld) - levels.majorWorld) < eps;
      const screenX = (wx - view.panX) * view.zoom + W / 2;

      for (let wy = startY; wy <= endY; wy += stepW) {
        const isSuperY = Math.abs(wy % levels.superWorld) < eps || Math.abs((wy % levels.superWorld) - levels.superWorld) < eps;
        const isMajorY = Math.abs(wy % levels.majorWorld) < eps || Math.abs((wy % levels.majorWorld) - levels.majorWorld) < eps;
        const screenY = H / 2 - (wy - view.panY) * view.zoom;

        const isSuper = isSuperX && isSuperY;
        const isMajor = isMajorX && isMajorY;

        let radius = 1;
        let color: string = CANVAS.grid;

        if (isSuper) {
          radius = 2.5;
          color = 'rgba(255, 255, 255, 0.45)';
        } else if (isMajor) {
          radius = 1.8;
          color = 'rgba(255, 255, 255, 0.3)';
        } else {
          radius = 1.0;
          color = CANVAS.grid;
        }

        ctx.fillStyle = color;
        ctx.fillRect(screenX - radius / 2, screenY - radius / 2, radius, radius);
      }
    }
  } else {
    // LINES MODE: Draw Minor, Major (10x), and Super (100x) grid lines
    const epsMinor = levels.minorWorld * 0.001;
    const epsMajor = levels.majorWorld * 0.001;

    // 1. Minor lines
    ctx.strokeStyle = CANVAS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startXMinor = Math.floor(leftW / levels.minorWorld) * levels.minorWorld;
    for (let wx = startXMinor; wx <= rightW; wx += levels.minorWorld) {
      const isMajor = Math.abs(wx % levels.majorWorld) < epsMinor || Math.abs((wx % levels.majorWorld) - levels.majorWorld) < epsMinor;
      if (!isMajor) {
        const sx = (wx - view.panX) * view.zoom + W / 2;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, H);
      }
    }
    const startYMinor = Math.floor(bottomW / levels.minorWorld) * levels.minorWorld;
    for (let wy = startYMinor; wy <= topW; wy += levels.minorWorld) {
      const isMajor = Math.abs(wy % levels.majorWorld) < epsMinor || Math.abs((wy % levels.majorWorld) - levels.majorWorld) < epsMinor;
      if (!isMajor) {
        const sy = H / 2 - (wy - view.panY) * view.zoom;
        ctx.moveTo(0, sy);
        ctx.lineTo(W, sy);
      }
    }
    ctx.stroke();

    // 2. Major lines (every 10x minor)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startXMajor = Math.floor(leftW / levels.majorWorld) * levels.majorWorld;
    for (let wx = startXMajor; wx <= rightW; wx += levels.majorWorld) {
      const isSuper = Math.abs(wx % levels.superWorld) < epsMajor || Math.abs((wx % levels.superWorld) - levels.superWorld) < epsMajor;
      if (!isSuper) {
        const sx = (wx - view.panX) * view.zoom + W / 2;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, H);
      }
    }
    const startYMajor = Math.floor(bottomW / levels.majorWorld) * levels.majorWorld;
    for (let wy = startYMajor; wy <= topW; wy += levels.majorWorld) {
      const isSuper = Math.abs(wy % levels.superWorld) < epsMajor || Math.abs((wy % levels.superWorld) - levels.superWorld) < epsMajor;
      if (!isSuper) {
        const sy = H / 2 - (wy - view.panY) * view.zoom;
        ctx.moveTo(0, sy);
        ctx.lineTo(W, sy);
      }
    }
    ctx.stroke();

    // 3. Super lines (every 100x minor)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const startXSuper = Math.floor(leftW / levels.superWorld) * levels.superWorld;
    for (let wx = startXSuper; wx <= rightW; wx += levels.superWorld) {
      const sx = (wx - view.panX) * view.zoom + W / 2;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, H);
    }
    const startYSuper = Math.floor(bottomW / levels.superWorld) * levels.superWorld;
    for (let wy = startYSuper; wy <= topW; wy += levels.superWorld) {
      const sy = H / 2 - (wy - view.panY) * view.zoom;
      ctx.moveTo(0, sy);
      ctx.lineTo(W, sy);
    }
    ctx.stroke();
  }

  // Draw primary world axes (X=0, Y=0)
  ctx.strokeStyle = CANVAS.axis;
  ctx.lineWidth = 1.5;
  const origin = view.toScreen(0, 0);
  ctx.beginPath();
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, H);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(W, origin.y);
  ctx.stroke();
}
