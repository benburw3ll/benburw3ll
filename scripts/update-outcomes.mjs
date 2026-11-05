// Draws one Windows 95 "File Transfer" window per WidgetButler outcome milestone (O1, O2, ...)
// into outcomes/O<n>.svg, and rewrites the block between the outcomes markers in README.md.
// No dependencies; GITHUB_TOKEN is optional (it only raises the API rate limit).
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { esc, raised, sunken, defs, windowFrame, UI } from './win95.mjs'

const REPO = process.env.OUTCOMES_REPO ?? 'benburw3ll/widgetbutler'
const root = new URL('../', import.meta.url)
const START = '<!-- outcomes:start -->'
const END = '<!-- outcomes:end -->'

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'outcomes-readme' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
const res = await fetch(`https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100`, { headers })
if (!res.ok) throw new Error(`GitHub API answered ${res.status}`)
const order = (m) => Number(/^O(\d+)\b/.exec(m.title)?.[1] ?? Infinity)
const milestones = (await res.json()).filter((m) => Number.isFinite(order(m))).sort((a, b) => order(a) - order(b))

const W = 400
const H = 104
const BLOCKS = 26
const fileName = (m) => {
  const [code, ...rest] = m.title.split('·')
  const words = rest.join(' ').replace(/\(parked\)/i, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')
  return `${code.trim()}_${words}`.slice(0, 22).replace(/_+$/, '') + '.EXE'
}

function transferSvg(m) {
  const n = order(m)
  const closed = m.closed_issues
  const all = m.open_issues + m.closed_issues
  const parked = /\(parked\)/i.test(m.title)
  const done = m.state === 'closed' || (all > 0 && closed === all)
  const pct = all === 0 ? 0 : closed / all
  const filled = done ? BLOCKS : Math.round(pct * BLOCKS)
  const blocks = Array.from({ length: filled }, (_, k) => `<rect x="${16 + k * 14}" y="61" width="12" height="14" fill="#000080"/>`).join('')
  const verb = done ? 'Downloaded' : parked ? 'Paused' : 'Downloading'
  const left = `${closed} of ${all} issues closed (${Math.round(pct * 100)}%)`
  const right = done ? 'Transfer complete.' : parked ? 'Transfer paused' : closed === 0 ? 'Time remaining: ∞' : `Time remaining: ${all - closed} issues`
  const title = `File Transfer - ${m.title.replace(/\s*\(parked\)/i, '')}`
  // A couple of the windows glitch now and then.
  const glitchy = n === 3 || n === 6
  const glitch = glitchy
    ? `<clipPath id="g${n}"><rect x="0" y="58" width="${W}" height="10"/></clipPath>
  <g clip-path="url(#g${n})"><g><animateTransform attributeName="transform" type="translate" values="0 0;26 0;0 0;-18 0;0 0" keyTimes="0;0.62;0.66;0.83;0.86" calcMode="discrete" dur="${7 + n}s" repeatCount="indefinite"/><use href="#w${n}"/><rect x="0" y="58" width="${W}" height="10" fill="#ff0040" opacity="0"><animate attributeName="opacity" values="0;0.3;0;0.3;0" keyTimes="0;0.62;0.66;0.83;0.86" calcMode="discrete" dur="${7 + n}s" repeatCount="indefinite"/></rect></g></g>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(`${m.title}: ${left}`)}" font-family="${UI}" font-size="12">
  <title>${esc(`${m.title}: ${left}`)}</title>
  ${defs()}
  <defs><g id="w${n}">
    ${windowFrame(W, H, title.length > 44 ? title.slice(0, 43).trimEnd() + '…' : title)}
    <path d="M14 30h10l4 4v12h-14z" fill="#fff" stroke="#000"/><path d="M24 30v4h4" fill="none" stroke="#000"/>
    <text x="36" y="43" font-weight="bold"${parked ? ' fill="#808080"' : ''}>${verb} ${esc(fileName(m))}</text>
    ${sunken(12, 57, 376, 22)}
    ${blocks}
    <text x="12" y="96"${parked ? ' fill="#808080"' : ''}>${esc(left)}</text>
    <text x="388" y="96" text-anchor="end"${parked ? ' fill="#808080"' : ''}>${esc(right)}</text>
  </g></defs>
  <use href="#w${n}"/>
  ${glitch}
</svg>
`
}

mkdirSync(new URL('outcomes/', root), { recursive: true })
let changed = 0
let done = 0
let total = 0
const links = []
for (const m of milestones) {
  const file = new URL(`outcomes/O${order(m)}.svg`, root)
  const svg = transferSvg(m)
  if (!existsSync(file) || readFileSync(file, 'utf8') !== svg) {
    writeFileSync(file, svg)
    changed++
  }
  if (!/\(parked\)/i.test(m.title)) {
    done += m.closed_issues
    total += m.open_issues + m.closed_issues
  }
  links.push(`<a href="${m.html_url}"><img src="outcomes/O${order(m)}.svg" width="400" alt="${esc(`${m.title}: ${m.closed_issues} of ${m.open_issues + m.closed_issues} issues closed`)}"></a>`)
}

const block = `<p align="center">\n${links.join('<br>\n')}\n</p>\n\n<p align="center"><b>${done} of ${total} issues closed</b> (parked outcomes not counted)</p>`
const readmeFile = new URL('README.md', root)
const readme = readFileSync(readmeFile, 'utf8')
const s = readme.indexOf(START)
const e = readme.indexOf(END)
if (s === -1 || e === -1 || e < s) throw new Error('README.md is missing the outcomes markers')
const next = `${readme.slice(0, s + START.length)}\n${block}\n${readme.slice(e)}`
if (next !== readme) {
  writeFileSync(readmeFile, next)
  changed++
}
console.log(changed ? `Updated ${changed} file(s): ${done}/${total} issues closed` : 'No change')
