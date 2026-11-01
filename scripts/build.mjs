/*
 * HTML 단일 소스를 수정하지 않고 GitHub Pages용 정적 산출물만 만든다.
 * PNG 아이콘은 Node 표준 라이브러리(zlib)로 생성하므로 추가 그래픽 의존성이 없다.
 */
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import { deflateSync } from 'node:zlib'
const output='dist'
await mkdir(output,{recursive:true})
await copyFile('index.html',join(output,'index.html'))
for(const f of ['manifest.webmanifest','sw.js','favicon.svg','robots.txt']) {
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
const html=await readFile(join(output,'index.html'),'utf8')
if(!html.includes('window.HONGIK_DATA')||!html.includes('</html>'))throw Error('index.html missing main app')
console.log('Built protected PWA assets:',html.length,'characters')


// New self-study tab is assembled in the deployment artifact; index.html stays untouched.
const foreignLanguageParts=[
  '01-summary.html','02-rules.html','03-contact.html'
];
const foreignHTML=(await Promise.all(foreignLanguageParts.map(f=>readFile(join('public','foreign-language',f),'utf8')))).join('\n');
const foreignCSS=await readFile(join('public','foreign-language','foreign-language.css'),'utf8');
let publishedHTML=html;
const foreignNavAnchor='<button class="nav-btn" data-page="research">';
const foreignRouteAnchor="const pages={home:{tag:'OVERVIEW',fn:home}";
const foreignRouteEnd="dossier:{tag:'DOSSIER',fn:dossier}};";
if(!publishedHTML.includes(foreignNavAnchor)||!publishedHTML.includes(foreignRouteAnchor)||!publishedHTML.includes(foreignRouteEnd))throw Error('Foreign exam tab integration anchors have changed');
publishedHTML=publishedHTML.replace(foreignNavAnchor,'<button class="nav-btn" data-page="foreign"><span class="nav-num">語</span>외국어시험·JLPT<span class="nav-arrow">↗</span></button>\n'+foreignNavAnchor);
publishedHTML=publishedHTML.replace(foreignRouteAnchor,'function foreignExam(){return '+JSON.stringify(foreignHTML).replace(/<\/script/gi,'<\\/script')+';}\n'+foreignRouteAnchor);
publishedHTML=publishedHTML.replace(foreignRouteEnd,"dossier:{tag:'DOSSIER',fn:dossier},foreign:{tag:'FOREIGN LANGUAGE',fn:foreignExam}};");
publishedHTML=publishedHTML.replace('</head>','<style>\n'+foreignCSS+'\n</style>\n</head>');
publishedHTML=publishedHTML.replace('v3.7 ↻','v3.9 ↻').replace('20261101-logo-woojae-v37#home','20261101-foreign-exam-v39#foreign').replace('2026.11.01 · 초상 로고 반영 · v3.7','2026.11.01 · 외국어시험 탭 추가 · v3.9');
const foreignCopyJS="<script>\n(function(){document.addEventListener('click',async function(e){var b=e.target.closest('[data-lang-copy]');if(!b)return;var el=document.getElementById('lang-inquiry');if(!el)return;try{await navigator.clipboard.writeText(el.innerText);b.textContent='복사 완료 ✓';}catch(err){b.textContent='길게 눌러 선택해서 복사';}});})();\n</script>\n";
publishedHTML=publishedHTML.replace('</body>',foreignCopyJS+'</body>');
if(!publishedHTML.includes("foreign:{tag:'FOREIGN LANGUAGE',fn:foreignExam}")||!foreignHTML.includes('id="lang-inquiry"')||!publishedHTML.includes('v3.9 ↻'))throw Error('Foreign exam tab missing from output');
await writeFile(join(output,'index.html'),publishedHTML);
console.log('Added standalone foreign exam tab:',foreignHTML.length,'chars');
