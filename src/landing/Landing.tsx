import { Link } from 'react-router-dom';
import {
  ArrowRight, Blocks, FileDown, MousePointerClick, Palette, Smartphone, Undo2,
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
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="f-land-hero">
      <div className="f-land-hero-copy">
        <h1>Design and publish a website without writing code</h1>
        <p>
          Drag sections onto a canvas, edit the text straight on the page, and export a real
          static website you can host anywhere. Everything you place is a proper component with
          its own settings.
        </p>
        <div className="f-land-cta-row">
          <Link className="f-btn f-btn-primary f-land-btn-lg" to="/dashboard">
            Open the builder
            <ArrowRight size={16} />
          </Link>
          <a className="f-btn f-btn-secondary f-land-btn-lg" href="#templates">
            Browse the templates
          </a>
        </div>
        <p className="f-land-fineprint">
          Nothing to install. Your work is saved in this browser as you go.
        </p>
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
        <span className="f-land-mock-title">Riverside Dental</span>
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
        <div className="f-land-mock-insp">
          <span className="f-land-mock-field" />
          <span className="f-land-mock-field" />
          <span className="f-land-mock-field short" />
          <span className="f-land-mock-field" />
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: MousePointerClick,
    title: 'Precise drag and drop',
    body: 'Insertion lines show exactly where a component will land before you let go, and a drop that would break the layout is refused rather than accepted quietly.',
  },
  {
    icon: Blocks,
    title: '29 components that arrive finished',
    body: 'Sections, grids, pricing tables, galleries, maps, contact forms and a WhatsApp button, each styled and configured the moment you drop it in.',
  },
  {
    icon: Smartphone,
    title: 'Breakpoints that inherit',
    body: 'Switch to tablet or mobile and change only what needs changing. Everything else is inherited, so you are never maintaining three copies of the same page.',
  },
  {
    icon: Palette,
    title: 'Theme tokens across the whole site',
    body: 'Colours, fonts and corner radius live in one panel. Change the primary colour and every component that references it updates at the same time.',
  },
  {
    icon: Undo2,
    title: 'History you can rely on',
    body: 'Every action is a step you can take back. Dragging a slider is recorded as one change rather than ninety separate ones.',
  },
  {
    icon: FileDown,
    title: 'Export that stands on its own',
    body: 'Plain HTML and CSS with a sitemap and robots.txt. No editor code ships with the site, so it runs anywhere you can put a folder of files.',
  },
];

function Features() {
  return (
    <section className="f-land-section" id="features">
      <SectionHead
        title="Built to behave like a real tool"
        lead="Nothing on this page is a placeholder. Every feature listed does the thing it says it does."
      />
      <div className="f-land-grid">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <article key={title} className="f-land-card">
            <span className="f-land-card-icon">
              <Icon size={17} />
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
  {
    n: '1',
    title: 'Choose a layout and tell us about your business',
    body: 'Pick the template closest to what you need, then answer a few questions. Your name, wording and contact details go into the site before it opens.',
  },
  {
    n: '2',
    title: 'Edit it on the page',
    body: 'Double click any text to change it in place. Swap images, adjust spacing and colours, and drag sections into a different order.',
  },
  {
    n: '3',
    title: 'Check how it looks on every screen',
    body: 'Move between desktop, tablet and mobile. Adjust one breakpoint and the others keep inheriting from the base.',
  },
  {
    n: '4',
    title: 'Publish it',
    body: 'Build the site and download it as plain HTML and CSS, ready to upload to any host.',
  },
];

function Steps() {
  return (
    <section className="f-land-section f-land-section-alt" id="how">
      <SectionHead
        title="From an empty page to a finished site"
        lead="You do not need to know React, CSS or hosting. You need to know what you want to say."
      />
      <ol className="f-land-steps">
        {STEPS.map((step) => (
          <li key={step.n} className="f-land-step">
            <span className="f-land-step-n">{step.n}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Templates() {
  const shown = TEMPLATES.filter((template) => template.id !== 'blank');
  return (
    <section className="f-land-section" id="templates">
      <SectionHead
        title="Five finished sites to start from"
        lead="Each one is assembled from the same components you drag onto the canvas, so every part of it can be changed."
      />
      <div className="f-land-templates">
        {shown.map((template) => (
          <article key={template.id} className="f-land-tpl">
            <span className="f-land-tpl-art" style={{ background: template.accent[0] }}>
              <span style={{ background: template.accent[1] }} />
            </span>
            <div className="f-land-tpl-body">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <span className="f-land-tpl-tag">{template.tag}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="f-land-closing">
      <h2>Start building</h2>
      <p>
        Open the builder, choose a template and answer a few questions about your business. The
        first version of your site will be on screen in a couple of minutes.
      </p>
      <Link className="f-btn f-btn-primary f-land-btn-lg" to="/dashboard">
        Open the builder
        <ArrowRight size={16} />
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
        Every behaviour in Flarent Builder is ordinary application logic, with no AI anywhere in it.
      </span>
      <Link className="f-btn f-btn-secondary f-btn-sm" to="/dashboard">
        Open the builder
      </Link>
    </footer>
  );
}

function SectionHead({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="f-land-head">
      <h2>{title}</h2>
      <p>{lead}</p>
    </div>
  );
}
