// Rebuild the live roadmap graphic and README links from Silas Portals milestones:
// the next-up lane (N1, N2, ...) first, then the outcomes (O1, O2, ...).
// No dependencies; GITHUB_TOKEN is optional and raises the API rate limit.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { renderWatchtowerBoard } from './watchtower-board.mjs'

const REPO = process.env.OUTCOMES_REPO ?? 'benburw3ll/silas-portals'
const root = new URL('../', import.meta.url)
const START = '<!-- outcomes:start -->'
const END = '<!-- outcomes:end -->'
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'silas-watchtower-profile' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
const res = await fetch(`https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100`, { headers })
if (!res.ok) throw new Error(`GitHub API answered ${res.status}`)
const LANES = ['N', 'O']
const code = (m) => /^([NO])(\d+)\b/.exec(m.title)
const order = (m) => LANES.indexOf(code(m)[1]) * 1000 + Number(code(m)[2])
const milestones = (await res.json()).filter(code).sort((a, b) => order(a) - order(b))
if (milestones.length === 0) throw new Error('No Silas Portals outcome milestones found')

// Merged pull requests come from the search API, so they refresh with the board.
const count = async (q) => {
  const r = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${REPO} ${q}`)}&per_page=1`, { headers })
  if (!r.ok) throw new Error(`GitHub search answered ${r.status}`)
  return (await r.json()).total_count
}
const merged = await count('is:pr is:merged')

const active = milestones.filter((m) => !/\(parked\)/i.test(m.title))
const done = active.reduce((sum, m) => sum + m.closed_issues, 0)
const total = active.reduce((sum, m) => sum + m.closed_issues + m.open_issues, 0)
const svg = renderWatchtowerBoard(milestones)
mkdirSync(new URL('outcomes/', root), { recursive: true })
writeFileSync(new URL('outcomes/operations.svg', root), svg)

const links = milestones.map((m) => `<a href="${esc(m.html_url)}">${code(m)[1]}${code(m)[2]}</a>`).join(' &nbsp;·&nbsp; ')
const block = `<p align="center"><a href="https://github.com/${REPO}/milestones"><img src="outcomes/operations.svg" width="960" alt="Overlord Watchtower outcome board: ${done} of ${total} issues closed"></a></p>\n\n<p align="center">${links}</p>\n\n<p align="center"><sub>${done} of ${total} issues closed across the active milestones · ${merged} pull requests merged.</sub></p>`
const file = new URL('README.md', root)
const readme = readFileSync(file, 'utf8')
const start = readme.indexOf(START), end = readme.indexOf(END)
if (start < 0 || end < start) throw new Error('README.md is missing the outcomes markers')
const next = `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`
if (next !== readme) writeFileSync(file, next)
console.log(`Updated roadmap: ${done}/${total} issues closed, ${merged} pull requests merged`)
