(()=>{const root=document.getElementById('content'),D=window.HONGIK_DATA;
if(!root||!D)return;
function show(){if(location.hash!=='#research')return;
if(!root.querySelector('.reader-ai-bridge')){const anchor=root.querySelector('.reader-guide')||root.querySelector('.page-intro');
if(anchor){const e=document.createElement('p');e.className='reader-ai-bridge';e.textContent='Arvis(아비스)·GeDAI(제다이)를 업무 보조에 써 본 경험이 연구의 출발점이야. AI가 답을 내놓아도 WMS 관련 자료와 맞는지 확인해야 하니까, 근거를 먼저 찾아주는 방식이 도움이 되는지 비교하려는 거야.';anchor.after(e);}}
root.querySelectorAll('.research-layer').forEach((row,i)=>{if(row.querySelector('.reader-more'))return;const t=row.querySelector('span');if(!t)return;
const old=t.textContent;t.textContent=D.easyResearch.layers[i]||old;
const d=document.createElement('details');d.className='reader-more';const s=document.createElement('summary');s.textContent='전문 표현';const p=document.createElement('p');p.textContent=old;d.append(s,p);row.append(d);
});}new MutationObserver(show).observe(root,{childList:true});show();})();