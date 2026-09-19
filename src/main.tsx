import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerBuiltInComponents } from '@/engine/registry/components';
import { applyBrandFavicon } from '@/app/brand';
import { AppRouter } from '@/app/router/AppRouter';
import '@/styles/app.css';

// Components register once, before anything renders, so every surface
// (dashboard previews included) resolves the same registry.
registerBuiltInComponents();

// Uses the brand logo for the tab icon once it loads, keeping the bundled
// default if no logo file has been added yet.
applyBrandFavicon();

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

createRoot(container).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
