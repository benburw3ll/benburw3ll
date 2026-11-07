// A self-contained SVG prologue for the public profile. No private source or live data.
const friend = (x, y, scale, color, pose = 0) => `<g transform="translate(${x} ${y}) scale(${scale})">
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
  <path d="M38-70l18-7m-18 7 17 4" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="43" cy="-70" r="4" fill="${color}" filter="url(#small-glow)"/>
</g>`

export function renderPrivateBanner() {
  const stars = Array.from({ length: 95 }, (_, i) => {
    const x = 12 + ((i * 173 + i * i * 19) % 936)
    const y = 16 + ((i * 79 + i * i * 11) % 348)
    return `<circle cx="${x}" cy="${y}" r="${i % 13 ? .65 : 1.5}" fill="#dbe8ff" opacity="${i % 7 ? .16 : .38}"/>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" width="960" height="420" role="img" aria-label="Private until v1 for development and penetration testing. Three imaginary friends test the Overlord Watchtower across a canyon while an evil imaginary friend tries to hack it and is denied." font-family="'Cascadia Code', Consolas, 'Liberation Mono', monospace">
  <title>Private until v1: the imaginary friends test the Overlord Watchtower</title>
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
    @media (prefers-reduced-motion: no-preference) {
      .test-shot { animation: fire 3s linear infinite }
      .shield { animation: shield 4s ease-in-out infinite }
      .denied { animation: denied 6s steps(1, end) infinite }
      .spark { transform-origin: center; animation: spark 1.4s ease-in-out infinite }
    }
  </style>
  <rect width="960" height="420" fill="url(#sky)"/>${stars}<rect width="960" height="420" fill="url(#scan)"/>
  <path d="M22 28h166m584 0h166M22 392h916" stroke="#7a91af" stroke-opacity=".35"/>
  <text x="480" y="65" text-anchor="middle" fill="#f2ecdf" font-size="41" font-weight="700" letter-spacing="4">PRIVATE UNTIL V1</text>
  <text x="480" y="94" text-anchor="middle" fill="#ffc76e" font-size="14" font-weight="700" letter-spacing="2">DEVELOPMENT + PENETRATION TESTING</text>
  <path d="M0 282L138 262L236 280L322 270L362 300L337 420H0ZM960 278L861 264L766 279L704 270L660 307L681 420H960Z" fill="url(#stone)" stroke="#71849e" stroke-width="3"/>
  <path d="M339 301Q480 365 671 305L681 420H337Z" fill="url(#canyon)"/>
  <path d="M367 317Q474 354 652 320M360 340Q473 385 660 343M353 370Q476 405 668 372" fill="none" stroke="#7e80a8" stroke-opacity=".17" stroke-width="2"/>
  <path d="M20 286L138 270L236 288L322 278M704 278L766 287L861 272L940 286" fill="none" stroke="#79e6d7" stroke-opacity=".65" stroke-width="3"/>
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
  <path class="test-shot" d="M166 221Q393 145 703 214M238 205Q470 184 695 238M307 232Q478 196 707 262" fill="none" stroke="#79e6d7" stroke-width="2.5" stroke-dasharray="12 10" stroke-opacity=".8"/>
  <path d="M701 214l-9-8m9 8-10 8m4 16-8-8m8 8-7 8m19 16-8-8m8 8-6 8" stroke="#ffc76e" stroke-width="2" class="spark"/>
  ${friend(152,286,1.1,'#ffc76e')}${friend(230,281,.92,'#79e6d7',1)}${friend(302,292,.74,'#b8a0fc')}
  <text x="41" y="347" fill="#ffc76e" font-size="11" font-weight="700" letter-spacing="1">FRIENDS TEST THE WALLS</text>
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
  <text x="918" y="401" text-anchor="end" fill="#aab2c7" font-size="10" letter-spacing="1">THE GATE HOLDS UNTIL V1</text>
  </svg>\n`
}
