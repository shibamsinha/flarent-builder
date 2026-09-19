import { Link } from 'react-router-dom';
import {
  ArrowRight, Blocks, FileDown, Layers, Monitor, MousePointerClick, Palette, Smartphone,
  Sparkles, Tablet, Undo2,
} from 'lucide-react';
import { TEMPLATES } from '@/templates';

/**
 * The front door. Its only job is to explain what Flarent Builder does and get
 * the visitor into the editor, so every route out of here lands on /dashboard.
 */
export function Landing() {
  return (
    <div className="f-land">
      <LandingNav />
      <Hero />
      <Marquee />
      <Features />
      <Steps />
      <Templates />
      <ClosingCta />
      <LandingFooter />
    </div>
  );
}

function LandingNav() {
  return (
    <header className="f-land-nav">
      <span className="f-logo">
        <span className="f-logo-mark">F</span>
        Flarent Builder
      </span>
      <nav className="f-land-nav-links">
        <a href="#features">Features</a>
        <a href="#how">How it works</a>
        <a href="#templates">Templates</a>
      </nav>
      <Link className="f-btn f-btn-primary" to="/dashboard">
        Open the builder
        <ArrowRight size={15} />
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="f-land-hero">
      <div className="f-land-hero-copy">
        <span className="f-land-tag">
          <Sparkles size={13} />
          V1, no AI required
        </span>
        <h1>
          Build a website.
          <br />
          <span className="f-land-mark">No code.</span>
          <br />
          No nonsense.
        </h1>
        <p>
          Drag sections onto a canvas, type straight onto the page, and publish a real static
          website. Everything you place is a proper component, not a screenshot.
        </p>
        <div className="f-land-cta-row">
          <Link className="f-btn f-btn-primary f-land-btn-lg" to="/dashboard">
            Start building
            <ArrowRight size={17} />
          </Link>
          <a className="f-btn f-btn-secondary f-land-btn-lg" href="#templates">
            See the templates
          </a>
        </div>
        <ul className="f-land-points">
          <li>Five ready-made templates</li>
          <li>Desktop, tablet and mobile</li>
          <li>Export as plain HTML and CSS</li>
        </ul>
      </div>

      <div className="f-land-hero-art" aria-hidden>
        <MockEditor />
      </div>
    </section>
  );
}

/** A flat, static illustration of the editor. Decorative only. */
function MockEditor() {
  return (
    <div className="f-land-mock">
      <div className="f-land-mock-bar">
        <span className="f-land-mock-dot" />
        <span className="f-land-mock-dot" />
        <span className="f-land-mock-dot" />
        <span className="f-land-mock-title">My Website</span>
        <span className="f-land-mock-pill">Saved</span>
      </div>
      <div className="f-land-mock-body">
        <div className="f-land-mock-side">
          {['Section', 'Heading', 'Image', 'Button', 'Grid', 'Footer'].map((label) => (
            <span key={label} className="f-land-mock-chip">
              {label}
            </span>
          ))}
        </div>
        <div className="f-land-mock-canvas">
          <span className="f-land-mock-band" />
          <span className="f-land-mock-line" style={{ width: '72%' }} />
          <span className="f-land-mock-line" style={{ width: '54%' }} />
          <span className="f-land-mock-btn" />
          <div className="f-land-mock-grid">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  const items = [
    'Drag and drop', 'Inline editing', 'Undo and redo', 'Responsive breakpoints',
    'Theme tokens', 'Multi page', 'Static export', 'Contact forms',
  ];
  return (
    <div className="f-land-marquee">
      <div className="f-land-marquee-track">
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: MousePointerClick,
    title: 'Drag it where you want it',
    body: 'Pick a component, drop it on the page. Insertion lines show exactly where it lands, and an invalid drop simply will not happen.',
    color: 'var(--f-yellow)',
  },
  {
    icon: Blocks,
    title: '29 real components',
    body: 'Sections, grids, pricing tables, FAQs, galleries, maps, contact forms and a WhatsApp button. All styled and ready the moment you drop them.',
    color: 'var(--f-cyan)',
  },
  {
    icon: Smartphone,
    title: 'Responsive without the guesswork',
    body: 'Switch to tablet or mobile and change only what needs changing. Everything else is inherited, so you are never maintaining three copies.',
    color: 'var(--f-lime)',
  },
  {
    icon: Palette,
    title: 'One theme, whole site',
    body: 'Colours, fonts and corner radius live in one place. Change the primary colour and every component using it updates at once.',
    color: 'var(--f-brand-soft)',
  },
  {
    icon: Undo2,
    title: 'Undo that behaves',
    body: 'Every action is a step you can take back. Dragging a slider counts as one change, not ninety.',
    color: 'var(--f-yellow)',
  },
  {
    icon: FileDown,
    title: 'Export a real website',
    body: 'Plain HTML and CSS with a sitemap and robots.txt. No editor code ships with it. Upload it anywhere.',
    color: 'var(--f-cyan)',
  },
];

function Features() {
  return (
    <section className="f-land-section" id="features">
      <SectionHead
        kicker="What you get"
        title="A builder that behaves like a tool"
        lead="Nothing here is a placeholder. Every feature listed does the thing it says."
      />
      <div className="f-land-grid">
        {FEATURES.map(({ icon: Icon, title, body, color }) => (
          <article key={title} className="f-land-card">
            <span className="f-land-card-icon" style={{ background: color }}>
              <Icon size={20} />
            </span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  { n: '01', title: 'Pick a template', body: 'Start from one of five finished sites, or from a blank page if you would rather build it yourself.' },
  { n: '02', title: 'Make it yours', body: 'Double click any text to edit it in place. Swap images, change colours, drag sections into a different order.' },
  { n: '03', title: 'Check every screen', body: 'Flip between desktop, tablet and mobile. Adjust a breakpoint and only that breakpoint changes.' },
  { n: '04', title: 'Publish it', body: 'Build the site and download it as plain HTML and CSS, ready to upload to any host.' },
];

function Steps() {
  return (
    <section className="f-land-section f-land-section-alt" id="how">
      <SectionHead
        kicker="How it works"
        title="Four steps, no manual"
        lead="You do not need to know React, CSS or hosting. You need to know what you want to say."
      />
      <div className="f-land-steps">
        {STEPS.map((step) => (
          <article key={step.n} className="f-land-step">
            <span className="f-land-step-n">{step.n}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Templates() {
  const shown = TEMPLATES.filter((template) => template.id !== 'blank');
  return (
    <section className="f-land-section" id="templates">
      <SectionHead
        kicker="Templates"
        title="Five sites, already finished"
        lead="Each one is built from the same components you drag onto the canvas, so everything in them can be changed."
      />
      <div className="f-land-templates">
        {shown.map((template) => (
          <article key={template.id} className="f-land-tpl">
            <span className="f-land-tpl-art" style={{ background: template.accent[0] }}>
              <span style={{ background: template.accent[1] }} />
            </span>
            <div className="f-land-tpl-body">
              <span className="f-land-tpl-tag">{template.tag}</span>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="f-land-devices">
        <Monitor size={17} /> Desktop
        <Tablet size={17} /> Tablet
        <Smartphone size={17} /> Mobile
        <Layers size={17} /> Multi page
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="f-land-closing">
      <h2>Your website is about twenty minutes away.</h2>
      <p>Open the builder, pick a template and start typing. Nothing to install, nothing to sign up for.</p>
      <Link className="f-btn f-land-btn-lg f-land-btn-invert" to="/dashboard">
        Open the builder
        <ArrowRight size={17} />
      </Link>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="f-land-footer">
      <span className="f-logo">
        <span className="f-logo-mark">F</span>
        Flarent Builder
      </span>
      <span className="f-land-footer-note">
        Built without AI. Every behaviour is ordinary application logic.
      </span>
      <Link className="f-btn f-btn-secondary f-btn-sm" to="/dashboard">
        Open the builder
      </Link>
    </footer>
  );
}

function SectionHead({ kicker, title, lead }: { kicker: string; title: string; lead: string }) {
  return (
    <div className="f-land-head">
      <span className="f-land-kicker">{kicker}</span>
      <h2>{title}</h2>
      <p>{lead}</p>
    </div>
  );
}
