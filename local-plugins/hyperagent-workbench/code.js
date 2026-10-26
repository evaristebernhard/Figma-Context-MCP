// Hyperagent Workbench Builder
// Adds a new editable dashboard page. No network access and no destructive edits.

const C = {
  canvas: "#0B0E14", sidebar: "#0D1119", topbar: "#0F131C",
  panel: "#141925", panel2: "#101520", panel3: "#191F2C",
  border: "#272E3D", soft: "#202635", text: "#F4F6FB",
  muted: "#929CB0", faint: "#626D82", purple: "#8B7CFF",
  purpleDark: "#282442", green: "#48D7A2", greenDark: "#183A32",
  orange: "#F4B86A", orangeDark: "#3B2D20", blue: "#7BA7FF",
  blueDark: "#1C2E4A", white: "#FFFFFF"
};

function rgb(hex) {
  const s = hex.replace("#", "");
  return { r: parseInt(s.slice(0, 2), 16) / 255, g: parseInt(s.slice(2, 4), 16) / 255, b: parseInt(s.slice(4, 6), 16) / 255 };
}
function paint(hex) { return { type: "SOLID", color: rgb(hex) }; }
function box(parent, name, x, y, w, h, fill, radius, stroke) {
  const n = figma.createFrame();
  n.name = name; n.resize(w, h); n.fills = fill ? [paint(fill)] : [];
  n.strokes = stroke ? [paint(stroke)] : []; if (stroke) n.strokeWeight = 1;
  n.cornerRadius = radius || 0; n.clipsContent = true;
  if (parent) parent.appendChild(n); n.x = x; n.y = y; return n;
}
function circle(parent, name, x, y, w, h, fill, stroke) {
  const n = figma.createEllipse(); n.name = name; n.resize(w, h);
  n.fills = fill ? [paint(fill)] : []; n.strokes = stroke ? [paint(stroke)] : [];
  if (stroke) n.strokeWeight = 1; if (parent) parent.appendChild(n);
  n.x = x; n.y = y; return n;
}
function txt(parent, name, value, x, y, w, h, size, color, font, align) {
  const n = figma.createText(); n.name = name; if (parent) parent.appendChild(n);
  n.fontName = font; n.characters = value; n.fontSize = size; n.fills = [paint(color)];
  n.resize(w, h); n.textAutoResize = "HEIGHT"; n.textAlignHorizontal = align || "LEFT";
  n.x = x; n.y = y; return n;
}
function rule(parent, name, x, y, w, color) { return box(parent, name, x, y, w, 1, color || C.soft, 0, null); }
function pill(parent, name, value, x, y, w, h, bg, fg, font, size) {
  const p = box(parent, name, x, y, w, h, bg, h / 2, null);
  const t = txt(p, name + " label", value, 0, 0, w, h, size || 9, fg, font, "CENTER");
  t.textAlignVertical = "CENTER"; return p;
}
function button(parent, name, value, x, y, w, h, bg, fg, font, outlined) {
  const b = box(parent, name, x, y, w, h, bg, 8, outlined ? C.border : null);
  const t = txt(b, name + " label", value, 8, 0, w - 16, h, 11, fg, font, "CENTER");
  t.textAlignVertical = "CENTER"; return b;
}
function nav(parent, label, glyph, y, active, fonts, count) {
  if (active) box(parent, label + " active background", 12, y, 216, 40, C.purpleDark, 9, null);
  txt(parent, label + " icon", glyph, 26, y + 9, 20, 20, 14, active ? C.purple : C.muted, fonts.medium, "CENTER");
  txt(parent, label + " label", label, 56, y + 10, 130, 20, 12, active ? C.text : C.muted, active ? fonts.medium : fonts.regular);
  if (count) pill(parent, label + " count", count, 190, y + 10, 25, 19, active ? "#40386D" : C.panel3, active ? "#D8D2FF" : C.muted, fonts.medium, 9);
}

async function main() {
  const available = await figma.listAvailableFontsAsync();
  const family = available.some(x => x.fontName.family === "Inter") ? "Inter" : available[0].fontName.family;
  const familyFonts = available.filter(x => x.fontName.family === family);
  const pick = styles => {
    const match = familyFonts.find(x => styles.includes(x.fontName.style));
    return match ? match.fontName : familyFonts[0].fontName;
  };
  const fonts = {
    regular: pick(["Regular", "Book", "Normal"]),
    medium: pick(["Medium", "Semi Bold", "Semibold", "Regular"]),
    semibold: pick(["Semi Bold", "Semibold", "Bold", "Medium"]),
    bold: pick(["Bold", "Extra Bold", "Black", "Semi Bold", "Regular"])
  };
  const uniqueFonts = new Map();
  Object.values(fonts).forEach(f => uniqueFonts.set(f.family + "::" + f.style, f));
  await Promise.all(Array.from(uniqueFonts.values()).map(f => figma.loadFontAsync(f)));

  const names = new Set(figma.root.children.map(p => p.name));
  let pageName = "Hyperagent Workbench", suffix = 2;
  while (names.has(pageName)) { pageName = "Hyperagent Workbench (" + suffix + ")"; suffix += 1; }
  const page = figma.createPage(); page.name = pageName;
  await figma.setCurrentPageAsync(page);

  const root = box(page, "Hyperagent Workbench — Editable Dashboard", 0, 0, 1440, 1100, C.canvas, 0, null);

  // Sidebar
  const side = box(root, "Sidebar", 0, 0, 240, 1100, C.sidebar, 0, null);
  rule(side, "Sidebar divider", 239, 0, 1, C.soft);
  box(side, "Brand mark", 22, 24, 30, 30, C.purple, 9, null);
  const logo = txt(side, "Brand mark letter", "h", 22, 25, 30, 28, 20, C.white, fonts.bold, "CENTER"); logo.textAlignVertical = "CENTER";
  txt(side, "Brand name", "hyperagent", 62, 29, 115, 22, 16, C.text, fonts.semibold);
  pill(side, "Beta badge", "BETA", 178, 31, 41, 17, C.panel3, C.muted, fonts.medium, 8);
  box(side, "Workspace switcher", 14, 76, 212, 52, C.panel, 10, C.soft);
  box(side, "Workspace avatar tile", 26, 88, 28, 28, C.blueDark, 8, null);
  const avatarText = txt(side, "Workspace initials", "BW", 26, 89, 28, 26, 9, C.blue, fonts.bold, "CENTER"); avatarText.textAlignVertical = "CENTER";
  txt(side, "Workspace name", "Personal workspace", 64, 87, 132, 18, 11, C.text, fonts.medium);
  txt(side, "Workspace tier", "Pro plan", 64, 104, 118, 14, 10, C.muted, fonts.regular);
  txt(side, "Workspace switch chevron", "⌄", 202, 94, 14, 18, 13, C.muted, fonts.medium, "CENTER");
  txt(side, "Workspace nav heading", "WORKSPACE", 24, 154, 150, 16, 9, C.faint, fonts.semibold);
  nav(side, "Overview", "◫", 178, false, fonts, null);
  nav(side, "Agent runs", "↗", 224, true, fonts, "3");
  nav(side, "Browser sessions", "▦", 270, false, fonts, "2");
  nav(side, "Artifacts", "◇", 316, false, fonts, null);
  nav(side, "Approvals", "✓", 362, false, fonts, "1");
  txt(side, "Tools nav heading", "TOOLS", 24, 432, 150, 16, 9, C.faint, fonts.semibold);
  nav(side, "Integrations", "⌘", 456, false, fonts, null);
  nav(side, "Settings", "⚙", 502, false, fonts, null);
  box(side, "Usage card", 14, 916, 212, 142, C.panel, 12, C.soft);
  txt(side, "Usage title", "Monthly usage", 28, 932, 130, 18, 11, C.text, fonts.medium);
  pill(side, "Usage plan", "PRO", 174, 932, 36, 18, C.purpleDark, "#D8D2FF", fonts.semibold, 8);
  txt(side, "Usage percentage", "68%", 28, 962, 70, 28, 22, C.text, fonts.semibold);
  txt(side, "Usage description", "of 1,000 agent minutes", 28, 991, 180, 15, 10, C.muted, fonts.regular);
  box(side, "Usage progress track", 28, 1018, 184, 5, C.panel3, 3, null);
  box(side, "Usage progress fill", 28, 1018, 125, 5, C.purple, 3, null);
  txt(side, "Usage renewal", "Resets in 12 days", 28, 1032, 175, 15, 9, C.faint, fonts.regular);

  // Top bar
  const top = box(root, "Top bar", 240, 0, 1200, 72, C.topbar, 0, null);
  rule(top, "Top bar divider", 0, 71, 1200, C.soft);
  box(top, "Search field", 32, 18, 376, 36, C.panel, 9, C.soft);
  txt(top, "Search icon", "⌕", 44, 23, 20, 22, 18, C.muted, fonts.regular, "CENTER");
  txt(top, "Search placeholder", "Search runs, artifacts, and sessions…", 70, 28, 280, 16, 11, C.faint, fonts.regular);
  pill(top, "Search shortcut", "⌘ K", 358, 26, 39, 19, C.panel3, C.muted, fonts.medium, 9);
  txt(top, "Help link", "Help center", 928, 27, 88, 18, 11, C.muted, fonts.medium);
  circle(top, "Notification indicator", 1035, 28, 7, 7, C.orange, null);
  txt(top, "Notifications icon", "♧", 1028, 22, 22, 24, 15, C.muted, fonts.regular, "CENTER");
  circle(top, "User avatar", 1072, 18, 36, 36, "#35304F", null);
  txt(top, "User initials", "BW", 1072, 27, 36, 18, 10, "#DCD7FF", fonts.semibold, "CENTER");
  txt(top, "User name", "Bernhard", 1117, 23, 68, 17, 11, C.text, fonts.medium);
  txt(top, "User menu", "⌄", 1178, 23, 12, 18, 10, C.muted, fonts.regular, "CENTER");

  // Main content
  const content = box(root, "Main content", 240, 72, 1200, 1028, C.canvas, 0, null);
  txt(content, "Page eyebrow", "WORKSPACE  /  AGENT RUNS", 32, 24, 350, 14, 9, C.purple, fonts.semibold);
  txt(content, "Page title", "Agent workspace", 32, 44, 520, 36, 28, C.text, fonts.bold);
  txt(content, "Page subtitle", "Follow the plan, inspect live browsers, and review the work in one place.", 32, 81, 720, 20, 12, C.muted, fonts.regular);
  pill(content, "Run state", "●  RUNNING", 963, 44, 104, 26, C.greenDark, C.green, fonts.semibold, 9);
  txt(content, "Run ID", "RUN  #HA-0248", 970, 75, 140, 16, 9, C.faint, fonts.medium);

  // 01 Interview
  const interview = box(content, "01 Interview — task prompt", 32, 102, 1128, 124, C.panel, 14, C.border);
  box(interview, "Interview accent", 0, 0, 4, 124, C.purple, 2, null);
  txt(interview, "Interview section label", "01  /  INTERVIEW", 24, 16, 180, 14, 9, C.purple, fonts.semibold);
  txt(interview, "Task prompt", "Find the best noise-cancelling headphones under $250, compare reviews, and prepare a shortlist.", 24, 40, 820, 42, 17, C.text, fonts.medium);
  txt(interview, "Task context", "Research products  ·  Compare independent reviews  ·  Deliver a sourced recommendation", 24, 91, 800, 16, 10, C.muted, fonts.regular);
  button(interview, "View task brief", "View task brief  ↗", 932, 47, 166, 38, C.purple, C.white, fonts.semibold, false);

  // Summary metrics
  const metrics = [
    { x: 32, label: "TASK PROGRESS", value: "68%", detail: "3 of 4 steps completed", glyph: "↗", color: C.purple, bg: C.purpleDark },
    { x: 413, label: "ACTIVE BROWSERS", value: "02", detail: "Isolated sessions running", glyph: "▦", color: C.blue, bg: C.blueDark },
    { x: 794, label: "ARTIFACTS READY", value: "03", detail: "1 item needs your review", glyph: "◇", color: C.green, bg: C.greenDark }
  ];
  metrics.forEach(m => {
    const card = box(content, m.label + " metric", m.x, 242, 366, 78, C.panel, 12, C.soft);
    box(card, m.label + " icon tile", 16, 18, 38, 38, m.bg, 10, null);
    txt(card, m.label + " icon", m.glyph, 16, 24, 38, 24, 17, m.color, fonts.medium, "CENTER");
    txt(card, m.label + " title", m.label, 68, 13, 230, 14, 9, C.faint, fonts.semibold);
    txt(card, m.label + " value", m.value, 68, 31, 86, 26, 21, C.text, fonts.semibold);
    txt(card, m.label + " detail", m.detail, 160, 38, 190, 16, 10, C.muted, fonts.regular);
  });

  // 02 Agent execution
  const exec = box(content, "02 Agent execution panel", 32, 336, 548, 340, C.panel, 14, C.border);
  txt(exec, "Execution section label", "02  /  AGENT EXECUTION", 20, 20, 260, 14, 9, C.purple, fonts.semibold);
  pill(exec, "Execution live badge", "LIVE", 475, 16, 48, 20, C.greenDark, C.green, fonts.semibold, 9);
  txt(exec, "Execution title", "Research and compare", 20, 44, 300, 25, 17, C.text, fonts.semibold);
  txt(exec, "Execution subtitle", "Plan generated · 2 browser sessions connected", 20, 72, 360, 17, 10, C.muted, fonts.regular);
  rule(exec, "Execution header divider", 20, 100, 508, C.soft);
  box(exec, "Execution timeline", 28, 124, 2, 176, C.border, 1, null);
  const steps = [
    { y: 118, state: "done", title: "Task plan generated", detail: "Intent decomposed into 4 research steps", time: "10:42:01" },
    { y: 170, state: "done", title: "Search product pages", detail: "12 product pages scanned across 3 sources", time: "10:42:08" },
    { y: 222, state: "active", title: "Compare specs and reviews", detail: "Extracting price, rating, ANC, and battery life", time: "RUNNING" },
    { y: 274, state: "waiting", title: "Prepare final shortlist", detail: "Will attach sources and comparison notes", time: "QUEUED" }
  ];
  steps.forEach((s, i) => {
    const fill = s.state === "done" ? C.green : s.state === "active" ? C.purple : C.panel3;
    circle(exec, "Step " + (i + 1) + " marker", 21, s.y + 3, 16, 16, fill, s.state === "waiting" ? C.faint : null);
    if (s.state === "done") txt(exec, "Step " + (i + 1) + " check", "✓", 21, s.y + 3, 16, 14, 10, C.canvas, fonts.bold, "CENTER");
    if (s.state === "active") circle(exec, "Active step inner dot", 26, s.y + 8, 6, 6, C.white, null);
    txt(exec, "Step " + (i + 1) + " title", s.title, 49, s.y, 290, 18, 12, s.state === "waiting" ? C.muted : C.text, fonts.medium);
    txt(exec, "Step " + (i + 1) + " detail", s.detail, 49, s.y + 20, 330, 16, 10, C.muted, fonts.regular);
    txt(exec, "Step " + (i + 1) + " time", s.time, 390, s.y + 2, 130, 14, 9, s.state === "active" ? C.purple : C.faint, fonts.medium, "RIGHT");
  });

  // 03 Browser sessions — UI mockups, not live browser captures
  const browsers = box(content, "03 Browser sessions panel", 596, 336, 564, 340, C.panel, 14, C.border);
  txt(browsers, "Browser section label", "03  /  BROWSER SESSIONS", 20, 20, 280, 14, 9, C.blue, fonts.semibold);
  pill(browsers, "Browser active count", "2 ACTIVE", 455, 16, 87, 20, C.blueDark, C.blue, fonts.semibold, 9);
  txt(browsers, "Browser section subtitle", "Separate, sandboxed browser contexts", 20, 44, 320, 18, 10, C.muted, fonts.regular);

  function browserMock(parent, x, name, url, heading, rows, community) {
    const b = box(parent, name, x, 76, 260, 246, C.panel2, 10, C.soft);
    box(b, name + " toolbar", 0, 0, 260, 34, "#171D29", 10, null);
    circle(b, name + " red dot", 12, 13, 6, 6, "#F07979", null);
    circle(b, name + " yellow dot", 22, 13, 6, 6, C.orange, null);
    circle(b, name + " green dot", 32, 13, 6, 6, C.green, null);
    box(b, name + " address field", 50, 8, 197, 18, C.panel2, 5, null);
    txt(b, name + " URL", url, 57, 11, 183, 12, 7, C.muted, fonts.regular);
    txt(b, name + " page heading", heading, 12, 44, 236, 20, 11, C.text, fonts.semibold);
    txt(b, name + " page subheading", community ? "r/HeadphoneAdvice · recent threads" : "Top results · sorted by rating", 12, 65, 236, 14, 8, C.faint, fonts.regular);
    rule(b, name + " heading divider", 12, 84, 236, C.soft);
    rows.forEach((r, i) => {
      const y = 94 + i * 49;
      if (!community) {
        box(b, name + " product thumbnail " + i, 12, y, 35, 35, r.color, 7, null);
        txt(b, name + " product name " + i, r.title, 56, y + 1, 126, 15, 9, C.text, fonts.medium);
        txt(b, name + " product detail " + i, r.detail, 56, y + 17, 132, 13, 7, C.muted, fonts.regular);
        txt(b, name + " product price " + i, r.trailing, 188, y + 5, 58, 16, 9, C.green, fonts.semibold, "RIGHT");
      } else {
        box(b, name + " vote tile " + i, 12, y + 2, 43, 24, C.panel3, 6, null);
        txt(b, name + " vote " + i, r.trailing, 12, y + 7, 43, 12, 7, C.orange, fonts.semibold, "CENTER");
        txt(b, name + " thread title " + i, r.title, 63, y, 184, 16, 9, C.text, fonts.medium);
        txt(b, name + " thread detail " + i, r.detail, 63, y + 18, 184, 22, 7, C.muted, fonts.regular);
      }
    });
  }
  browserMock(browsers, 16, "Browser session 01 — Retail search", "amazon.com/search/headphones", "Noise cancelling headphones", [
    { title: "QuietComfort 45", detail: "4.6 ★ · 24h battery", trailing: "$229", color: "#34445C" },
    { title: "Soundcore Space Q45", detail: "4.5 ★ · 50h battery", trailing: "$149", color: "#5B4E73" },
    { title: "Sony WH-CH720N", detail: "4.4 ★ · 35h battery", trailing: "$128", color: "#465B51" }
  ], false);
  browserMock(browsers, 288, "Browser session 02 — Community reviews", "reddit.com/r/headphones", "Community recommendations", [
    { title: "Best ANC under $250?", detail: "Comfort matters for long flights.", trailing: "▲ 284" },
    { title: "Q45 vs QC45 after 6 months", detail: "Battery life and app EQ notes.", trailing: "▲ 176" },
    { title: "What I wish I knew before buying", detail: "Mic quality differs by device.", trailing: "▲ 92" }
  ], true);

  // 04 Artifact workspace
  const artifacts = box(content, "04 Artifact workspace panel", 32, 692, 548, 268, C.panel, 14, C.border);
  txt(artifacts, "Artifact section label", "04  /  ARTIFACT WORKSPACE", 20, 20, 280, 14, 9, C.green, fonts.semibold);
  txt(artifacts, "Artifact view all", "View all  ↗", 430, 19, 96, 17, 10, C.muted, fonts.medium, "RIGHT");
  txt(artifacts, "Artifact subtitle", "Generated outputs are saved here as the agent works.", 20, 44, 410, 17, 10, C.muted, fonts.regular);
  const items = [
    { x: 16, type: "CSV", color: C.green, bg: C.greenDark, title: "Comparison table", file: "comparison.csv", status: "READY" },
    { x: 188, type: "PDF", color: C.orange, bg: C.orangeDark, title: "Product shortlist", file: "shortlist.pdf", status: "READY" },
    { x: 360, type: "MD", color: C.blue, bg: C.blueDark, title: "Source notes", file: "source-notes.md", status: "UPDATED" }
  ];
  items.forEach((it, i) => {
    const card = box(artifacts, "Artifact card " + (i + 1), it.x, 78, 160, 166, C.panel2, 10, C.soft);
    box(card, it.title + " icon tile", 12, 12, 34, 38, it.bg, 8, null);
    txt(card, it.title + " file type", it.type, 12, 24, 34, 14, 9, it.color, fonts.bold, "CENTER");
    txt(card, it.title + " title", it.title, 12, 61, 136, 18, 10, C.text, fonts.medium);
    txt(card, it.title + " filename", it.file, 12, 82, 136, 15, 8, C.muted, fonts.regular);
    rule(card, it.title + " divider", 12, 108, 136, C.soft);
    pill(card, it.title + " status", it.status, 12, 121, it.status === "UPDATED" ? 68 : 53, 19, it.status === "UPDATED" ? C.blueDark : C.greenDark, it.status === "UPDATED" ? C.blue : C.green, fonts.semibold, 8);
    txt(card, it.title + " open arrow", "↗", 127, 121, 20, 18, 11, C.faint, fonts.medium, "CENTER");
  });

  // 05 Approval checkpoint
  const approval = box(content, "05 Approval checkpoint panel", 596, 692, 564, 268, C.panel, 14, C.border);
  txt(approval, "Approval section label", "05  /  APPROVAL CHECKPOINT", 20, 20, 300, 14, 9, C.orange, fonts.semibold);
  pill(approval, "Approval pending badge", "NEEDS REVIEW", 411, 16, 119, 20, C.orangeDark, C.orange, fonts.semibold, 8);
  txt(approval, "Approval title", "One decision before I continue", 20, 47, 400, 24, 16, C.text, fonts.semibold);
  txt(approval, "Approval description", "Review the shortlist before the agent shares its final recommendation.", 20, 75, 500, 30, 10, C.muted, fonts.regular);
  const choices = [
    { y: 116, name: "QuietComfort 45", price: "$229", score: "Best comfort" },
    { y: 151, name: "Soundcore Space Q45", price: "$149", score: "Best value" },
    { y: 186, name: "Sony WH-CH720N", price: "$128", score: "Lightweight" }
  ];
  choices.forEach((choice, i) => {
    circle(approval, "Approval option " + (i + 1) + " selector", 22, choice.y + 2, 13, 13, i === 1 ? C.purple : C.panel2, i === 1 ? C.purple : C.faint);
    if (i === 1) circle(approval, "Selected option inner dot", 26, choice.y + 6, 5, 5, C.white, null);
    txt(approval, "Approval option " + (i + 1) + " name", choice.name, 45, choice.y, 205, 17, 10, C.text, fonts.medium);
    txt(approval, "Approval option " + (i + 1) + " descriptor", choice.score, 264, choice.y + 1, 126, 15, 9, C.muted, fonts.regular);
    txt(approval, "Approval option " + (i + 1) + " price", choice.price, 440, choice.y, 78, 16, 10, C.text, fonts.semibold, "RIGHT");
  });
  button(approval, "Review comparison button", "Review comparison", 20, 224, 158, 30, C.panel3, C.text, fonts.medium, true);
  button(approval, "Approve next step button", "Approve next step  →", 188, 224, 190, 30, C.purple, C.white, fonts.semibold, false);
  txt(approval, "Approval safety note", "No purchase or external action without approval.", 389, 229, 145, 24, 8, C.faint, fonts.regular);

  txt(content, "Canvas footer status", "Last synced just now  ·  All browser activity is isolated", 32, 983, 520, 16, 9, C.faint, fonts.regular);
  txt(content, "Canvas footer version", "HYPERAGENT WORKSPACE  /  DESIGN DRAFT 01", 830, 983, 330, 16, 8, C.faint, fonts.medium, "RIGHT");

  figma.viewport.scrollAndZoomIntoView([root]);
  figma.closePlugin("Created “" + pageName + "” with an editable dashboard. Existing pages were left unchanged.");
}

main().catch(error => {
  figma.closePlugin("Hyperagent Workbench Builder failed: " + (error && error.message ? error.message : String(error)));
});
