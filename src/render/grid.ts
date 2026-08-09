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
  const { width: canvasWidth, height: canvasHeight } = view;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = CANVAS.background;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const levels = getGridLevels(gridSize, view.zoom, 8);

  // Convert screen boundaries to world coordinates
  const minWorldPoint = view.toWorld(0, canvasHeight);
  const maxWorldPoint = view.toWorld(canvasWidth, 0);

  const worldLeft = Math.min(minWorldPoint.x, maxWorldPoint.x);
  const worldRight = Math.max(minWorldPoint.x, maxWorldPoint.x);
  const worldBottom = Math.min(minWorldPoint.y, maxWorldPoint.y);
  const worldTop = Math.max(minWorldPoint.y, maxWorldPoint.y);

  if (gridMode === 'dots') {
    // DOTS MODE: Draw dots at minor, major, and super grid intersections
    const stepWorld = levels.minorWorld;
    const startWorldX = Math.floor(worldLeft / stepWorld) * stepWorld;
    const endWorldX = Math.ceil(worldRight / stepWorld) * stepWorld;
    const startWorldY = Math.floor(worldBottom / stepWorld) * stepWorld;
    const endWorldY = Math.ceil(worldTop / stepWorld) * stepWorld;

    for (let worldX = startWorldX; worldX <= endWorldX + stepWorld * 0.5; worldX += stepWorld) {
      const indexX = Math.round(worldX / stepWorld);
      const isMajorX = indexX % 10 === 0;
      const isSuperX = indexX % 100 === 0;
      const screenX = (worldX - view.panX) * view.zoom + canvasWidth / 2;

      for (let worldY = startWorldY; worldY <= endWorldY + stepWorld * 0.5; worldY += stepWorld) {
        const indexY = Math.round(worldY / stepWorld);
        const isMajorY = indexY % 10 === 0;
        const isSuperY = indexY % 100 === 0;
        const screenY = canvasHeight / 2 - (worldY - view.panY) * view.zoom;

        const isSuper = isSuperX && isSuperY;
        const isMajor = isMajorX && isMajorY;

        let dotRadius = 1;
        let dotColor: string = CANVAS.grid;

        if (isSuper) {
          dotRadius = 2.5;
          dotColor = 'rgba(255, 255, 255, 0.45)';
        } else if (isMajor) {
          dotRadius = 1.8;
          dotColor = 'rgba(255, 255, 255, 0.3)';
        } else {
          dotRadius = 1.0;
          dotColor = CANVAS.grid;
        }

        ctx.fillStyle = dotColor;
        ctx.fillRect(screenX - dotRadius / 2, screenY - dotRadius / 2, dotRadius, dotRadius);
      }
    }
  } else {
    // LINES MODE: Draw Minor, Major (10x), and Super (100x) grid lines
    const stepWorld = levels.minorWorld;

    // 1. Minor lines (excluding major & super)
    ctx.strokeStyle = CANVAS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startXMinor = Math.floor(worldLeft / stepWorld) * stepWorld;
    for (let worldX = startXMinor; worldX <= worldRight + stepWorld * 0.5; worldX += stepWorld) {
      const indexX = Math.round(worldX / stepWorld);
      if (indexX % 10 !== 0) {
        const screenX = (worldX - view.panX) * view.zoom + canvasWidth / 2;
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, canvasHeight);
      }
    }
    const startYMinor = Math.floor(worldBottom / stepWorld) * stepWorld;
    for (let worldY = startYMinor; worldY <= worldTop + stepWorld * 0.5; worldY += stepWorld) {
      const indexY = Math.round(worldY / stepWorld);
      if (indexY % 10 !== 0) {
        const screenY = canvasHeight / 2 - (worldY - view.panY) * view.zoom;
        ctx.moveTo(0, screenY);
        ctx.lineTo(canvasWidth, screenY);
      }
    }
    ctx.stroke();

    // 2. Major lines (every 10x minor, excluding super)
    const majorStepWorld = levels.majorWorld;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startXMajor = Math.floor(worldLeft / majorStepWorld) * majorStepWorld;
    for (let worldX = startXMajor; worldX <= worldRight + majorStepWorld * 0.5; worldX += majorStepWorld) {
      const indexX = Math.round(worldX / majorStepWorld);
      if (indexX % 10 !== 0) {
        const screenX = (worldX - view.panX) * view.zoom + canvasWidth / 2;
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, canvasHeight);
      }
    }
    const startYMajor = Math.floor(worldBottom / majorStepWorld) * majorStepWorld;
    for (let worldY = startYMajor; worldY <= worldTop + majorStepWorld * 0.5; worldY += majorStepWorld) {
      const indexY = Math.round(worldY / majorStepWorld);
      if (indexY % 10 !== 0) {
        const screenY = canvasHeight / 2 - (worldY - view.panY) * view.zoom;
        ctx.moveTo(0, screenY);
        ctx.lineTo(canvasWidth, screenY);
      }
    }
    ctx.stroke();

    // 3. Super lines (every 100x minor)
    const superStepWorld = levels.superWorld;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const startXSuper = Math.floor(worldLeft / superStepWorld) * superStepWorld;
    for (let worldX = startXSuper; worldX <= worldRight + superStepWorld * 0.5; worldX += superStepWorld) {
      const screenX = (worldX - view.panX) * view.zoom + canvasWidth / 2;
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvasHeight);
    }
    const startYSuper = Math.floor(worldBottom / superStepWorld) * superStepWorld;
    for (let worldY = startYSuper; worldY <= worldTop + superStepWorld * 0.5; worldY += superStepWorld) {
      const screenY = canvasHeight / 2 - (worldY - view.panY) * view.zoom;
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvasWidth, screenY);
    }
    ctx.stroke();
  }

  // Draw primary world axes (X=0, Y=0)
  ctx.strokeStyle = CANVAS.axis;
  ctx.lineWidth = 1.5;
  const origin = view.toScreen(0, 0);
  ctx.beginPath();
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, canvasHeight);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(canvasWidth, origin.y);
  ctx.stroke();
}
