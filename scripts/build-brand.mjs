/**
 * Builds portable logo SVGs and the concept board.
 * Run: node scripts/build-brand.mjs
 */
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import { MARK, INK, BLUE, MIST, LINE, PAPER } from "../brand/mark.mjs";

const root = path.resolve(import.meta.dirname, "..");

function parseFont(file) {
  const buf = fs.readFileSync(file);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

function linePath(font, text, size, spacing) {
  let x = 0;
  const parts = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    const glyphPath = glyph.getPath(x, 0, size);
    parts.push(glyphPath.toPathData(2));
    const box = glyphPath.getBoundingBox();
    minX = Math.min(minX, box.x1);
    minY = Math.min(minY, box.y1);
    maxX = Math.max(maxX, box.x2);
    maxY = Math.max(maxY, box.y2);
    x += (glyph.advanceWidth * size) / font.unitsPerEm + spacing;
  }
  return { d: parts.join(" "), minX, minY, maxX, maxY, advance: x - spacing };
}

function fitSpacing(font, text, size, targetWidth) {
  let low = -2;
  let high = 8;
  let best = 0;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    const measured = linePath(font, text, size, mid);
    best = mid;
    if (measured.maxX - measured.minX > targetWidth) high = mid;
    else low = mid;
  }
  return linePath(font, text, size, best);
}

function markGroup(fillBars, fillJoint) {
  const bars = MARK.bars.map((d) => `<path d="${d}"/>`).join("");
  return `<g fill="${fillBars}">${bars}</g><path fill="${fillJoint}" d="${MARK.datum}"/><circle fill="${fillJoint}" cx="${MARK.node.cx}" cy="${MARK.node.cy}" r="${MARK.node.r}"/>`;
}

function lockup({ bars, joint, word }) {
  const fontDir = path.join(root, "node_modules/@fontsource/outfit/files");
  const semi = parseFont(path.join(fontDir, "outfit-latin-600-normal.woff"));
  const medium = parseFont(path.join(fontDir, "outfit-latin-500-normal.woff"));
  const mhm = linePath(semi, "MHM", 30, -0.7);
  const mhmWidth = mhm.maxX - mhm.minX;
  const global = fitSpacing(medium, "GLOBAL", 9.25, mhmWidth);
  const gap = 6.5;
  const textHeight = mhm.maxY - mhm.minY + gap + (global.maxY - global.minY);
  const markMid = (8 + 56) / 2;
  const textTop = markMid - textHeight / 2;
  const mhmTy = textTop - mhm.minY;
  const globalTy = textTop + (mhm.maxY - mhm.minY) + gap - global.minY;
  const textX = 64 + 14 - Math.min(mhm.minX, global.minX);
  const mhmTx = textX - mhm.minX;
  const globalTx = textX + (mhmWidth - (global.maxX - global.minX)) / 2 - global.minX;
  const width = Math.ceil(textX + mhmWidth + 2);
  const height = 64;
  const body = `
    ${markGroup(bars, joint)}
    <path fill="${word}" transform="translate(${mhmTx.toFixed(2)} ${mhmTy.toFixed(2)})" d="${mhm.d}"/>
    <path fill="${word}" transform="translate(${globalTx.toFixed(2)} ${globalTy.toFixed(2)})" d="${global.d}"/>
  `;
  return { width, height, body, mhm, global };
}

const color = lockup({ bars: INK, joint: BLUE, word: INK });
const mono = lockup({ bars: "currentColor", joint: "currentColor", word: "currentColor" });

function svgDoc({ width, height, body, fill, label }) {
  const rootFill = fill ? ` fill="${fill}"` : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img"${rootFill}>
  <title>${label}</title>
  <!-- Original MHM Global identity study. Not a trademark claim or clearance. -->
  ${body}
</svg>
`;
}

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.mkdirSync(path.join(root, "brand"), { recursive: true });

fs.writeFileSync(
  path.join(root, "public/logo-color.svg"),
  svgDoc({ width: color.width, height: color.height, body: color.body, label: "MHM Global" }),
);
fs.writeFileSync(
  path.join(root, "public/logo-mono.svg"),
  svgDoc({
    width: mono.width,
    height: mono.height,
    body: mono.body,
    fill: "currentColor",
    label: "MHM Global",
  }),
);

const favicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img">
  <title>MHM Global</title>
  <rect width="64" height="64" rx="14" fill="${INK}"/>
  <g fill="${MIST}" transform="translate(32 32) scale(0.62) translate(-32 -32)">
    ${MARK.bars.map((d) => `<path d="${d}"/>`).join("")}
    <path d="${MARK.datum}"/>
    <circle cx="${MARK.node.cx}" cy="${MARK.node.cy}" r="${MARK.node.r}"/>
  </g>
</svg>
`;
fs.writeFileSync(path.join(root, "public/favicon.svg"), favicon);

function concept(id) {
  if (id === "plan") {
    return `<g fill="none" stroke="${INK}" stroke-width="2.4">
      <rect x="8" y="8" width="48" height="48"/>
      <path d="M8 40H56"/>
      <path d="M22 8V40"/>
      <path d="M40 40V56"/>
    </g>
    <circle cx="40" cy="40" r="3.4" fill="${BLUE}"/>`;
  }
  if (id === "portal") {
    return `<g fill="none" stroke="${INK}" stroke-width="2.4">
      <path d="M8 12h32v34H8z"/>
      <path d="M20 20h34v34H20z"/>
    </g>
    <path d="M20 54h34" stroke="${BLUE}" stroke-width="2.4"/>
    <circle cx="28" cy="46" r="3.3" fill="${BLUE}"/>`;
  }
  if (id === "bay") {
    return `<rect x="29" y="24" width="8" height="20" fill="${LINE}"/>
    <g fill="none" stroke="${INK}" stroke-width="2.3">
      <path d="M7 16H57"/>
      <path d="M7 50H57"/>
      <rect x="10" y="22" width="12" height="24"/>
      <rect x="26" y="22" width="12" height="24"/>
      <rect x="42" y="22" width="12" height="24"/>
    </g>
    <circle cx="32" cy="16" r="3.3" fill="${BLUE}"/>`;
  }
  return `<path d="M6 50H58" stroke="${INK}" stroke-width="2.4"/>
  <path d="M10 50V34L22 16L32 34L44 16L54 34V50" fill="${PAPER}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="miter"/>
  <circle cx="32" cy="34" r="3.4" fill="${BLUE}"/>`;
}

const outfitB64 = fs
  .readFileSync(path.join(root, "node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2"))
  .toString("base64");
const syneB64 = fs
  .readFileSync(path.join(root, "node_modules/@fontsource-variable/syne/files/syne-latin-wght-normal.woff2"))
  .toString("base64");

const alternatives = [
  {
    id: "plan",
    name: "Plan",
    copy: "Floor plate, corridor, junction. Quiet as a drawing, softer as a 16px stamp.",
  },
  {
    id: "portal",
    name: "Portal",
    copy: "Offset frames and a threshold. Suggests entry more than a distributable mark.",
  },
  {
    id: "bay",
    name: "Bay",
    copy: "Three-bay facade, transom node. Architectural, and busier when reduced.",
  },
  {
    id: "section",
    name: "Section",
    copy: "Two roofs, one valley. The clearest M, the first to clog at invoice size.",
  },
];

const cards = alternatives
  .map((item, index) => {
    const x = 64 + index * (353 + 20);
    return `<g>
      <rect x="${x}" y="900" width="353" height="340" fill="${PAPER}" stroke="${LINE}"/>
      <svg x="${x + 116}" y="928" width="120" height="120" viewBox="0 0 64 64">${concept(item.id)}</svg>
      <text x="${x + 28}" y="1088" fill="${INK}" font-family="Syne Board, sans-serif" font-size="28" font-weight="650">${item.name}</text>
      <foreignObject x="${x + 28}" y="1108" width="297" height="110">
        <p xmlns="http://www.w3.org/1999/xhtml" style="margin:0;font-family:'Outfit Board',sans-serif;font-size:16px;line-height:1.45;color:#3E5670;">${item.copy}</p>
      </foreignObject>
    </g>`;
  })
  .join("");

const board = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1320" viewBox="0 0 1600 1320" role="img">
  <title>MHM Global logo studies</title>
  <style><![CDATA[
    @font-face {
      font-family: "Outfit Board";
      src: url("data:font/woff2;base64,${outfitB64}") format("woff2");
      font-weight: 100 900;
      font-style: normal;
    }
    @font-face {
      font-family: "Syne Board";
      src: url("data:font/woff2;base64,${syneB64}") format("woff2");
      font-weight: 400 800;
      font-style: normal;
    }
  ]]></style>
  <rect width="1600" height="1320" fill="${MIST}"/>
  <svg x="64" y="48" width="36" height="36" viewBox="0 0 64 64">${markGroup(INK, BLUE)}</svg>
  <text x="112" y="72" fill="${INK}" font-family="Outfit Board, sans-serif" font-size="16" font-weight="600" letter-spacing="0.5">MHM Global</text>
  <text x="1536" y="72" text-anchor="end" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="13" font-weight="600" letter-spacing="2.4">LOGO STUDIES</text>
  <text x="64" y="168" fill="${INK}" font-family="Syne Board, sans-serif" font-size="58" font-weight="650">Five directions. Datum selected.</text>
  <text x="64" y="206" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="18">Original vector studies for a low-voltage distributor. Not a trademark search or clearance.</text>

  <rect x="64" y="240" width="1472" height="620" fill="${PAPER}" stroke="${LINE}"/>
  <text x="104" y="284" fill="${BLUE}" font-family="Outfit Board, sans-serif" font-size="13" font-weight="600" letter-spacing="2.2">SELECTED</text>
  <text x="104" y="326" fill="${INK}" font-family="Syne Board, sans-serif" font-size="40" font-weight="650">Datum</text>
  <svg x="104" y="360" width="${color.width * 2.15}" height="${color.height * 2.15}" viewBox="0 0 ${color.width} ${color.height}">${color.body}</svg>

  <text x="860" y="300" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="13" font-weight="600" letter-spacing="1.8">COLOR AND ONE INK</text>
  <rect x="860" y="322" width="300" height="92" fill="${PAPER}" stroke="${LINE}"/>
  <svg x="876" y="338" width="${mono.width * 1.15}" height="${mono.height * 1.15}" viewBox="0 0 ${mono.width} ${mono.height}" color="${INK}">${mono.body}</svg>
  <rect x="1180" y="322" width="300" height="92" fill="${INK}"/>
  <svg x="1196" y="338" width="${mono.width * 1.15}" height="${mono.height * 1.15}" viewBox="0 0 ${mono.width} ${mono.height}" color="${MIST}">${mono.body}</svg>

  <text x="860" y="460" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="13" font-weight="600" letter-spacing="1.8">SMALL SIZES</text>
  <svg x="860" y="480" width="64" height="64" viewBox="0 0 64 64">${markGroup(INK, BLUE)}</svg>
  <svg x="944" y="496" width="32" height="32" viewBox="0 0 64 64">${markGroup(INK, BLUE)}</svg>
  <svg x="992" y="504" width="16" height="16" viewBox="0 0 64 64">${markGroup(INK, BLUE)}</svg>
  <text x="860" y="562" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="12">64 · 32 · 16</text>
  <svg x="1040" y="478" width="64" height="64" viewBox="0 0 64 64">${markGroup(INK, BLUE)}</svg>
  <text x="1040" y="562" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="12">16px shown at 4×</text>

  <text x="860" y="620" fill="${INK}" font-family="Outfit Board, sans-serif" font-size="18">Three piers, one datum, a joint cut into the center pier.</text>
  <text x="860" y="648" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="16">The joint stays visible in a single ink, so the stamp works on</text>
  <text x="860" y="672" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="16">invoices, labels, and a navy ground. Architecture without a</text>
  <text x="860" y="696" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="16">building icon. Connection without a globe or a circuit.</text>
  <text x="860" y="742" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="16">Wordmark set in Outfit. Headlines on the site use Syne.</text>
  <text x="860" y="800" fill="${INK}" font-family="Outfit Board, sans-serif" font-size="14" font-weight="600">${INK}  ·  ${BLUE}  ·  ${MIST}</text>

  <text x="104" y="548" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="13" font-weight="600" letter-spacing="1.8">APPLIED</text>
  <rect x="104" y="564" width="220" height="250" fill="${MIST}" stroke="${LINE}"/>
  <text x="124" y="592" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="12" letter-spacing="1.4">BUSINESS CARD</text>
  <svg x="124" y="620" width="${color.width * 1.05}" height="${color.height * 1.05}" viewBox="0 0 ${color.width} ${color.height}">${color.body}</svg>
  <text x="124" y="760" fill="${INK}" font-family="Outfit Board, sans-serif" font-size="14">Low-voltage distribution</text>
  <text x="124" y="784" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="13">Contact to be confirmed</text>

  <rect x="344" y="564" width="230" height="250" fill="${PAPER}" stroke="${LINE}"/>
  <text x="364" y="592" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="12" letter-spacing="1.4">DOCUMENT HEADER</text>
  <svg x="364" y="616" width="${color.width * 0.92}" height="${color.height * 0.92}" viewBox="0 0 ${color.width} ${color.height}">${color.body}</svg>
  <text x="364" y="748" fill="${INK}" font-family="Outfit Board, sans-serif" font-size="13">Specimen header only.</text>
  <text x="364" y="770" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="13">No account or address</text>
  <text x="364" y="790" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="13">is printed here.</text>

  <rect x="594" y="564" width="210" height="250" fill="${INK}"/>
  <text x="614" y="592" fill="${LINE}" font-family="Outfit Board, sans-serif" font-size="12" letter-spacing="1.4">PACKAGING</text>
  <svg x="614" y="630" width="88" height="88" viewBox="0 0 64 64" color="${MIST}">${markGroup("currentColor", "currentColor")}</svg>
  <text x="614" y="760" fill="${MIST}" font-family="Outfit Board, sans-serif" font-size="16" font-weight="600">MHM</text>
  <text x="614" y="782" fill="${LINE}" font-family="Outfit Board, sans-serif" font-size="12" letter-spacing="2">GLOBAL</text>

  <text x="64" y="880" fill="${INK}" font-family="Syne Board, sans-serif" font-size="32" font-weight="650">Alternatives</text>
  ${cards}
  <text x="64" y="1284" fill="#3E5670" font-family="Outfit Board, sans-serif" font-size="14">Keep these visible when judging the choice. Datum is the mark used across the homepage.</text>
</svg>
`;

fs.writeFileSync(path.join(root, "brand/logo-concepts.svg"), board);
console.log(`color lockup ${color.width}x${color.height}`);
console.log("wrote public/logo-color.svg, public/logo-mono.svg, public/favicon.svg, brand/logo-concepts.svg");
