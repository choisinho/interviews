/*
 * 개인용 홍익대 면접 아틀리에의 비공개 읽기 문.
 * ACCESS_KEY는 Cloudflare Worker Secret으로만 설정한다.
 * Private GitHub 리포지토리의 코드가 배포된다고 해서 공개 정적 사이트가 되지 않도록
 * 모든 민감한 정적 경로를 인증 후에만 ASSETS.fetch로 건넨다.
 */
const COOKIE = '__Host-interviews_session'
const DAYS = 120
const TTL = DAYS * 86400
const enc = new TextEncoder()
const failed = new Map()
const PUBLIC = new Set(['/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon.svg', '/robots.txt'])
const C = {
  'referrer-policy': 'no-referrer',
  'x-robots-tag': 'noindex, nofollow, noarchive',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'strict-transport-security': 'max-age=31536000',
  'cache-control': 'private, no-store'
}
const CSP = "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'self'"

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
}
function headers(type='text/html; charset=utf-8') {
  return {'content-type':type,...C,...(type.startsWith('text/html')?{'content-security-policy':CSP}:{})}
}
function page(body,status=200,extra={}) {
  return new Response(body,{status,headers:{...headers(),...extra}})
}
function redirect(to,extra={}) {
  return new Response(null,{status:303,headers:{...C,location:to,...extra}})
}
function safePath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.length>300) return '/'
  if (/\r|\n/.test(value) || value.startsWith('/login') || value.startsWith('/logout')) return '/'
  return value
}
function cookie(request) {
  const raw=request.headers.get('cookie')||''
  const entry=raw.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))
  return entry?entry.slice(COOKIE.length+1):''
}
function base64url(buf) {
  let str=''
  for(const byte of new Uint8Array(buf)) str+=String.fromCharCode(byte)
  return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}
async function hmac(data,key) {
  const k=await crypto.subtle.importKey('raw',enc.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign'])
  return base64url(await crypto.subtle.sign('HMAC',k,enc.encode(data)))
}
async function digest(str){
  return new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(str)))
}
function equalBytes(a,b){
  if(a.length!==b.length)return false
  let d=0;for(let i=0;i<a.length;i++)d|=a[i]^b[i]
  return d===0
}
async function keyMatches(input,secret){
  return equalBytes(await digest(input),await digest(secret))
}
async function authorized(request,secret) {
  const token=cookie(request)
  const m=/^(\d{10,11})\.([\w-]{42,45})$/.exec(token)
  if(!m) return false
  const exp=Number(m[1])
  if(!Number.isSafeInteger(exp) || exp <= Math.floor(Date.now()/1000) || exp>Math.floor(Date.now()/1000)+TTL) return false
  const signed=await hmac(m[1],secret)
  return m[2]===signed
}
async function issue(secret){
  const expires=String(Math.floor(Date.now()/1000)+TTL)
  const sig=await hmac(expires,secret)
  return COOKIE+'='+expires+'.'+sig+'; Max-Age='+TTL+'; Path=/; Secure; HttpOnly; SameSite=Strict'
}
function loginHtml(next, error=''){
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101a18"><title>면접 아틀리에 · 개인 열쇠</title><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/favicon.svg"><style>*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#101a18;color:#eaf4e7;font:15px/1.85 system-ui,-apple-system,'Malgun Gothic',sans-serif;padding:24px}.sheet{width:min(100%,440px);background:#1e3028;padding:36px;border:1px solid #344b3c;border-radius:22px}.over{font-size:10px;letter-spacing:.2em;color:#b3d99f;font-weight:750}.symbol{display:grid;place-items:center;background:#cde9a6;color:#13281e;border-radius:14px;width:50px;height:50px;font-size:23px;font-weight:900;margin-bottom:24px}h1{font-size:28px;letter-spacing:-.06em;line-height:1.45;margin:12px 0 13px}p{color:#b5c5b8;font-size:13px;margin-bottom:26px}input{width:100%;border:1px solid #627768;background:#102018;border-radius:10px;padding:15px;color:white;font-size:16px;outline-offset:3px}button{width:100%;background:#d4edae;color:#183425;border:0;border-radius:11px;padding:15px;font-weight:800;font-size:14px;margin-top:12px}.error{color:#ffd0be;font-size:12px;margin:8px 0}</style></head><body><section class="sheet"><div class="symbol">AI</div><div class="over">PRIVATE STUDY · INTERVIEW ATELIER</div><h1>면접 아틀리에</h1><p>모래성처럼 개인 열쇠로 들어오는 공간이야. 한 번 열면 휴대폰 홈 화면 아이콘으로 다시 들어올 수 있어.</p><form method="post" action="/login"><input type="hidden" name="next" value="${escape(next)}"><label for="key" style="display:block;font-size:12px;margin-bottom:8px">개인 열쇠</label><input id="key" type="password" name="key" placeholder="개인 열쇠 입력" autocomplete="current-password" required autofocus><button type="submit">아틀리에 들어가기 →</button></form>${error?'<p class="error" role="alert">'+escape(error)+'</p>':''}</section></body></html>`
}
function throttle(ip){
  const now=Date.now()
  const n=failed.get(ip)||[]
  const recent=n.filter(x=>now-x<5*60*1000)
  failed.set(ip,recent)
  if(failed.size>3000)failed.clear()
  return recent.length>=8
}
function failure(ip) { const list=failed.get(ip)||[];list.push(Date.now());failed.set(ip,list) }

export default {
 async fetch(request, env){
  const url=new URL(request.url)
  const path=url.pathname
  // 키 미설정 때는 앱 데이터를 절대 내보내지 않는다.
  const secret=env.ACCESS_KEY
  if(!secret || secret.length<16)return page('<h1>개인 열쇠 미설정</h1><p>Cloudflare Worker에 ACCESS_KEY Secret을 설정해야 열려.</p>',503)
  if(PUBLIC.has(path) && (request.method==='GET'||request.method==='HEAD')){
    const response=await env.ASSETS.fetch(request)
    const h=new Headers(response.headers)
    for(const [k,v] of Object.entries(C))h.set(k,v)
    h.set('cache-control','public, max-age=3600')
    return new Response(response.body,{status:response.status,headers:h})
  }
  const logged=await authorized(request,secret)
  if(path==='/login'){
    if(request.method==='POST'){
      const ip=request.headers.get('cf-connecting-ip')||'unknown'
      if(throttle(ip))return page(loginHtml('/','잠깐 뒤에 다시 시도해줘.'),429)
      const form=await request.formData().catch(()=>null)
      const key=String(form?.get('key')||'')
      const next=safePath(String(form?.get('next')||'/'))
      if(key.length<1000 && await keyMatches(key,secret)){
        failed.delete(ip)
        return redirect(next,{'set-cookie':await issue(secret)})
      }
      failure(ip)
      return page(loginHtml(next,'열쇠가 맞지 않아.'),401)
    }
    if(logged)return redirect(safePath(url.searchParams.get('next')||'/'))
    return page(loginHtml(safePath(url.searchParams.get('next')||'/')))
  }
  if(path==='/logout' && request.method==='POST'){
    return redirect('/login',{'set-cookie':COOKIE+'=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Strict'})
  }
  if(!logged){
    if(request.method!=='GET'&&request.method!=='HEAD')return page('Method not allowed',405)
    return redirect('/login?next='+encodeURIComponent(safePath(url.pathname+url.search)))
  }
  if(request.method!=='GET'&&request.method!=='HEAD')return page('Method not allowed',405)
  // 로그인 성공 전에는 앱의 HTML과 스크립트가 단 한 줄도 전송되지 않는다.
  const response=await env.ASSETS.fetch(request)
  const h=new Headers(response.headers)
  for(const [k,v] of Object.entries(C))h.set(k,v)
  if((h.get('content-type')||'').includes('text/html'))h.set('content-security-policy',CSP)
  return new Response(response.body,{status:response.status,headers:h})
 }
}
