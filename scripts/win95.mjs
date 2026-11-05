// Shared pieces for the profile's 90s online-service look: Windows 95 bevels, windows, buttons,
// fader text, and SMIL timing helpers. Every SVG stays self-contained (GitHub shows them as <img>).
export const UI = "Tahoma, Verdana, 'Segoe UI', Arial, sans-serif"
export const MONO = "ui-monospace, Consolas, 'Courier New', monospace"
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** A raised Windows 95 bevel. */
export const raised = (x, y, w, h, face = '#c0c0c0') => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${face}"/>
  <path d="M${x + 0.5} ${y + h - 1}V${y + 0.5}H${x + w - 1}" stroke="#fff" fill="none"/>
  <path d="M${x + 1.5} ${y + h - 2}V${y + 1.5}H${x + w - 2}" stroke="#dfdfdf" fill="none"/>
  <path d="M${x} ${y + h - 0.5}H${x + w - 0.5}V${y}" stroke="#000" fill="none"/>
  <path d="M${x + 1} ${y + h - 1.5}H${x + w - 1.5}V${y + 1}" stroke="#808080" fill="none"/>`

/** A sunken field. */
export const sunken = (x, y, w, h, fill = '#fff') => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>
  <path d="M${x + 0.5} ${y + h - 1}V${y + 0.5}H${x + w - 1}" stroke="#808080" fill="none"/>
  <path d="M${x + 1.5} ${y + h - 2}V${y + 1.5}H${x + w - 2}" stroke="#000" fill="none"/>
  <path d="M${x} ${y + h - 0.5}H${x + w - 0.5}V${y}" stroke="#fff" fill="none"/>
  <path d="M${x + 1} ${y + h - 1.5}H${x + w - 1.5}V${y + 1}" stroke="#dfdfdf" fill="none"/>`

/** A push button; disabled ones get the embossed grey label. */
export const button = (x, y, w, h, label, { disabled = false, primary = false } = {}) => {
  const tx = x + w / 2
  const ty = y + h / 2 + 4
  const text = disabled
    ? `<text x="${tx + 1}" y="${ty + 1}" fill="#fff" text-anchor="middle">${esc(label)}</text><text x="${tx}" y="${ty}" fill="#808080" text-anchor="middle">${esc(label)}</text>`
    : `<text x="${tx}" y="${ty}" fill="#000" text-anchor="middle">${esc(label)}</text>`
  const frame = primary ? `<rect x="${x - 1}" y="${y - 1}" width="${w + 2}" height="${h + 2}" fill="#000"/>` : ''
  return `${frame}${raised(x, y, w, h)}${text}`
}

/** Gradient definitions every SVG uses: the title bar and the rainbow "fader". */
export const defs = (extra = '') => `<defs>
    <linearGradient id="title" x1="0" x2="1"><stop offset="0" stop-color="#000080"/><stop offset="1" stop-color="#1084d0"/></linearGradient>
    <linearGradient id="fader" x1="0" x2="1">
      <stop offset="0" stop-color="#ff0040"/><stop offset="0.18" stop-color="#ff9a00"/><stop offset="0.36" stop-color="#ffe600"/>
      <stop offset="0.54" stop-color="#29ff4a"/><stop offset="0.72" stop-color="#00d5ff"/><stop offset="0.88" stop-color="#4a5bff"/><stop offset="1" stop-color="#d000ff"/>
    </linearGradient>
    ${extra}
  </defs>`

/** A window: outer bevel, gradient title bar, the three caption buttons. */
export const windowFrame = (w, h, title) => `
  ${raised(0, 0, w, h)}
  <rect x="3" y="3" width="${w - 6}" height="18" fill="url(#title)"/>
  <text x="8" y="16" fill="#fff" font-weight="bold" font-size="12">${esc(title)}</text>
  ${raised(w - 57, 5, 16, 14)}<path d="M${w - 53} 15h7" stroke="#000" stroke-width="2"/>
  ${raised(w - 41, 5, 16, 14)}<rect x="${w - 37.5}" y="8.5" width="8" height="7" fill="none" stroke="#000"/><path d="M${w - 37.5} 9.5h8" stroke="#000"/>
  ${raised(w - 21, 5, 16, 14)}<path d="M${w - 17} 8.5l7 7M${w - 10} 8.5l-7 7" stroke="#000" stroke-width="1.6"/>`

/** SMIL: show an element only between a and b seconds of a cycle of `dur` seconds. */
export const during = (a, b, dur) => {
  if (a <= 0 && b >= dur) return ''
  if (a <= 0) return `<animate attributeName="opacity" values="1;0" keyTimes="0;${(b / dur).toFixed(4)}" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>`
  if (b >= dur) return `<animate attributeName="opacity" values="0;1" keyTimes="0;${(a / dur).toFixed(4)}" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>`
  return `<animate attributeName="opacity" values="0;1;0" keyTimes="0;${(a / dur).toFixed(4)};${(b / dur).toFixed(4)}" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>`
}
/** The opacity an element should start with, for static renderers. */
export const startOpacity = (a) => (a <= 0 ? 1 : 0)

/** A clipped band of `#src` that tears sideways at the given moments. steps: [[t, dx], ...] */
export const tear = (id, src, w, y, h, steps, dur, tint) => {
  const times = [0, ...steps.map(([t]) => t / dur)]
  const values = ['0 0', ...steps.map(([, dx]) => `${dx} 0`)]
  return `<clipPath id="${id}"><rect x="0" y="${y}" width="${w}" height="${h}"/></clipPath>
  <g clip-path="url(#${id})">
    <g><animateTransform attributeName="transform" type="translate" values="${values.join(';')}" keyTimes="${times.map((t) => t.toFixed(4)).join(';')}" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>
      <use href="#${src}"/>${tint ? `<rect x="0" y="${y}" width="${w}" height="${h}" fill="${tint}" opacity="0.35"/>` : ''}
    </g>
  </g>`
}

/** Rows of binary: the ASCII of a phrase, offset per row. */
export const binaryRows = (phrase, w, top, bottom, step, fill, size = 10) => {
  const bits = [...phrase].map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
  const rows = []
  for (let r = 0, y = top; y < bottom; r++, y += step) {
    const start = (r * 13) % bits.length
    const text = (bits + ' ' + bits + ' ' + bits).slice(start, start + Math.floor(w / (size * 0.62)))
    rows.push(`<text x="6" y="${y}" textLength="${w - 12}" lengthAdjust="spacing">${text}</text>`)
  }
  return `<g font-family="${MONO}" font-size="${size}" fill="${fill}">${rows.join('')}</g>`
}
