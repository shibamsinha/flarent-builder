/** A miniature of a real page layout, drawn from the template's own colours. */
export function TemplateThumb({ from, to }: { from: string; to: string }) {
  return (
    <div className="f-tpl-thumb" style={{ background: from }}>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          width: '38%',
          marginLeft: 'auto',
          background: to,
          borderLeft: '2px solid #0a0a0a',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '12px 14px -20px',
          background: '#fff',
          border: '2px solid #0a0a0a',
          borderBottom: 'none',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 22, height: 5, background: from }} />
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <i key={i} style={{ display: 'block', width: 10, height: 3, background: '#0a0a0a', opacity: 0.3 }} />
            ))}
          </span>
        </div>
        <span style={{ height: 9, width: '68%', background: '#0a0a0a' }} />
        <span style={{ height: 4, width: '86%', background: '#0a0a0a', opacity: 0.22 }} />
        <span style={{ height: 4, width: '74%', background: '#0a0a0a', opacity: 0.22 }} />
        <div style={{ display: 'flex', gap: 5, marginTop: 3 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ flex: 1, height: 22, border: '1.5px solid #0a0a0a', background: i === 1 ? from : 'transparent' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
