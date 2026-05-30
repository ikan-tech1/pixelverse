import { Routes, Route } from 'react-router-dom';
import AppShell from '@/components/shell/AppShell';
import Home from '@/routes/Home';
import Studio from '@/routes/Studio';
import Gallery from '@/routes/Gallery';
import Playground from '@/routes/Playground';
import Sandbox from '@/routes/Sandbox';
import Snake from '@/routes/Snake';
import Pixelizer from '@/routes/Pixelizer';
import Nonogram from '@/routes/Nonogram';
import Daily from '@/routes/Daily';
import Settings from '@/routes/Settings';
import NotFound from '@/routes/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/play" element={<Playground />} />
        <Route path="/play/sandbox" element={<Sandbox />} />
        <Route path="/play/snake" element={<Snake />} />
        <Route path="/play/pixelizer" element={<Pixelizer />} />
        <Route path="/play/nonogram" element={<Nonogram />} />
        <Route path="/daily" element={<Daily />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
