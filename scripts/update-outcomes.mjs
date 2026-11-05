// Rebuild the live roadmap graphic and README links from Silas Portals milestones.
// No dependencies; GITHUB_TOKEN is optional and raises the API rate limit.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const REPO = process.env.OUTCOMES_REPO ?? 'benburw3ll/silas-portals'
const root = new URL('../', import.meta.url)
const START = '<!-- outcomes:start -->'
const END = '<!-- outcomes:end -->'
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'red-signal-profile' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
const res = await fetch(`https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100`, { headers })
if (!res.ok) throw new Error(`GitHub API answered ${res.status}`)
const order = (m) => Number(/^O(\d+)\b/.exec(m.title)?.[1] ?? Infinity)
const milestones = (await res.json()).filter((m) => Number.isFinite(order(m))).sort((a, b) => order(a) - order(b))
if (milestones.length === 0) throw new Error('No Silas Portals outcome milestones found')

const C = { bg: '#060607', panel: '#0d0b0e', line: '#6b202d', red: '#f02b43', bone: '#f0e6e1', soft: '#a99a9c', faint: '#594c50' }
const mono = "'Cascadia Code', Consolas, 'Liberation Mono', monospace"
const w = 960, h = 123 + milestones.length * 49 + 58
let done = 0, total = 0
const rows = milestones.map((m, i) => {
  const n = order(m)
  const closed = m.closed_issues
  const count = m.open_issues + closed
  const parked = /\(parked\)/i.test(m.title)
  const title = m.title.replace(/^O\d+\s*·\s*/, '').replace(/\s*\(parked\)/i, '')
  const pct = count ? closed / count : 0
  if (!parked) { done += closed; total += count }
  const y = 117 + i * 49
  const state = parked ? 'PARKED' : pct === 1 ? 'DONE' : 'IN PROGRESS'
  return `<g>
    <rect x="24" y="${y}" width="912" height="42" fill="${i % 2 ? '#0c090b' : C.panel}" stroke="${C.line}" stroke-opacity=".55"/>
    <rect x="24" y="${y}" width="3" height="42" fill="${parked ? C.faint : C.red}"/>
    <text x="41" y="${y + 27}" fill="${parked ? C.faint : C.red}" font-size="15" font-weight="700">${String(n).padStart(2, '0')}</text>
    <text x="85" y="${y + 27}" fill="${parked ? C.soft : C.bone}" font-size="16">${esc(title)}</text>
    <text x="601" y="${y + 26}" fill="${parked ? C.faint : C.soft}" font-size="10" letter-spacing="1">${state}</text>
    <rect x="701" y="${y + 16}" width="146" height="10" fill="#241218" stroke="${C.line}"/>
    <rect x="702" y="${y + 17}" width="${Math.round(144 * pct)}" height="8" fill="${C.red}"/>
    <text x="919" y="${y + 27}" text-anchor="end" fill="${parked ? C.faint : C.bone}" font-size="14">${closed}/${count}</text>
  </g>`
}).join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Silas Portals road to v1, ${done} of ${total} issues closed" font-family="${mono}">
<title>Silas Portals road to v1: ${done} of ${total} issues closed</title>
<defs><pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5H4" stroke="#fff" stroke-opacity=".035"/></pattern></defs>
<rect width="960" height="${h}" fill="${C.bg}"/><rect width="960" height="${h}" fill="url(#scan)"/>
<rect x="1" y="1" width="958" height="${h - 2}" fill="none" stroke="${C.line}" stroke-width="2"/>
<rect x="24" y="25" width="8" height="8" fill="${C.red}"/>
<text x="45" y="36" fill="${C.bone}" font-size="19" font-weight="700" letter-spacing="1">ROAD TO V1 // OPEN TRANSMISSIONS</text>
<text x="936" y="36" text-anchor="end" fill="${C.red}" font-size="12">LIVE GITHUB MILESTONES</text>
<path d="M24 51H936" stroke="${C.line}"/>
<text x="24" y="88" fill="${C.red}" font-size="30" font-weight="700">${done}<tspan fill="${C.faint}"> / ${total}</tspan></text>
<text x="204" y="87" fill="${C.soft}" font-size="14">ISSUES CLOSED ACROSS ACTIVE OUTCOMES</text>
${rows}
<path d="M24 ${h - 45}H936" stroke="${C.line}"/>
<text x="24" y="${h - 19}" fill="${C.faint}" font-size="11" letter-spacing="1">NEXT STOP: SILAS PORTALS V1</text>
<text x="936" y="${h - 19}" text-anchor="end" fill="${C.red}" font-size="11" letter-spacing="1">TRANSMISSION CONTINUES_</text>
</svg>\n`
mkdirSync(new URL('outcomes/', root), { recursive: true })
writeFileSync(new URL('outcomes/operations.svg', root), svg)

const links = milestones.map((m) => `<a href="${esc(m.html_url)}">O${order(m)}</a>`).join(' &nbsp;·&nbsp; ')
const block = `<p align="center"><a href="https://github.com/${REPO}/milestones"><img src="outcomes/operations.svg" width="960" alt="Silas Portals road to v1: ${done} of ${total} issues closed"></a></p>\n\n<p align="center">${links}</p>\n\n<p align="center"><sub>${done} of ${total} issues closed across the active outcomes.</sub></p>`
const file = new URL('README.md', root)
const readme = readFileSync(file, 'utf8')
const start = readme.indexOf(START), end = readme.indexOf(END)
if (start < 0 || end < start) throw new Error('README.md is missing the outcomes markers')
const next = `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`
if (next !== readme) writeFileSync(file, next)
console.log(`Updated roadmap: ${done}/${total} issues closed`)
