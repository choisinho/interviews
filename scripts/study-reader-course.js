(()=>{'use strict';
const root=document.getElementById('content'),D=window.HONGIK_DATA;if(!root||!D)return;
function render(){
 if(location.hash!=='#coursebook')return;
 for(const card of root.querySelectorAll('.course-card')){
  if(card.querySelector('.reader-easy'))continue;
  const name=card.querySelector('h3')?.textContent.trim(),c=D.actualCourses.find(x=>x.name===name);
  const bridge=card.querySelector('p.bridge');if(!c||!bridge)continue;
  const p=document.createElement('p');p.className='reader-easy';p.textContent='쉽게 말하면 · '+(c.easy||c.bridge);
  bridge.before(p);
  const d=document.createElement('details');d.className='reader-more';
  const s=document.createElement('summary');s.textContent='이 과목을 WMS 연구와 연결해 보기';d.append(s);
  bridge.before(d);d.append(bridge);
 }
}
new MutationObserver(render).observe(root,{childList:true});render();
})();