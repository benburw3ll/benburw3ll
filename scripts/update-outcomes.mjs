// Rewrites the outcomes table in README.md from the WidgetButler milestones (O1, O2, ...).
// Needs no dependencies; GITHUB_TOKEN is optional (it only raises the API rate limit).
import { readFile, writeFile } from 'node:fs/promises'

const REPO = process.env.OUTCOMES_REPO ?? 'benburw3ll/widgetbutler'
const README = new URL('../README.md', import.meta.url)
const START = '<!-- outcomes:start -->'
const END = '<!-- outcomes:end -->'

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'outcomes-readme' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

const res = await fetch(`https://api.github.com/repos/${REPO}/milestones?state=all&per_page=100`, { headers })
if (!res.ok) throw new Error(`GitHub API answered ${res.status}`)

const order = (m) => Number(/^O(\d+)\b/.exec(m.title)?.[1] ?? Infinity)
const milestones = (await res.json()).filter((m) => Number.isFinite(order(m))).sort((a, b) => order(a) - order(b))

const bar = (done, total) => {
  const filled = total === 0 ? 0 : Math.round((done / total) * 10)
  return '`' + '▓'.repeat(filled) + '░'.repeat(10 - filled) + '`'
}

let done = 0
let total = 0
const rows = milestones.map((m) => {
  const closed = m.closed_issues
  const all = m.open_issues + m.closed_issues
  const parked = /\(parked\)/i.test(m.title)
  if (!parked) {
    done += closed
    total += all
  }
  const progress =
    m.state === 'closed' ? '✅ done' : parked ? 'parked' : `${bar(closed, all)} ${all === 0 ? 0 : Math.round((closed / all) * 100)}%`
  return `| [${m.title}](${m.html_url}) | ${progress} | ${closed}/${all} |`
})

const table = [
  '| Outcome | Progress | Issues |',
  '| --- | --- | --- |',
  ...rows,
  '',
  `**${done} of ${total} issues closed** (parked outcomes not counted).`,
].join('\n')

const readme = await readFile(README, 'utf8')
const start = readme.indexOf(START)
const end = readme.indexOf(END)
if (start === -1 || end === -1 || end < start) throw new Error('README.md is missing the outcomes markers')
const next = `${readme.slice(0, start + START.length)}\n${table}\n${readme.slice(end)}`

if (next === readme) {
  console.log('No change')
} else {
  await writeFile(README, next)
  console.log(`Updated: ${done}/${total} issues closed across ${milestones.length} outcomes`)
}
