import { useState } from 'react';
import { DrawingCanvas } from './components/DrawingCanvas';
import { ImagePanel } from './components/ImagePanel';
import { SidebarPanel } from './components/sidebar/SidebarPanel';
import { StatusBar } from './components/statusbar/StatusBar';
import { MenuBar } from './components/menubar/MenuBar';
import { VerticalToolbar } from './components/toolbar/VerticalToolbar';
import { EditorStore } from './state/EditorStore';
import { EditorContext } from './state/EditorContext';

export default function App() {
  const [store] = useState(() => new EditorStore());

  return (
    <EditorContext.Provider value={store}>
      <div className="flex h-full flex-col overflow-hidden bg-[#1e1e1e]">
        {/* Top CAD Header Bar */}
        <MenuBar />

        {/* Main Work Area: Left Toolbar + Canvas + Right Sidebar */}
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
