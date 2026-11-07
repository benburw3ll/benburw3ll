// Renders the live README outcome board from public milestone data. The version comes from the
// milestone title: no suffix is v1 (the road to v1), "(v1.1)" the next board, "(later)" and
// "(parked)" later. Only v1 outcomes are rings in the tower; the rest are listed below the road.
export const versionOf = (title) => {
  const m = /\((v1\.1|later|parked)\)\s*$/i.exec(title ?? '')
  return !m ? 'v1' : m[1].toLowerCase() === 'v1.1' ? 'v1.1' : 'later'
}
const ink = '#f1ecdf'
const dim = '#aab2c7'
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const text = (x, y, value, size = 12, color = ink, extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" ${extra}>${esc(value)}</text>`
const starfield = (count, seed = 13) => Array.from({ length: count }, (_, i) => {
  const x = 20 + ((i * 181 + i * i * seed) % 920)
  const y = 30 + ((i * 89 + i * i * 7) % 550)
  return `<circle cx="${x}" cy="${y}" r="${i % 11 ? .65 : 1.6}" fill="#d8e8ff" opacity="${i % 7 ? .15 : .4}"/>`
}).join('')
const logicField = () => Array.from({ length: 38 }, (_, i) => {
  const glyphs = ['∧', '∨', '⊕', '¬', '⇒', '0', '1']
  const x = 38 + ((i * 173 + i * i * 23) % 884)
  const y = 205 + ((i * 103 + i * i * 17) % 505)
  return text(x, y, glyphs[i % glyphs.length], i % 5 ? 12 : 17, i % 3 ? '#79e6d7' : '#e46d94', `class="logic-glyph logic-glyph-${i % 3}" opacity=".12"`)
}).join('')

const defs = (accent, secondary) => `<defs>
  <radialGradient id="sky"><stop stop-color="#1a2038"/><stop offset=".55" stop-color="#0b1022"/><stop offset="1" stop-color="#050710"/></radialGradient>
  <radialGradient id="well"><stop stop-color="${accent}" stop-opacity=".45"/><stop offset=".5" stop-color="${secondary}" stop-opacity=".22"/><stop offset="1" stop-color="#050710"/></radialGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8f1df"/><stop offset=".18" stop-color="${accent}"/><stop offset=".55" stop-color="#354360"/><stop offset=".8" stop-color="${secondary}"/><stop offset="1" stop-color="#fff4d9"/></linearGradient>
  <linearGradient id="tower" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#17233a"/><stop offset=".55" stop-color="#0b1222"/><stop offset="1" stop-color="#080b15"/></linearGradient>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="13"/></filter>
  <filter id="smallGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5H4" stroke="#fff" stroke-opacity=".035"/></pattern>
  <pattern id="stone" width="74" height="36" patternUnits="userSpaceOnUse"><path d="M0 0H74M0 18H74M37 0V18M0 18V36M74 18V36" stroke="#8ca4c0" stroke-opacity=".13" fill="none"/></pattern>
</defs>`

const ring = (cx, cy, r, color, state, outcome) => {
  const active = state === 'active', ghost = state === 'ghost'
  const { code, title, complete, total } = outcome
  const opacity = ghost ? .58 : 1
  const progress = total ? complete / total : 0
  const progressRadius = r - 17
  const circumference = Math.round(2 * Math.PI * progressRadius)
  const construction = active ? `<circle cx="${cx}" cy="${cy}" r="${r + 8}" fill="none" stroke="${color}" stroke-width="8" stroke-dasharray="${Math.round(r * 2)} 18 39 14 55 25" transform="rotate(-78 ${cx} ${cy})"/><circle cx="${cx}" cy="${cy}" r="${r + 19}" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="3 8"/>` : ''
  const core = ghost ? `<circle cx="${cx}" cy="${cy}" r="${r - 7}" fill="#060a16" stroke="${color}" stroke-opacity=".4" stroke-dasharray="5 9"/>` : `<circle cx="${cx}" cy="${cy}" r="${r - 8}" fill="url(#well)"/><path d="M${cx-r*.8} ${cy+r*.25}Q${cx} ${cy-r*.9} ${cx+r*.8} ${cy+r*.3}M${cx-r*.5} ${cy-r*.6}Q${cx+r*.3} ${cy+r*.7} ${cx+r*.7} ${cy-r*.45}" fill="none" stroke="${color}" stroke-width="${Math.max(2,r*.08)}" stroke-opacity=".6" class="${active ? 'current' : ''}"/>`
  const progressArc = progress ? `<circle cx="${cx}" cy="${cy}" r="${progressRadius}" fill="none" stroke="${color}" stroke-width="${r < 40 ? 3 : 4}" stroke-linecap="round" stroke-dasharray="${Math.round(circumference * progress)} ${circumference}" transform="rotate(-90 ${cx} ${cy})"/>` : ''
  const codeSize = r < 40 ? 8 : r < 50 ? 10 : 12
  const countSize = r < 40 ? 12 : r < 50 ? 17 : 26
  const codeY = cy - (r < 40 ? 8 : r < 50 ? 11 : 17)
  const countY = cy + (r < 40 ? 9 : r < 50 ? 13 : 17)
  return `<g opacity="${opacity}"><title>${esc(`${code} ${title}: ${complete} of ${total} stories finished`)}</title><circle cx="${cx}" cy="${cy}" r="${r + 9}" fill="none" stroke="${color}" stroke-width="19" opacity="${ghost ? .08 : .34}" filter="url(#glow)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#050711" stroke="${ghost ? color : 'url(#rim)'}" stroke-width="${active ? 10 : 8}" stroke-dasharray="${ghost ? '3 11' : ''}"/>${core}<circle cx="${cx}" cy="${cy}" r="${progressRadius}" fill="none" stroke="${color}" stroke-opacity=".16" stroke-width="${r < 40 ? 3 : 4}"/>${progressArc}${construction}<circle cx="${cx}" cy="${cy}" r="${r+13}" fill="none" stroke="${color}" stroke-opacity=".6" stroke-width="1" stroke-dasharray="1 12"/>${text(cx, codeY, code, codeSize, ink, 'text-anchor="middle" font-weight="700" letter-spacing="1"')}${text(cx, countY, `${complete}/${total}`, countSize, color, 'text-anchor="middle" font-weight="700"')}</g>`
}

// The Stonebinder is one of the story's imaginary friends: a hooded, non-goblin
// builder with a tool belt and a masonry hammer. No species design is canon yet.
const builder = (x, y, scale, color, facing = 1) => `<g transform="translate(${x} ${y}) scale(${scale * facing} ${scale})">
  <g class="builder-base">
  <ellipse cx="0" cy="4" rx="30" ry="6" fill="#02040a" opacity=".75"/>
  <path d="M-13-35l-8 37h13l10-29M12-34l9 36H8L-2-27" fill="#283246" stroke="#6f809b" stroke-width="2"/>
  <path d="M-22-39Q-31-25-27-9L-14-8Q0-13 13-8L27-9Q30-27 21-40L10-51H-11Z" fill="#d9d3c5" stroke="#506071" stroke-width="3"/>
  <path d="M-26-31Q-7-24 26-31" stroke="${color}" stroke-width="5" opacity=".8"/>
  <path d="M-24-53Q-34-71-20-81Q-12-95 0-91Q18-95 24-77L19-53Z" fill="#a9a2a5" stroke="#535869" stroke-width="3"/>
  <path d="M-20-60Q-9-74 0-72Q13-73 20-60Q19-46 10-42H-10Q-20-48-20-60Z" fill="#2b3347"/>
  <path d="M-8-59h5m11 0h5" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  <path d="M-24-49L-39-30L-34-24L-15-36M22-48L36-30L50-52" fill="none" stroke="#d9d3c5" stroke-width="10" stroke-linecap="round"/>
  <path d="M50-52L60-68M49-69L72-68M55-75v20" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
  <path d="M-17-15h35" stroke="#594c45" stroke-width="6"/><path d="M7-19v11h9v-11" fill="${color}"/>
  </g>
  <g class="builder-glitch" opacity="0">
    <path d="M-28-11Q-36-55-22-83L-9-93H12L27-78Q38-47 27-10Q8-20-1-12Q-15-22-28-11Z" fill="#16243a" stroke="#79e6d7" stroke-width="2" stroke-dasharray="19 5 4 7"/>
    <path d="M-20-69Q0-89 20-68L11-48H-12Z" fill="#354465" stroke="#b8a0fc" stroke-width="2"/>
    <path d="M-15-62h30M-9-54h18" stroke="#e9faff" stroke-width="3" stroke-dasharray="7 4"/>
    <circle cx="-8" cy="-59" r="3" fill="#79e6d7"/><circle cx="9" cy="-59" r="3" fill="#e46d94"/>
    <path d="M-26-31l-27 13M25-34l29-15M-21-9l-9 22M20-9l11 22" stroke="#b8a0fc" stroke-width="5" stroke-dasharray="9 7"/>
    <path d="M44-75l25 1M55-87v25M-36-82h-22M-62-69h17M30-18h32M-49-38h15" stroke="#ffc76e" stroke-width="3" stroke-dasharray="13 6"/>
    <circle cx="0" cy="-42" r="36" fill="none" stroke="#79e6d7" stroke-opacity=".65" stroke-dasharray="2 9"/>
    ${text(-48,-86,'∧',11,'#79e6d7')}${text(41,-44,'⊕',12,'#e46d94')}${text(-39,3,'1',11,'#ffc76e')}
  </g>
</g>`

const statPlate = (x, width, color, fill) => `<path d="M${x+12} 602H${x+width-12}l12 12v118l-12 12H${x+12}l-12-12V614Z" fill="${fill}" stroke="${color}" stroke-opacity=".75" stroke-width="2"/>
  <path d="M${x+12} 607h37M${x+width-12} 739h-37" stroke="${color}" stroke-width="3" stroke-opacity=".65"/>
  <circle cx="${x+10}" cy="613" r="2" fill="${color}"/><circle cx="${x+width-10}" cy="733" r="2" fill="${color}"/>`

export function renderWatchtowerBoard(milestones, { merged, mergedWeek, closedTotal, closedWeek }) {
  const outcomes = milestones.map((milestone) => {
    const match = /^([NO])(\d+)\b/.exec(milestone.title)
    if (!match) throw new Error(`Unrecognized outcome milestone: ${milestone.title}`)
    const code = `${match[1]}${match[2]}`
    const version = versionOf(milestone.title)
    const title = milestone.title.replace(/^[NO]\d+\s*·\s*/, '').replace(/\s*\((v1\.1|later|parked)\)/i, '')
    const complete = milestone.closed_issues
    const total = milestone.open_issues + complete
    const state = /\(parked\)/i.test(milestone.title)
      ? 'parked'
      : version === 'later'
        ? 'later'
        : total > 0 && complete === total
          ? 'done'
          : complete > 0
            ? 'building'
            : 'planned'
    return { code, title, complete, total, state, version }
  })
  const v1 = outcomes.filter((item) => item.version === 'v1')
  const v1Done = v1.reduce((sum, item) => sum + item.complete, 0)
  const v1Total = v1.reduce((sum, item) => sum + item.total, 0)
  const recentDone = v1.filter((item) => item.state === 'done').slice(-3)
  if (recentDone.length !== 3) throw new Error('The Watchtower needs three finished v1 outcome rings')
  const available = v1.filter((item) => item.state !== 'done')
  const next = outcomes.filter((item) => item.version === 'v1.1')
  const primary = available[0] ?? next[0] ?? outcomes.at(-2)
  const secondary = available[1] ?? next.find((item) => item.code !== primary.code) ?? outcomes.find((item) => item.code !== primary.code && item.state !== 'done') ?? outcomes.at(-1)
  const future = [...available, ...next, ...outcomes.filter((item) => item.version === 'later')].filter((item) => item.state !== 'done' && item.code !== primary.code && item.code !== secondary.code)
  const leftGhost = future.at(-2) ?? outcomes.at(-2)
  const rightGhost = future.at(-1) ?? outcomes.at(-1)
  const a = '#79e6d7', b = '#ffc76e', signal = '#e46d94'
  const leftTraces = Array.from({ length: 13 }, (_, i) => {
    const y = 197 + i * 26
    const end = 290 + (i % 4) * 22
    const notch = 167 + (i % 3) * 17
    return `<path d="M${48 + i % 3 * 9} ${y}h${notch}l${18 + i % 3 * 4} ${i % 2 ? 11 : -11}H${end}" fill="none" stroke="${i % 4 ? a : signal}" stroke-width="${i % 4 ? 1.3 : 2.2}" stroke-opacity="${i % 4 ? .25 : .5}"/><circle cx="${end}" cy="${y + (i % 2 ? 11 : -11)}" r="${i % 4 ? 2 : 3}" fill="${i % 4 ? a : signal}" opacity=".7"/>`
  }).join('')
  const rightTraces = Array.from({ length: 13 }, (_, i) => {
    const y = 204 + i * 25
    const start = 671 - (i % 4) * 22
    const notch = 786 - (i % 3) * 17
    return `<path d="M${start} ${y}h${notch-start}l${18 + i % 3 * 4} ${i % 2 ? -11 : 11}H${919 - i % 3 * 9}" fill="none" stroke="${i % 5 ? a : signal}" stroke-width="${i % 5 ? 1.3 : 2.2}" stroke-opacity="${i % 5 ? .25 : .55}"/><circle cx="${start}" cy="${y}" r="${i % 5 ? 2 : 3}" fill="${i % 5 ? a : signal}" opacity=".7"/>`
  }).join('')
  const towerCircuits = Array.from({ length: 18 }, (_, i) => {
    const y = 196 + i * 19
    const left = 281 + (i % 5) * 9
    const right = 679 - (i % 4) * 11
    return `<path d="M${left} ${y}h${21 + i % 4 * 7}v${i % 2 ? 8 : -8}h${12 + i % 3 * 5}M${right} ${y}h-${20 + i % 3 * 8}v${i % 2 ? -8 : 8}h-${10 + i % 4 * 5}" fill="none" stroke="${i % 6 ? '#6887ad' : signal}" stroke-width="1.1" stroke-opacity="${i % 6 ? .28 : .64}"/>`
  }).join('')
  const nodes = Array.from({ length: 48 }, (_, i) => {
    const x = 287 + (i * 71 % 390)
    const y = 171 + (i * 47 % 380)
    return `<circle cx="${x}" cy="${y}" r="${i % 9 ? 1.2 : 2.2}" fill="${i % 4 ? a : signal}" opacity="${i % 4 ? .25 : .65}"/>`
  }).join('')
  const body = `<defs><radialGradient id="ship-halo"><stop stop-color="${signal}" stop-opacity=".22"/><stop offset=".52" stop-color="${a}" stop-opacity=".11"/><stop offset="1" stop-color="#050710" stop-opacity="0"/></radialGradient><linearGradient id="hull" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#202b41"/><stop offset=".45" stop-color="#0c1325"/><stop offset="1" stop-color="#060913"/></linearGradient></defs>
  <ellipse cx="480" cy="347" rx="451" ry="284" fill="url(#ship-halo)"/>
  <path d="M36 46H295M665 46H924" stroke="${signal}" stroke-opacity=".4"/>
  <path d="M478 13L456 86H504Z" fill="#11182b" stroke="${a}" stroke-width="2"/><circle cx="480" cy="34" r="7" fill="${signal}" filter="url(#smallGlow)"/><circle cx="480" cy="34" r="4" fill="${signal}"/>
  <path d="M299 174L365 105L595 105L661 174L630 201H330Z" fill="url(#hull)" stroke="#8192ad" stroke-width="3"/>
  <path d="M365 105L480 83L595 105M330 201L480 175L630 201" fill="none" stroke="${a}" stroke-opacity=".5" stroke-width="3"/>
  ${text(480,130,'OVERLORD',24,ink,'text-anchor="middle" font-weight="700" letter-spacing="4"')}
  ${text(480,158,'WATCHTOWER',24,ink,'text-anchor="middle" font-weight="700" letter-spacing="4"')}
  <path d="M248 218L318 171L642 171L712 218L727 568H233Z" fill="url(#hull)" stroke="#66758f" stroke-width="4"/>
  <path d="M248 218L318 171L642 171L712 218L727 568H233Z" fill="url(#stone)" opacity=".42"/>
  <path d="M252 234L116 210L29 278L100 337L254 314ZM708 234L844 210L931 278L860 337L706 314Z" fill="#0b1121" stroke="#53627d" stroke-width="3"/>
  <path d="M116 210L151 277L100 337M844 210L809 277L860 337" fill="none" stroke="${signal}" stroke-opacity=".45" stroke-width="2"/>
  <path d="M246 300L104 318L40 384L169 404L237 378M714 300L856 318L920 384L791 404L723 378" fill="#0b1121" stroke="#374660" stroke-width="3"/>
  <path d="M315 173L270 215L245 568M645 173L690 215L715 568" fill="none" stroke="${signal}" stroke-width="7" stroke-opacity=".36" filter="url(#smallGlow)"/>
  ${leftTraces}${rightTraces}${towerCircuits}${nodes}
  <path d="M480 103v67M356 113l39 57M604 113l-39 57" stroke="${a}" stroke-opacity=".45" stroke-width="2" stroke-dasharray="4 7" class="current"/>
  <path d="M285 325H675M264 494H696" stroke="#7585a1" stroke-opacity=".45" stroke-width="2"/>
  <path d="M321 196h318M333 208h294" stroke="${a}" stroke-opacity=".3"/>
  ${text(480,225,'IF   ∧   THEN   ∨   ELSE',12,b,'text-anchor="middle" letter-spacing="3"')}
  ${ring(339,282,45,b,'done',recentDone[0])}${ring(470,282,45,b,'done',recentDone[1])}${ring(601,282,45,b,'done',recentDone[2])}
  ${ring(374,420,65,a,primary.state === 'done' ? 'done' : 'active',primary)}${ring(565,420,65,'#b8a0fc',secondary.state === 'done' ? 'done' : 'active',secondary)}
  <path d="M338 343v14h-27v22m159-36v16h-32v20m163-36v17h25v19" fill="none" stroke="${a}" stroke-opacity=".5" stroke-width="2"/>
  <path d="M437 420h58M470 366v-24m0 156v21" stroke="${signal}" stroke-opacity=".7" stroke-width="3" stroke-dasharray="4 7" class="current"/>
  <path d="M627 374h100v13H627m37 0v180m42-180v180m-42-122h42m-42 52h42m-42 52h42" fill="none" stroke="${b}" stroke-width="3"/>
  ${builder(666,383,1.03,b,-1)}
  <path d="M608 373l-16-20m23 17l-8-26m15 23l1-23" stroke="${b}" stroke-width="2" stroke-linecap="round" class="pulse"/>
  ${text(374,531,primary.title,11,a,'text-anchor="middle" font-weight="700"')}${text(565,531,secondary.title,11,'#b8a0fc','text-anchor="middle" font-weight="700"')}
  <path d="M88 454l-19 67 28 48h110l26-76-38-54zM872 454l19 67-28 48H753l-26-76 38-54z" fill="#070d19" stroke="#46536d" stroke-width="3"/>
  <path d="M93 494l-9 29 21 38h81l27-63M867 494l9 29-21 38h-81l-27-63" fill="none" stroke="${signal}" stroke-opacity=".55" stroke-width="3"/>
  <path d="M89 566h122M749 566h122" stroke="${a}" stroke-width="5" stroke-opacity=".65" filter="url(#smallGlow)"/>
  ${ring(125,456,34,'#b8a0fc','ghost',leftGhost)}${ring(835,456,34,'#b8a0fc','ghost',rightGhost)}
  ${text(38,101,'LATEST FINISHED OUTCOMES',11,b,'letter-spacing="1"')}${text(922,101,'NEXT OUTCOMES',11,a,'text-anchor="end" letter-spacing="1"')}`

  // Rows: the v1 lane, the v1 outcomes, then the next board and later, each group under its label.
  const ordered = [
    ...v1.filter((item) => item.code.startsWith('N')),
    ...v1.filter((item) => item.code.startsWith('O')),
    ...next,
    ...outcomes.filter((item) => item.version === 'later'),
  ]
  const nCount = v1.filter((item) => item.code.startsWith('N')).length
  const v1Count = v1.length
  const nextCount = next.length
  const gapOf = (i) => (i >= nCount ? 38 : 0) + (i >= v1Count ? 38 : 0) + (nextCount && i >= v1Count + nextCount ? 38 : 0)
  const row = (item, i) => {
    const { code, title, complete, total, state } = item
    const y = 645 + i * 45 + gapOf(i)
    const current = code === primary.code || code === secondary.code
    const color = state === 'done' ? b : state === 'building' && current ? a : state === 'parked' || state === 'later' ? '#657086' : '#a69aba'
    const status = state === 'done' ? 'COMPLETE' : state === 'building' && current ? 'BUILDING' : state === 'building' ? 'FORMING' : state === 'parked' ? 'PARKED' : state === 'later' ? 'LATER' : item.version === 'v1.1' ? 'NEXT BOARD' : 'PLANNED'
    const fraction = total ? complete / total : 0
    const arc = Math.round(82 * fraction)
    const bar = Math.round(111 * fraction)
    return `<g>
      <rect x="30" y="${y}" width="900" height="41" rx="6" fill="${i % 2 ? '#101729' : '#0c1324'}" stroke="${color}" stroke-opacity="${state === 'building' ? .64 : .32}"/>
      <path d="M31 ${y+8}v-7h21M929 ${y+8}v-7h-21" fill="none" stroke="${color}" stroke-opacity=".7" stroke-width="1.5"/>
      <circle cx="65" cy="${y+21}" r="13" fill="#060a17" stroke="${color}" stroke-opacity=".34" stroke-width="4"/>
      <circle cx="65" cy="${y+21}" r="13" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="${arc} 82" transform="rotate(-90 65 ${y+21})"/>
      <circle cx="65" cy="${y+21}" r="4" fill="${color}" opacity="${state === 'parked' || state === 'later' ? .4 : .8}"/>
      ${text(96,y+27,code,17,color,'font-weight="700"')}
      ${text(155,y+27,title,16,state === 'parked' || state === 'later' ? '#8991a3' : ink,'font-weight="600"')}
      ${text(636,y+26,status,10,color,'text-anchor="middle" letter-spacing="1"')}
      <path d="M710 ${y+21}h112" stroke="#2d3c54" stroke-width="8" stroke-linecap="round"/>
      <path d="M710 ${y+21}h${bar}" stroke="${color}" stroke-width="6" stroke-linecap="round" opacity="${state === 'parked' || state === 'later' ? .4 : .9}"/>
      ${text(913,y+27,`${complete}/${total}`,14,color,'text-anchor="end" font-weight="700"')}
    </g>`
  }
  const signalsHeight = 205
  const roadHeight = 1430 + (outcomes.length - 15) * 45 + (nextCount ? 38 : 0) + (outcomes.length > v1Count + nextCount ? 38 : 0)
  const boardHeight = roadHeight + signalsHeight
  const rows = ordered.map(row).join('')
  const board = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${boardHeight}" width="960" height="${boardHeight}" role="img" aria-label="Overlord Watchtower roadmap: ${merged} code merges, ${closedTotal} issues closed, and ${v1Done} of ${v1Total} v1 stories finished" font-family="'Cascadia Code', Consolas, 'Liberation Mono', monospace">
  <title>Overlord Watchtower: ${merged} code merges, ${closedTotal} issues closed, ${v1Done} of ${v1Total} v1 stories finished</title>${defs(a,b)}
  <style>@keyframes pulse{50%{opacity:.45}}@keyframes flow{to{stroke-dashoffset:-90}}@keyframes glyph-signal{0%,72%,100%{opacity:.1}76%,80%{opacity:.4}78%{opacity:.2}}@media (prefers-reduced-motion:no-preference){.pulse{animation:pulse 4s ease-in-out infinite}.current{stroke-dasharray:8 7;animation:flow 4s linear infinite}.logic-glyph{animation:glyph-signal 7s ease-in-out infinite}.logic-glyph-1{animation-delay:-2.3s}.logic-glyph-2{animation-delay:-4.7s}.builder-base{animation:builder-fade 12s steps(1,end) infinite}.builder-glitch{animation:builder-echo 12s steps(1,end) infinite}}@keyframes builder-fade{0%,44%,50%,100%{opacity:1}45%,49%{opacity:.22}}@keyframes builder-echo{0%,44%,50%,100%{opacity:0}45%,49%{opacity:.9}}</style>
  <rect width="960" height="${boardHeight}" fill="url(#sky)"/>${starfield(105)}${logicField()}<rect width="960" height="${boardHeight}" fill="url(#scan)"/>
  <g transform="translate(0 ${signalsHeight})">
  ${body}
  </g>
  <g transform="translate(0 -545)">
  <path d="M25 565H935" stroke="${a}" stroke-opacity=".4"/>
  ${text(30,590,'WATCHTOWER LEDGER',12,a,'font-weight="700" letter-spacing="2"')}
  ${text(930,590,'REFRESHED EVERY THREE HOURS',10,dim,'text-anchor="end" letter-spacing="1"')}
  ${statPlate(30,211,b,'#171a2d')}${statPlate(253,211,signal,'#211525')}${statPlate(476,211,a,'#0e1b2b')}${statPlate(699,231,'#b8a0fc','#17142a')}
  ${text(48,634,'CODE MERGED',12,b,'font-weight="700" letter-spacing="1"')}
  ${text(47,706,merged,54,ink,'font-weight="700"')}
  ${text(223,727,'ALL TIME',10,b,'text-anchor="end" letter-spacing="1"')}
  ${text(271,634,'ISSUES CLOSED',12,signal,'font-weight="700" letter-spacing="1"')}
  ${text(270,706,closedTotal,54,ink,'font-weight="700"')}
  ${text(446,727,'ALL TIME',10,signal,'text-anchor="end" letter-spacing="1"')}
  ${text(494,634,'V1 STORIES',12,a,'font-weight="700" letter-spacing="1"')}
  ${text(493,693,`${v1Done}/${v1Total}`,34,ink,'font-weight="700"')}
  <path d="M494 720h174" stroke="#2d3c54" stroke-width="7" stroke-linecap="round"/>
  <path d="M494 720h${v1Total ? Math.round(174 * v1Done / v1Total) : 0}" stroke="${a}" stroke-width="7" stroke-linecap="round"/>
  ${text(717,634,'LAST 7 DAYS',12,'#b8a0fc','font-weight="700" letter-spacing="1"')}
  ${text(716,676,mergedWeek,27,ink,'font-weight="700"')}
  ${text(772,675,'CODE MERGED',10,dim)}
  ${text(716,716,closedWeek,27,ink,'font-weight="700"')}
  ${text(772,715,'ISSUES CLOSED',10,dim)}
  </g>
  <g transform="translate(0 ${signalsHeight})">
  <path d="M25 565H935" stroke="${a}" stroke-opacity=".4"/>
  ${text(30,606,'ROAD TO V1',23,ink,'font-weight="700" letter-spacing="2"')}
  ${text(930,604,'STORIES FINISHED  /  TOTAL',11,a,'text-anchor="end" letter-spacing="1"')}
  <path d="M30 622H930" stroke="${a}" stroke-opacity=".45"/>
  <path d="M65 637V${roadHeight-76}" stroke="${a}" stroke-opacity=".18" stroke-width="3" stroke-dasharray="3 8"/>
  ${text(30,645+nCount*45+23,'OUTCOMES',10,b,'letter-spacing="1"')}
  ${nextCount ? text(30,645+v1Count*45+38+23,'NEXT BOARD  ·  V1.1',10,'#b8a0fc','letter-spacing="1"') : ''}
  ${outcomes.length > v1Count + nextCount ? text(30,645+(v1Count+nextCount)*45+76+23,'LATER',10,'#8991a3','letter-spacing="1"') : ''}
  ${rows}
  <path d="M30 ${roadHeight-48}H930" stroke="${a}" stroke-opacity=".4"/>
  ${text(30,roadHeight-24,'RING COUNTS  /  STORIES FINISHED OF TOTAL',10,dim,'letter-spacing="1"')}
  ${text(930,roadHeight-24,'SILAS PORTALS',11,a,'text-anchor="end" letter-spacing="1"')}
  </g>
  </svg>\n`
  return board
}
