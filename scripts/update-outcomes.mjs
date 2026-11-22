// Rebuild the Watchtower and README from the Silas Portals milestones.
// Count issues rather than milestone totals: milestones can contain pull requests,
// cancelled issues, and issues deferred with a `later` or `parked` label.
// A private source is read only with GITHUB_TOKEN set (a token that can read its issues)
// and OUTCOMES_PRIVATE_OK=1; the board carries titles, counts and dates, never an issue's text.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { renderWatchtowerBoard, versionOf } from './watchtower-board.mjs'
import { renderPublicWatchtower } from './public-watchtower.mjs'
import { composeReadme } from './compose-readme.mjs'
import { renderGithubStats } from './github-stats.mjs'

const REPO = process.env.OUTCOMES_REPO ?? 'benburw3ll/silas-portals'
const root = new URL('../', import.meta.url)
const START = '<!-- outcomes:start -->'
const END = '<!-- outcomes:end -->'
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const get = async (url, token = process.env.GITHUB_TOKEN) => {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'silas-watchtower-profile' }
  if (token) headers.Authorization = `Bearer ${token}`
  const r = await fetch(url, { headers })
  if (r.status === 404 && !token) {
    throw new Error(`GitHub API answered 404 for ${url}: a private source repository needs GITHUB_TOKEN (with issues: read on it) and OUTCOMES_PRIVATE_OK=1`)
  }
  if (!r.ok) throw new Error(`GitHub API answered ${r.status} for ${url}`)
  return r.json()
}
const code = (m) => /^([NO])(\d+)\b/.exec(m.title)
// Keep this in step with the Build order in Silas Portals' docs/ARCHITECTURE.md.
const BUILD_ORDER = [
  'O1', 'N1', 'N2', 'N3', 'N4', 'N5', 'N6',
  'O2', 'O3', 'O4', 'O12', 'O18', 'O19', 'O21', 'O22', 'O23', 'O24', 'O26', 'O27', 'O28',
  'O13', 'O14', 'O15', 'O20', 'O25', 'O5', 'O17', 'O6',
  'O7', 'O8', 'O9', 'O10', 'O11', 'O16',
]
const order = (m) => {
  const match = code(m)
  const index = BUILD_ORDER.indexOf(`${match[1]}${match[2]}`)
  return index < 0 ? BUILD_ORDER.length + Number(match[2]) : index
}
const repository = await get(`https://api.github.com/repos/${REPO}`)
if (repository.private && !(process.env.GITHUB_TOKEN && process.env.OUTCOMES_PRIVATE_OK === '1')) {
  throw new Error(`${REPO} is private: set GITHUB_TOKEN (with issues: read on it) and OUTCOMES_PRIVATE_OK=1 to draw the board from it`)
}
const rawList = await get(`https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100`)
// The profile never names AI: a milestone title is drawn with its public wording.
const publicTitle = (title) => title.replace('AI on a budget', 'Thinking on a budget')
const raw = rawList
  .filter(code)
  .map((m) => ({ ...m, title: publicTitle(m.title) }))
  .sort((a, b) => order(a) - order(b))
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

// The board's repo-scoped token cannot see the owner's other private repos.
// Without a separate read-only profile token, keep the last complete snapshot.
if (process.env.PROFILE_STATS_TOKEN) {
  const statsGet = (url) => get(url, process.env.PROFILE_STATS_TOKEN)
  const username = 'benburw3ll'
  const search = (qualifiers, pageSize = 1, page = 1) =>
    statsGet(`https://api.github.com/search/issues?q=${encodeURIComponent(`author:${username} ${qualifiers}`)}&per_page=${pageSize}&page=${page}`)
  const searchCount = async (qualifiers) => (await search(qualifiers)).total_count
  const repositoriesWithPrs = new Set()
  for (let page = 1; ; page++) {
    const results = await search('is:pr', 100, page)
    if (results.total_count > 1000) throw new Error('PR repository count exceeds the GitHub search window')
    for (const item of results.items) repositoriesWithPrs.add(item.repository_url)
    if (results.items.length < 100) break
  }
  const sevenDaysAgo = new Date(Date.now() - 7 * 864e5).toISOString()
  const githubStats = {
    merged: await searchCount('is:pr is:merged'),
    outside: await searchCount(`is:pr is:merged -repo:${REPO}`),
    repositories: repositoriesWithPrs.size,
    open: await searchCount('is:pr is:open'),
    recent: await searchCount(`is:pr is:merged merged:>=${sevenDaysAgo}`),
    issues: await searchCount('is:issue'),
    issuesClosed: await searchCount('is:issue is:closed'),
    pullRequests: await searchCount('is:pr'),
    updated: new Date().toISOString().slice(0, 10),
  }
  mkdirSync(new URL('assets/', root), { recursive: true })
  writeFileSync(new URL('assets/github-stats.svg', root), renderGithubStats(githubStats))
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
const block = `<details>\n<summary>Open the stories behind the rings</summary>\n\n${group('v1', 'The road to v1')}${group('v1.1', 'The next board, v1.1')}${group('later', 'Later')}${group('superseded', 'Superseded')}<p>${done} of ${total} v1 stories finished · ${closedTotal} issues closed overall · ${merged} pull requests merged.</p>\n</details>`
const file = new URL('README.md', root)
const readme = readFileSync(file, 'utf8')
const start = readme.indexOf(START), end = readme.indexOf(END)
if (start < 0 || end < start) throw new Error('README.md is missing the outcomes markers')
const next = `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`
if (next !== readme) writeFileSync(file, next)
console.log(`Updated roadmap: ${done}/${total} v1 stories finished, ${closedTotal} issues closed, ${merged} pull requests merged`)
