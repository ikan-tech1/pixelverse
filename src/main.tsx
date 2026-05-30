import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Bundled pixel fonts (offline-friendly for the PWA)
import '@fontsource/press-start-2p/400.css';
import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import '@fontsource/silkscreen/400.css';
import '@fontsource/silkscreen/700.css';

// Remove the pre-React boot flash once we mount.
document.getElementById('boot')?.remove();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
