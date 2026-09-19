import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { RuntimeStyles } from '@/app/providers/RuntimeStyles';
import { Toasts } from '@/components/ui';
import { Dashboard } from '@/dashboard/Dashboard';

// The editor and preview are the heavy modules; the dashboard loads instantly.
const EditorRoute = lazy(() =>
  import('@/builder/editor/EditorRoute').then((m) => ({ default: m.EditorRoute })),
);
const PreviewRoute = lazy(() =>
  import('@/builder/preview/PreviewRoute').then((m) => ({ default: m.PreviewRoute })),
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <RuntimeStyles />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/edit/:projectId" element={<EditorRoute />} />
          <Route path="/preview/:projectId" element={<PreviewRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toasts />
    </BrowserRouter>
  );
}

function RouteFallback() {
  return (
    <div className="f-center">
      <div className="f-state">
        <Loader size={22} className="f-spin" style={{ color: 'var(--f-brand)' }} />
        <p>Loading Flarent Builder…</p>
      </div>
    </div>
  );
}
