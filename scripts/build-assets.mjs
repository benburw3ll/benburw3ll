// Generate self-contained SVG artwork for the GitHub profile README.
// Run: node scripts/build-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs'

const out = new URL('../assets/', import.meta.url)
mkdirSync(out, { recursive: true })
const save = (name, body) => {
  writeFileSync(new URL(name, out), body)
  console.log(`assets/${name}`)
}

const C = {
  bg: '#060607', panel: '#0d0b0e', panel2: '#140d10',
  red: '#f02b43', dim: '#6b202d',
  bone: '#f0e6e1', soft: '#a99a9c', faint: '#594c50',
}
const mono = "'Cascadia Code', Consolas, 'Liberation Mono', monospace"
const common = `<defs>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5H4" stroke="#fff" stroke-opacity=".035"/></pattern>
  <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${C.panel2}"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
</defs>`
const open = (w, h, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}" font-family="${mono}"><title>${title}</title>${common}`
const line = (x1, y1, x2, y2, color = C.dim, opacity = 1, width = 1) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${width}"/>`
const text = (x, y, s, size = 14, fill = C.bone, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${s}</text>`
// A compact binary trace. The profile name and story live in GitHub's own UI.
{
  const w = 960, h = 188
  const bits = Array.from({ length: 4 }, (_, row) => {
    const sequence = Array.from({ length: 108 }, (_, i) => ((i * 17 + row * 11 + (i >> 3)) % 13 < 6 ? '0' : '1')).join('')
    return text(28 + (row % 2) * 13, 33 + row * 40, sequence, 9, C.red, `opacity="${row % 2 ? '.06' : '.11'}" letter-spacing="3.2"`)
  }).join('')
  const trace = Array.from({ length: 181 }, (_, i) => {
    const x = 29 + i * 5
    const envelope = Math.exp(-Math.pow((i - 90) / 45, 2))
    const interference = Math.sin(i * 1.71) * Math.sin(i * .27) + Math.sin(i * .91) * .35
    const y = 94 + interference * (3 + envelope * 35)
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  const svg = `${open(w, h, 'Abstract black and red binary trace inspired by dial-up noise')}
    <rect width="960" height="188" fill="${C.bg}"/>
    <rect width="960" height="188" fill="url(#scan)"/>
    ${bits}
    <path d="M29 94H929" stroke="${C.dim}" stroke-opacity=".5"/>
    <path d="${trace}" fill="none" stroke="${C.red}" stroke-opacity=".35" stroke-width="8" filter="url(#glow)"/>
    <path d="${trace}" fill="none" stroke="${C.red}" stroke-width="1.4"/>
    <path d="M29 94h22m856 0h22" stroke="${C.bone}" stroke-width="1.5"/>
    <rect x="1" y="1" width="958" height="186" fill="none" stroke="${C.dim}" stroke-opacity=".8"/>
    <rect x="1" y="1" width="176" height="2" fill="${C.red}"/>
    <rect x="782" y="185" width="177" height="2" fill="${C.red}"/>
  </svg>`
  save('signal.svg', svg)
}
// A visual summary; the README below it remains real HTML text for accessibility.
{
  const w = 960, h = 355
  const card = (x, n, label, title, lines, icon) => `<rect x="${x}" y="105" width="278" height="212" fill="url(#panel)" stroke="${C.dim}"/>
    <rect x="${x}" y="105" width="278" height="3" fill="${C.red}"/>
    ${text(x + 17, 137, `[ ${n} ]  ${label}`, 13, C.red, 'font-weight="700" letter-spacing="1"')}
    ${icon(x + 228, 151)}
    ${text(x + 17, 199, title, 20, C.bone, 'font-weight="700"')}
    ${lines.map((s, i) => text(x + 17, 236 + i * 23, s, 13, C.soft)).join('')}`
  const desktopIcon = (x, y) => `<g fill="none" stroke="${C.red}"><rect x="${x - 22}" y="${y - 20}" width="44" height="32"/><path d="M${x - 9} ${y + 17}h18M${x} ${y + 12}v5M${x - 16} ${y - 9}h12v8h-12zM${x + 2} ${y - 9}h12v8H${x + 2}z"/></g>`
  const phoneIcon = (x, y) => `<g fill="none" stroke="${C.red}"><rect x="${x - 17}" y="${y - 23}" width="34" height="48" rx="4"/><path d="M${x - 10} ${y - 9}h20M${x - 10} ${y - 2}h14M${x - 10} ${y + 5}h18"/></g>`
  const ruleIcon = (x, y) => `<g fill="none" stroke="${C.red}"><circle cx="${x - 18}" cy="${y - 11}" r="5"/><circle cx="${x + 18}" cy="${y + 15}" r="5"/><path d="M${x - 13} ${y - 11}h16v26h10M${x - 2} ${y - 16}l5 5-5 5"/></g>`
  const svg = `${open(w, h, 'Silas Portals connects desktop widgets, Silas on Telegram, and personal rules')}
    <rect width="960" height="355" fill="${C.bg}"/><rect width="960" height="355" fill="url(#scan)"/>
    <rect x="1" y="1" width="958" height="353" fill="none" stroke="${C.dim}" stroke-width="2"/>
    <rect x="24" y="22" width="8" height="8" fill="${C.red}"/>
    ${text(45, 32, 'SILAS PORTALS // THE SYSTEM', 17, C.bone, 'font-weight="700" letter-spacing="1.3"')}
    ${text(934, 32, 'LOCAL FIRST · ONE HUB', 12, C.red, 'text-anchor="end" letter-spacing="1"')}
    ${line(24, 47, 936, 47, C.dim)}
    ${text(24, 78, 'ONE HUB. MANY PORTALS. ONE ASSISTANT THAT CAN ACT.', 18, C.soft, 'letter-spacing=".4"')}
    ${card(24, '01', 'DESKTOP', 'Always in sight', ['Lights · door · meals · habits', 'Weight · WHOOP · physique', 'Gratitude · AI usage, on screen'], desktopIcon)}
    ${card(341, '02', 'TELEGRAM', 'Just ask Silas', ['Silas reaches every portal:', 'ask about your day or change', 'something from your phone'], phoneIcon)}
    ${card(658, '03', 'RULES', 'Make connections', ['Events and standing rules can', 'join separate parts of life.', 'More combinations are planned.'], ruleIcon)}
    ${text(24, 341, '01/03  ·  INPUT', 10, C.faint, 'letter-spacing="1"')}
    ${text(478, 341, '02/03  ·  INTELLIGENCE', 10, C.faint, 'text-anchor="middle" letter-spacing="1"')}
    ${text(936, 341, '03/03  ·  ACTION', 10, C.faint, 'text-anchor="end" letter-spacing="1"')}
  </svg>`
  save('system.svg', svg)
}
