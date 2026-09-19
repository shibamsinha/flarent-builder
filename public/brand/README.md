# Brand assets

Drop the Flarent Builder logo here as:

    public/brand/logo.png

Nothing else needs changing. The file is picked up by `src/app/brand.ts`, which
is the only place the logo is referenced, and it is used automatically by:

- the landing page header and footer
- the project dashboard
- the editor top bar
- the preview bar
- the browser tab icon

Until that file exists the app falls back to the lettermark, so a missing logo
never shows as a broken image.

## What to export

- **Format:** PNG with a transparent background.
- **Size:** at least 128 px tall. It is displayed at 22 px in the chrome, so
  export at 2x or 3x to stay sharp on high-density screens.
- **Shape:** a square or near-square mark works best beside the product name.
- **Crop it tight.** Export tools often leave a large transparent margin around
  the artwork. The lockup scales the file to a fixed height, so that margin is
  scaled too and the mark ends up looking tiny. Trim to the edge of the glyph.

If your artwork already includes the words "Flarent Builder", set
`logoIncludesName: true` in `src/app/brand.ts` so the name is not printed twice.
