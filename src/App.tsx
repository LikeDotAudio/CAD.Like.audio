import { useState } from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { ImagePanel } from './components/ImagePanel';
import { SidebarPanel } from './components/SidebarPanel';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { VerticalToolbar } from './components/VerticalToolbar';
import { EditorStore } from './state/EditorStore';
import { EditorContext } from './state/useEditor';

export default function App() {
  const [store] = useState(() => new EditorStore());

  return (
    <EditorContext.Provider value={store}>
      <div className="flex h-full flex-col overflow-hidden bg-[#1e1e1e]">
        {/* Top CAD Header Bar */}
        <Toolbar />

        {/* Main Work Area: Left Toolbar + Canvas + Right QCAD Sidebar */}
        <div className="flex flex-1 overflow-hidden relative">
          <VerticalToolbar />
          <div className="flex flex-1 flex-col overflow-hidden relative">
            <DrawingCanvas />
            <ImagePanel />
          </div>
          <SidebarPanel />
        </div>

        {/* Bottom Status Bar */}
        <StatusBar />
      </div>
    </EditorContext.Provider>
  );
}
