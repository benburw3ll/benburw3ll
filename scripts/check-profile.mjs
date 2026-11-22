import { readFileSync } from 'node:fs'

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
const manifesto = '<p align="center"><i>"My crime is that of outsmarting you, something that you will never forgive me for."</i><br>&mdash; The Mentor, <a href="https://phrack.org/issues/7/hackers-manifesto"><i>The Hacker\'s Manifesto</i></a>, 1986</p>'
if (!readme.includes(manifesto)) throw new Error("The Hacker's Manifesto quote, attribution, and link must remain in README.md")

const beforeQuote = readme.slice(0, readme.indexOf(manifesto))
const panel = '<p align="center"><img src="assets/github-stats.svg" width="960"'
if (!beforeQuote.includes(panel) || beforeQuote.replace(/<!--[^]*?-->/g, '').replace(/<p align="center"><img src="assets\/github-stats\.svg"[^>]*\/>?<\/p>/, '').trim()) {
  throw new Error("The eight GitHub panels must precede the unchanged Hacker's Manifesto quote")
}
if (!readme.includes('AI psychosis demon') || !readme.includes('Silas appeared in my AI psychosis')) {
  throw new Error('Keep the owner\'s AI psychosis wording in the profile')
}
