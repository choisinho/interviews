/*
 * 내용 보존 검사: 배포 HTML에서 한글이 들어간 텍스트 조각(atom)을 추출한다.
 *   node scripts/content-atoms.mjs extract <built.html> [extra.html...] > atoms.json
 *   node scripts/content-atoms.mjs check <atoms.json> <built.html> [extra.html...]
 * check는 기준 조각 중 새 빌드에서 찾을 수 없는 것을 나열한다(공백·HTML 엔티티 차이는 무시).
 */
import { readFileSync } from 'node:fs'
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\n/g, ' ').replace(/\\"/g, '"').replace(/\'/g, "'")
const norm = s => decode(s).replace(/\s+/g, '').replace(/[·•]/g, '·')
function corpus(files) {
  return files.map(f => readFileSync(f, 'utf8')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/data:[a-z]+\/[a-z+.-]+;base64,[A-Za-z0-9+/=]+/g, ' ')).join('\n')
}
function atoms(text) {
  const out = new Set()
  for (const piece of text.split(/<[^>]*>|\$\{[^}]*\}|["'`]\s*\+|\+\s*["'`]|["`]|\n|[{}]|\n/)) {
    const t = decode(piece).replace(/\s+/g, ' ').trim()
    if (t.length >= 6 && /[가-힣]/.test(t)) out.add(t)
  }
  return [...out]
}
const [mode, a, ...rest] = process.argv.slice(2)
if (mode === 'extract') {
  console.log(JSON.stringify(atoms(corpus([a, ...rest])), null, 0))
} else if (mode === 'check') {
  const base = JSON.parse(readFileSync(a, 'utf8'))
  const hay = norm(corpus(rest))
  const missing = base.filter(t => !hay.includes(norm(t)))
  console.log(JSON.stringify({ total: base.length, missing: missing.length, items: missing }, null, 1))
  process.exitCode = missing.length ? 1 : 0
} else {
  console.error('usage: extract|check'); process.exitCode = 2
}
