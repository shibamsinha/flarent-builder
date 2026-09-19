import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerBuiltInComponents } from '@/engine/registry/components';
import { AppRouter } from '@/app/router/AppRouter';
import '@/styles/app.css';

// Components register once, before anything renders, so every surface
// (dashboard previews included) resolves the same registry.
registerBuiltInComponents();

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

createRoot(container).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
