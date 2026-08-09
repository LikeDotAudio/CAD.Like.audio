import { useEffect, useRef } from 'react';
import { useStore } from '../state/useStore';
import { ContextMenu } from './contextmenu/ContextMenu';
import { DynInput } from './DynInput';
import { Hint } from './Hint';
import { ScaleBox } from './ScaleBox';

/**
 * Hosts the canvas and the overlays anchored to it. All pointer and keyboard
 * handling lives in the store; React only owns mounting and sizing.
 */
export function DrawingCanvas() {
  const store = useStore();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const detach = store.attach(canvas);
    const observer = new ResizeObserver(() => {
      const r = wrap.getBoundingClientRect();
      store.resize(r.width, r.height);
    });
    observer.observe(wrap);

    return () => {
      observer.disconnect();
      detach();
    };
  }, [store]);

  return (
    <div ref={wrapRef} className="relative flex-1 overflow-hidden bg-[#1e1e1e]">
      <canvas ref={canvasRef} className="absolute left-0 top-0" />
      <Hint />
      <ScaleBox />
      <DynInput />
      <ContextMenu />
    </div>
  );
}
