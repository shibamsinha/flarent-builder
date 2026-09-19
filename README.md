# Flarent Builder V1

A visual website builder with drag-and-drop editing, multi-page sites, a
responsive system, and a static export that produces a real website.

**No AI anywhere.** Every behaviour in V1 is deterministic application logic.
There is no dependency on any model or AI API, and none is needed.

```bash
npm install
npm run dev        # landing page at http://localhost:5173
npm test           # 149 tests
npm run build      # production bundle
npm run export:demo  # build every template to demo-export/ as static sites
```

---

## The one idea that holds it together

Everything is a **JSON document** rendered by **one renderer**:

```
User interaction → commands → Project JSON → NodeRenderer → canvas / preview / published site
```

The editor canvas, the preview, and the static export all call the same
`NodeRenderer` with a different `RenderEnv`. A component has no idea which one
it is rendering into, so what you design is what gets published. There is no
second rendering path to drift out of sync.

The only deliberate difference is *where styles are written*: the canvas and
preview resolve styles for the simulated device and apply them inline (so the
device selector is exact), while the export writes the same values into
`styles.css` with real `max-width` media queries. Both use the same
`resolveStyles` logic.

---

## Layout

```
src/
  types/            Project schema + the closed set of CSS properties
  engine/
    schema/         defaults
    registry/       component registry + all component definitions
    renderer/       NodeRenderer, Editable, runtime stylesheet
    commands/       every mutation of a Project, as pure functions
    responsive/     breakpoints and style inheritance
    validation/     nesting rules
    theme/          design tokens → CSS custom properties
    export/         static site generation
  project/
    repository/     ProjectRepository interface + IndexedDB implementation
    persistence/    IndexedDB wrapper with an in-memory fallback
    migrations/     schema versioning and document repair
  services/         assets / forms / publishing, all behind interfaces
  store/            editor state, history, autosave
  builder/          the editor UI (canvas, inspector, panels, dialogs, preview)
  templates/        five starting sites, built from real components
  landing/          the marketing page at /
  dashboard/        project list at /dashboard
```

### Commands are the only way to change a project

`src/engine/commands/index.ts` holds every mutation as a pure function:

```ts
addNode(project, { pageId, node, parentId, index })  → Project
moveNode(project, { pageId, nodeId, parentId, index }) → Project
updateNodeProps / updateNodeStyles / duplicateNode / removeNode
createPage / updatePage / deletePage / setHomePage
updateTheme / updateSettings / updateNavigation
```

They never touch React, storage or the DOM. That is what makes undo/redo a
snapshot list, makes the operations testable in isolation, and gives any future
automation layer a complete API to drive the editor through. A command that
changes nothing returns the *same* project object, so no empty step ever lands
in the undo history.

### Adding a component

One file, one registration. Nothing else in the app changes:

```ts
registerComponent({
  type: 'badge',
  label: 'Badge',
  icon: Tag,
  category: 'basic',
  defaultProps: { text: 'New' },
  defaultStyles: { desktop: { fontSize: 13 } },
  children: { kind: 'none' },
  inspector: [{ key: 'text', label: 'Text', type: 'text' }],
  styleGroups: ['spacing', 'typography', 'background', 'border'],
  render: ({ props, attrs }) => <span {...attrs}>{props.text}</span>,
});
```

The components panel, the inspector, nesting validation, the layers tree, the
exporter and the templates all pick it up from the registry. The inspector is
schema-driven, so there is no per-component inspector UI anywhere in the codebase.

A component can also declare `syncChildren`, which is how `Columns` adds and
removes column children when its count changes without that logic leaking into
the store.

### Responsive model

Desktop is the base; tablet inherits desktop; mobile inherits tablet. Only
*overrides* are stored, never a full copy per breakpoint:

```ts
styles: { desktop: { fontSize: 48 }, mobile: { fontSize: 32 } }
// tablet resolves to 48, nothing is stored for it
```

Because the export emits widest-first `max-width` queries, the normal CSS
cascade reproduces that inheritance exactly on the published site.

### Theming

Theme tokens become CSS custom properties (`--fl-color-primary`), and style
values reference them as `var(--fl-color-primary)`. Changing a token updates
the canvas, the preview and the export at once, with no node rewriting.

### Selection without re-rendering

Selection outlines, hover highlights, badges and drop indicators are drawn as an
**overlay above the page**, positioned from measured rects. Node DOM is
byte-for-byte identical in the editor and on the published site, and hovering
never re-renders a node, which is what keeps large pages smooth.

### Drag and drop

dnd-kit supplies sensors, drag lifecycle and the drag preview. *Where a
component lands* is resolved by `dropResolver.ts`, which reads structure from
the project tree and geometry from live DOM rects. It walks up from the element
under the pointer until it finds a container that accepts the dragged type, so
an invalid drop is impossible and a component can never disappear.

### Swappable boundaries

| Concern    | Interface           | V1 implementation           |
|------------|---------------------|-----------------------------|
| Projects   | `ProjectRepository` | IndexedDB (memory fallback) |
| Assets     | `AssetService`      | IndexedDB blobs + object URLs |
| Forms      | `FormService`       | Local store, or a POST endpoint on the published site |
| Publishing | `Publisher`         | Static export as a `.zip`   |

Flarent Hosting, custom domains and deploy history implement `Publisher`
without the editor changing.

### Versioning

Every saved document carries `schemaVersion`. `migrateProject()` runs ordered
migrations, then a repair pass that guarantees the invariants the editor relies
on: exactly one home page, unique slugs, unique node ids, no dangling
navigation links. Malformed nodes are dropped rather than crashing the canvas;
a slightly lossy open beats an unopenable project.

### Routes

| Path                | Screen                                        |
|---------------------|-----------------------------------------------|
| `/`                 | Landing page, with a button into the builder  |
| `/dashboard`        | Project list: create, rename, duplicate, open |
| `/edit/:projectId`  | The editor                                    |
| `/preview/:id`      | Preview, with device and page switching       |

### Interface

The application chrome is Neo-Brutalist: hard black borders, offset shadows
with no blur, flat fills, square corners and heavy uppercase labels. There are
no gradients in the UI. Depth comes from displacement rather than softness, so
every interactive surface moves when you touch it.

That styling applies to the builder itself, never to the websites you make with
it. Your site renders with its own theme tokens and is unaffected.

---

## What the export produces

```
index.html            styles.css      (theme + layout + media queries)
menu/index.html       flarent.js      (form handling, the only script)
about/index.html      sitemap.xml
contact/index.html    robots.txt
assets/…              (uploaded images)
```

Plain HTML and CSS. No editor code ships with the site. Pages use relative
paths, so the export works from a static host or straight off disk.

## Safety

Rich text is whitelisted to inline formatting through DOMPurify. URLs are
scheme-checked (`javascript:`, `vbscript:`, `file:`, non-image `data:` are all
rejected), embeds must be HTTPS, and every node renders inside an error
boundary so one bad component cannot take the editor down.

## Tests

149 tests covering tree operations, commands, undo/redo coalescing, responsive
inheritance, nesting validation, schema migration and repair, stylesheet
generation, export output, link resolution, sanitisation, and a structural
audit of all six templates.

## Deliberately not in V1

AI, e-commerce, CRM, analytics, collaboration, multi-user editing, a plugin
marketplace, or a code editor. The foundation comes first.
