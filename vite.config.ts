import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** Revision stamp, YYYYMMDD.HH.MM in local time, fixed at the moment of the build. */
function buildStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.${p(d.getHours())}.${p(d.getMinutes())}`;
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, open: false },
  define: {
    // Baked in by the build, so the running app can show which revision it is.
    __BUILD_STAMP__: JSON.stringify(buildStamp()),
    __REPO_URL__: JSON.stringify('https://github.com/LikeDotAudio/CAD.Like.audio'),
  },
});
