(()=>{'use strict';
const D=window.HONGIK_DATA,root=document.getElementById('content');
if(!D||!root||!D.easyGuides)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const page=(location.hash||'#home').slice(1),frame=root.querySelector('.view-transition');
 if(!frame||page==='interview'||frame.querySelector('.reader-guide'))return;
 const g=D.easyGuides[page],anchor=frame.querySelector(page==='home'?'.hero':'.page-intro');
 if(!g||!anchor)return;
 const e=document.createElement('section');e.className='reader-guide';
 e.innerHTML='<div class="reader-label">✦ 쉽게 읽는 내 공부용 해설</div><h2>'+esc(g.title)+'</h2><p>'+esc(g.summary)+'</p><div class="reader-guide-grid">'+g.items.map(x=>'<article><b>'+esc(x[0])+'</b><p>'+esc(x[1])+'</p></article>').join('')+'</div>';
 anchor.after(e);
}
new MutationObserver(render).observe(root,{childList:true});render();
})();