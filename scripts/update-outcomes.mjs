// Rebuild the live roadmap graphic and README links from Silas Portals milestones:
// the next-up lane (N1, N2, ...) first, then the outcomes (O1, O2, ...). The version comes from the
// milestone title: no suffix is v1 (the road to v1), "(v1.1)" the next board, "(later)" and "(parked)"
// later. Open issues labelled `later` or `parked` are left out of an outcome's count: they sit in it
// but aren't part of its "done when". No dependencies; GITHUB_TOKEN is optional and raises the rate limit.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { renderWatchtowerBoard, versionOf } from './watchtower-board.mjs'

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
let rawList
try {
  rawList = await get(`https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100`)
} catch (e) {
  // The repo is private while its penetration testing runs: without a token that can read it,
  // keep the last board rather than fail every run. OUTCOMES_TOKEN in the workflow restores the updates.
  if (/ 40[34] /.test(String(e.message))) {
    console.log(`No access to ${REPO} (private?): kept the last board. Set OUTCOMES_TOKEN to resume updates.`)
    process.exit(0)
  }
  throw e
}
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
const closedWeek = await count(`is:issue is:closed reason:completed closed:>=${weekAgo}`)

const v1 = milestones.filter((m) => versionOf(m.title) === 'v1')
const done = v1.reduce((sum, m) => sum + m.closed_issues, 0)
const total = v1.reduce((sum, m) => sum + m.closed_issues + m.open_issues, 0)
const svg = renderWatchtowerBoard(milestones, { merged, mergedWeek, closedWeek })
mkdirSync(new URL('outcomes/', root), { recursive: true })
writeFileSync(new URL('outcomes/operations.svg', root), svg)

const group = (version, label) => {
  const items = milestones.filter((m) => versionOf(m.title) === version)
  if (!items.length) return ''
  const links = items.map((m) => `<li><a href="${esc(m.html_url)}">${esc(m.title)}</a></li>`).join('\n')
  return `<p><b>${label}</b></p>\n<ul>\n${links}\n</ul>\n`
}
const block = `<p align="center"><a href="https://github.com/${REPO}/milestones"><img src="outcomes/operations.svg" width="960" alt="Overlord Watchtower outcome board: ${merged} pull requests merged, ${done} of ${total} v1 issues closed"></a></p>\n\n<details>\n<summary>Open the stories behind the rings</summary>\n\n${group('v1', 'The road to v1')}${group('v1.1', 'The next board, v1.1')}${group('later', 'Later')}<p>${done} of ${total} v1 issues closed · ${merged} pull requests merged.</p>\n</details>`
const file = new URL('README.md', root)
const readme = readFileSync(file, 'utf8')
const start = readme.indexOf(START), end = readme.indexOf(END)
if (start < 0 || end < start) throw new Error('README.md is missing the outcomes markers')
const next = `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`
if (next !== readme) writeFileSync(file, next)
console.log(`Updated roadmap: ${done}/${total} v1 issues closed, ${merged} pull requests merged`)
