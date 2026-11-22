// A compact front panel for the profile. Only aggregate counts leave the
// owner's authenticated GitHub view; no private repository names leak.
const ink = '#f1ecdf'
const muted = '#aab2c7'
const colors = ['#79e6d7', '#ffc76e', '#b8a0fc', '#e46d94']
const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const label = (x, y, value, size, fill, extra = '') => `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" ${extra}>${escapeXml(value)}</text>`

export function renderGithubStats(stats) {
  const cards = [
    ['PRS MERGED', stats.merged, 'Across my repositories'],
    ['BEYOND SILAS', stats.outside, 'Merged PRs in other repos'],
    ['REPOS REACHED', stats.repositories, 'Repos with my PRs'],
    ['OPEN PRS', stats.open, 'Across this scope'],
    ['LAST 7 DAYS', stats.recent, 'PRs merged'],
    ['ISSUES OPENED', stats.issues, 'Across this scope'],
    ['ISSUES CLOSED', stats.issuesClosed, 'Of those I opened'],
    ['PRS OPENED', stats.pullRequests, 'Across this scope'],
  ]
  const card = ([title, value, detail], index) => {
    const x = 24 + index % 4 * 234
    const y = 79 + Math.floor(index / 4) * 116
    const color = colors[index % 4]
    const number = String(value)
    return `<g>
      <path d="M${x+9} ${y}h198l9 9v84l-9 9H${x+9}l-9-9V${y+9}Z" fill="#101729" stroke="${color}" stroke-opacity=".67" stroke-width="1.5"/>
      <path d="M${x+12} ${y+6}h37M${x+203} ${y+95}h-37" stroke="${color}" stroke-opacity=".8" stroke-width="2"/>
      <circle cx="${x+202}" cy="${y+14}" r="3" fill="${color}" opacity=".8"/>
      ${label(x+15,y+25,title,11,color,'font-weight="700" letter-spacing="1.1"')}
      ${label(x+15,y+70,number,38,ink,'font-weight="700"')}
      ${label(x+15,y+91,detail,10,muted)}
    </g>`
  }
  const summary = cards.map(([title, value]) => `${title.toLowerCase()}: ${value}`).join('; ')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 327" width="960" height="327" role="img" aria-label="GitHub activity across public and private repositories: ${escapeXml(summary)}" font-family="'Cascadia Code', Consolas, 'Liberation Mono', monospace">
  <title>GitHub activity across public and private repositories</title>
  <defs><linearGradient id="stats-sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111b30"/><stop offset=".55" stop-color="#080d1c"/><stop offset="1" stop-color="#171021"/></linearGradient><pattern id="stats-scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5H4" stroke="#fff" stroke-opacity=".03"/></pattern></defs>
  <rect width="960" height="327" rx="14" fill="url(#stats-sky)" stroke="#506580" stroke-opacity=".7"/>
  <path d="M23 56H937M23 306H937" stroke="#79e6d7" stroke-opacity=".42"/>
  ${label(26,37,'GITHUB SIGNALS',21,ink,'font-weight="700" letter-spacing="2"')}
  ${label(934,35,'PUBLIC + PRIVATE REPOS',11,'#79e6d7','text-anchor="end" letter-spacing="1"')}
  ${cards.map(card).join('')}
  ${label(26,319,`SNAPSHOT ${stats.updated}`,9,muted,'letter-spacing="1"')}
  ${label(934,319,'PRIVATE REPOS INCLUDED · COUNTS ONLY',9,muted,'text-anchor="end" letter-spacing="1"')}
  <rect width="960" height="327" rx="14" fill="url(#stats-scan)" pointer-events="none"/>
</svg>\n`
}
