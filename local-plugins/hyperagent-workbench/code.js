// Hyperagent UI recreation — local Figma development plugin.
// Creates five light-theme screens based on the user's Hyperagent screenshots.
// Every visible element is a native, editable Figma layer. No network access.
// Existing pages are never changed or deleted.

const C = {
  white: "#FFFFFF", app: "#FFFFFF", sidebar: "#F7F7F7", sideActive: "#E4E4E4",
  border: "#E6E6E6", border2: "#DCDCDC", text: "#171717", muted: "#666666",
  faint: "#8A8A8A", pale: "#F2F2F2", pale2: "#F8F8F8", blue: "#2F6BFF",
  bluePale: "#DDF4FF", blueSoft: "#E6F4FF", green: "#16A34A", greenPale: "#E7F8EC",
  workspace: "#E9E9E9", dark: "#171717", black: "#101010", pink: "#F45DAA",
  purple: "#7057E8", purplePale: "#F0ECFF", orange: "#F59E0B", red: "#E11D48",
  navy: "#172033", navy2: "#26344D", heroBlue: "#DDEBFA", heroWarm: "#E9D9C5"
};

function rgb(hex) {
  const s = hex.replace("#", "");
  return { r: parseInt(s.slice(0, 2), 16) / 255, g: parseInt(s.slice(2, 4), 16) / 255, b: parseInt(s.slice(4, 6), 16) / 255 };
}
function paint(hex) { return { type: "SOLID", color: rgb(hex) }; }
function rect(parent, name, x, y, w, h, fill, radius, stroke) {
  const n = figma.createFrame();
  n.name = name; n.resize(w, h); n.fills = fill ? [paint(fill)] : [];
  n.strokes = stroke ? [paint(stroke)] : []; if (stroke) n.strokeWeight = 1;
  n.cornerRadius = radius || 0; n.clipsContent = true;
  parent.appendChild(n); n.x = x; n.y = y; return n;
}
function ellipse(parent, name, x, y, w, h, fill, stroke) {
  const n = figma.createEllipse(); n.name = name; n.resize(w, h);
  n.fills = fill ? [paint(fill)] : []; n.strokes = stroke ? [paint(stroke)] : [];
  if (stroke) n.strokeWeight = 1; parent.appendChild(n); n.x = x; n.y = y; return n;
}
function line(parent, name, x, y, w, color) { return rect(parent, name, x, y, w, 1, color || C.border, 0, null); }
function text(parent, name, value, x, y, w, h, size, color, font, align) {
  const n = figma.createText(); n.name = name; n.fontName = font;
  n.characters = value; n.fontSize = size; n.fills = [paint(color)];
  n.resize(w, h); n.textAutoResize = "HEIGHT";
  if (align) n.textAlignHorizontal = align;
  parent.appendChild(n); n.x = x; n.y = y; return n;
}
function pill(parent, name, value, x, y, w, h, bg, fg, font, size, border) {
  const p = rect(parent, name, x, y, w, h, bg, h / 2, border || null);
  const t = text(p, name + " text", value, 5, 1, w - 10, h - 2, size || 10, fg, font, "CENTER");
  t.textAlignVertical = "CENTER"; return p;
}
function button(parent, name, value, x, y, w, h, bg, fg, font, border) {
  const p = rect(parent, name, x, y, w, h, bg, 9, border || null);
  const t = text(p, name + " text", value, 8, 1, w - 16, h - 2, 11, fg, font, "CENTER");
  t.textAlignVertical = "CENTER"; return p;
}
function makeFonts(available) {
  const family = available.some(x => x.fontName.family === "Inter") ? "Inter" : available[0].fontName.family;
  const list = available.filter(x => x.fontName.family === family);
  function choose(styles) {
    for (const style of styles) {
      const found = list.find(x => x.fontName.style === style);
      if (found) return found.fontName;
    }
    return list[0].fontName;
  }
  return {
    regular: choose(["Regular", "Book", "Normal"]),
    medium: choose(["Medium", "Regular", "Semi Bold"]),
    semibold: choose(["Semi Bold", "Semibold", "Bold", "Medium"]),
    bold: choose(["Bold", "Semi Bold", "Semibold", "Medium"])
  };
}
function sidebar(root, fonts, activeThread) {
  const s = rect(root, "Left navigation sidebar", 0, 0, 258, 900, C.sidebar, 0, null);
  line(s, "Sidebar right border", 257, 0, 1, C.border);
  text(s, "Hyperagent logo mark", "✿", 18, 19, 28, 28, 24, C.text, fonts.bold, "CENTER");
  text(s, "Hyperagent wordmark", "Hyperagent", 49, 23, 144, 26, 19, C.text, fonts.semibold);
  text(s, "Collapse sidebar icon", "◧", 222, 23, 22, 22, 14, C.muted, fonts.regular, "CENTER");
  rect(s, "Workspace selector", 8, 64, 242, 34, C.pale, 10, C.border);
  pill(s, "Personal avatar", "P", 18, 72, 20, 18, "#E5E7EB", C.muted, fonts.semibold, 9);
  text(s, "Personal workspace", "Personal", 46, 72, 135, 19, 12, C.text, fonts.medium);
  text(s, "Workspace dropdown", "⌄", 224, 71, 16, 18, 12, C.muted, fonts.regular, "CENTER");

  function nav(label, glyph, y, active, count) {
    if (active) rect(s, label + " selected row", 8, y - 3, 242, 36, C.sideActive, 9, null);
    text(s, label + " icon", glyph, 22, y + 2, 20, 22, 15, C.text, fonts.regular, "CENTER");
    text(s, label + " label", label, 51, y + 4, 160, 21, 12, C.text, active ? fonts.semibold : fonts.regular);
    if (count) pill(s, label + " count", count, 218, y + 3, 22, 18, C.white, C.muted, fonts.medium, 9, C.border);
  }
  nav("New thread", "↗", 116, false);
  nav("Search", "⌕", 150, false);
  nav("Inbox", "▱", 184, false, "1");
  text(s, "Agents section label", "Agents  ⌄", 20, 221, 160, 18, 10, C.muted, fonts.medium);
  nav("New agent", "+", 249, false);
  nav("View roster", "↗", 283, false);
  text(s, "Recent threads label", "Recent threads  ⌄", 20, 324, 190, 18, 10, C.muted, fonts.medium);
  nav("Small Biz Website Builder ...", "✿", 350, activeThread === "smallbiz", activeThread === "smallbiz" ? null : null);
  nav("Initial Conversation Greeting", "✿", 384, activeThread === "initial", null);
  nav("Welcome to Hyperagent", "✿", 418, activeThread === "welcome", null);
  nav("View all", "↗", 452, false);
  text(s, "Recent rooms label", "Recent rooms  ⌄", 20, 485, 190, 18, 10, C.muted, fonts.medium);
  nav("New room", "+", 510, false);
  text(s, "Resources label", "Resources", 20, 551, 160, 18, 10, C.muted, fonts.medium);
  nav("Skills", "♧", 574, false);
  nav("Memories", "♧", 608, false);
  nav("Learning", "▱", 642, false);
  nav("New project", "+", 676, false);
  nav("Library", "▤", 710, false);
  nav("Marketplace", "♧", 744, false);
  line(s, "Profile separator", 0, 838, 257, C.border);
  ellipse(s, "Profile avatar", 16, 854, 32, 32, "#E7E7E7", null);
  text(s, "Profile initial", "B", 16, 861, 32, 18, 11, C.muted, fonts.semibold, "CENTER");
  text(s, "Profile name", "Bernhard", 57, 853, 145, 17, 11, C.text, fonts.semibold);
  text(s, "Profile email", "chaoyucogito@inbox.lv", 57, 870, 170, 15, 9, C.muted, fonts.regular);
  text(s, "Profile menu", "›", 229, 861, 15, 18, 15, C.muted, fonts.regular, "CENTER");
  return s;
}
function threadHeader(parent, x, width, fonts, title) {
  const h = rect(parent, "Thread header", x, 0, width, 56, C.white, 0, null);
  line(h, "Thread header bottom border", 0, 55, width, C.border);
  text(h, "Thread title", title, 20, 17, Math.max(190, width - 390), 22, 13, C.text, fonts.medium);
  text(h, "Thread title dropdown", "⌄", Math.max(210, width - 375), 17, 16, 18, 11, C.muted, fonts.regular, "CENTER");
  text(h, "Star thread", "☆", Math.max(235, width - 350), 15, 22, 22, 18, C.muted, fonts.regular, "CENTER");
  text(h, "Live indicator", "○ Live", width - 248, 17, 55, 18, 10, C.muted, fonts.regular);
  button(h, "Choose model", "◉  Choose your model", width - 185, 10, 142, 34, C.white, C.muted, fonts.medium, C.border);
  button(h, "Thread settings", "☷", width - 38, 10, 30, 34, C.white, C.muted, fonts.regular, C.border);
  return h;
}
function composer(parent, x, y, w, fonts, working) {
  const h = working ? 211 : 166;
  const c = rect(parent, "Follow-up composer", x, y, w, h, C.white, 17, C.border);
  if (working) {
    text(c, "Working status", "···  Working...", 18, 12, 160, 18, 11, C.muted, fonts.regular);
    button(c, "Stop execution", "■  Stop", w - 83, 7, 65, 27, C.white, C.text, fonts.medium, null);
    line(c, "Composer status divider", 0, 39, w, C.border);
  }
  text(c, "Composer placeholder", "Add a follow-up...", 18, working ? 55 : 20, w - 40, 24, 13, C.muted, fonts.regular);
  const controlsY = working ? 126 : 102;
  ellipse(c, "Composer add button", 18, controlsY, 42, 42, C.white, C.border);
  text(c, "Composer add icon", "+", 18, controlsY + 8, 42, 24, 21, C.muted, fonts.regular, "CENTER");
  ellipse(c, "Composer options button", 72, controlsY, 42, 42, C.white, C.border);
  text(c, "Composer options icon", "☷", 72, controlsY + 9, 42, 22, 16, C.muted, fonts.regular, "CENTER");
  text(c, "Execute icon", "ϟ", w - 142, controlsY + 11, 18, 20, 17, C.text, fonts.medium, "CENTER");
  button(c, "Approval lock", "♙", w - 98, controlsY, 42, 42, C.white, C.muted, fonts.regular, C.border);
  ellipse(c, "Send message button", w - 50, controlsY, 42, 42, "#9AA7B8", null);
  text(c, "Send message arrow", "↑", w - 50, controlsY + 6, 42, 27, 22, C.white, fonts.medium, "CENTER");
  const footerY = working ? 192 : 148;
  rect(c, "Integration footer", 0, footerY, w, h - footerY, C.pale, 0, null);
  text(c, "Integration icons", "▰  ✉  ✣", 15, footerY, 56, h - footerY, 10, C.text, fonts.medium);
  text(c, "Connect integrations", "Connect your integrations  →", 74, footerY + 1, 210, h - footerY - 1, 10, C.muted, fonts.regular);
  return c;
}
function toolRow(parent, name, value, y, w, fonts, detail) {
  const r = rect(parent, name, 22, y, w - 44, 30, C.pale, 9, C.border);
  text(r, name + " icon", "▤", 9, 7, 14, 15, 10, C.muted, fonts.regular, "CENTER");
  text(r, name + " title", value, 28, 7, w - 145, 17, 10, C.muted, fonts.medium);
  if (detail) text(r, name + " detail", detail, w - 116, 7, 72, 16, 9, C.faint, fonts.regular, "RIGHT");
  text(r, name + " chevron", "›", w - 33, 4, 18, 20, 16, C.muted, fonts.regular, "CENTER");
  return r;
}
function sitePreview(parent, name, x, y, w, h, kind, fonts, fileLabel) {
  const card = rect(parent, name, x, y, w, h, C.white, 14, C.border);
  const headerColor = kind === "pet" ? "#FFF9F6" : kind === "auto" ? "#171717" : kind === "shoe" ? "#F8F8F8" : "#FBFBFB";
  rect(card, name + " website top bar", 0, 0, w, 31, headerColor, 12, null);
  if (kind === "pet") {
    text(card, name + " logo", "FOREVER YOUNG", 12, 8, w - 100, 15, 9, "#E86C94", fonts.semibold);
    text(card, name + " navigation", "HOME   SERVICES   ABOUT", w - 138, 9, 128, 13, 6, C.muted, fonts.regular, "RIGHT");
    rect(card, name + " hero", 0, 31, w, Math.floor(h * 0.57), "#D6C7B9", 0, null);
    text(card, name + " hero title", "We're your stress-free\ndog grooming solution!", 16, 58, w - 32, 44, 13, C.white, fonts.semibold, "CENTER");
    button(card, name + " hero CTA", "Let's Get Started", Math.floor((w - 112) / 2), 111, 112, 24, C.white, C.text, fonts.medium, null);
    rect(card, name + " lower image block", 12, Math.floor(h * 0.72), Math.floor(w * 0.44), Math.floor(h * 0.19), "#E9D9C8", 5, null);
    text(card, name + " lower heading", "Why choose our service", Math.floor(w * 0.49), Math.floor(h * 0.73), Math.floor(w * 0.48), 20, 9, C.text, fonts.semibold);
    text(card, name + " lower text", "Gentle care for your best friend.", Math.floor(w * 0.49), Math.floor(h * 0.82), Math.floor(w * 0.46), 24, 7, C.muted, fonts.regular);
  } else if (kind === "auto") {
    text(card, name + " logo", "DOORSTEP AUTO CARE", 12, 8, w - 120, 15, 8, C.white, fonts.bold);
    text(card, name + " navigation", "HOME  SERVICES  BOOKING", w - 125, 9, 115, 13, 6, "#D0D0D0", fonts.regular, "RIGHT");
    rect(card, name + " hero", 0, 31, w, Math.floor(h * 0.65), "#343434", 0, null);
    rect(card, name + " hero light", 0, 31, w, Math.floor(h * 0.65), "#252525", 0, null);
    text(card, name + " hero title", "Doorstep Auto Care —\nMobile Mechanic", 16, 61, w - 32, 48, 16, C.white, fonts.bold);
    text(card, name + " hero subtitle", "Kitchener, Waterloo, Cambridge & Guelph", 16, 113, w - 32, 20, 8, "#DDDDDD", fonts.regular);
    button(card, name + " call button", "Call Now", 16, 143, 82, 25, "#D61F26", C.white, fonts.semibold, null);
    button(card, name + " booking button", "Book Appointment", 105, 143, 112, 25, C.white, C.text, fonts.medium, null);
    rect(card, name + " red strip", 0, Math.floor(h * 0.68), w, 20, "#D61F26", 0, null);
    text(card, name + " red strip text", "Same-Day Mobile Mechanic Available", 8, Math.floor(h * 0.68) + 4, w - 16, 13, 7, C.white, fonts.semibold, "CENTER");
    text(card, name + " below fold", "Meet Your Mechanic", 14, Math.floor(h * 0.81), w - 28, 18, 10, C.text, fonts.semibold, "CENTER");
  } else if (kind === "shoe") {
    text(card, name + " logo", "SHOE DOCTOR KITCHENER", 12, 8, w - 24, 15, 8, C.text, fonts.bold);
    text(card, name + " navigation", "Home   Repairs   Contact", 12, 37, w - 24, 13, 6, C.muted, fonts.regular, "CENTER");
    rect(card, name + " hero", 0, 56, w, Math.floor(h * 0.66), "#7B6A5A", 0, null);
    text(card, name + " hero title", "WELCOME TO\nSHOE DOCTOR\nKITCHENER", 12, 79, w - 24, 72, 18, C.white, fonts.regular, "CENTER");
    text(card, name + " hero subtitle", "Quality shoe repair & restoration", 12, 158, w - 24, 16, 8, C.white, fonts.medium, "CENTER");
    text(card, name + " below fold", "Repairs  ·  Restoration  ·  Care", 12, Math.floor(h * 0.81), w - 24, 15, 8, C.text, fonts.medium, "CENTER");
  } else {
    text(card, name + " logo", "KW ALTERATIONS", 12, 8, w - 24, 15, 9, C.text, fonts.bold);
    text(card, name + " navigation", "ALTERATIONS    REPAIRS    CONTACT", 12, 29, w - 24, 12, 6, C.muted, fonts.regular, "CENTER");
    rect(card, name + " hero", 0, 45, w, Math.floor(h * 0.56), "#C4A76D", 0, null);
    text(card, name + " hero title", "Your Neighbor Alteration Professional", 12, 61, w - 24, 25, 11, C.white, fonts.semibold, "CENTER");
    text(card, name + " hero subtitle", "Elegance in Every Detail", 12, 88, w - 24, 16, 8, C.white, fonts.regular, "CENTER");
    const tileW = Math.floor((w - 32) / 3);
    for (let i = 0; i < 3; i++) {
      rect(card, name + " service tile " + i, 10 + i * (tileW + 6), Math.floor(h * 0.69), tileW, Math.floor(h * 0.21), "#211A32", 4, null);
      text(card, name + " service tile title " + i, ["Alteration Services", "Personal Tailoring", "Repair & Care"][i], 13 + i * (tileW + 6), Math.floor(h * 0.73), tileW - 6, 24, 7, C.white, fonts.medium, "CENTER");
    }
  }
  if (fileLabel) {
    const label = rect(card, name + " file label", 8, 7, Math.min(w - 16, fileLabel.length * 5.5 + 18), 19, "#333333", 7, null);
    text(label, name + " filename", fileLabel, 6, 3, label.width - 12, 13, 7, C.white, fonts.medium);
  }
  return card;
}
function workspaceToolbar(parent, width, fonts, mode) {
  const t = rect(parent, "Workspace toolbar", 0, 0, width, 58, "#F4F4F4", 0, null);
  line(t, "Workspace toolbar bottom border", 0, 57, width, C.border);
  pill(t, "All filter", "All  5", 14, 14, 64, 30, C.white, C.text, fonts.medium, 10, C.border);
  pill(t, "Images filter", "□  Images  4", 83, 14, 105, 30, C.white, C.muted, fonts.regular, 10, C.border);
  pill(t, "Documents filter", "□  Documents  1", 194, 14, 126, 30, C.white, C.muted, fonts.regular, 10, C.border);
  pill(t, "View layout control", "▣   ▦   ◈   ↕", Math.floor(width * 0.46), 14, 132, 30, C.white, C.muted, fonts.medium, 11, C.border);
  pill(t, "Browser tab", "◉  Browser  •", width - 244, 14, 105, 30, mode === "browser" ? C.white : "#F4F4F4", C.text, fonts.medium, 10, mode === "browser" ? C.border2 : null);
  pill(t, "Files tab", "▤  Files", width - 133, 14, 85, 30, mode === "files" ? C.white : "#F4F4F4", C.text, fonts.medium, 10, mode === "files" ? C.border2 : null);
  text(t, "Collapse workspace", "⇥", width - 36, 18, 24, 22, 17, C.muted, fonts.regular, "CENTER");
  return t;
}
function buildArtifactGallery(page, fonts) {
  const root = rect(page, "Hyperagent — Artifact gallery screen", 0, 0, 1720, 900, C.white, 0, null);
  sidebar(root, fonts, "smallbiz");
  const chatX = 258, chatW = 457, workX = 715, workW = 1005;
  const chat = rect(root, "Chat conversation column", chatX, 0, chatW, 900, C.white, 0, C.border);
  threadHeader(chat, 0, chatW, fonts, "Small Biz Website ...");
  text(chat, "Reasoning label one", "Reasoned for 1s  ›", 24, 65, 180, 16, 10, "#A0A0A0", fonts.regular);
  toolRow(chat, "Saving tool calls", "▤  Saving  4 tool calls", 87, chatW, fonts, "");
  toolRow(chat, "Updating document", "✎  Updating document · replace", 125, chatW, fonts, "");
  rect(chat, "Working notes link card", 24, 166, 404, 49, C.white, 12, C.border);
  text(chat, "Working notes icon", "▤", 37, 180, 18, 20, 13, C.muted, fonts.regular, "CENTER");
  text(chat, "Working notes title", "Working notes", 61, 176, 160, 17, 10, C.text, fonts.semibold);
  text(chat, "Working notes description", "What the agent keeps for this thread: its plan, the numbers, an...", 61, 193, 340, 15, 9, C.muted, fonts.regular);
  text(chat, "Reasoning label two", "Reasoned for 1s  ›", 24, 236, 180, 16, 10, "#A0A0A0", fonts.regular);
  text(chat, "Capture checked response", "The current-site captures are checked. Three are usable; Fur-Ever Loved’s capture has a broken hero image, so its card will link to the live site instead of showing an incomplete preview.", 24, 267, 405, 100, 12, C.text, fonts.regular);
  text(chat, "Image generation response", "Image generation is blocked on the Free plan. I’ll make this first version typography-led, with different layouts and clearly labelled demo flows—no invented product photos, prices, or live bookings.", 24, 379, 405, 100, 12, C.text, fonts.regular);
  toolRow(chat, "Publishing publicly", "◎  Publishing publicly  3 tool calls", 493, chatW, fonts, "");
  text(chat, "Reasoning status", "Reasoning...  ⌃", 24, 537, 160, 16, 10, C.muted, fonts.regular);
  text(chat, "Reasoning preview", "characters. I can use a Python composer and templates for this. Maybe I can delegate writing one HTML section since I don't have to do it all myself. Compelling typography is essential, and while I might not have actual images, I could utilize services for visual elements.", 24, 559, 405, 84, 10, "#A0A0A0", fonts.regular);
  composer(chat, 14, 673, 429, fonts, true);

  const work = rect(root, "Artifact workspace", workX, 0, workW, 900, C.workspace, 0, null);
  workspaceToolbar(work, workW, fonts, "files");
  pill(work, "Image count chip", "▧  4 Images", 196, 136, 100, 30, "#BDBDBD", C.white, fonts.semibold, 11);
  sitePreview(work, "KW Alterations screenshot preview", 196, 176, 298, 214, "alterations", fonts, "kwal terations-com.png".replace(" ", ""));
  sitePreview(work, "Fur Ever Loved screenshot preview", 502, 176, 298, 214, "pet", fonts, "fur-everloved-com.png");
  sitePreview(work, "Eddys Auto screenshot preview", 196, 397, 298, 214, "auto", fonts, "eddysauto-ca.png");
  sitePreview(work, "Shoe Doctor screenshot preview", 502, 397, 298, 214, "shoe", fonts, "shoedoctorkitchener-com.png");

  const doc = rect(work, "Working notes document preview", 824, 86, 181, 688, C.white, 14, C.border);
  pill(work, "Working notes floating title", "▤  Working notes   v4", 824, 58, 181, 28, "#333333", C.white, fonts.medium, 9);
  text(doc, "Document heading", "Working notes", 25, 30, 145, 32, 22, "#202033", fonts.bold);
  text(doc, "Document introduction", "What the agent keeps for this thread. Facts it must not forget.", 25, 73, 145, 55, 12, "#7786A0", fonts.regular);
  text(doc, "Plan overview heading", "Plan Overview", 25, 153, 145, 23, 16, "#202033", fonts.semibold);
  line(doc, "Plan overview divider", 25, 184, 133, C.border);
  text(doc, "Plan overview body", "Build a five-page workspace for small businesses. Review current sites, create distinct concepts, and keep the process easy to inspect.", 25, 198, 145, 105, 11, "#454555", fonts.regular);
  text(doc, "Plan tasks heading", "Plan Tasks", 25, 324, 145, 23, 16, "#202033", fonts.semibold);
  line(doc, "Plan tasks divider", 25, 354, 133, C.border);
  text(doc, "Plan task list", "✓  Discover Kitchener businesses\n✓  Verify websites\n○  Capture current sites\n○  Build concept pages\n○  Review deliverables", 25, 371, 145, 132, 10, "#555568", fonts.regular);
  text(doc, "Document update label", "Updated just now", 25, 642, 140, 16, 9, C.faint, fonts.regular);
  return root;
}
function browserWindow(parent, name, x, y, w, h, brand, url, kind, fonts) {
  const win = rect(parent, name, x, y, w, h, C.white, 15, C.border);
  const bar = rect(win, name + " browser chrome", 0, 0, w, 36, "#FAFAFA", 15, null);
  pill(bar, name + " tab title", brand + " ↗", 10, 6, Math.min(95, w * 0.28), 23, "#F0F0F0", C.muted, fonts.medium, 8);
  text(bar, name + " back", "‹", Math.floor(w * 0.31), 9, 15, 17, 15, C.muted, fonts.regular, "CENTER");
  text(bar, name + " forward", "›", Math.floor(w * 0.31) + 18, 9, 15, 17, 15, C.muted, fonts.regular, "CENTER");
  text(bar, name + " refresh", "⟳", Math.floor(w * 0.31) + 38, 9, 15, 17, 13, C.muted, fonts.regular, "CENTER");
  pill(bar, name + " address bar", url, Math.floor(w * 0.31) + 58, 6, Math.max(80, w * 0.42), 23, C.white, C.muted, fonts.regular, 7, C.border);
  text(bar, name + " open icon", "↗", w - 28, 8, 18, 18, 12, C.muted, fonts.regular, "CENTER");
  const inner = rect(win, name + " page content", 0, 36, w, h - 36, C.white, 0, null);
  sitePreview(inner, name + " website preview", 0, 0, w, h - 36, kind, fonts, "");
  return win;
}
function buildBrowserSessions(page, fonts) {
  const root = rect(page, "Hyperagent — Browser sessions screen", 0, 0, 1720, 900, C.white, 0, null);
  sidebar(root, fonts, "smallbiz");
  const chatX = 258, chatW = 568, workX = 826, workW = 894;
  const chat = rect(root, "Chat execution column", chatX, 0, chatW, 900, C.white, 0, C.border);
  threadHeader(chat, 0, chatW, fonts, "Small Biz Website Builder Thread");
  rect(chat, "Working notes card", 22, 64, 398, 44, C.white, 10, C.border);
  text(chat, "Working notes card icon", "▤", 35, 75, 18, 19, 13, C.muted, fonts.regular, "CENTER");
  text(chat, "Working notes card title", "Working notes", 60, 72, 160, 16, 10, C.text, fonts.semibold);
  text(chat, "Working notes card detail", "What the agent keeps for this thread: its plan, the numbers, an...", 60, 88, 345, 13, 9, C.muted, fonts.regular);
  toolRow(chat, "Loading skill", "▤  Loading · Small Biz Website Builder", 122, chatW, fonts, "");
  rect(chat, "Skill summary card", 22, 161, 382, 57, C.white, 11, C.border);
  ellipse(chat, "Skill icon background", 34, 176, 26, 26, "#E8E8E8", null);
  text(chat, "Skill icon", "♧", 34, 181, 26, 17, 13, C.text, fonts.medium, "CENTER");
  text(chat, "Skill name", "Small Biz Website Builder", 68, 171, 320, 18, 12, C.text, fonts.semibold);
  text(chat, "Skill summary", "End-to-end playbook for a local web-design lead engine:...", 68, 190, 320, 16, 10, C.muted, fonts.regular);
  toolRow(chat, "Loading guidance", "▤  Loading guidance", 229, chatW, fonts, "2 tool calls");
  toolRow(chat, "Searching places", "◎  Searching places", 277, chatW, fonts, "4 tool calls");
  text(chat, "Reasoning label", "Reasoning...", 22, 326, 150, 17, 10, C.muted, fonts.regular);
  text(chat, "Reasoning paragraph", "Researching candidates efficiently — I’m thinking about how I need to effectively research 20 candidates, breaking them down into manageable batches and finding reliable sources for information and organizing the outputs into files.", 22, 350, 510, 75, 11, C.text, fonts.regular);
  text(chat, "Agent dispatch label", "🟣  🟢  🔵  3 agents dispatched", 22, 433, 270, 20, 10, C.muted, fonts.medium);
  function agentRow(name, color, role, state, y) {
    const r = rect(chat, name + " agent status row", 22, y, 522, 37, C.white, 10, C.border);
    ellipse(r, name + " avatar", 9, 7, 22, 22, color, null);
    text(r, name + " avatar glyph", "•", 9, 8, 22, 18, 14, C.white, fonts.bold, "CENTER");
    text(r, name + " name", name, 39, 9, 68, 17, 10, C.text, fonts.semibold);
    text(r, name + " role", role, 108, 9, 132, 17, 9, C.muted, fonts.regular);
    text(r, name + " status", state, 246, 9, 230, 17, 9, C.muted, fonts.regular);
    text(r, name + " more", "•••", 486, 8, 25, 17, 11, C.faint, fonts.medium, "CENTER");
  }
  agentRow("Crumb", "#8975FF", "Website Scout", "responding", 462);
  agentRow("Ratchet", "#5CCB8A", "Website Scout", "Viewing image", 504);
  agentRow("Thimble", "#55C8DD", "Website Scout", "Viewing image", 546);
  toolRow(chat, "Place search terms", "◎  Searching places · independent barbers, garden centres, upholstery repair", 592, chatW, fonts, "");
  composer(chat, 14, 669, 540, fonts, true);

  const work = rect(root, "Browser sessions workspace", workX, 0, workW, 900, "#F1F2F3", 0, null);
  rect(work, "Browser sessions topbar", 0, 0, workW, 58, "#F5F5F5", 0, null);
  line(work, "Browser workspace header divider", 0, 57, workW, C.border);
  text(work, "Browser sessions title", "◉  Browser Sessions (3)", 22, 19, 230, 22, 13, C.text, fonts.semibold);
  pill(work, "Browser active badge", "Browser  •", workW - 142, 13, 120, 31, C.white, C.text, fonts.medium, 10, C.border);
  browserWindow(work, "Ratchet browser session", 64, 66, 360, 365, "Ratchet", "doorstep-auto-c...", "auto", fonts);
  browserWindow(work, "Thimble browser session", 434, 66, 360, 365, "Thimble", "foreveryounggro...", "pet", fonts);
  browserWindow(work, "Crumb browser session", 64, 443, 360, 390, "Crumb", "www.facebook.co...", "shoe", fonts);
  return root;
}
function buildInterview(page, fonts, finalStep) {
  const root = rect(page, finalStep ? "Hyperagent — Interview step 3 screen" : "Hyperagent — Interview step 1 screen", 0, 0, 1720, 900, C.white, 0, null);
  sidebar(root, fonts, "smallbiz");
  const mainX = 258, mainW = 1462;
  const main = rect(root, "Interview conversation main", mainX, 0, mainW, 900, C.white, 0, null);
  threadHeader(main, 0, mainW, fonts, "Small Biz Website Builder Thread");
  pill(main, "User skill request bubble", "Help me use the  ♧ Small Biz Website Builder  skill", 750, 118, 620, 46, C.bluePale, C.blue, fonts.medium, 12, "#C8EAF8");
  text(main, "Knowledge hints", "✧  3 knowledge hints  ·  5:11 PM", 1060, 169, 310, 17, 10, C.faint, fonts.regular, "RIGHT");
  text(main, "Assistant response", "I've got the Small Biz Website Builder playbook loaded — it's the full lead-engine: find businesses with great Google reviews but no/bad websites, screenshot their current state, build distinct concept rebuilds, and package it all as one click-through operator dashboard.", 338, 217, 770, 74, 12, C.text, fonts.regular);
  text(main, "Assistant follow-up", "Before I fire up the Google Places discovery sweep, I need two things from you:", 338, 294, 770, 25, 12, C.text, fonts.regular);
  if (!finalStep) {
    const q = rect(main, "Interview question card — step 1", 328, 348, 785, 274, C.white, 16, C.border);
    text(q, "Question title", "Which city/region should I target for the prospect sweep?", 18, 18, 590, 22, 13, C.text, fonts.semibold);
    text(q, "Question progress", "1/3  ⌄", 710, 18, 54, 18, 11, C.muted, fonts.medium, "RIGHT");
    const opts = ["Kitchener, ON, Canada", "Austin, TX, USA", "Manchester, UK", "Melbourne, Australia", "Your own answer"];
    opts.forEach((o, i) => {
      const y = 57 + i * 31;
      ellipse(q, "City option radio " + i, 18, y, 16, 16, i === 0 ? C.text : C.white, i === 0 ? C.text : "#C8C8C8");
      if (i === 0) ellipse(q, "City option selected center", 23, y + 5, 6, 6, C.white, null);
      text(q, "City option " + i, o, 42, y - 1, 560, 20, 12, i === 4 ? C.muted : C.text, fonts.regular);
    });
    button(q, "Skip question", "Skip", 646, 226, 58, 32, C.white, C.text, fonts.medium, C.border);
    button(q, "Next question", "Next", 712, 226, 53, 32, "#333333", C.white, fonts.semibold, null);
  } else {
    const summary = rect(main, "Previous answers summary", 328, 348, 785, 113, C.bluePale, 15, "#C8EAF8");
    text(summary, "Previous answer one", "1. Which city/region should I target for the prospect sweep?: Kitchener, ON, Canada", 18, 17, 745, 23, 11, C.text, fonts.regular);
    text(summary, "Previous answer two", "2. Which business categories should I sweep first?: Full mix (recommended)", 18, 45, 745, 23, 11, C.text, fonts.regular);
    text(main, "Final step prompt", "How strict should the review-quality filter be?", 338, 484, 700, 24, 13, C.text, fonts.semibold);
    const q = rect(main, "Interview question card — step 3", 328, 518, 785, 188, C.white, 16, C.border);
    text(q, "Question title", "How strict should the review-quality filter be?", 18, 18, 590, 22, 13, C.text, fonts.semibold);
    text(q, "Question progress", "3/3  ⌄", 710, 18, 54, 18, 11, C.muted, fonts.medium, "RIGHT");
    const opts = ["Standard (≥ 4.2★)", "Premium (≥ 4.5★)", "Your own answer"];
    opts.forEach((o, i) => {
      const y = 56 + i * 31;
      ellipse(q, "Review quality radio " + i, 18, y, 16, 16, i === 0 ? C.text : C.white, i === 0 ? C.text : "#C8C8C8");
      if (i === 0) ellipse(q, "Review quality selected center", 23, y + 5, 6, 6, C.white, null);
      text(q, "Review quality option " + i, o, 42, y - 1, 560, 20, 12, i === 2 ? C.muted : C.text, fonts.regular);
    });
    button(q, "Back to previous question", "Back", 18, 142, 60, 31, C.white, C.text, fonts.medium, C.border);
    button(q, "Skip final question", "Skip", 646, 142, 58, 31, C.white, C.text, fonts.medium, C.border);
    button(q, "Send response", "Send response", 710, 142, 65, 31, "#333333", C.white, fonts.semibold, null);
  }
  composer(main, 328, 714, 785, fonts, false);
  return root;
}
function buildBrowserEmpty(page, fonts) {
  const root = rect(page, "Hyperagent — Empty browser state screen", 0, 0, 1720, 900, C.white, 0, null);
  sidebar(root, fonts, "smallbiz");
  const chatX = 258, chatW = 457, notesX = 715, notesW = 182, browserX = 897, browserW = 823;
  const chat = rect(root, "Empty state chat column", chatX, 0, chatW, 900, C.white, 0, C.border);
  threadHeader(chat, 0, chatW, fonts, "Small Biz Website ...");
  text(chat, "Reasoning label", "Reasoned for 1s  ›", 24, 65, 180, 16, 10, "#A0A0A0", fonts.regular);
  toolRow(chat, "Saving tool calls", "▤  Saving  4 tool calls", 87, chatW, fonts, "");
  toolRow(chat, "Updating document", "✎  Updating document · replace", 125, chatW, fonts, "");
  rect(chat, "Working notes link", 24, 166, 404, 49, C.white, 12, C.border);
  text(chat, "Working notes icon", "▤", 37, 180, 18, 20, 13, C.muted, fonts.regular, "CENTER");
  text(chat, "Working notes title", "Working notes", 61, 176, 160, 17, 10, C.text, fonts.semibold);
  text(chat, "Working notes description", "What the agent keeps for this thread: its plan, the numbers, an...", 61, 193, 340, 15, 9, C.muted, fonts.regular);
  text(chat, "Capture checked message", "The current-site captures are checked. Three are usable; Fur-Ever Loved's capture has a broken hero image, so its card will link to the live site instead.", 24, 243, 405, 90, 12, C.text, fonts.regular);
  text(chat, "Image generation message", "Image generation is blocked on the Free plan. I'll make this first version typography-led, with different layouts and clearly labelled demo flows.", 24, 342, 405, 75, 12, C.text, fonts.regular);
  toolRow(chat, "Publishing publicly", "◎  Publishing publicly  3 tool calls", 435, chatW, fonts, "");
  text(chat, "Reasoning label two", "Reasoning...  ⌃", 24, 482, 160, 16, 10, C.muted, fonts.regular);
  text(chat, "Reasoning preview", "characters. I can use a Python composer and templates for this. Compelling typography is essential, and while I might not have actual images, I could utilize services for visual elements.", 24, 504, 405, 75, 10, "#A0A0A0", fonts.regular);
  composer(chat, 14, 673, 429, fonts, true);

  const notes = rect(root, "Narrow working notes preview", notesX, 0, notesW, 900, C.white, 0, C.border);
  text(notes, "Narrow notes title", "Working notes", 14, 78, 150, 27, 18, "#202033", fonts.bold);
  text(notes, "Narrow notes intro", "What the agent keeps for this thread.", 14, 116, 150, 56, 10, "#7786A0", fonts.regular);
  text(notes, "Narrow plan title", "Plan Overview", 14, 194, 150, 20, 13, "#202033", fonts.semibold);
  line(notes, "Narrow notes divider one", 14, 220, 150, C.border);
  text(notes, "Narrow plan text", "Build a five-page operator dashboard. Review businesses, capture current sites, then package concepts.", 14, 233, 150, 100, 10, "#454555", fonts.regular);
  text(notes, "Narrow tasks title", "Plan Tasks", 14, 355, 150, 20, 13, "#202033", fonts.semibold);
  line(notes, "Narrow notes divider two", 14, 382, 150, C.border);
  text(notes, "Narrow task list", "✓ Research leads\n✓ Capture websites\n○ Build concepts\n○ Review output", 14, 397, 150, 100, 9, "#555568", fonts.regular);

  const browser = rect(root, "Browser workspace empty state", browserX, 0, browserW, 900, C.workspace, 0, null);
  workspaceToolbar(browser, browserW, fonts, "browser");
  const win = rect(browser, "Empty browser window", 62, 122, 690, 664, C.workspace, 16, "#9AAFFF");
  rect(win, "Empty browser chrome", 0, 0, 690, 40, "#E7E7E7", 16, null);
  text(win, "Browser back", "‹", 16, 11, 17, 18, 16, C.muted, fonts.regular, "CENTER");
  text(win, "Browser forward", "›", 36, 11, 17, 18, 16, C.muted, fonts.regular, "CENTER");
  text(win, "Browser refresh", "⟳", 56, 11, 18, 18, 14, C.muted, fonts.regular, "CENTER");
  pill(win, "Browser address bar", "Go to a site...", 93, 7, 360, 26, C.white, "#A0A0A0", fonts.regular, 10, C.border);
  text(win, "Signed in sites", "♙  Signed-in sites  ⌄", 469, 12, 120, 16, 9, C.muted, fonts.medium);
  text(win, "Browser open in new window", "↗", 647, 10, 24, 20, 14, C.muted, fonts.regular, "CENTER");
  ellipse(win, "No browser icon", 320, 290, 36, 36, null, "#858585");
  text(win, "No browser icon glyph", "◉", 320, 297, 36, 20, 17, "#777777", fonts.regular, "CENTER");
  text(win, "No browser session yet title", "No browser session yet", 210, 343, 256, 24, 14, "#333333", fonts.semibold, "CENTER");
  text(win, "No browser session yet subtitle", "The live view appears when the agent browses — or go to a site yourself in the address bar above.", 80, 374, 520, 36, 10, "#777777", fonts.regular, "CENTER");
  return root;
}

async function main() {
  const available = await figma.listAvailableFontsAsync();
  const fonts = makeFonts(available);
  const unique = new Map();
  Object.values(fonts).forEach(f => unique.set(f.family + "::" + f.style, f));
  await Promise.all(Array.from(unique.values()).map(f => figma.loadFontAsync(f)));

  const definitions = [
    { name: "Hyperagent UI — Artifact Gallery", build: buildArtifactGallery },
    { name: "Hyperagent UI — Browser Sessions", build: buildBrowserSessions },
    { name: "Hyperagent UI — Interview Step 1", build: (p, f) => buildInterview(p, f, false) },
    { name: "Hyperagent UI — Interview Step 3", build: (p, f) => buildInterview(p, f, true) },
    { name: "Hyperagent UI — Browser Empty State", build: buildBrowserEmpty }
  ];
  const existing = new Set(figma.root.children.map(p => p.name));
  const created = [];
  for (const def of definitions) {
    let name = def.name, suffix = 2;
    while (existing.has(name)) { name = def.name + " (" + suffix + ")"; suffix += 1; }
    const page = figma.createPage(); page.name = name; existing.add(name);
    await figma.setCurrentPageAsync(page);
    const root = def.build(page, fonts);
    created.push({ page: page, root: root, name: name });
  }
  await figma.setCurrentPageAsync(created[0].page);
  figma.viewport.scrollAndZoomIntoView([created[0].root]);
  figma.closePlugin("Created five light-theme Hyperagent screen recreations. Existing pages were left unchanged.");
}

main().catch(error => {
  figma.closePlugin("Hyperagent UI recreation failed: " + (error && error.message ? error.message : String(error)));
});
