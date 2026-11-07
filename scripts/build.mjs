/*
 * index.html 셸과 public/ 소스를 하나의 오프라인 HTML(dist/index.html)로 묶어 GitHub Pages용 산출물을 만든다.
 * index.html의 로컬 <script src="./public/..."> / <link rel="stylesheet" href="./public/..."> 태그는 모두 인라인된다.
 * PNG 아이콘은 Node 표준 라이브러리(zlib)로 생성하므로 추가 그래픽 의존성이 없다.
 */
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { deflateSync } from 'node:zlib'
import { Script, createContext } from 'node:vm'
const output='dist'
await mkdir(output,{recursive:true})
for(const f of ['manifest.webmanifest','favicon.svg','robots.txt']) {
 await copyFile(join('public',f),join(output,f))
}
function crc32(bytes){
 let crc=0xffffffff
 for(const n of bytes){crc^=n;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}
 return (crc^0xffffffff)>>>0
}
function chunk(type, bytes){
 const t=Buffer.from(type), l=Buffer.alloc(4), c=Buffer.alloc(4)
 l.writeUInt32BE(bytes.length)
 c.writeUInt32BE(crc32(Buffer.concat([t,bytes])))
 return Buffer.concat([l,t,bytes,c])
}
function icon(size){
 const raw=Buffer.alloc(size*(1+4*size))
 const c=size/2
 const scale=size/512
 for(let y=0;y<size;y++){
   const row=y*(1+4*size);raw[row]=0
   for(let x=0;x<size;x++){
     const fx=x/size, fy=y/size
     let rgb=[16,34,27]
     if(fx>.26&&fx<.49&&fy>.26&&fy<.49)rgb=[205,232,166]
     if(fx>.52&&fx<.74&&fy>.26&&fy<.49 && (fx<.545||fx>.715||fy<.285||fy>.465))rgb=[205,232,166]
     if(fx>.26&&fx<.49&&fy>.52&&fy<.74 &&(fx<.285||fx>.465||fy<.545||fy>.715))rgb=[205,232,166]
     if(fx>.52&&fx<.74&&fy>.52&&fy<.74)rgb=[205,232,166]
     const i=row+1+4*x
     raw[i]=rgb[0];raw[i+1]=rgb[1];raw[i+2]=rgb[2];raw[i+3]=255
   }
 }
 const header=Buffer.alloc(13)
 header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))])
}
for(const size of [192,512])await writeFile(join(output,'icon-'+size+'.png'),icon(size))

// 1) index.html의 로컬 public/ 스크립트·스타일 태그를 모두 인라인한다(오프라인 단일 HTML, file:// 에서도 동작).
const shell=await readFile('index.html','utf8')
if(!shell.includes('</html>'))throw Error('index.html missing closing </html>')
// 속성 순서·추가 속성과 무관하게 <script ... src="./public/x.js" ...></script>, <link ... rel="stylesheet" ... href="./public/x.css" ...>를 잡는다.
const localTag=/<script\b[^>]*?\ssrc="\.\/(public\/[^"]+\.js)"[^>]*><\/script>|<link\b(?=[^>]*\srel="stylesheet")[^>]*?\shref="\.\/(public\/[^"]+\.css)"[^>]*>/g
const inlined=[]
const sources={}
for(const m of shell.matchAll(localTag)){const path=m[1]||m[2];if(!(path in sources))sources[path]=await readFile(path,'utf8')}
const publishedHTML=shell.replace(localTag,(tag,js,css)=>{
 const path=js||css, source=sources[path]
 if(/<\/(script|style)/i.test(source))throw Error('closing tag inside inlined source: '+path)
 inlined.push(path)
 return js?'<script>\n'+source+'\n</script>':'<style>\n'+source+'\n</style>'
})
if(/(?:src|href)="\.\/public\//.test(publishedHTML))throw Error('local ./public/ asset left un-inlined: '+publishedHTML.match(/(?:src|href)="\.\/public\/[^"]*"/)[0])
for(const need of ['public/app/app.js','public/app/app.css','public/schools/hongik.js','public/schools/ajou.js','public/graduation/graduation.js','public/graduation/graduation.css','public/wms/reader.js'])if(!inlined.includes(need))throw Error('required source not loaded by index.html: '+need)
if(!publishedHTML.includes('window.HONGIK_DATA'))throw Error('index.html missing main app data')

// 2) 인라인 스크립트 문법 검사.
const scripts=[...publishedHTML.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1])
for(const [i,code] of scripts.entries())new Script(code,{filename:'published-inline-'+i})

// 3) 학교 자료 검사: 홍익대·아주대 존재, 아주대 data가 홍익대 data의 최상위 키(객체면 그 안의 필드까지)를 모두 가짐.
const sandbox={window:{}};createContext(sandbox)
for(const path of inlined.filter(p=>p.startsWith('public/schools/')))new Script(sources[path],{filename:path}).runInContext(sandbox)
const SCHOOLS=sandbox.window.ATELIER_SCHOOLS||{}
for(const id of ['hongik','ajou'])if(!SCHOOLS[id]||!SCHOOLS[id].meta||!SCHOOLS[id].data)throw Error('school missing: '+id)
if(sandbox.window.HONGIK_DATA!==SCHOOLS.hongik.data)throw Error('window.HONGIK_DATA alias missing')
if(SCHOOLS.hongik.meta.storageKey!=='hongik-study-v2')throw Error('Hongik storage key must stay hongik-study-v2')
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v)
for(const [id,s] of Object.entries(SCHOOLS)){
 if(id==='hongik')continue
 for(const [k,v] of Object.entries(SCHOOLS.hongik.data)){
  if(!(k in s.data))throw Error(id+'.data missing key: '+k)
  if(Array.isArray(v)!==Array.isArray(s.data[k])||typeof v!==typeof s.data[k])throw Error(id+'.data.'+k+' has a different type')
  if(isObj(v))for(const f of Object.keys(v))if(!(f in s.data[k]))throw Error(id+'.data.'+k+' missing field: '+f)
 }
 if(!s.meta.storageKey||s.meta.storageKey===SCHOOLS.hongik.meta.storageKey)throw Error(id+' needs its own storageKey')
}
if(!publishedHTML.includes('function graduation()')||!publishedHTML.includes("id:'graduation'"))throw Error('Graduation page missing')

// 4) 결과물 쓰기 + 졸업요건 원문 자료 복사 + 서비스 워커에 빌드 해시 주입.
await writeFile(join(output,'index.html'),publishedHTML)
await mkdir(join(output,'graduation'),{recursive:true})
for(const file of ['degree-methods-page2.jpg','foreign-subjects.pdf'])await copyFile(join('public','graduation',file),join(output,'graduation',file))
const buildHash=createHash('sha256').update(publishedHTML).digest('hex').slice(0,12)
const sw=await readFile(join('public','sw.js'),'utf8')
if(!sw.includes("const BUILD_ID='dev';"))throw Error('sw.js BUILD_ID placeholder missing')
await writeFile(join(output,'sw.js'),sw.replace("const BUILD_ID='dev';",()=>"const BUILD_ID='"+buildHash+"';"))
console.log('Built offline app:',publishedHTML.length,'characters ·',inlined.length,'inlined sources · build',buildHash)
