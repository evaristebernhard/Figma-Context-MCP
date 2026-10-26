# Hyperagent Workbench Builder (local Figma plugin)

This development plugin creates a new, fully editable Figma page named **Hyperagent Workbench**. If that name already exists, it creates a numbered page instead. It never deletes or overwrites existing pages.

## What it creates

- **01 / Interview** — task prompt and task brief action
- **02 / Agent Execution** — four-step execution timeline with completed, running, and queued states
- **03 / Browser Sessions** — two editable browser-window mockups
- **04 / Artifact Workspace** — comparison table, product shortlist, and source-note cards
- **05 / Approval Checkpoint** — review choices and an explicit approval boundary
- Sidebar navigation, usage meter, run status, search, and summary metrics

All visible elements are native Figma text, frame, and ellipse layers. The browser previews and product details are illustrative mock data, not live browser captures.

## Run it in Figma Desktop

1. Download or clone this repository to your computer.
2. Open your Hyperagent design file in **Figma Desktop**.
3. Choose **Plugins → Development → Import plugin from manifest…**.
4. Select the manifest.json file in this folder.
5. Run **Hyperagent Workbench Builder** from **Plugins → Development**.
6. The plugin creates a new page and zooms to the dashboard. Your existing homepage and pages remain unchanged.

If you run it again, it creates a numbered page such as **Hyperagent Workbench (2)** instead of replacing the previous draft.

## Validation

The plugin has no build step, no third-party dependencies, and no network access. Run node --check code.js to check JavaScript syntax. The plugin must be run inside Figma Desktop to validate its Figma Plugin API calls and create the page in the document.
