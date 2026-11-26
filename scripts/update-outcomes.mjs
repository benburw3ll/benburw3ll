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
const codeOf = (title) => /^([NO]\d+)\b/.exec(title)?.[1] ?? (/^The Proving Ground\b/.test(title) ? 'PG' : null)
const roadmapFile = await get(`https://api.github.com/repos/${REPO}/contents/docs/ARCHITECTURE.md?ref=main`)
if (roadmapFile.encoding !== 'base64') throw new Error('The Roadmap could not be read')
const architecture = Buffer.from(roadmapFile.content, 'base64').toString('utf8')
const roadmapSection = architecture.split(/^## Roadmap[ \t]*\r?$/m)[1]?.split(/^## [^\n]+$/m)[0]
if (!roadmapSection) throw new Error('The Roadmap section is missing')
const roadmap = new Map()
let roadmapGroup = null
for (const line of roadmapSection.split(/\r?\n/)) {
  if (/^### Everyday\b/.test(line)) roadmapGroup = 'Everyday'
  else if (/^### Advanced\b/.test(line)) roadmapGroup = 'Advanced'
  else if (/^### Later and parked\b/.test(line)) roadmapGroup = 'Later'
  else if (/^### Done\b/.test(line)) roadmapGroup = 'Done'
  const match = /^\|\s*([NO]\d+)\b/.exec(line)
  if (match && roadmapGroup) roadmap.set(match[1], { group: roadmapGroup, order: roadmap.size, status: line.split('|')[3]?.trim() ?? '' })
}
if (!roadmap.has('O22')) throw new Error('The Roadmap milestones could not be parsed')
const groupRank = { Findings: 0, Everyday: 1, Advanced: 2, Later: 3, Done: 4, Superseded: 5, Unplaced: 6 }
const repository = await get(`https://api.github.com/repos/${REPO}`)
if (repository.private && !(process.env.GITHUB_TOKEN && process.env.OUTCOMES_PRIVATE_OK === '1')) {
  throw new Error(`${REPO} is private: set GITHUB_TOKEN (with issues: read on it) and OUTCOMES_PRIVATE_OK=1 to draw the board from it`)
}
const rawList = await get(`https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100`)
// The profile never names AI: a milestone title is drawn with its public wording.
const publicTitle = (title) => title.replace('AI on a budget', 'Thinking on a budget')
const raw = rawList
  .filter((m) => codeOf(m.title))
  .map((m) => {
    const code = codeOf(m.title)
    const group = code === 'O16' ? 'Superseded' : m.state === 'closed' ? 'Done' : code === 'PG' ? 'Findings' : roadmap.get(code)?.group ?? 'Unplaced'
    return { ...m, code, group, roadmapStatus: roadmap.get(code)?.status ?? '', title: publicTitle(m.title) }
  })
  .sort((a, b) => groupRank[a.group] - groupRank[b.group] ||
    (a.group === 'Done' ? (b.closed_at ?? '').localeCompare(a.closed_at ?? '') : (roadmap.get(a.code)?.order ?? 1000) - (roadmap.get(b.code)?.order ?? 1000)))
if (raw.length === 0) throw new Error('No Silas Portals outcome milestones found')

const milestoneIssues = async (number) => {
  const issues = []
  for (let page = 1; ; page++) {
    const batch = await get(`https://api.github.com/repos/${REPO}/issues?milestone=${number}&state=all&per_page=100&page=${page}`)
    issues.push(...batch)
    if (batch.length < 100) return issues
  }
}

// A closed issue marked not_planned was cancelled, not finished. A label may
// move an issue later than its milestone, never earlier: `later` means v1.1 and
// `parked` means Later, while a Later milestone keeps all of its live issues.
const milestones = []
for (const m of raw) {
  const issues = (await milestoneIssues(m.number)).filter((issue) => !issue.pull_request)
  const version = versionOf(m.title)
  const counted = issues.filter((issue) => {
    if (issue.state_reason === 'not_planned') return false
    const labels = new Set(issue.labels.map((label) => label.name))
    if (version === 'later' || version === 'superseded') return true
    if (version === 'v1.1') return !labels.has('parked')
    return !labels.has('later') && !labels.has('parked')
  })
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
    updated: `${new Date().toISOString().slice(0, 10)} UTC`,
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

const group = (name, label) => {
  const items = milestones.filter((m) => m.group === name)
  if (!items.length) return ''
  // Plain titles: a milestone link 404s for everyone but the owner once the source is private.
  const links = items.map((m) => `<li>${esc(m.title)} · ${m.closed_issues}/${m.closed_issues + m.open_issues}</li>`).join('\n')
  return `<p><b>${label}</b></p>\n<ul>\n${links}\n</ul>\n`
}
const block = `<details>\n<summary>Open the stories behind the rings</summary>\n\n${group('Findings', 'Findings first')}${group('Everyday', 'Everyday')}${group('Advanced', 'Advanced')}${group('Later', 'Later and parked')}${group('Done', 'Done')}${group('Superseded', 'Superseded')}${group('Unplaced', 'Not yet on the Roadmap')}<p>${done} of ${total} v1 stories finished · ${closedTotal} issues closed overall · ${merged} pull requests merged.</p>\n</details>`
const file = new URL('README.md', root)
const readme = readFileSync(file, 'utf8')
const start = readme.indexOf(START), end = readme.indexOf(END)
if (start < 0 || end < start) throw new Error('README.md is missing the outcomes markers')
const next = `${readme.slice(0, start + START.length)}\n${block}\n${readme.slice(end)}`
if (next !== readme) writeFileSync(file, next)
console.log(`Updated roadmap: ${done}/${total} v1 stories finished, ${closedTotal} issues closed, ${merged} pull requests merged`)
