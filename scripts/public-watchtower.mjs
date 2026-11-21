// A self-contained public-source scene for the profile. No live data.
const friend = (x, y, scale, color, pose = 0, prop = 'spark') => `<g transform="translate(${x} ${y}) scale(${scale})">
  <ellipse cx="0" cy="2" rx="22" ry="5" fill="#02050d" opacity=".7"/>
  <path d="M17-28q28-6 31 12 2 11-9 15" fill="none" stroke="#a86583" stroke-width="6" stroke-linecap="round"/>
  <path d="M37-2l14-10-1 17z" fill="${color}" stroke="#281c35" stroke-width="2"/>
  <path d="M-17-43q-21-24-37-8l10 5-5 17 15-7 12 12 11-9M17-43q21-24 37-8l-10 5 5 17-15-7-12 12-11-9" fill="#452b51" stroke="${color}" stroke-opacity=".78" stroke-width="2" stroke-linejoin="round"/>
  <path d="M-10-19l-8 20h11l8-15m9-5 8 20H7L-1-14" fill="#241a31" stroke="${color}" stroke-width="2"/>
  <path d="M-18-51q-13 17-8 35l15 4 11-6 11 6 15-4q5-18-8-35z" fill="#35243e" stroke="#aa758e" stroke-width="2.5"/>
  <path d="M-23-67q-14-3-16-16l17 7m45 9q14-3 16-16l-17 7" fill="#a86583" stroke="#e0a879" stroke-width="2"/>
  <path d="M-21-70q-15-9-10-36 8 13 17 13l-1 18M21-70q15-9 10-36-8 13-17 13l1 18" fill="#d9ae78" stroke="#76536d" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M-21-72q20-18 42 0l3 24q-22 19-48 0z" fill="#94607d" stroke="#e0a879" stroke-width="2.5"/>
  <path d="M-19-74q20-12 38 0" fill="none" stroke="#c58293" stroke-width="2"/>
  <circle cx="-9" cy="-56" r="7" fill="#121421" stroke="${color}" stroke-width="2.5"/>
  <circle cx="9" cy="-56" r="7" fill="#121421" stroke="${color}" stroke-width="2.5"/>
  <path d="M-9-61v10m18-10v10" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
  <path d="M-7-41q7 5 14 0m-12-1 1 5m9-5-1 5" fill="none" stroke="#f9e2ce" stroke-width="2" stroke-linecap="round"/>
  <path d="M-19-34l-13 ${pose ? -17 : -7}m50-17 23-21" stroke="#ad708d" stroke-width="7" stroke-linecap="round"/>
  ${prop === 'spark' ? `<path d="M38-70l18-7m-18 7 17 4" stroke="${color}" stroke-width="3" stroke-linecap="round"/><circle cx="43" cy="-70" r="4" fill="${color}" filter="url(#small-glow)"/>` : ''}
</g>`

const builder = (x, y, scale, color, tool) => `${friend(x, y, scale, color, 1, 'none')}<g transform="translate(${x} ${y}) scale(${scale})">
  <path d="M-23-75q2-18 23-18t23 18v6h-46z" fill="#ffc76e" stroke="#9b6f42" stroke-width="2.5"/>
  <path d="M-29-70h58" stroke="#f7df9e" stroke-width="5" stroke-linecap="round"/>
  ${tool === 'brick' ? '<rect x="38" y="-77" width="28" height="16" rx="2" fill="#8ba8bd" stroke="#d2e0dd" stroke-width="2"/><path d="M52-77v16" stroke="#d2e0dd" stroke-opacity=".5"/>' : '<path d="M43-71l17-23" stroke="#d2e0dd" stroke-width="3"/><path d="M47-96h23v9H47z" fill="#8ba8bd" stroke="#d2e0dd" stroke-width="2"/>'}
</g>`

export function renderPublicWatchtower() {
  const stars = Array.from({ length: 95 }, (_, i) => {
    const x = 12 + ((i * 173 + i * i * 19) % 936)
    const y = 16 + ((i * 79 + i * i * 11) % 348)
    return `<circle cx="${x}" cy="${y}" r="${i % 13 ? .65 : 1.5}" fill="#dbe8ff" opacity="${i % 7 ? .16 : .38}"/>`
  }).join('')
  const bridgePlanks = Array.from({ length: 13 }, (_, i) => {
    const x = 355 + i * 29
    const y = 300 - (x - 337) * .061
    return `<path d="M${x} ${y}l2 21" stroke="#b6eee8" stroke-opacity="${i % 3 ? .32 : .55}" stroke-width="2"/>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" width="960" height="420" role="img" aria-label="The Silas Portals source stays private. Little horned demons cross a luminous bridge to the Overlord Watchtower while their friends test its shield with a cannon; its defenses remain online." font-family="'Cascadia Code', Consolas, 'Liberation Mono', monospace">
  <title>The gate is open: little demons build and guard the Silas Portals watchtower</title>
  <defs>
    <radialGradient id="sky"><stop stop-color="#1b2440"/><stop offset=".55" stop-color="#0b1123"/><stop offset="1" stop-color="#050711"/></radialGradient>
    <linearGradient id="canyon" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#18223b"/><stop offset="1" stop-color="#03050d"/></linearGradient>
    <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#283c58"/><stop offset=".5" stop-color="#101a2d"/><stop offset="1" stop-color="#080c18"/></linearGradient>
    <linearGradient id="bridge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#d2fff2"/><stop offset=".22" stop-color="#7ce4d8"/><stop offset=".55" stop-color="#205474"/><stop offset="1" stop-color="#11192e"/></linearGradient>
    <radialGradient id="portal"><stop stop-color="#f7f3d8"/><stop offset=".35" stop-color="#95f5e2"/><stop offset=".7" stop-color="#2f9ea6"/><stop offset="1" stop-color="#0c172d"/></radialGradient>
    <filter id="glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="small-glow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3"/></filter>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5H4" stroke="#fff" stroke-opacity=".03"/></pattern>
  </defs>
  <style>
    @keyframes fire { to { stroke-dashoffset: -88 } }
    @keyframes shield { 50% { opacity: .48 } }
    @keyframes gate { 50% { opacity: .58; transform: scale(1.16) } }
    @keyframes bridge-flow { to { stroke-dashoffset: -54 } }
    @keyframes spark { 50% { transform: scale(1.35); opacity: .85 } }
    @keyframes muzzle { 0%, 13%, 100% { opacity: .15; transform: scale(.45) } 4% { opacity: 1; transform: scale(1.25) } }
    @media (prefers-reduced-motion: no-preference) {
      .test-shot { animation: fire 3s linear infinite }
      .shield { animation: shield 4s ease-in-out infinite }
      .gate-pulse { transform-origin: 808px 216px; animation: gate 3.6s ease-in-out infinite }
      .bridge-flow { animation: bridge-flow 4s linear infinite }
      .spark { transform-origin: center; animation: spark 1.4s ease-in-out infinite }
      .muzzle { transform-origin: 353px 249px; animation: muzzle 3.2s ease-out infinite }
    }
    @media (prefers-reduced-motion: reduce) { .moving-ball { display: none } }
  </style>
  <rect width="960" height="420" fill="url(#sky)"/>${stars}<rect width="960" height="420" fill="url(#scan)"/>
  <path d="M22 28h166m584 0h166M22 392h916" stroke="#7a91af" stroke-opacity=".35"/>
  <text x="480" y="65" text-anchor="middle" fill="#f2ecdf" font-size="41" font-weight="700" letter-spacing="4">THE GATE IS OPEN</text>
  <text x="480" y="94" text-anchor="middle" fill="#79e6d7" font-size="14" font-weight="700" letter-spacing="2">PRIVATE BUILD  ·  DEFENSES ONLINE</text>
  <path d="M0 282L138 262L236 280L322 270L362 300L337 420H0ZM960 278L861 264L766 279L704 270L660 307L681 420H960Z" fill="url(#stone)" stroke="#71849e" stroke-width="3"/>
  <path d="M339 301Q480 365 671 305L681 420H337Z" fill="url(#canyon)"/>
  <path d="M367 317Q474 354 652 320M360 340Q473 385 660 343M353 370Q476 405 668 372" fill="none" stroke="#7e80a8" stroke-opacity=".17" stroke-width="2"/>
  <path d="M339 301L743 275L743 291L339 324Z" fill="#79e6d7" opacity=".28" filter="url(#glow)"/>
  <path d="M339 301L743 275L743 291L339 324Z" fill="url(#bridge)" stroke="#b7fff1" stroke-width="2"/>
  <path d="M345 300L737 275M345 322L737 291" fill="none" stroke="#b8fff1" stroke-opacity=".8" stroke-width="3"/>
  <path d="M345 310L737 283" fill="none" stroke="#ecffff" stroke-width="2" stroke-dasharray="18 12" stroke-opacity=".75" class="bridge-flow"/>
  ${bridgePlanks}
  <path d="M343 300v-21m44 18v-21m44 18v-21m44 18v-21m44 18v-21m44 18v-21m44 18v-21m44 18v-21m44 18v-21" fill="none" stroke="#8cece0" stroke-opacity=".75" stroke-width="2"/>
  <path d="M343 279L735 253" fill="none" stroke="#8cece0" stroke-opacity=".48" stroke-width="2"/>
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
  <path d="M788 203q20-27 40 0v35h-40z" fill="url(#portal)" stroke="#f1e3ad" stroke-width="3"/>
  <ellipse class="gate-pulse" cx="808" cy="216" rx="17" ry="24" fill="#79e6d7" opacity=".34" filter="url(#glow)"/>
  <path d="M808 195v35m-12-24 12-11 12 11m-24 13 12 11 12-11" fill="none" stroke="#f6f3d8" stroke-opacity=".85" stroke-width="2"/>
  <circle cx="808" cy="216" r="4" fill="#fff9da" filter="url(#small-glow)"/>
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
    <path d="M21-15q27-10 30 9 2 11-8 15" fill="none" stroke="#a6557a" stroke-width="6" stroke-linecap="round"/>
    <path d="M41 8l13-9-2 16z" fill="#ff719d" stroke="#54274c" stroke-width="2"/>
    <path d="M-18-31q-16-16-27-8l8 5-4 12 12-5 11 9M18-31q16-16 27-8l-8 5 4 12-12-5-11 9" fill="#492b51" stroke="#e46d94" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-19-45l-9-21 19 9m28 12 9-21-19 9" fill="#6f3b62" stroke="#e46d94" stroke-width="2"/>
    <circle cy="-45" r="19" fill="#38253f" stroke="#e46d94" stroke-width="2.5"/>
    <path d="M-11-48h7m8 0h7" stroke="#ff719d" stroke-width="3" stroke-linecap="round"/>
    <path d="M-5-37l2 4m8-4-2 4" stroke="#ffd7dd" stroke-width="2" stroke-linecap="round"/>
    <path d="M-21-22q21-10 42 0l9 28h-60z" fill="#2b2540" stroke="#8b6d9d" stroke-width="2"/>
    <path d="M-24-8l13-5 24 1 13 5-4 17h-42z" fill="#10182b" stroke="#e46d94" stroke-width="2"/>
    <text x="0" y="3" text-anchor="middle" fill="#e46d94" font-size="10" font-weight="700">0x!</text>
  </g>
  <path d="M535 326Q621 302 702 282" fill="none" stroke="#e46d94" stroke-width="2" stroke-dasharray="4 8" class="test-shot"/>
  <g><rect x="578" y="342" width="198" height="28" rx="5" fill="#152c3a" stroke="#79e6d7" stroke-width="1.5"/>
    <circle cx="595" cy="356" r="4" fill="#79e6d7" filter="url(#small-glow)"/><circle cx="595" cy="356" r="3" fill="#79e6d7"/>
    <text x="678" y="361" text-anchor="middle" fill="#c5fff5" font-size="13" font-weight="700" letter-spacing="1">SHIELD ONLINE</text></g>
  </svg>\n`.replace(/[ \t]+$/gm, '')
}
