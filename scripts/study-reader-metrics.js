(()=>{const root=document.getElementById('content'),D=window.HONGIK_DATA;if(!root||!D)return;
function explain(p,meaning){if(!p||p.classList.contains('reader-easy'))return;
const old=p.textContent;p.classList.add('reader-easy');p.textContent=meaning||old;
const d=document.createElement('details');d.className='reader-more';
const s=document.createElement('summary');s.textContent='정확한 평가 기준';const t=document.createElement('p');t.textContent=old;d.append(s,t);p.after(d);}
function render(){if(location.hash!=='#research')return;
root.querySelectorAll('.metric-list .metric').forEach(x=>{const k=x.querySelector('b')?.textContent.trim();explain(x.querySelector('p'),D.easyResearch.metrics[k])});
const cards=Array.from(root.querySelectorAll('.card')).filter(x=>x.querySelector('.overline')?.textContent.startsWith('EXPERIMENT'));
cards.forEach((x,i)=>explain(x.querySelector('p'),D.easyResearch.conditions[i]));}
new MutationObserver(render).observe(root,{childList:true});render();})();