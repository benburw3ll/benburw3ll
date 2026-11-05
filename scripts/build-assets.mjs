// Builds the profile's static SVGs into assets/: the sign-on window, the instant message, the
// buddy list and the fader headings. Run: node scripts/build-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { UI, MONO, esc, raised, sunken, button, defs, windowFrame, during, startOpacity, tear, binaryRows } from './win95.mjs'

const dir = new URL('../assets/', import.meta.url)
mkdirSync(dir, { recursive: true })
const save = (name, svg) => {
  writeFileSync(new URL(name, dir), svg)
  console.log(`assets/${name} ${svg.length} bytes`)
}
const svgOpen = (w, h, label, extraDefs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}" font-family="${UI}" font-size="12">
  <title>${esc(label)}</title>
  ${defs(extraDefs)}`

/** Opacity on/off over several windows within one cycle. */
const flicker = (pairs, dur) => {
  const values = ['0']
  const times = ['0']
  for (const [a, b] of pairs) {
    values.push('1', '0')
    times.push((a / dur).toFixed(4), (b / dur).toFixed(4))
  }
  return `<animate attributeName="opacity" values="${values.join(';')}" keyTimes="${times.join(';')}" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>`
}
const GHOSTS = `<filter id="onlyRed"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>
    <filter id="onlyCyan"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter>`

// Block letters, for the moment the sign-on screen breaks.
const G = {
  H: ['██╗  ██╗', '██║  ██║', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
  A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
  C: [' ██████╗', '██╔════╝', '██║     ', '██║     ', '╚██████╗', ' ╚═════╝'],
  K: ['██╗  ██╗', '██║ ██╔╝', '█████╔╝ ', '██╔═██╗ ', '██║  ██╗', '╚═╝  ╚═╝'],
  T: ['████████╗', '╚══██╔══╝', '   ██║   ', '   ██║   ', '   ██║   ', '   ╚═╝   '],
  E: ['███████╗', '██╔════╝', '█████╗  ', '██╔══╝  ', '███████╗', '╚══════╝'],
  P: ['██████╗ ', '██╔══██╗', '██████╔╝', '██╔═══╝ ', '██║     ', '╚═╝     '],
  L: ['██╗     ', '██║     ', '██║     ', '██║     ', '███████╗', '╚══════╝'],
  N: ['███╗   ██╗', '████╗  ██║', '██╔██╗ ██║', '██║╚██╗██║', '██║ ╚████║', '╚═╝  ╚═══╝'],
  ' ': ['   ', '   ', '   ', '   ', '   ', '   '],
}
const blockWord = (text, cx, top, cw, ch) => {
  const rows = [0, 1, 2, 3, 4, 5].map((i) => [...text].map((c) => G[c][i]).join(''))
  const x0 = cx - ([...rows[0]].length * cw) / 2
  const out = []
  rows.forEach((row, r) => [...row].forEach((c, k) => c === '█' && out.push(`<rect x="${x0 + k * cw}" y="${top + r * ch}" width="${cw}" height="${ch}"/>`)))
  return out.join('')
}

// ---------- sign-on window ----------
{
  const W = 400
  const H = 290
  const D = 12
  const icon = (i, cx, cy, c) => {
    const s = `stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"`
    switch (i) {
      case 0: // modem
        return `<rect x="${cx - 24}" y="${cy - 8}" width="48" height="16" rx="3" ${s}/><circle cx="${cx - 12}" cy="${cy}" r="2" fill="${c}"/><circle cx="${cx - 4}" cy="${cy}" r="2" fill="${c}"/><circle cx="${cx + 4}" cy="${cy}" r="2" fill="${c}"/><path d="M${cx + 24} ${cy}c8 0 6 10 14 10" ${s}/>`
      case 1: // two machines and a signal
        return `<rect x="${cx - 32}" y="${cy - 15}" width="18" height="14" ${s}/><path d="M${cx - 23} ${cy - 1}v5m-5 0h10" ${s}/><rect x="${cx + 14}" y="${cy - 15}" width="18" height="14" ${s}/><path d="M${cx + 23} ${cy - 1}v5m-5 0h10" ${s}/><path d="M${cx - 11} ${cy - 8}l4 -5l4 10l4 -10l4 10l4 -5" ${s}/>`
      case 2: // key
        return `<circle cx="${cx - 14}" cy="${cy}" r="7" ${s}/><path d="M${cx - 7} ${cy}h26m-8 0v6m6 -6v5" ${s}/>`
      default: // the eye
        return `<path d="M${cx - 24} ${cy}Q${cx} ${cy - 18} ${cx + 24} ${cy}Q${cx} ${cy + 18} ${cx - 24} ${cy}Z" ${s}/><circle cx="${cx}" cy="${cy}" r="8" ${s}/>`
    }
  }
  const labels = ['Dialing', 'Connecting', 'Password', 'Signing on']
  const tiles = labels
    .map((label, i) => {
      const x = 22 + i * 92
      const y = 72
      const cx = x + 40
      const cy = y + 36
      const lit = i === 3 ? '#ff1a1a' : '#ffd400'
      const on = i * 2
      const pupil =
        i === 3
          ? `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${lit}"><animateTransform attributeName="transform" type="translate" values="0 0;-6 0;5 0;0 2;-4 -1;0 0" keyTimes="0;0.55;0.68;0.8;0.9;0.97" calcMode="discrete" dur="${D}s" repeatCount="indefinite"/></circle>`
          : ''
      return `<rect x="${x}" y="${y}" width="80" height="80" fill="#0b0b0b" stroke="#2a2a2a"/>
      ${icon(i, cx, cy, '#3a3a3a')}
      <text x="${x + 5}" y="${y + 13}" fill="#4a4a4a" font-size="10" font-weight="bold">${i + 1}</text>
      <text x="${cx}" y="${y + 97}" fill="#5a5a5a" text-anchor="middle" font-size="11">${label}</text>
      <g opacity="${startOpacity(on)}">${during(on, D, D)}
        <rect x="${x + 0.5}" y="${y + 0.5}" width="79" height="79" fill="none" stroke="${lit}"/>
        ${icon(i, cx, cy, lit)}${pupil}
        <text x="${x + 5}" y="${y + 13}" fill="${lit}" font-size="10" font-weight="bold">${i + 1}</text>
        <text x="${cx}" y="${y + 97}" fill="#fff" text-anchor="middle" font-size="11">${label}</text>
      </g>`
    })
    .join('')
  const status = [
    [0, 2, 'Dialing…', '#000', UI],
    [2, 4, 'Connecting at 28,800 bps…', '#000', UI],
    [4, 6, 'Checking password…', '#000', UI],
    [6, 7.5, 'Signing on…', '#000', UI],
    [7.5, 10.5, '01010111 01000101 01001100 01000011 01001111 01001101 01000101', '#c00000', MONO],
    [10.5, D, 'Welcome back.', '#000', UI],
  ]
    .map(([a, b, t, c, f]) => `<text x="20" y="${208}" fill="${c}" font-family="${f}" opacity="${startOpacity(a)}">${during(a, b, D)}${esc(t)}</text>`)
    .join('')
  const win = `<g id="win">
    ${windowFrame(W, H, 'WidgetButler OnLine — Sign On')}
    <text x="${W / 2}" y="54" text-anchor="middle" font-size="25" font-weight="bold" font-style="italic" fill="url(#fader)" stroke="#000" stroke-width="0.8" paint-order="stroke">WidgetButler OnLine</text>
    ${sunken(12, 64, 376, 124, '#000')}
    ${tiles}
    ${sunken(12, 194, 376, 22)}
    ${status}
    <text x="12" y="238">Screen Name:</text>${sunken(88, 225, 122, 20)}<text x="94" y="239">benburw3ll</text>
    <text x="220" y="238">Password:</text>${sunken(280, 225, 108, 20)}<text x="287" y="240" letter-spacing="1">••••••••</text>
    ${button(12, 256, 70, 24, 'Setup')}${button(88, 256, 60, 24, 'Help')}
    ${button(232, 256, 72, 24, 'Cancel', { disabled: true })}${button(312, 256, 76, 24, 'Sign On', { primary: true })}
  </g>`
  const svg = `${svgOpen(W, H, 'WidgetButler OnLine signing on: dialing, connecting, checking password, signing on', GHOSTS)}
  <defs>${win}</defs>
  <use href="#win"/>
  ${tear('t1', 'win', W, 40, 10, [[7.6, 24], [8.0, 0], [9.1, -30], [9.4, 0]], D)}
  ${tear('t2', 'win', W, 118, 14, [[7.9, -18], [8.5, 0], [9.8, 40], [10.2, 0]], D, '#ff0040')}
  ${tear('t3', 'win', W, 196, 9, [[8.2, 50], [8.6, 0], [9.6, -22], [10.0, 0]], D)}
  ${tear('t4', 'win', W, 258, 12, [[7.7, -12], [8.1, 0], [10.0, 16], [10.4, 0]], D, '#00d5ff')}
  <g opacity="0">${flicker([[7.5, 8.0], [8.6, 9.3], [9.8, 10.4]], D)}
    <use href="#win" x="-4" filter="url(#onlyRed)" opacity="0.5"/><use href="#win" x="4" filter="url(#onlyCyan)" opacity="0.45"/>
  </g>
  <g opacity="0">${flicker([[7.8, 10.2]], D)}${binaryRows('HACK THE PLANET ', W, 36, H - 4, 11, '#1aff3a')}</g>
  <g opacity="0">${flicker([[8.4, 8.9], [9.0, 9.6]], D)}
    <g fill="#ff1a1a" transform="translate(-3 0)">${blockWord('HACK THE', W / 2, 76, 5, 9)}${blockWord('PLANET', W / 2, 138, 5, 9)}</g>
    <g fill="#39ff14">${blockWord('HACK THE', W / 2, 76, 5, 9)}${blockWord('PLANET', W / 2, 138, 5, 9)}</g>
  </g>
  <rect width="${W}" height="${H}" fill="#ff0020" opacity="0">${flicker([[7.5, 7.65], [9.0, 9.12]], D)}</rect>
</svg>
`
  save('signon.svg', svg.replace('<animate attributeName="opacity" values="0;1;0"', '<animate attributeName="opacity" values="0;1;0"'))
}

// ---------- instant message ----------
{
  const W = 400
  const H = 248
  const D = 12
  const name = (n, c) => `<tspan fill="${c}" font-weight="bold">${esc(n)}</tspan>`
  const lines = [
    [0.5, `${name('n1ghtc4ll3r', '#ff0000')}<tspan>: u up?</tspan>`],
    [2.0, `${name('n1ghtc4ll3r', '#ff0000')}<tspan>: i read ur commit history</tspan>`],
    [3.8, `${name('benburw3ll', '#0000ff')}<tspan>: ...</tspan>`],
    [5.6, `${name('n1ghtc4ll3r', '#ff0000')}<tspan>: the kill switch isn't built yet. is it</tspan>`],
    [7.8, `<tspan fill="#808080" font-style="italic">n1ghtc4ll3r has warned you. Warning level: 100%</tspan>`],
  ]
  const msg = lines
    .map(([t, body], i) => `<text x="16" y="${66 + i * 21}" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#000" opacity="0">${during(t, D, D)}${body}</text>`)
    .join('')
  const tools = ['A', 'A', 'B', 'I', 'U']
    .map((t, k) => `${raised(8 + k * 20, 25, 18, 17)}<text x="${17 + k * 20}" y="${38}" text-anchor="middle" font-size="${k === 0 ? 9 : 12}" font-weight="${t === 'B' ? 'bold' : 'normal'}" font-style="${t === 'I' ? 'italic' : 'normal'}" text-decoration="${t === 'U' ? 'underline' : 'none'}">${t}</text>`)
    .join('')
  const win = `<g id="im">
    ${windowFrame(W, H, 'Instant Message From: n1ghtc4ll3r')}
    ${tools}<rect x="112" y="27" width="14" height="13" fill="#ff0000" stroke="#000"/>
    ${sunken(8, 46, 384, 128)}
    ${msg}
    ${sunken(8, 182, 300, 58)}
    <rect x="14" y="189" width="1" height="15" fill="#000">${`<animate attributeName="opacity" values="1;0" keyTimes="0;0.5" calcMode="discrete" dur="1s" repeatCount="indefinite"/>`}</rect>
    ${button(316, 182, 76, 18, 'Warn')}${button(316, 202, 76, 18, 'Block', { disabled: true })}${button(316, 222, 76, 18, 'Send', { primary: true })}
  </g>`
  const svg = `${svgOpen(W, H, 'Instant message from n1ghtc4ll3r: u up?', GHOSTS)}
  <defs>${win}</defs>
  <use href="#im"/>
  ${tear('i1', 'im', W, 108, 12, [[9.6, 22], [10.0, 0], [10.8, -26], [11.1, 0]], D, '#ff0040')}
  ${tear('i2', 'im', W, 150, 8, [[9.9, -34], [10.3, 0], [11.2, 18], [11.5, 0]], D)}
  <g opacity="0">${flicker([[9.6, 10.1], [10.7, 11.3]], D)}
    <use href="#im" x="-3" filter="url(#onlyRed)" opacity="0.5"/><use href="#im" x="3" filter="url(#onlyCyan)" opacity="0.45"/>
  </g>
  <g opacity="0">${flicker([[10.2, 11.6]], D)}<svg x="9" y="47" width="382" height="126">${binaryRows('u up? ', 382, 12, 126, 11, '#0a8a20')}</svg></g>
</svg>
`
  save('im.svg', svg)
}

// ---------- buddy list ----------
{
  const W = 180
  const H = 248
  const online = ['n1ghtc4ll3r', 'zer0fr1endz', 'xXd34dp1x3lXx', 'ph0nephr34k', 'c0ldb00t', 'punt3rX', 'd1alt0ne', 'l0stcarri3r']
  const rows = [
    `<text x="12" y="60" font-weight="bold">▾ Online (8/8)</text>`,
    ...online.map((n, k) => `<text x="28" y="${75 + k * 15}"${k === 0 ? ' font-weight="bold"' : ''}>${n}</text>`),
    `<text x="12" y="${75 + online.length * 15}" font-weight="bold">▾ Humans (0/1)</text>`,
    `<text x="28" y="${90 + online.length * 15}" fill="#808080" font-style="italic">benburw3ll</text>`,
  ].join('')
  const svg = `${svgOpen(W, H, 'Buddy List: Online 8 of 8, Humans 0 of 1')}
  ${windowFrame(W, H, 'Buddy List')}
  ${raised(6, 25, 70, 18)}<text x="41" y="38" text-anchor="middle" font-weight="bold">Online</text>
  ${raised(78, 27, 80, 16)}<text x="118" y="39" text-anchor="middle" fill="#404040">List Setup</text>
  ${sunken(6, 44, 168, 170)}
  ${rows}
  <rect x="24" y="64" width="2" height="13" fill="#ff0000"><animate attributeName="opacity" values="1;0" keyTimes="0;0.5" calcMode="discrete" dur="1.4s" repeatCount="indefinite"/></rect>
  ${button(6, 220, 50, 20, 'IM')}${button(62, 220, 54, 20, 'Info')}${button(122, 220, 52, 20, 'Away')}
</svg>
`
  save('buddies.svg', svg)
}

// ---------- fader headings ----------
const fader = (name, W, H, lines) => {
  const body = lines
    .map(([text, y, size]) => `<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="bold" font-style="italic" fill="url(#fader)" stroke="#000" stroke-width="0.7" paint-order="stroke">${esc(text)}</text>`)
    .join('')
  save(name, `${svgOpen(W, H, lines.map(([t]) => t).join(' · '))}${body}</svg>\n`)
}
fader('transfers.svg', 400, 40, [['~*~ File Transfers ~*~', 29, 24]])
fader('greetz.svg', 400, 56, [['coded by benburw3ll', 24, 20], ['greetz: The Mentor', 46, 14]])
