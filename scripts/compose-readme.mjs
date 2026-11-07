// Place the three self-contained scenes on one continuous SVG plane. Prefix IDs so
// gradients, clips and filters from the scenes cannot shadow one another.
const nest = (source, x, y, prefix) => {
  const opening = /^<svg\b[^>]*>/s.exec(source)
  const dimensions = /\bviewBox="0 0 (\d+) (\d+)"/.exec(opening?.[0] ?? '')
  const width = Number(dimensions?.[1]), height = Number(dimensions?.[2])
  if (!opening || !width || !height || !source.trimEnd().endsWith('</svg>')) throw new Error(`Invalid ${prefix} scene`)
  const svg = source
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}-${id})`)
    .replace(/\bhref="#([^"]+)"/g, (_, id) => `href="#${prefix}-${id}"`)
    .replace(opening[0], `<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">`)
  return { svg, width, height }
}

export function composeReadme(hero, castle, board, telegram) {
  const heroScene = nest(hero, 0, 0, 'hero')
  const castleScene = nest(castle, 0, heroScene.height, 'castle')
  const boardScene = nest(board, 0, heroScene.height + castleScene.height, 'board')
  const telegramY = heroScene.height + castleScene.height + boardScene.height + 24
  const telegramWidth = Number(/\bviewBox="0 0 (\d+) /.exec(telegram)?.[1])
  const telegramScene = nest(telegram, (960 - telegramWidth) / 2, telegramY, 'telegram')
  const height = telegramY + telegramScene.height + 24
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${height}" width="960" height="${height}" role="img" aria-label="Silas Portals: Silas runs among portals; imaginary friends build the Overlord Watchtower and test it with a cannon while a rogue hacker is denied; the live ledger and Telegram conversation complete the world." font-family="'Cascadia Code', Consolas, 'Liberation Mono', monospace">
  <title>Silas Portals: one growing world, one live watchtower</title>
  <defs><radialGradient id="world-phone-halo"><stop stop-color="#79e6d7" stop-opacity=".13"/><stop offset="1" stop-color="#79e6d7" stop-opacity="0"/></radialGradient></defs>
  <rect width="960" height="${height}" fill="#050711"/>
  ${heroScene.svg}
  ${castleScene.svg}
  ${boardScene.svg}
  <ellipse cx="480" cy="${telegramY + 350}" rx="415" ry="365" fill="url(#world-phone-halo)"/>
  <circle cx="480" cy="${telegramY + 350}" r="342" fill="none" stroke="#79e6d7" stroke-opacity=".12" stroke-width="3"/>
  <circle cx="480" cy="${telegramY + 350}" r="370" fill="none" stroke="#b8a0fc" stroke-opacity=".1" stroke-dasharray="8 15"/>
  ${telegramScene.svg}
</svg>\n`
}
