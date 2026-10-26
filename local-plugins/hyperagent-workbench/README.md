# Hyperagent UI Recreation (local Figma plugin)

This is a correction to the first draft: it recreates the **light-theme Hyperagent UI layouts shown in the supplied reference screenshots** instead of inventing a dark analytics dashboard.

## Screens created

The plugin creates five new Figma pages, each containing a 1720 × 900 editable screen:

1. **Hyperagent UI — Artifact Gallery** — left navigation, conversation/tool activity, image gallery, and a Working notes document panel.
2. **Hyperagent UI — Browser Sessions** — left navigation, Agent activity and agent-status rows, plus three browser-session mockups.
3. **Hyperagent UI — Interview Step 1** — the city/region question card, radio options, step counter, and Next/Skip controls.
4. **Hyperagent UI — Interview Step 3** — the review-quality question, selected option, Back/Skip/Send response controls, and previous-answer summary.
5. **Hyperagent UI — Browser Empty State** — conversation, narrow Working notes preview, browser toolbar, and the “No browser session yet” state.

All UI elements are native, editable Figma frames, text, and ellipse layers. The browser page thumbnails are constructed vector mockups, not live browser captures or actual website screenshots. The existing pages are never deleted or modified.

## Run it in Figma Desktop

1. Download or clone the repository branch containing this plugin.
2. Open the Hyperagent design file in **Figma Desktop**.
3. Choose **Plugins → Development → Import plugin from manifest…**.
4. Select `local-plugins/hyperagent-workbench/manifest.json`.
5. Run **Hyperagent UI Recreation** from **Plugins → Development**.
6. The plugin creates five new pages and opens the Artifact Gallery page.

If you run it again, it creates additional numbered page names rather than replacing previous drafts.

## Technical notes

- No build step or third-party dependency.
- No network access or Figma REST API token.
- JavaScript syntax can be checked with `node --check code.js`.
- The plugin must be run inside Figma Desktop to exercise the Figma Plugin API and write the screens into the document.
