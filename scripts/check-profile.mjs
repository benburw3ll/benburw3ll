import { readFileSync } from 'node:fs'

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
const manifesto = '<p align="center"><i>"My crime is that of outsmarting you, something that you will never forgive me for."</i><br>&mdash; The Mentor, <a href="https://phrack.org/issues/7/hackers-manifesto"><i>The Hacker\'s Manifesto</i></a>, 1986</p>'
if (!readme.includes(manifesto)) throw new Error("The Hacker's Manifesto quote, attribution, and link must remain in README.md")

const beforeQuote = readme.slice(0, readme.indexOf(manifesto))
if (beforeQuote.replace(/<!--[^]*?-->/g, '').trim()) {
  throw new Error("The Hacker's Manifesto quote must remain the first visible content in README.md")
}
