(()=>{const root=document.getElementById('content'),D=window.HONGIK_DATA;if(!root||!D)return;
function render(){if(location.hash!=='#reality')return;
for(const card of root.querySelectorAll('.card')){
 const h=card.querySelector(':scope > h3');if(!h||card.querySelector('.reader-feas'))continue;
 const row=D.feasibility.rows.find(x=>x.subject===h.textContent.trim());if(!row)continue;
 const e=document.createElement('p');e.className='reader-easy reader-feas';e.textContent='쉽게 말하면 · '+row.easy;
 const more=document.createElement('details');more.className='reader-more';
 const s=document.createElement('summary');s.textContent='원래 조사내용과 근거 자세히 보기';more.append(s);
 let n=h.nextSibling;while(n&&!n.classList?.contains('fact-links')){const next=n.nextSibling;more.append(n);n=next;}
 h.after(e,more);
}}
new MutationObserver(render).observe(root,{childList:true});render();})();