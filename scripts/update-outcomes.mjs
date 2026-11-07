// Rebuild the live roadmap graphic and README links from Silas Portals milestones:
// the next-up lane (N1, N2, ...) first, then the outcomes (O1, O2, ...). The version comes from the
// milestone title: no suffix is v1 (the road to v1), "(v1.1)" the next board, "(later)" and "(parked)"
// later. Open issues labelled `later` or `parked` are left out of an outcome's count: they sit in it
// but aren't part of its "done when". GITHUB_TOKEN must read the source repository.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { renderWatchtowerBoard, versionOf } from './watchtower-board.mjs'
import { renderPrivateBanner } from './private-banner.mjs'

const REPO = process.env.OUTCOMES_REPO ?? 'benburw3ll/silas-portals'
const root = new URL('../', import.meta.url)
const START = '<!-- outcomes:start -->'
const END = '<!-- outcomes:end -->'
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'silas-watchtower-profile' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
const get = async (url) => {
  const r = await fetch(url, { headers })
  if (!r.ok) throw new Error(`GitHub API answered ${r.status} for ${url}`)
  return r.json()
}
const LANES = ['N', 'O']
const code = (m) => /^([NO])(\d+)\b/.exec(m.title)
const order = (m) => LANES.indexOf(code(m)[1]) * 1000 + Number(code(m)[2])
const repository = await get(`https://api.github.com/repos/${REPO}`)
const sourcePublic = !repository.private
const rawList = await get(`https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100`)
const raw = rawList.filter(code).sort((a, b) => order(a) - order(b))
if (raw.length === 0) throw new Error('No Silas Portals outcome milestones found')

// Open issues labelled `later` or `parked` don't count toward their outcome.
const milestones = []
for (const m of raw) {
  let deferred = 0
  if (m.open_issues > 0) {
    for (const label of ['later', 'parked']) {
      const issues = await get(`https://api.github.com/repos/${REPO}/issues?milestone=${m.number}&labels=${label}&state=open&per_page=100`)
      deferred += issues.filter((i) => !i.pull_request).length
    }
  }
  milestones.push({ ...m, open_issues: Math.max(0, m.open_issues - deferred), deferred_issues: deferred })
}

// Activity counts come from the search API, so they refresh with the board.
const count = async (q) => (await get(`https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${REPO} ${q}`)}&per_page=1`)).total_count
const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)
const merged = await count('is:pr is:merged')
const mergedWeek = await count(`is:pr is:merged merged:>=${weekAgo}`)
const closedTotal = await count('is:issue is:closed')
const closedWeek = await count(`is:issue is:closed closed:>=${weekAgo}`)

const v1 = milestones.filter((m) => versionOf(m.title) === 'v1')
const done = v1.reduce((sum, m) => sum + m.closed_issues, 0)
const total = v1.reduce((sum, m) => sum + m.closed_issues + m.open_issues, 0)
const svg = renderWatchtowerBoard(milestones, { merged, mergedWeek, closedTotal, closedWeek })
mkdirSync(new URL('outcomes/', root), { recursive: true })
writeFileSync(new URL('outcomes/operations.svg', root), svg)
mkdirSync(new URL('assets/', root), { recursive: true })
writeFileSync(new URL('assets/private-banner.svg', root), renderPrivateBanner())

const group = (version, label) => {
  const items = milestones.filter((m) => versionOf(m.title) === version)
  if (!items.length) return ''
  const links = items.map((m) => `<li>${sourcePublic ? `<a href="${esc(m.html_url)}">${esc(m.title)}</a>` : esc(m.title)}</li>`).join('\n')
  return `<p><b>${label}</b></p>\n<ul>\n${links}\n</ul>\n`
}
const boardImage = `<img src="outcomes/operations.svg" width="960" alt="Overlord Watchtower outcome board: ${merged} code merges, ${closedTotal} issues closed, ${done} of ${total} v1 stories finished">`
const boardLink = sourcePublic ? `<a href="https://github.com/${REPO}/milestones">${boardImage}</a>` : boardImage
const block = `<p align="center">${boardLink}</p>\n\n<details>\n<summary>Open the stories behind the rings</summary>\n\n${group('v1', 'The road to v1')}${group('v1.1', 'The next board, v1.1')}${group('later', 'Later')}<p>${done} of ${total} v1 stories finished · ${closedTotal} issues closed overall · ${merged} code merges.</p>\n</details>`
const file = new URL('README.md', root)
const readme = readFileSync(file, 'utf8')
const start = readme.indexOf(START), end = readme.indexOf(END)
if (start < 0 || end < start) throw new Error('README.md is missing the outcomes markers')
const next = `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`
if (next !== readme) writeFileSync(file, next)
console.log(`Updated roadmap: ${done}/${total} v1 stories finished, ${closedTotal} issues closed, ${merged} code merges`)
