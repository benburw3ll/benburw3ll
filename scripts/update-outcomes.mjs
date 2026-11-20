// Rebuild the Watchtower and README from the Silas Portals milestones.
// Count issues rather than milestone totals: milestones can contain pull requests,
// cancelled issues, and issues deferred with a `later` or `parked` label.
// A private source is read only with GITHUB_TOKEN set (a token that can read its issues)
// and OUTCOMES_PRIVATE_OK=1; the board carries titles, counts and dates, never an issue's text.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { renderWatchtowerBoard, versionOf } from './watchtower-board.mjs'
import { renderPublicWatchtower } from './public-watchtower.mjs'
import { composeReadme } from './compose-readme.mjs'

const REPO = process.env.OUTCOMES_REPO ?? 'benburw3ll/silas-portals'
const root = new URL('../', import.meta.url)
const START = '<!-- outcomes:start -->'
const END = '<!-- outcomes:end -->'
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'silas-watchtower-profile' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
const get = async (url) => {
  const r = await fetch(url, { headers })
  if (r.status === 404 && !process.env.GITHUB_TOKEN) {
    throw new Error(`GitHub API answered 404 for ${url}: a private source repository needs GITHUB_TOKEN (with issues: read on it) and OUTCOMES_PRIVATE_OK=1`)
  }
  if (!r.ok) throw new Error(`GitHub API answered ${r.status} for ${url}`)
  return r.json()
}
const code = (m) => /^([NO])(\d+)\b/.exec(m.title)
// Keep this in step with the Build order in Silas Portals' docs/ARCHITECTURE.md.
const OUTCOME_ORDER = [
  'O1', 'O2', 'O3', 'O4', 'O12', 'O16', 'O18', 'O19', 'O21', 'O22', 'O23', 'O24',
  'O13', 'O14', 'O15', 'O20', 'O25', 'O5', 'O17', 'O6',
  'O7', 'O8', 'O9', 'O10', 'O11',
]
const order = (m) => {
  const match = code(m)
  if (match[1] === 'N') return Number(match[2])
  const index = OUTCOME_ORDER.indexOf(`${match[1]}${match[2]}`)
  return 1000 + (index < 0 ? OUTCOME_ORDER.length + Number(match[2]) : index)
}
const repository = await get(`https://api.github.com/repos/${REPO}`)
if (repository.private && !(process.env.GITHUB_TOKEN && process.env.OUTCOMES_PRIVATE_OK === '1')) {
  throw new Error(`${REPO} is private: set GITHUB_TOKEN (with issues: read on it) and OUTCOMES_PRIVATE_OK=1 to draw the board from it`)
}
const rawList = await get(`https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100`)
const raw = rawList.filter(code).sort((a, b) => order(a) - order(b))
if (raw.length === 0) throw new Error('No Silas Portals outcome milestones found')

const milestoneIssues = async (number) => {
  const issues = []
  for (let page = 1; ; page++) {
    const batch = await get(`https://api.github.com/repos/${REPO}/issues?milestone=${number}&state=all&per_page=100&page=${page}`)
    issues.push(...batch)
    if (batch.length < 100) return issues
  }
}

// A closed issue marked not_planned was cancelled, not finished. Deferred issues
// belong to a later version even if they remain attached to an earlier milestone.
const milestones = []
for (const m of raw) {
  const issues = (await milestoneIssues(m.number)).filter((issue) => !issue.pull_request)
  const counted = issues.filter((issue) =>
    issue.state_reason !== 'not_planned' &&
    !issue.labels.some((label) => label.name === 'later' || label.name === 'parked'),
  )
  milestones.push({
    ...m,
    open_issues: counted.filter((issue) => issue.state === 'open').length,
    closed_issues: counted.filter((issue) => issue.state === 'closed').length,
    last_completed_at: counted.reduce((latest, issue) =>
      issue.state === 'closed' && issue.closed_at > latest ? issue.closed_at : latest, ''),
  })
}

// Activity counts come from the search API, so they refresh with the board.
const count = async (q) => (await get(`https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${REPO} ${q}`)}&per_page=1`)).total_count
const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString()
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
const castle = renderPublicWatchtower()
writeFileSync(new URL('assets/public-watchtower.svg', root), castle)
const hero = readFileSync(new URL('assets/threshold.svg', root), 'utf8')
const telegram = readFileSync(new URL('assets/telegram-sample.svg', root), 'utf8')
writeFileSync(new URL('assets/silas-world.svg', root), composeReadme(hero, castle, svg, telegram))

const group = (version, label) => {
  const items = milestones.filter((m) => versionOf(m.title) === version)
  if (!items.length) return ''
  // Plain titles: a milestone link 404s for everyone but the owner once the source is private.
  const links = items.map((m) => `<li>${esc(m.title)}</li>`).join('\n')
  return `<p><b>${label}</b></p>\n<ul>\n${links}\n</ul>\n`
}
const block = `<details>\n<summary>Open the stories behind the rings</summary>\n\n${group('v1', 'The road to v1')}${group('v1.1', 'The next board, v1.1')}${group('later', 'Later')}<p>${done} of ${total} v1 stories finished · ${closedTotal} issues closed overall · ${merged} pull requests merged.</p>\n</details>`
const file = new URL('README.md', root)
const readme = readFileSync(file, 'utf8')
const start = readme.indexOf(START), end = readme.indexOf(END)
if (start < 0 || end < start) throw new Error('README.md is missing the outcomes markers')
const next = `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`
if (next !== readme) writeFileSync(file, next)
console.log(`Updated roadmap: ${done}/${total} v1 stories finished, ${closedTotal} issues closed, ${merged} pull requests merged`)
