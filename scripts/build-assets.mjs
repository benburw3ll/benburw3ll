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
  red: '#f02b43', hot: '#ff5568', dim: '#6b202d',
  bone: '#f0e6e1', soft: '#a99a9c', faint: '#594c50',
}
const mono = "'Cascadia Code', Consolas, 'Liberation Mono', monospace"
const common = `<defs>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5H4" stroke="#fff" stroke-opacity=".035"/></pattern>
  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="${C.red}" stroke-opacity=".07"/></pattern>
  <linearGradient id="fade" x1="0" x2="1"><stop stop-color="${C.red}"/><stop offset="1" stop-color="#370b14"/></linearGradient>
  <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${C.panel2}"/><stop offset="1" stop-color="${C.bg}"/></linearGradient>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
</defs>`
const open = (w, h, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}" font-family="${mono}"><title>${title}</title>${common}`
const line = (x1, y1, x2, y2, color = C.dim, opacity = 1, width = 1) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${width}"/>`
const text = (x, y, s, size = 14, fill = C.bone, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${s}</text>`
const binary = Array.from({ length: 8 }, (_, row) => {
  const s = Array.from({ length: 70 }, (_, i) => ((i * 13 + row * 19 + (i >> 2)) % 11 < 5 ? '0' : '1')).join('')
  return text(35 + (row % 2) * 24, 67 + row * 47, s, 10, C.red, `opacity="${row % 3 === 0 ? '.17' : '.09'}" letter-spacing="5"`)
}).join('')

// The opening image: dial-up DNA, reframed as a contemporary command surface.
{
  const w = 960, h = 482
  const ticks = Array.from({ length: 40 }, (_, i) => {
    const a = i * Math.PI * 2 / 40
    const r1 = i % 5 === 0 ? 104 : 111
    const r2 = 119
    return line((782 + Math.cos(a) * r1).toFixed(1), (329 + Math.sin(a) * r1).toFixed(1), (782 + Math.cos(a) * r2).toFixed(1), (329 + Math.sin(a) * r2).toFixed(1), C.red, i % 5 === 0 ? .8 : .25)
  }).join('')
  const rows = [
    ['C:\\&gt; CONNECT BENBURW3LL', C.bone],
    ['&gt; MOUNT WIDGETBUTLER / WINDOWS_11', C.soft],
    ['&gt; LOAD 8 WIDGETS + TELEGRAM ASSISTANT', C.soft],
    ['&gt; STATUS: BUILDING THE NEXT VERSION_', C.red],
  ].map(([s, color], i) => text(66, 312 + i * 29, s, 17, color, `letter-spacing=".1"`)).join('')
  const svg = `${open(w, h, 'Ben Burwell: red and black hacker console, binary signal, and WidgetButler status')}
  <style>
    @keyframes tear { 0%, 87%, 91%, 100% { transform: translateX(0) } 88% { transform: translateX(15px) } 89% { transform: translateX(-8px) } 90% { transform: translateX(6px) } }
    @keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
    @media (prefers-reduced-motion: no-preference) { #glitch-a { animation: tear 9s steps(1) infinite } #cursor { animation: blink 1.2s steps(1) infinite } }
  </style>
  <clipPath id="slice1"><rect x="0" y="111" width="960" height="9"/></clipPath>
  <clipPath id="slice2"><rect x="0" y="155" width="960" height="6"/></clipPath>
  <rect width="960" height="482" fill="${C.bg}"/><rect width="960" height="482" fill="url(#grid)"/>
  <rect x="0" y="0" width="960" height="482" fill="url(#scan)"/>
  ${binary}
  <rect x="1" y="1" width="958" height="480" fill="none" stroke="${C.dim}" stroke-width="2"/>
  <rect x="15" y="15" width="930" height="452" fill="none" stroke="${C.red}" stroke-opacity=".18"/>
  <rect x="15" y="15" width="258" height="3" fill="${C.red}"/><rect x="802" y="464" width="143" height="3" fill="${C.red}"/>
  ${text(43, 52, '[ SYS://BENBURW3LL/ROOT ]', 14, C.red, 'font-weight="700" letter-spacing="1.5"')}
  ${text(918, 52, '28.8K  →  ALWAYS ON', 12, C.soft, 'text-anchor="end" letter-spacing="1"')}
  ${line(43, 65, 918, 65, C.dim)}
  ${text(45, 104, 'INCOMING TRANSMISSION', 13, C.soft, 'letter-spacing="4"')}
  <text id="glitch-a" x="39" y="187" font-family="${mono}" font-size="91" font-weight="900" letter-spacing="-6" fill="${C.red}" opacity=".6" clip-path="url(#slice1)">BENBURW3LL</text>
  <text x="55" y="187" font-family="${mono}" font-size="91" font-weight="900" letter-spacing="-6" fill="${C.red}" opacity=".75" clip-path="url(#slice2)">BENBURW3LL</text>
  <text x="47" y="187" font-family="${mono}" font-size="91" font-weight="900" letter-spacing="-6" fill="${C.bone}">BENBURW3LL</text>
  <rect x="47" y="199" width="405" height="3" fill="${C.red}"/>
  ${text(47, 232, 'ART / CODE / MACHINES WITH A MIND OF THEIR OWN', 17, C.red, 'letter-spacing="1.4"')}
  ${text(47, 253, 'FILE   EDIT   VIEW   SIGN ON   PROGZ   HELP', 10, C.faint, 'letter-spacing="1"')}
  <rect x="43" y="264" width="572" height="159" fill="url(#panel)" stroke="${C.dim}"/>
  <rect x="43" y="264" width="572" height="24" fill="${C.red}" fill-opacity=".12"/>
  ${text(59, 281, 'TERMINAL_01   ::   CURRENT OPERATION', 12, C.red, 'font-weight="700" letter-spacing="1"')}
  ${text(596, 281, '● ● ●', 12, C.red, 'text-anchor="end"')}
  ${rows}
  <rect id="cursor" x="511" y="385" width="10" height="3" fill="${C.red}"/>
  <rect x="639" y="264" width="279" height="159" fill="${C.panel}" stroke="${C.dim}"/>
  ${ticks}
  <circle cx="782" cy="329" r="95" fill="none" stroke="${C.red}" stroke-opacity=".18" stroke-width="16" filter="url(#glow)"/>
  <circle cx="782" cy="329" r="95" fill="none" stroke="${C.red}" stroke-opacity=".74" stroke-width="1.5"/>
  <circle cx="782" cy="329" r="72" fill="none" stroke="${C.red}" stroke-opacity=".25"/>
  <circle cx="782" cy="329" r="52" fill="none" stroke="${C.red}" stroke-opacity=".45" stroke-dasharray="4 5"/>
  <path d="M782 274v110M727 329h110" stroke="${C.red}" stroke-opacity=".45"/>
  <path d="M782 291l38 38-38 38-38-38z" fill="${C.bg}" stroke="${C.red}" stroke-width="2"/>
  ${text(782, 337, 'B', 32, C.bone, 'text-anchor="middle" font-weight="900"')}
  <rect x="652" y="274" width="94" height="17" fill="${C.bg}"/>
  ${text(657, 287, 'SIGNAL: LIVE', 11, C.red, 'font-weight="700"')}
  ${text(782, 410, '01000010  /  00110011', 10, C.soft, 'text-anchor="middle" letter-spacing="1"')}
  ${line(43, 444, 918, 444, C.dim)}
  ${text(43, 461, 'NO CARRIER  →  CARRIER RESTORED', 11, C.faint, 'letter-spacing="1"')}
  ${text(918, 461, 'WELCOME TO THE OTHER SIDE_ ', 11, C.red, 'text-anchor="end" letter-spacing="1"')}
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
  const svg = `${open(w, h, 'WidgetButler connects desktop widgets, a Telegram assistant, and personal rules')}
    <rect width="960" height="355" fill="${C.bg}"/><rect width="960" height="355" fill="url(#scan)"/>
    <rect x="1" y="1" width="958" height="353" fill="none" stroke="${C.dim}" stroke-width="2"/>
    <rect x="24" y="22" width="8" height="8" fill="${C.red}"/>
    ${text(45, 32, 'WIDGETBUTLER // THE SYSTEM', 17, C.bone, 'font-weight="700" letter-spacing="1.3"')}
    ${text(934, 32, 'LOCAL FIRST · MID-REBUILD', 12, C.red, 'text-anchor="end" letter-spacing="1"')}
    ${line(24, 47, 936, 47, C.dim)}
    ${text(24, 78, 'ONE DESKTOP. EIGHT WIDGETS. ONE ASSISTANT THAT CAN ACT.', 18, C.soft, 'letter-spacing=".4"')}
    ${card(24, '01', 'DESKTOP', 'Always in sight', ['Lights · door · meals · weight', 'WHOOP · physique · gratitude', 'AI usage, behind your windows'], desktopIcon)}
    ${card(341, '02', 'TELEGRAM', 'Just ask it', ['A chat interface to the widgets', 'Ask about your day or change', 'something from your phone'], phoneIcon)}
    ${card(658, '03', 'RULES', 'Make connections', ['Events and standing rules can', 'join separate parts of life.', 'More combinations are planned.'], ruleIcon)}
    ${text(24, 341, '01/03  ·  INPUT', 10, C.faint, 'letter-spacing="1"')}
    ${text(478, 341, '02/03  ·  INTELLIGENCE', 10, C.faint, 'text-anchor="middle" letter-spacing="1"')}
    ${text(936, 341, '03/03  ·  ACTION', 10, C.faint, 'text-anchor="end" letter-spacing="1"')}
  </svg>`
  save('system.svg', svg)
}
