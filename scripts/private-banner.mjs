// A self-contained SVG prologue for the public profile. No private source or live data.
const friend = (x, y, scale, color, pose = 0, prop = 'spark') => `<g transform="translate(${x} ${y}) scale(${scale})">
  <ellipse cx="0" cy="2" rx="22" ry="5" fill="#02050d" opacity=".7"/>
  <path d="M-10-19l-8 20h11l8-15m9-5 8 20H7L-1-14" fill="#273750" stroke="${color}" stroke-width="2"/>
  <path d="M-18-51q-13 17-8 35l15 4 11-6 11 6 15-4q5-18-8-35z" fill="#e5dece" stroke="#64738c" stroke-width="2.5"/>
  <path d="M-23-57l-10-13 5 23m51-10 10-13-5 23" fill="#8cae9f" stroke="#375968" stroke-width="2"/>
  <path d="M-20-72q20-18 40 0l3 25q-21 16-46 0z" fill="#9cbdad" stroke="#375968" stroke-width="2.5"/>
  <path d="M-25-72l7-10 9 7 9-15 9 14 11-8 5 13" fill="#f1e8d6" stroke="#77758a" stroke-width="2"/>
  <circle cx="-9" cy="-56" r="7" fill="#142c3f" stroke="${color}" stroke-width="2.5"/>
  <circle cx="9" cy="-56" r="7" fill="#142c3f" stroke="${color}" stroke-width="2.5"/>
  <path d="M-6-40q8 6 14-2" fill="none" stroke="#34516a" stroke-width="2"/>
  <path d="M-19-34l-13 ${pose ? -17 : -7}m50-17 23-21" stroke="#e5dece" stroke-width="7" stroke-linecap="round"/>
  ${prop === 'spark' ? `<path d="M38-70l18-7m-18 7 17 4" stroke="${color}" stroke-width="3" stroke-linecap="round"/><circle cx="43" cy="-70" r="4" fill="${color}" filter="url(#small-glow)"/>` : ''}
</g>`

const builder = (x, y, scale, color, tool) => `${friend(x, y, scale, color, 1, 'none')}<g transform="translate(${x} ${y}) scale(${scale})">
  <path d="M-23-75q2-18 23-18t23 18v6h-46z" fill="#ffc76e" stroke="#9b6f42" stroke-width="2.5"/>
  <path d="M-29-70h58" stroke="#f7df9e" stroke-width="5" stroke-linecap="round"/>
  ${tool === 'brick' ? '<rect x="38" y="-77" width="28" height="16" rx="2" fill="#8ba8bd" stroke="#d2e0dd" stroke-width="2"/><path d="M52-77v16" stroke="#d2e0dd" stroke-opacity=".5"/>' : '<path d="M43-71l17-23" stroke="#d2e0dd" stroke-width="3"/><path d="M47-96h23v9H47z" fill="#8ba8bd" stroke="#d2e0dd" stroke-width="2"/>'}
</g>`

export function renderPrivateBanner() {
  const stars = Array.from({ length: 95 }, (_, i) => {
    const x = 12 + ((i * 173 + i * i * 19) % 936)
    const y = 16 + ((i * 79 + i * i * 11) % 348)
    return `<circle cx="${x}" cy="${y}" r="${i % 13 ? .65 : 1.5}" fill="#dbe8ff" opacity="${i % 7 ? .16 : .38}"/>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" width="960" height="420" role="img" aria-label="Private until v1. Imaginary friends build the Overlord Watchtower while their friends fire a cannon across the canyon to test its shield. A rogue imaginary friend tries to hack in and is denied." font-family="'Cascadia Code', Consolas, 'Liberation Mono', monospace">
  <title>Private until v1: imaginary friends build and test the Overlord Watchtower</title>
  <defs>
    <radialGradient id="sky"><stop stop-color="#1b2440"/><stop offset=".55" stop-color="#0b1123"/><stop offset="1" stop-color="#050711"/></radialGradient>
    <linearGradient id="canyon" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#18223b"/><stop offset="1" stop-color="#03050d"/></linearGradient>
    <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#283c58"/><stop offset=".5" stop-color="#101a2d"/><stop offset="1" stop-color="#080c18"/></linearGradient>
    <filter id="glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="small-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3"/></filter>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5H4" stroke="#fff" stroke-opacity=".03"/></pattern>
  </defs>
  <style>
    @keyframes fire { to { stroke-dashoffset: -88 } }
    @keyframes shield { 50% { opacity: .48 } }
    @keyframes denied { 0%, 87%, 100% { opacity: 1 } 88%, 91% { opacity: .22 } }
    @keyframes spark { 50% { transform: scale(1.35); opacity: .85 } }
    @keyframes muzzle { 0%, 13%, 100% { opacity: .15; transform: scale(.45) } 4% { opacity: 1; transform: scale(1.25) } }
    @media (prefers-reduced-motion: no-preference) {
      .test-shot { animation: fire 3s linear infinite }
      .shield { animation: shield 4s ease-in-out infinite }
      .denied { animation: denied 6s steps(1, end) infinite }
      .spark { transform-origin: center; animation: spark 1.4s ease-in-out infinite }
      .muzzle { transform-origin: 353px 249px; animation: muzzle 3.2s ease-out infinite }
    }
    @media (prefers-reduced-motion: reduce) { .moving-ball { display: none } }
  </style>
  <rect width="960" height="420" fill="url(#sky)"/>${stars}<rect width="960" height="420" fill="url(#scan)"/>
  <path d="M22 28h166m584 0h166M22 392h916" stroke="#7a91af" stroke-opacity=".35"/>
  <text x="480" y="65" text-anchor="middle" fill="#f2ecdf" font-size="41" font-weight="700" letter-spacing="4">PRIVATE UNTIL V1</text>
  <text x="480" y="94" text-anchor="middle" fill="#ffc76e" font-size="14" font-weight="700" letter-spacing="2">DEVELOPMENT + PENETRATION TESTING</text>
  <path d="M0 282L138 262L236 280L322 270L362 300L337 420H0ZM960 278L861 264L766 279L704 270L660 307L681 420H960Z" fill="url(#stone)" stroke="#71849e" stroke-width="3"/>
  <path d="M339 301Q480 365 671 305L681 420H337Z" fill="url(#canyon)"/>
  <path d="M367 317Q474 354 652 320M360 340Q473 385 660 343M353 370Q476 405 668 372" fill="none" stroke="#7e80a8" stroke-opacity=".17" stroke-width="2"/>
  <path d="M20 286L138 270L236 288L322 278M704 278L766 287L861 272L940 286" fill="none" stroke="#79e6d7" stroke-opacity=".65" stroke-width="3"/>
  <g fill="none" stroke="#d1b47b" stroke-width="3" stroke-linejoin="round" opacity=".9">
    <path d="M893 276V177m38 104V177M887 219h49M887 259h49M893 280l38-61m-38 40 38-40m-38 0 38 40"/>
    <path d="M899 177h29m-15-20v49"/>
  </g>
  <path d="M899 205h27v18h-27z" fill="#8ca3b9" stroke="#d1e1dc" stroke-width="2"/>
  <path d="M913 205v18" stroke="#d1e1dc" stroke-opacity=".5"/>
  <path d="M747 271V195l21-14v-24h19v-18h21v18h20v-18h21v18h18v24l20 14v76" fill="url(#stone)" stroke="#91a5c2" stroke-width="3"/>
  <path d="M768 181h99M759 210h119M759 239h119" stroke="#79e6d7" stroke-opacity=".42" stroke-width="2"/>
  <path d="M788 195v62m21-62v62m21-62v62m21-62v62" stroke="#92a8c7" stroke-opacity=".25"/>
  <path d="M788 203q20-27 40 0v35h-40z" fill="#09101f" stroke="#ffc76e" stroke-width="3"/>
  <circle cx="808" cy="213" r="8" fill="#ffc76e" filter="url(#small-glow)"/>
  <circle cx="808" cy="213" r="4" fill="#ffc76e"/>
  <path d="M742 275h145" stroke="#ffc76e" stroke-width="5" stroke-opacity=".68"/>
  <ellipse class="shield" cx="811" cy="220" rx="116" ry="91" fill="none" stroke="#79e6d7" stroke-width="14" opacity=".24" filter="url(#glow)"/>
  <ellipse cx="811" cy="220" rx="116" ry="91" fill="none" stroke="#79e6d7" stroke-width="2" stroke-dasharray="8 9"/>
  <text x="811" y="127" text-anchor="middle" fill="#f2ecdf" font-size="12" font-weight="700" letter-spacing="2">OVERLORD WATCHTOWER</text>
  <path d="M351 249Q491 132 696 213" fill="none" stroke="#ffc76e" stroke-width="3" stroke-dasharray="5 11" stroke-opacity=".84"/>
  <path d="M351 249Q491 132 696 213" fill="none" stroke="#ffc76e" stroke-width="11" stroke-opacity=".12" filter="url(#small-glow)"/>
  <g class="moving-ball"><circle r="7" fill="#ffe3a2" stroke="#ffc76e" stroke-width="3" filter="url(#small-glow)"/><animateMotion dur="3.2s" repeatCount="indefinite" path="M351 249Q491 132 696 213"/></g>
  <circle cx="540" cy="181" r="5" fill="#ffe3a2" opacity=".7"/>
  <path d="M698 213l-12-13m12 13-14 8m14-8 10-15m-10 15 15 9m-15-9 2 21" fill="none" stroke="#ffc76e" stroke-width="3" stroke-linecap="round" class="spark"/>
  <path d="M208 293l19-27 96-25 22 11-3 18-104 31z" fill="#19243a" stroke="#f1c879" stroke-width="4" stroke-linejoin="round"/>
  <path d="M228 272l95-25m-86 44 103-29" stroke="#8da8bd" stroke-width="3" opacity=".9"/>
  <ellipse cx="343" cy="255" rx="7" ry="13" transform="rotate(-17 343 255)" fill="#09101e" stroke="#ffc76e" stroke-width="3"/>
  <circle cx="250" cy="300" r="19" fill="#121a2d" stroke="#ffc76e" stroke-width="4"/><circle cx="250" cy="300" r="7" fill="#8ca5ba"/>
  <circle cx="310" cy="286" r="16" fill="#121a2d" stroke="#ffc76e" stroke-width="4"/><circle cx="310" cy="286" r="6" fill="#8ca5ba"/>
  <path class="muzzle" d="M353 249l10-15 3 13 15 3-14 7-5 13-7-12-13-2z" fill="#ffc76e" stroke="#ffe6ab" stroke-width="2" filter="url(#small-glow)"/>
  ${friend(119,285,.82,'#ffc76e',1,'none')}${friend(192,278,.67,'#79e6d7',0,'none')}
  ${builder(737,288,.48,'#ffc76e','brick')}${builder(911,258,.46,'#79e6d7','hammer')}
  <path d="M428 353l43-23 66 6 37 21-19 27H446Z" fill="#17223a" stroke="#ad668b" stroke-width="2"/>
  <g transform="translate(504 335)">
    <path d="M-19-45l-9-21 19 9m28 12 9-21-19 9" fill="#6f3b62" stroke="#e46d94" stroke-width="2"/>
    <circle cy="-45" r="19" fill="#38253f" stroke="#e46d94" stroke-width="2.5"/>
    <path d="M-11-48h7m8 0h7" stroke="#ff719d" stroke-width="3" stroke-linecap="round"/>
    <path d="M-21-22q21-10 42 0l9 28h-60z" fill="#2b2540" stroke="#8b6d9d" stroke-width="2"/>
    <path d="M-24-8l13-5 24 1 13 5-4 17h-42z" fill="#10182b" stroke="#e46d94" stroke-width="2"/>
    <text x="0" y="3" text-anchor="middle" fill="#e46d94" font-size="10" font-weight="700">0x!</text>
  </g>
  <path d="M535 326Q621 302 702 282" fill="none" stroke="#e46d94" stroke-width="2" stroke-dasharray="4 8" class="test-shot"/>
  <g class="denied"><rect x="578" y="342" width="198" height="28" rx="5" fill="#2a1328" stroke="#e46d94" stroke-width="1.5"/>
    <text x="677" y="361" text-anchor="middle" fill="#ffc4d3" font-size="13" font-weight="700" letter-spacing="1">ACCESS DENIED</text></g>
  </svg>\n`.replace(/[ \t]+$/gm, '')
}
