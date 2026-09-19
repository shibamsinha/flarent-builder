/**
 * The stylesheet that ships with a rendered website.
 *
 * It lives here as a string, not a .css file, because the exact same bytes are
 * injected into the editor canvas, the preview and `styles.css` in the static
 * export. One source of truth means what you see really is what you publish.
 */
export const RUNTIME_CSS = String.raw`
/* --- reset ------------------------------------------------------------
   Every element reset goes through :where() so it carries no extra
   specificity. A plain .fl-root a selector would be more specific than the
   per-node rules the exporter emits, which would silently drop a colour the
   user set on a button, and make the published page disagree with the canvas. */
.fl-root *, .fl-root *::before, .fl-root *::after { box-sizing: border-box; }
.fl-root { margin: 0; font-family: var(--fl-font-body); color: var(--fl-color-text);
  background: var(--fl-color-background); -webkit-font-smoothing: antialiased; line-height: 1.5; }
.fl-root :where(img, video, iframe) { max-width: 100%; }
.fl-root :where(h1, h2, h3, h4, h5, h6) {
  font-family: var(--fl-font-heading); margin: 0; line-height: 1.15; }
.fl-root :where(p) { margin: 0; }
.fl-root :where(a) { color: inherit; text-decoration: none; }
.fl-root :where(ul, ol) { margin: 0; padding: 0; list-style: none; }
.fl-root :where(button) { font: inherit; }

/* --- buttons ---------------------------------------------------------- */
.fl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-family: var(--fl-font-body); font-weight: 600; border-radius: var(--fl-radius-pill);
  border: 1px solid transparent; cursor: pointer; text-decoration: none; white-space: nowrap;
  transition: transform .15s ease, box-shadow .2s ease, background-color .2s ease, color .2s ease; }
.fl-btn:hover { transform: translateY(-1px); }
.fl-btn:active { transform: translateY(0); }
.fl-btn-sm { padding: 9px 18px; font-size: 14px; }
.fl-btn-md { padding: 12px 24px; font-size: 15px; }
.fl-btn-lg { padding: 16px 32px; font-size: 17px; }
.fl-btn-primary { background: var(--fl-color-primary); color: var(--fl-on-primary);
  box-shadow: 0 6px 20px -10px var(--fl-color-primary); }
.fl-btn-primary:hover { background: var(--fl-color-secondary); color: var(--fl-on-secondary); }
.fl-btn-secondary { background: var(--fl-color-background); color: var(--fl-color-primary);
  box-shadow: 0 6px 20px -12px rgba(0,0,0,.4); }
.fl-btn-outline { background: transparent; color: var(--fl-color-text);
  border-color: var(--fl-color-border); }
.fl-btn-outline:hover { border-color: var(--fl-color-primary); color: var(--fl-color-primary); }
.fl-btn-ghost { background: color-mix(in srgb, var(--fl-color-primary) 10%, transparent);
  color: var(--fl-color-primary); }
.fl-btn-text { background: none; padding-left: 0; padding-right: 0; color: var(--fl-color-primary); }
.fl-btn-text:hover { text-decoration: underline; }
.fl-btn-whatsapp { background: #25d366; color: #fff; }
.fl-btn-whatsapp:hover { background: #1fb457; }
.fl-btn:disabled { opacity: .55; cursor: default; transform: none; }

/* --- navbar ----------------------------------------------------------- */
.fl-navbar { border-bottom: 1px solid var(--fl-color-border); }
.fl-navbar-sticky { position: sticky; top: 0; z-index: 50;
  backdrop-filter: saturate(180%) blur(12px); }
.fl-navbar-inner { display: flex; align-items: center; gap: 28px; width: 100%;
  max-width: var(--fl-container); margin: 0 auto; }
.fl-navbar-logo { font-family: var(--fl-font-heading); font-weight: 800; font-size: 20px;
  letter-spacing: -.02em; display: inline-flex; align-items: center; }
.fl-navbar-logo img { display: block; width: auto; }
.fl-navbar-links { display: flex; align-items: center; gap: 26px; margin-left: auto; flex-wrap: wrap; }
.fl-nav-link { font-size: 15px; font-weight: 500; color: var(--fl-color-muted); transition: color .15s ease; }
.fl-nav-link:hover, .fl-nav-active { color: var(--fl-color-text); }
.fl-nav-active { font-weight: 600; }
.fl-navbar-empty { font-size: 13px; color: var(--fl-color-muted); font-style: italic; }
.fl-navbar-cta { margin-left: 4px; }
@media (max-width: 640px) {
  .fl-navbar-inner { flex-wrap: wrap; gap: 12px; }
  .fl-navbar-links { margin-left: 0; width: 100%; gap: 16px; order: 3; }
  .fl-navbar-cta { margin-left: auto; }
}

/* --- section scaffolding ---------------------------------------------- */
.fl-band { width: 100%; max-width: var(--fl-container); margin: 0 auto;
  display: flex; flex-direction: column; gap: 40px; }
.fl-band-narrow { max-width: 820px; }
.fl-band-head { display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center; }
.fl-band-title { font-size: 38px; font-weight: 700; letter-spacing: -.02em; text-align: center; }
.fl-band-sub { color: var(--fl-color-muted); font-size: 18px; text-align: center; max-width: 620px; }
@media (max-width: 640px) { .fl-band-title { font-size: 27px; } .fl-band-sub { font-size: 16px; } }
.fl-auto-grid { display: grid; gap: 24px;
  grid-template-columns: repeat(var(--fl-cols, 3), minmax(0, 1fr)); }
@media (max-width: 1024px) { .fl-auto-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .fl-auto-grid { grid-template-columns: minmax(0, 1fr); } }

/* --- testimonials ------------------------------------------------------ */
.fl-testimonial { display: flex; flex-direction: column; gap: 16px; margin: 0; padding: 28px;
  background: var(--fl-color-background); border: 1px solid var(--fl-color-border);
  border-radius: var(--fl-radius-lg); }
.fl-testimonial blockquote { margin: 0; font-size: 17px; line-height: 1.6; }
.fl-testimonial figcaption { display: flex; align-items: center; gap: 12px; margin-top: auto; }
.fl-testimonial figcaption span { display: flex; flex-direction: column; }
.fl-testimonial figcaption strong { font-size: 15px; font-weight: 600; }
.fl-testimonial figcaption em { font-size: 13px; color: var(--fl-color-muted); font-style: normal; }
.fl-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; }
.fl-stars { display: inline-flex; gap: 2px; color: var(--fl-color-accent); }

/* --- pricing ----------------------------------------------------------- */
.fl-plan { position: relative; display: flex; flex-direction: column; gap: 14px; padding: 32px 28px;
  background: var(--fl-color-background); border: 1px solid var(--fl-color-border);
  border-radius: var(--fl-radius-lg); }
.fl-plan-featured { border-color: var(--fl-color-primary); box-shadow: 0 24px 60px -32px var(--fl-color-primary); }
.fl-plan-badge { position: absolute; top: -12px; left: 28px; padding: 5px 12px; font-size: 12px;
  font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--fl-on-primary);
  background: var(--fl-color-primary); border-radius: var(--fl-radius-pill); }
.fl-plan h3 { font-size: 20px; font-weight: 600; }
.fl-plan-desc { font-size: 14px; color: var(--fl-color-muted); }
.fl-plan-price { font-family: var(--fl-font-heading); font-size: 46px; font-weight: 800;
  letter-spacing: -.03em; display: flex; align-items: baseline; gap: 2px; }
.fl-plan-currency { font-size: 24px; font-weight: 600; }
.fl-plan-period { font-size: 15px; font-weight: 500; color: var(--fl-color-muted); }
.fl-plan-features { display: flex; flex-direction: column; gap: 10px; font-size: 15px; }
.fl-plan-features li { display: flex; align-items: center; gap: 9px; color: var(--fl-color-muted); }
.fl-plan-features svg { color: var(--fl-color-primary); flex: none; }
.fl-plan-cta { margin-top: auto; width: 100%; }

/* --- faq --------------------------------------------------------------- */
.fl-faq { display: flex; flex-direction: column; gap: 10px; }
.fl-faq-item { border: 1px solid var(--fl-color-border); border-radius: var(--fl-radius-md);
  background: var(--fl-color-background); overflow: hidden; }
.fl-faq-item summary { display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 18px 22px; font-weight: 600; font-size: 16px; cursor: pointer; list-style: none; }
.fl-faq-item summary::-webkit-details-marker { display: none; }
.fl-faq-item summary svg { flex: none; transition: transform .2s ease; color: var(--fl-color-muted); }
.fl-faq-item[open] summary svg { transform: rotate(180deg); }
.fl-faq-item p { padding: 0 22px 20px; color: var(--fl-color-muted); line-height: 1.65; }

/* --- gallery ----------------------------------------------------------- */
.fl-gallery-img { width: 100%; height: 100%; object-fit: cover; display: block;
  border-radius: var(--fl-radius-md); }

/* --- forms ------------------------------------------------------------- */
.fl-form { display: flex; flex-direction: column; gap: 18px; }
.fl-form-title { font-size: 24px; font-weight: 700; }
.fl-form-desc { color: var(--fl-color-muted); font-size: 15px; margin-top: -10px; }
.fl-form-stack { display: flex; flex-direction: column; gap: 14px; }
.fl-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.fl-form-grid .fl-form-row-wide { grid-column: 1 / -1; }
@media (max-width: 640px) { .fl-form-grid { grid-template-columns: 1fr; } }
.fl-form-row { display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 500; }
.fl-form-row em { color: var(--fl-color-primary); font-style: normal; }
.fl-form input, .fl-form textarea { font: inherit; font-weight: 400; padding: 11px 14px;
  border: 1px solid var(--fl-color-border); border-radius: var(--fl-radius-sm);
  background: var(--fl-color-background); color: var(--fl-color-text); width: 100%; resize: vertical; }
.fl-form input:focus, .fl-form textarea:focus { outline: 2px solid var(--fl-color-primary);
  outline-offset: 1px; border-color: transparent; }
.fl-form-status { font-size: 14px; min-height: 1em; }
.fl-form-status[data-state="ok"] { color: #0f8a4b; }
.fl-form-status[data-state="error"] { color: #c0392b; }

/* --- map / media ------------------------------------------------------- */
.fl-map { width: 100%; border: 0; display: block; }
.fl-map-address { margin-top: 10px; font-size: 14px; color: var(--fl-color-muted); }
.fl-media-fallback { display: flex; align-items: center; justify-content: center; width: 100%;
  min-height: 120px; background: var(--fl-color-surface); color: var(--fl-color-muted);
  font-size: 14px; border-radius: var(--fl-radius-md); text-align: center; padding: 16px; }

/* --- whatsapp ---------------------------------------------------------- */
.fl-whatsapp-floating { position: fixed; right: 22px; bottom: 22px; z-index: 90;
  width: 56px; height: 56px; border-radius: 50%; background: #25d366; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 14px 34px -12px rgba(37,211,102,.9); }
.fl-whatsapp-floating svg { width: 26px; height: 26px; }

/* --- business hours ---------------------------------------------------- */
.fl-hours-title { font-size: 18px; font-weight: 600; margin-bottom: 14px; }
.fl-hours { display: flex; flex-direction: column; }
.fl-hours-row { display: flex; justify-content: space-between; gap: 20px; padding: 9px 0;
  font-size: 15px; color: var(--fl-color-muted); border-bottom: 1px solid var(--fl-color-border); }
.fl-hours-row:last-child { border-bottom: none; }
.fl-hours-today { color: var(--fl-color-text); font-weight: 600; }

/* --- social ------------------------------------------------------------ */
.fl-social { display: inline-flex; align-items: center; justify-content: center; padding: 10px;
  color: var(--fl-color-text); background: var(--fl-color-surface); transition: all .15s ease; }
.fl-social-circle { border-radius: 50%; }
.fl-social-rounded { border-radius: var(--fl-radius-sm); }
.fl-social-plain { background: none; padding: 4px; }
.fl-social:hover { color: var(--fl-on-primary); background: var(--fl-color-primary); }
.fl-social-plain:hover { background: none; color: var(--fl-color-primary); }

/* --- fallbacks --------------------------------------------------------- */
.fl-image-link { display: block; }
.fl-node-error { display: flex; flex-direction: column; gap: 4px; padding: 16px 18px;
  border: 1px dashed #d9534f; border-radius: 10px; background: #fff5f5; color: #a33;
  font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.fl-empty-slot { display: flex; align-items: center; justify-content: center; min-height: 92px;
  border: 1px dashed var(--fl-color-border); border-radius: var(--fl-radius-md);
  color: var(--fl-color-muted); font-size: 13px; width: 100%;
  font-family: ui-sans-serif, system-ui, sans-serif; }

/* --- animations -------------------------------------------------------- */
.fl-anim { animation-fill-mode: both; animation-timing-function: cubic-bezier(.22,.61,.36,1); }
.fl-anim[data-fl-anim="fade"] { animation-name: fl-fade; }
.fl-anim[data-fl-anim="fade-up"] { animation-name: fl-fade-up; }
.fl-anim[data-fl-anim="fade-down"] { animation-name: fl-fade-down; }
.fl-anim[data-fl-anim="zoom-in"] { animation-name: fl-zoom-in; }
.fl-anim[data-fl-anim="slide-left"] { animation-name: fl-slide-left; }
.fl-anim[data-fl-anim="slide-right"] { animation-name: fl-slide-right; }
@keyframes fl-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes fl-fade-up { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }
@keyframes fl-fade-down { from { opacity: 0; transform: translateY(-24px) } to { opacity: 1; transform: none } }
@keyframes fl-zoom-in { from { opacity: 0; transform: scale(.94) } to { opacity: 1; transform: none } }
@keyframes fl-slide-left { from { opacity: 0; transform: translateX(36px) } to { opacity: 1; transform: none } }
@keyframes fl-slide-right { from { opacity: 0; transform: translateX(-36px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .fl-anim { animation: none !important; } }
`;
