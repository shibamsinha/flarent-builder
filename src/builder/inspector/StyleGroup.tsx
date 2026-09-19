import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export function StyleGroup({
  title,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="f-group">
      <button className="f-group-head" data-open={open} onClick={() => setOpen((o) => !o)}>
        <ChevronRight size={13} />
        {title}
        {badge}
      </button>
      {open ? <div className="f-group-body">{children}</div> : null}
    </section>
  );
}
