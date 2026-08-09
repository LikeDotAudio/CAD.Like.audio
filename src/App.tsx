import { useState } from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { ImagePanel } from './components/ImagePanel';
import { LayersPanel } from './components/LayersPanel';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { EditorStore } from './state/EditorStore';
import { EditorContext } from './state/useEditor';

export default function App() {
  const [store] = useState(() => new EditorStore());

  return (
    <EditorContext.Provider value={store}>
      <div className="relative flex h-full flex-col overflow-hidden">
        <Toolbar />
        <DrawingCanvas />
        <LayersPanel />
        <ImagePanel />
        <StatusBar />
      </div>
    </EditorContext.Provider>
  );
}
