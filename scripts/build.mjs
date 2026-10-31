/*
 * HTML 단일 소스를 수정하지 않고 Cloudflare용 정적 산출물만 만든다.
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
     const roundRect=(l,t,r,b,rad)=>{
       const px=Math.max(l,Math.min(x/size,r)),py=Math.max(t,Math.min(y/size,b))
       return Math.hypot(x/size-px,y/size-py)<=rad
     }
     const soft=(Math.hypot(fx-.52,fy-.48)<.55)
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
