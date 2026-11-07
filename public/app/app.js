/* 면접 아틀리에 앱: 학교 모드(#<school>/<page>[/<sub>]), 페이지 레지스트리, 학습 기록. index.html이 로드하고 build.mjs가 인라인한다. */
(()=>{
'use strict';
/* 학교 모드: public/schools/*.js가 ATELIER_SCHOOLS.<id> = {meta, data}를 등록한다. D는 현재 학교의 data를 가리킨다. */
const SCHOOLS=window.ATELIER_SCHOOLS||{}, root=document.getElementById('content');
if(!SCHOOLS.hongik&&window.HONGIK_DATA)SCHOOLS.hongik={meta:{id:'hongik',name:'홍익대학교',short:'홍익대',storageKey:'hongik-study-v2',status:'ready'},data:window.HONGIK_DATA};
const SCHOOL_IDS=Object.keys(SCHOOLS).filter(id=>SCHOOLS[id]&&SCHOOLS[id].meta&&SCHOOLS[id].data);
const HONGIK=SCHOOLS.hongik||{};
let D=HONGIK.data, M=HONGIK.meta, school='hongik', schoolReady=false, booted=false, GRAD=null;
if(!D||!root){document.body.innerHTML='<p>필수 학교 자료(public/schools/*.js의 ATELIER_SCHOOLS)를 찾을 수 없어. 폴더 구조를 유지해줘.</p>';return}
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const state={page:'home',duration:'short',followFilter:'전체',qSearch:'',archiveTab:'plan',factFilter:'전체',timer:null,timerStart:null,elapsed:0,activeScript:null,showScript:true,focus:false};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readStore(key){try{const v=JSON.parse(localStorage.getItem(key)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return{}}}
/* 현재 학교의 학습 기록. 참조는 고정하고 학교를 바꿀 때 내용만 교체한다(홍익대 키: hongik-study-v2, 내부 키 이름 불변). */
const saved=readStore(M.storageKey||'hongik-study-v2');
const prefs=readStore('atelier-prefs');
function savePrefs(){try{localStorage.setItem('atelier-prefs',JSON.stringify(prefs))}catch{}}
/* 클라이언트 버전: topbar '최신판 다시 열기' 링크와 footer가 이 상수 하나에서 만들어진다. */
const APP_VERSION={label:'v5.0',date:'2026-11-07',rev:'20261107-atelier-v50',note:'디자인 시스템 · 다크 모드 · 학교 테마'};
function applyVersion(){const link=$('#latestSiteLink'),foot=$('#footerVersion');if(link){link.textContent=APP_VERSION.label+' ↻';link.href='./?rev='+APP_VERSION.rev+location.hash}if(foot)foot.textContent=APP_VERSION.date.replace(/-/g,'.')+' · '+APP_VERSION.note+' · '+APP_VERSION.label}
/* 화면 테마: 시스템 → 라이트 → 다크 순환. atelier-prefs.theme('system'|'light'|'dark'), <html data-theme>로 적용. */
const THEMES=[['system','시스템','◐'],['light','라이트','☀'],['dark','다크','☾']];
function applyTheme(){const t=THEMES.find(x=>x[0]===prefs.theme)||THEMES[0],root=document.documentElement;if(t[0]==='system')delete root.dataset.theme;else root.dataset.theme=t[0];const b=$('#themeToggle');if(b){b.querySelector('.theme-icon').textContent=t[2];b.querySelector('.theme-label').textContent=t[1];b.title='화면 테마: '+t[1]+(t[0]==='system'?' 설정':'')+' (눌러서 전환)';b.setAttribute('aria-label','화면 테마 전환 (현재: '+t[1]+')')}
 requestAnimationFrame(()=>{applySchoolMark();const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=getComputedStyle(root).getPropertyValue('--side-bg').trim()||'#101a18'})}
function cycleTheme(){const i=THEMES.findIndex(x=>x[0]===(prefs.theme||'system'));prefs.theme=THEMES[(i+1)%THEMES.length][0];savePrefs();applyTheme();toast('화면 테마: '+THEMES.find(x=>x[0]===prefs.theme)[1])}
/* 학교별 작은 표지(파비콘): 학교 테마의 짙은 색 + 액센트로 그린다. */
function applySchoolMark(){const css=getComputedStyle(document.documentElement),bg=css.getPropertyValue('--side-bg').trim()||'#10221b',fg=css.getPropertyValue('--side-accent').trim()||'#cde8a6';const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="13" fill="'+bg+'"/><path fill="'+fg+'" d="M15 15h15v15H15zM34 15h15v3H37v12h-3zM46 18h3v12h-3zM15 34h15v3H18v12h-3zM27 37h3v12h-3zM34 34h15v15H34z"/></svg>';const link=document.querySelector('link[rel="icon"]');if(link)link.href='data:image/svg+xml,'+encodeURIComponent(svg)}
state.roadmapTrack='thesis';
function persist(){try{localStorage.setItem(M.storageKey,JSON.stringify(saved))}catch{}}
function checked(k){return !!saved[k]}
function setcheck(k,v){saved[k]=v;persist()}
function toast(s){const el=$('#toast');el.textContent=s;el.classList.add('visible');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('visible'),2600)}
function title(k,t,d,meta=''){return `<header class="page-intro"><div class="section-eyebrow">${eyebrow(k)}</div><h1>${t}</h1><p>${d}</p>${meta?`<div class="intro-meta">${meta}</div>`:''}</header>`}
function eyebrow(k){const m=/^\d+\s*\/\s*(.+)$/.exec(k),n=navNumbers()[state.page];return m&&n?n+' / '+m[1]:k}
function section(t,right=''){return `<div class="section-heading"><h2>${t}</h2><span>${right}</span></div>`}
function pill(t,cls=''){return `<span class="pill ${cls}">${escape(t)}</span>`}
function btn(text,action,cls=''){return `<button class="btn ${cls}" data-action="${escape(action)}">${text}</button>`}
function check(key,text){return `<label class="check-row"><input type="checkbox" data-check="${escape(key)}" ${checked(key)?'checked':''}><span>${escape(text)}</span></label>`}
const wmsReader=window.WMS_RESEARCH_SOURCE && window.WMS_CHAPTER_GUIDES && window.WMS_PLATES_LATE && window.createWmsReader?.({source:window.WMS_RESEARCH_SOURCE,guides:window.WMS_CHAPTER_GUIDES,plates:{...window.WMS_PLATES_EARLY,...window.WMS_PLATES_MIDDLE,...window.WMS_PLATES_LATE},root,escape});
function getProgress(prefix,total){let n=Object.keys(saved).filter(k=>k.startsWith(prefix)&&saved[k]).length;return [Math.min(n,total),total]}
function progress(n,max){return `<div class="progress-track"><div style="width:${max?100*n/max:0}%"></div></div><div class="progress-meta">${n} / ${max} 완료 · 이 브라우저에 저장됨</div>`}
function openSearch(){const modal=$('#searchModal');modal.hidden=false;$('#overlay').hidden=false;$('#globalSearch').value='';search('');setTimeout(()=>$('#globalSearch').focus(),30)}
function closeSearch(){const modal=$('#searchModal');modal.hidden=true;$('#overlay').hidden=true}
/* 화면 안 특정 위치로 이동(go:page:anchor 버튼과 #school/page/anchor 딥링크 공용). */
function jumpTo(anchor){setTimeout(()=>{const t=document.getElementById('script-'+anchor)||document.getElementById(anchor);if(!t)return;t.closest('details')?.setAttribute('open','');const q=t.classList.contains('q-item');if(q)t.classList.add('open');t.scrollIntoView({behavior:'smooth',block:q||t.id.startsWith('script-')?'center':'start'})},65)}
function nav(page,hash=true){const wmsAnchor=page.startsWith('wms-practice/') ? page : '';if(wmsAnchor)page='wms-practice';let subAnchor='';if(!wmsAnchor&&page.includes('/')&&pageInfo(page.split('/')[0])){subAnchor=page.slice(page.indexOf('/')+1);page=page.split('/')[0];prepAnchor(page,subAnchor)}if(page==='foreign'||page==='graduation-guide'){page='graduation';hash=true;}if(page==='wms-practice')wmsReader?.setRoute(wmsAnchor);stopMock();if(!pageInfo(page)){page='home';hash=true;}state.page=page;clearTimer();render();if(hash)history.replaceState(null,'',makeHash(school,wmsAnchor||(subAnchor?page+'/'+subAnchor:page)));window.scrollTo({top:0,behavior:'instant'});$('#sidebar').classList.remove('mobile-open');$('#overlay').classList.remove('menu-backdrop');$('#overlay').hidden=true;$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('#breadcrumbCurrent').textContent=pageInfo(page).tag;if(wmsAnchor)wmsReader?.jump(wmsAnchor);if(subAnchor)jumpTo(subAnchor);}

state.mockPool='전체';state.mockId='core-motivation';state.mockReveal=false;state.mockSeconds=0;state.mockInterval=null;
/* 다른 화면의 특정 위치로 갈 때: 꼬리질문 필터·근거 필터 초기화, 원문 화면은 해당 탭(수학계획서/47개 주제)으로. */
function prepAnchor(pg,an){if(!an)return;if(pg==='followups'){state.followFilter='전체';state.qSearch=''}if(pg==='facts')state.factFilter='전체';if(pg==='archive'){if(/^archive-(item-\d+|history)$/.test(an))state.archiveTab='history';else if(an==='archive-plan')state.archiveTab='plan'}}
function stopMock(){if(state.mockInterval){clearInterval(state.mockInterval);state.mockInterval=null}}
/* 꼬리질문 항목의 tip/risk는 모든 꼬리질문에 같은 문장(common)이라 mock 화면 상단에 한 번만 보여 준다. */
function bank(){return [...D.scripts.map(s=>({id:'core-'+s.id,type:'핵심 4문항',q:s.title,a:s.short,tip:s.tip,risk:s.risk})),...D.followups.map((s,i)=>({id:'follow-'+i,type:s.tag,q:s.question,a:s.answer,tip:'핵심부터 먼저 답하고 확인된 근거로 뒷받침해.',risk:'미확인 사항이나 군 내부 정보를 단정하지 말기.',cluster:clusterOf(i)?.title||'',common:true}))]}
function filteredBank(){const items=bank();if(state.mockPool==='핵심 4문항')return items.filter(x=>x.id.startsWith('core-'));if(state.mockPool==='꼬리질문')return items.filter(x=>x.id.startsWith('follow-'));if(state.mockPool==='약점만')return items.filter(x=>saved['confidence-'+x.id]&&Number(saved['confidence-'+x.id])<=2);return items}
function nextMock(){stopMock();state.mockSeconds=0;const p=filteredBank();const options=p.filter(x=>x.id!==state.mockId);state.mockId=(options.length?options:p)[Math.floor(Math.random()*(options.length||p.length))]?.id||'';state.mockReveal=false;render()}
function formatMockTime(){let n=state.mockSeconds;const el=$('#mockClock');if(el){el.textContent=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');el.style.color=n>90?'#f2aaa0':n>60?'#f1c988':'#cceca7'}}
function mock(){const pool=filteredBank(),common=bank().find(x=>x.common);const q=pool.find(x=>x.id===state.mockId)||pool[0];const completed=bank().filter(x=>saved['confidence-'+x.id]).length;return title('09 / MOCK INTERVIEW','실전 모의면접','답변을 보기 전에 실제로 말하고, 타이머를 확인한 다음 자기평가를 기록해. 1·2점은 약점만 모드에서 다시 출제돼.',pill('무작위 출제')+pill('답변 숨김')+pill('자신감 1~5'))
+'<div class="atelier-launch"><div><strong>연습한 질문 '+completed+' / '+bank().length+'개</strong><p>학습 상태는 이 브라우저에만 저장되며 다른 기기로 동기화되지 않아.</p></div>'+btn('면접 직전 한 장 →','go:briefing','tiny')+'</div>'
+(common?'<div class="callout navy mock-common"><strong>꼬리질문 공통 답변 원칙.</strong> 모든 꼬리질문에 똑같이 적용돼서 여기 한 번만 적어 뒀어.<div class="note-row"><div class="note-box"><b>핵심</b>'+escape(common.tip)+'</div><div class="note-box warn"><b>피할 표현</b>'+escape(common.risk)+'</div></div></div>':'')
+'<div class="question-tools"><div class="chips">'+['전체','핵심 4문항','꼬리질문','약점만'].map(t=>'<button class="filter-chip '+(state.mockPool===t?'active':'')+'" data-mock-pool="'+escape(t)+'">'+escape(t)+'</button>').join('')+'</div></div>'
+(q?'<section class="mock-card"><div class="mock-head"><span>'+escape(q.type)+(q.cluster?' · '+escape(q.cluster):'')+' / '+pool.length+'문항</span><span class="mock-time" id="mockClock">'+String(Math.floor(state.mockSeconds/60)).padStart(2,'0')+':'+String(state.mockSeconds%60).padStart(2,'0')+'</span></div><h2>'+escape(q.q)+'</h2><div class="mock-controls"><button class="primary" data-action="mockTimer">'+(state.mockInterval?'■ 일시정지':'▶ 말하기 시작')+'</button><button data-action="mockReset">↺ 타이머 초기화</button><button data-action="mockReveal">'+(state.mockReveal?'답변 숨기기':'답변 확인하기')+'</button><button class="primary" data-action="mockNext">다음 무작위 질문 →</button></div></section>'
+(state.mockReveal?'<div class="mock-answer"><div class="overline">EXPECTED DIRECTION / 답변 비교</div><p>'+escape(q.a)+'</p>'+(q.common?'<p class="showcase-note">핵심·피할 표현은 화면 위 꼬리질문 공통 답변 원칙을 그대로 따라.</p>':'<div class="note-row"><div class="note-box"><b>핵심</b>'+escape(q.tip)+'</div><div class="note-box warn"><b>피할 표현</b>'+escape(q.risk)+'</div></div>')+'</div>':'<div class="callout navy">답변은 가려져 있어. 먼저 직접 말한 뒤 <b>답변 확인하기</b>를 눌러 대조해.</div>')
+'<div class="card"><h3>방금 답변은 어땠어?</h3><p>정확성·논리·근거·속도를 함께 판단해. 약했던 질문은 다시 나와.</p><div class="mock-ratings">'+['전혀 모름','어려움','보통','괜찮음','자신'].map((x,i)=>'<button data-confidence="'+(i+1)+'" data-confidence-id="'+q.id+'" class="'+(Number(saved['confidence-'+q.id])===i+1?'active':'')+'">'+(i+1)+' · '+x+'</button>').join('')+'</div></div>'
:'<div class="card"><h3>약점으로 표시된 질문이 아직 없어.</h3>'+btn('전체 질문으로 돌아가기','mockAll','primary')+'</div>')+'<div class="callout warn">이 답변은 유일한 정답이 아니라 연습 기준이야. 교수의 질문을 들은 뒤 실제 경험과 확인된 사실만 선택해서 말하는 게 중요해.</div>';}
function briefing(){const count=D.lastMinute.filter((x,i)=>checked('last-'+i)).length;return title('10 / LAST-MINUTE','면접 직전 한 장','시험장 앞에서는 새로운 내용을 늘리지 말고, 네 실무 경험에서 출발한 이야기의 연결만 확인해.',pill('30초 핵심 4문항')+pill('위험 표현')+pill('준비 체크'))
+(D.narrative&&D.narrative.briefLine?'<div class="card dark big narrative-brief"><div class="overline">'+escape(D.narrative.briefLabel)+'</div><h2>'+escape(D.narrative.briefLine)+'</h2>'+btn('전체 서사 · 대시보드 →','go:home:narrative','tiny')+'</div>':'')
+section('30초 핵심 네 문항','기본기를 지탱하는 가장 짧은 문장')
+'<div class="brief-grid">'+D.scripts.map(s=>'<article class="brief-card"><div class="overline">'+escape(s.no)+' / '+escape(s.eng)+'</div><h3>'+escape(s.title)+'</h3><p>'+escape(s.micro)+'</p>'+btn('60초·90초 버전 →','go:interview:'+s.id,'tiny')+'</article>').join('')+'</div>'
+section('하지 않을 주장','과장 대신 검증 가능한 문장')
+'<div class="card" id="bad-phrases">'+D.badPhrases.map(x=>'<div class="brief-alert"><b>× '+escape(x[0])+'</b><span>✓ '+escape(x[1])+'</span>'+relatedQ(x[2])+'</div>').join('')+'</div>'
+section('마지막 확인','현재 브라우저에 저장됨')
+'<div class="card"><h3>'+count+' / '+D.lastMinute.length+'개 확인</h3>'+progress(count,D.lastMinute.length)+'<div class="brief-list" style="margin-top:17px">'+D.lastMinute.map((x,i)=>check('last-'+i,x)).join('')+'</div></div>'
+'<div class="banner"><div class="badge-icon">↗</div><div><b>준비한 내용이 실제로 나오는지 확인해 보자.</b><p>연구설계와 대학원 현실성은 근거·출처 화면에서 근거까지 다시 읽을 수 있어.</p></div>'+btn('모의면접 시작 →','go:mock','primary')+'</div>';}
/* 심층 보고서: dossierHTML 원문은 그대로 두고, 예전 research-report.html에만 있던 표지·먼저 읽기·범례·부록 안내·콜로폰(D.dossierFrame)을 앞뒤에 붙인다. */
function dossierHeads(level){const out=[],re=new RegExp('<h'+level+' id="([^"]+)">([^<]+)</h'+level+'>','g');String(D.dossierHTML||'').replace(re,(_,id,t)=>{out.push({id,t});return ''});return out}
function dossierCover(X){if(!X.lead&&!X.readFirst)return '';return '<section class="dossier-cover" id="dossier-cover">'
+(X.toolbarTitle?'<div class="dossier-toolbar"><span><strong>'+escape(X.toolbarTitle)+'</strong> '+escape(X.toolbarSub)+'</span>'+(X.printLabel?btn(escape(X.printLabel),'print','tiny'):'')+'</div>':'')
+'<div class="overline">'+escape(X.eyebrow)+'</div><h2 class="dossier-hero">'+escape(X.heroLead)+'<br><em>'+escape(X.heroEm)+'</em></h2>'
+(X.lead?'<p class="dossier-lead">'+escape(X.lead)+'</p>':'')
+((X.meta||[]).length?'<div class="dossier-meta">'+X.meta.map(m=>'<span>'+escape(m)+'</span>').join('')+'</div>':'')
+(X.sidenote?'<p class="dossier-sidenote">'+escape(X.sidenote)+'</p>':'')
+(X.docTitle?'<p class="dossier-doctitle"><span>원 보고서 제목</span>'+escape(X.docTitle)+'</p>':'')
+'</section>'
+(X.readFirst?'<div class="callout warn dossier-readfirst"><strong>'+escape(X.readFirstLabel)+'</strong> '+escape(X.readFirst)+'</div>':'')
+((X.legend||[]).length||(X.evidenceKeys||[]).length?'<div class="dossier-legend-row"><div class="dossier-legend">'+(X.legend||[]).map(l=>'<span class="'+escape(l.tone)+'">'+escape(l.label)+'</span>').join('')+'</div><div class="dossier-evidence"><strong>'+escape(X.evidenceTitle)+'</strong>'+(X.evidenceKeys||[]).map(k=>'<span>'+escape(k)+'</span>').join('')+'<small>'+escape(X.checkedAt)+'</small></div></div>':'')}
function dossierToc(X,ch){if(!ch.length)return '';return '<nav class="card dossier-toc" id="dossier-toc" aria-label="심층 보고서 장 목차"><div class="overline">'+escape(X.tocLabel||'CONTENTS')+'</div><ol>'+ch.map(c=>'<li><button type="button" data-jump="'+escape(c.id)+'">'+escape(c.t)+'</button></li>').join('')+(X.appendixNav?'<li><button type="button" data-jump="dossier-appendix">'+escape(X.appendixNav)+'</button></li>':'')+'</ol></nav>'}
function dossierCodes(X){const order=c=>({P:0,S:1,R:2}[c[0]]??3)*100+Number(c.slice(1));return [...(X.localCodes||[]).map(c=>({code:c.code,label:c.label,tab:c.tab})),...(D.sources||[]).flatMap(e=>(e.records||[]).filter(r=>r.dossierCode).map(r=>({code:r.dossierCode,id:r.id,label:r.name,url:r.url||e.url})))].sort((x,y)=>order(x.code)-order(y.code))}
function dossierCodeLegend(X){const codes=dossierCodes(X);if(!codes.length)return '';return '<section class="dossier-code-legend" id="dossier-code-legend">'+section(escape(X.codeLegendTitle||'출처 코드'),'보고서 12장 출처 표와 함께 보기')+'<div class="card">'+(X.codeLegendNote?'<p class="showcase-note">'+escape(X.codeLegendNote)+'</p>':'')+'<div class="table-scroll"><table class="data-table"><thead><tr><th>보고서 코드</th><th>현재 번호</th><th>자료</th></tr></thead><tbody>'+codes.map(c=>'<tr><th>'+escape(c.code)+'</th><td>'+(c.id?btn(escape(c.id)+' · 근거·출처','go:facts:src-'+c.id,'tiny'):btn('원문·조사 기록','go:archive:archive-'+c.tab,'tiny'))+'</td><td>'+escape(c.label)+(c.url?' <a href="'+escape(c.url)+'" target="_blank" rel="noopener noreferrer">↗</a>':'')+'</td></tr>').join('')+'</tbody></table></div></div></section>'}
function dossierAppendix(X){if(!(X.appendix||[]).length)return '';return '<section class="dossier-appendix" id="dossier-appendix"><div class="overline">'+escape(X.appendixPart)+'</div><h2>'+escape(X.appendixTitle)+'</h2><p>'+escape(X.appendixExplainer)+'</p>'+(X.appendixNote?'<p class="showcase-note">'+escape(X.appendixNote)+'</p>':'')+'<div class="grid grid-2">'+X.appendix.map(a=>'<button type="button" class="card dossier-annex" data-action="go:archive:archive-'+escape(a.tab)+'"><b>'+escape(a.label)+'</b><span>'+escape(a.range)+' · '+escape(a.code)+' · 원문·조사 기록에서 열기 →</span></button>').join('')+'</div></section>'}
function dossierColophon(X){return (X.colophon?'<div class="dossier-endnote"><b>'+escape(X.colophonLabel)+'</b> '+escape(X.colophon)+'</div>':'')+((X.footer||[]).length?'<div class="dossier-footer">'+X.footer.map(x=>'<span>'+escape(x)+'</span>').join('')+'</div>':'')}
function dossier(){return title('11 / RESEARCH DOSSIER','심층 검증 자료실','실제 대학원 2년을 가정한 학사·근무·연구 보고서를 아틀리에 안에서 읽을 수 있어. 제출 원문은 별도 아카이브 화면에서 그대로 확인해.',pill('4학기 시나리오')+pill('학사·연구 근거')+pill('원문 보존'))
+dossierCover(D.dossierFrame||{})
+notices('dossier')
+dossierToc(D.dossierFrame||{},dossierHeads(2))
+'<div class="research-dossier">'+D.dossierHTML+'</div>'
+dossierCodeLegend(D.dossierFrame||{})
+dossierAppendix(D.dossierFrame||{})
+dossierColophon(D.dossierFrame||{})
+'<div class="banner"><div class="badge-icon">↗</div><div><b>심층 자료는 답변의 근거를 만들기 위한 거야.</b><p>실전에서는 원리와 연구범위를 짧게 설명하는 게 더 설득력 있어.</p></div>'+btn('핵심 4문항 →','go:interview','primary')+'</div>';}


state.courseTerm=1;
state.courseGroup='전체';
/* 페이지 상단 '이후 정정' 안내(D.notices)와 정정 기록(D.revisions). 본문 [[이름|page]]는 해당 화면 버튼이 된다. */
function noticeBody(t){return escape(t).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,(_,label,page)=>btn(label,'go:'+page,'tiny'))}
function noticeExtra(x){const al=(x.alertRefs||[]).map(i=>D.alerts[i]).filter(Boolean).map(a=>noticeBody(typeof a==='object'?a.text:a));const items=[...(x.items||[]).map(it=>typeof it==='string'?noticeBody(it):'<strong>'+escape(it.title||'')+'</strong> '+noticeBody(it.body||'')),...al];return items.length?'<ul class="notice-items">'+items.map(t=>'<li>'+t+'</li>').join('')+'</ul>':''}
function notices(page){const list=(D.notices||[]).filter(x=>(x.pages||[]).includes(page));return list.length?'<section class="notice-stack" aria-label="이후 정정 안내"><div class="notice-stack-head">이후 정정 · 원문은 그대로 두고 안내만 덧붙였어</div>'+list.map(x=>'<div class="callout '+(x.tone==='warn'?'warn':'')+'" id="notice-'+escape(x.id)+'"><strong>'+escape(x.title)+'</strong> '+noticeBody(x.body)+noticeExtra(x)+'</div>').join('')+'</section>':''}
function revisionLog(){const R=D.revisions||[];if(!R.length)return '';const areas=[...new Set(R.map(r=>r.area))];
return section('정정 기록 '+R.length+'건','이전 문구 보존 · 바꾼 이유와 근거')+'<div class="revision-log" id="revision-log"><p class="showcase-note">대본·자료를 고칠 때 원래 문구를 지우지 않고 여기에 그대로 남겼어. 원문 3종(수학계획서·47개 조사·심층 보고서)과 WMS 원고 본문은 고치지 않고, 각 화면 위 안내나 WMS 가이드 주석으로 처리했어.</p>'
+(areas.length>2?'<nav class="page-toc" aria-label="정정 기록 영역 바로가기"><span class="related-label">영역</span>'+areas.map((a,i)=>'<button class="btn tiny" type="button" data-jump="rev-area-'+(i+1)+'">'+escape(a)+' · '+R.filter(r=>r.area===a).length+'</button>').join('')+'</nav>':'')
+areas.map((a,ai)=>{const rows=R.filter(r=>r.area===a);return '<details class="card revision-group" id="rev-area-'+(ai+1)+'"><summary><b>'+escape(a)+'</b><span>'+rows.length+'건</span></summary><div class="revision-scroll"><table class="data-table revision-table"><thead><tr><th>위치</th><th>이전 문구</th><th>고친 문구</th><th>이유 · 근거</th></tr></thead><tbody>'+rows.map(r=>'<tr id="'+escape(r.id)+'"><th>'+escape(r.id)+'<small>'+escape(r.where)+'</small></th><td class="rev-before">'+escape(r.before)+'</td><td class="rev-after">'+escape(r.after)+'</td><td>'+escape(r.reason)+'<div class="source-date">'+escape(r.source)+' · '+escape(r.date)+'</div></td></tr>').join('')+'</tbody></table></div></details>'}).join('')+'</div>'}
/* 입학 후 계획 그룹 공통 도우미: 과목명 정규화(띄어쓰기·가운뎃점), 출처 링크, **굵게**·[[링크|페이지]] 표기. */
const normName=s=>String(s||'').replace(/\s+/g,'').replace(/[·•‧∙・ㆍ]/g,'·');
/* D.sources: URL당 1개 항목. records에 원래 번호별 이름·설명·날짜, aliases에 별칭 번호(S10=F-EXAM=G6 등). 옛 번호 어느 것으로 찾아도 같은 문서. */
function findSource(id){for(const e of D.sources||[]){const r=(e.records||[e]).find(x=>x.id===id);if(r)return {...e,...r,url:r.url||e.url,primary:e.id}}return null}
function refText(t){return escape(t).replace(/\b[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*\b/g,id=>{const x=findSource(id);return x?'<button type="button" class="ref-chip" data-jump="src-'+id+'" title="'+escape(x.name)+'">'+id+'</button>':id})}
function srcLink(ref){const s=findSource(ref);return s?'<a href="'+escape(s.url)+'" target="_blank" rel="noopener noreferrer">'+escape(ref)+' · 출처 ↗</a>':'<span>'+escape(ref)+'</span>'}
function rich(t){return noticeBody(t||'').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>')}
/* 교과목 '근거 수준' 박스: D.courseEvidence의 요약 문장 + first/second/termLimit/supply 원문 + 학기별 과목 수. */
function courseEvidenceBox(){const E=D.courseEvidence||{},L=E.levelLabels||{},terms=E.terms||[],cs=E.creditStat||{};
const levels=['first','second','termLimit','supply'].filter(k=>E[k]);
const links=[[E.officialTimeUrl,'홍익대 시간표 원본 ↗'],[E.curriculumUrl,'학과 교육과정 ↗'],[E.staffingUrl,'교원 초빙 자료 ↗']].filter(x=>x[0]);
if(!E.summary&&!levels.length)return '';
return '<section class="course-evidence" id="course-evidence"><div class="course-alert"><strong>팩트 구분:</strong> '+rich(E.summary)+' '+links.map(([u,t])=>'<a href="'+escape(u)+'" target="_blank" rel="noopener noreferrer">'+t+'</a>').join(' ')+'</div>'
+(levels.length?'<div class="evidence-head"><span class="tag">근거 수준</span><small>시간표 캡처와 교육과정 조사가 각각 무엇을 보장하고 무엇을 보장하지 않는지</small></div><div class="evidence-levels">'+levels.map(k=>'<div class="evidence-level evidence-'+k+'"><span class="overline">'+escape(L[k]||k)+'</span><p>'+escape(E[k])+'</p></div>').join('')+'</div>':'')
+(terms.length||cs.label?'<div class="course-stats">'+terms.map(t=>'<div class="card"><small>'+escape(t.label)+'</small><b>'+D.actualCourses.filter(c=>c.semester===t.term).length+'</b><small>'+escape(t.stat)+'</small></div>').join('')+(cs.label?'<div class="card"><small>'+escape(cs.label)+'</small><b>'+escape(cs.value)+'</b><small>'+escape(cs.note)+'</small></div>':'')+'</div>':'')+'</section>'}
/* 교육과정 전체 목록(정본): 주제 분류 + 2026 개설 배지(정규화 매칭) + 목록 외 개설 + 이전 조사의 시험과목 기록(접힘). */
function curriculumSection(){const C=D.curriculum||{},all=D.courses||[];if(!all.length&&!(C.topics||[]).length)return '';
const opened=new Map();D.actualCourses.forEach(c=>{const k=normName(c.name);opened.set(k,[...(opened.get(k)||[]),c])});
const desc=new Map((C.descriptions||[]).map(([n,t])=>[normName(n),t])),listed=new Set();
const chip=name=>{const k=normName(name);listed.add(k);const hit=opened.get(k)||[];return '<li class="curr-course'+(hit.length?' opened':'')+'"><span class="curr-name">'+escape(name)+'</span>'+(hit.length?hit.map(c=>'<span class="curr-badge">2026-'+c.semester+' 개설 · '+escape(c.day)+' '+c.start+'–'+c.end+'시</span>').join(''):'<span class="curr-badge muted">2026 시간표에 없음</span>')+(desc.has(k)?'<small class="curr-desc">'+escape(desc.get(k))+'</small>':'')+'</li>'};
const topics=(C.topics||[]).length?C.topics:[{name:'교육과정',priority:'',why:'',courses:all}];
const cards=topics.map(t=>'<article class="card curr-topic"><div class="curr-topic-head"><span class="overline">'+escape(t.priority||'')+'</span><h3>'+escape(t.name)+'</h3>'+(t.why?'<small>'+escape(t.why)+'</small>':'')+'</div><ul class="curr-list">'+(t.courses||[]).map(chip).join('')+'</ul></article>').join('');
const rest=all.filter(n=>!listed.has(normName(n)));const restCard=rest.length?'<article class="card curr-topic"><div class="curr-topic-head"><h3>분류 밖 교육과정</h3></div><ul class="curr-list">'+rest.map(chip).join('')+'</ul></article>':'';
const inList=all.filter(n=>opened.has(normName(n))).length,outside=D.actualCourses.filter(c=>!listed.has(normName(c.name)));
const X=C.exam||{},exams=D.examCourses||[];
return '<section id="curriculum">'+section(escape(C.title||'교육과정 전체 '+all.length+'과목'),escape(C.basis||''))
+'<div class="card curr-intro"><span class="overline">개설 후보 전체 목록</span>'+(C.lead?'<p>'+escape(C.lead)+'</p>':'')+(C.format?'<p>'+escape(C.format)+'</p>':'')
+'<div class="metrics"><span>교육과정 '+all.length+'과목</span><span>2026 개설 확인 '+inList+'</span><span>2026 시간표에 없음 '+(all.length-inList)+'</span>'+(outside.length?'<span>'+escape(C.outsideLabel||'목록 외 2026 개설')+' '+outside.length+'</span>':'')+'</div>'
+(C.matchNote?'<p class="showcase-note">'+escape(C.matchNote)+'</p>':'')+'</div>'
+'<div class="curr-grid">'+cards+restCard+(outside.length?'<article class="card curr-topic warm"><div class="curr-topic-head"><span class="overline">2026 개설</span><h3>'+escape(C.outsideLabel||'목록 외 2026 개설')+'</h3></div><ul class="curr-list">'+outside.map(c=>'<li class="curr-course opened"><span class="curr-name">'+escape(c.name)+'</span><span class="curr-badge">2026-'+c.semester+' 개설 · '+escape(c.day)+' '+c.start+'–'+c.end+'시</span><small class="curr-desc">'+escape(c.bridge||'')+'</small></li>').join('')+'</ul></article>':'')+'</div>'
+((C.topicSource||C.descSource)?'<p class="showcase-note">'+[C.topicSource?'주제 분류: '+escape(C.topicSource):'',C.descSource?'과목 해설 3개: '+escape(C.descSource):''].filter(Boolean).join(' · ')+'</p>':'')
+(X.rule?'<div class="card curr-exam-rule"><div class="tag">'+escape(X.tag||'')+'</div><p>'+escape(X.rule)+'</p>'+btn('졸업요건 · 종합시험과 영어 →','go:graduation:graduation-exams','tiny')+'</div>':'')
+(exams.length?'<details class="card curr-exam"><summary>'+escape(X.summary||'이전 조사 기록(미검증)')+'</summary>'+(X.lead?'<p>'+escape(X.lead)+'</p>':'')+'<div class="pill-row">'+exams.map(c=>'<span class="course-chip muted">'+escape(c)+'</span>').join('')+'</div>'+(X.source?'<p class="showcase-note">출처: '+escape(X.source)+'</p>':'')+'</details>':'')
+'</section>'}
function initCourseChoices(){state.courseChoices=Array.isArray(saved['course-choices-v1'])?saved['course-choices-v1'].filter(id=>D.actualCourses.some(c=>c.code===id)):[...(D.coursePlans[0]?.items||[])]}
function selectedCourses(){return D.actualCourses.filter(c=>state.courseChoices.includes(c.code))}
function courseCollision(a,b){return a.day===b.day&&a.start<b.end&&b.start<a.end}
function courseCalc(){const items=selectedCourses(),pairs=[];for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if(courseCollision(items[i],items[j]))pairs.push([items[i],items[j]]);
return {items,pairs,days:new Set(items.map(c=>c.day)),early:items.filter(c=>c.start<19),credits:items.reduce((n,c)=>n+c.credits,0)}}
function coursebook(){
const courses=D.actualCourses.filter(c=>(state.courseTerm==='전체'||c.semester===state.courseTerm)&&(state.courseGroup==='전체'||state.courseGroup===c.group));
const r=courseCalc();
let evaluated=r.items.length?'<div class="metrics"><span>'+r.items.length+'과목</span><span>'+r.credits+'학점</span><span>주 강의 '+r.items.length*3+'시간</span><span>출석 '+r.days.size+'일</span><span>강의+자율학습 약 '+(r.items.length*5)+'~'+(r.items.length*6)+'시간/주</span></div>'
+(r.pairs.length?'<p class="warn">⚠ 같은 시간 수업 '+r.pairs.length+'건: '+r.pairs.map(x=>escape(x[0].name)+' ↔ '+escape(x[1].name)).join(' / ')+'</p>':'<p class="ok">✓ 선택한 강의들의 시간은 겹치지 않아.</p>')
+(r.early.length?'<p class="warn">⚠ 19시 이전 시작 과목: '+r.early.map(c=>escape(c.name)+' '+escape(c.day)+c.start+':00').join(', ')+'</p>':'')
+(r.credits>9?'<p class="warn">⚠ 2026 주간 석사 안내의 학기당 일반 수강 상한 9학점 초과.</p>':'')
+(r.items.some(c=>c.semester!==r.items[0].semester)?'<p class="warn">⚠ 서로 다른 학기를 함께 선택했어.</p>':'')
:'<p>과목을 선택하거나 추천 조합을 눌러봐.</p>';
return title('09 / REAL COURSE EVIDENCE','실제 교과목 탐구','2026학년도 1·2학기 시간표 캡처를 바탕으로 23과목의 의미·실무 연관성을 정리했어. 학점과 시간 충돌은 실제 2026 편성 기준으로 계산해.',pill('1학기 11과목')+pill('2학기 12과목')+pill('2027 미확정'))
+notices('coursebook')+courseEvidenceBox()
+section('시간표의 실제 과목','학기·연구 분야를 선택해 봐')
+'<div class="course-filters">'+['전체',1,2].map(t=>'<button class="'+(state.courseTerm===t?'active':'')+'" data-course-term="'+t+'">'+(t==='전체'?'전체 보기':'2026년 '+t+'학기')+'</button>').join('')+'</div>'
+'<div class="course-filters">'+['전체','데이터·AI','SW 유지보수','연구방법','보안','군수·운영','국방 운영','국방 기획','경영','프로젝트','국방 기술'].map(g=>'<button class="'+(state.courseGroup===g?'active':'')+'" data-course-group="'+escape(g)+'">'+escape(g)+'</button>').join('')+'</div>'
+'<div class="course-grid">'+courses.map(c=>'<article class="course-card '+(state.courseChoices.includes(c.code)?'selected':'')+'"><div class="course-inner"><div class="overline">'+escape(c.code)+' · '+c.semester+'학기</div><div class="course-tags"><span>'+escape(c.priority)+'</span><span>'+escape(c.group)+'</span><span>'+(c.semester===1?'학과 필터 확인':'2학기 필터 주의')+'</span></div><h3>'+escape(c.name)+'</h3><div class="slot">'+escape(c.day)+'요일 '+c.start+':00–'+c.end+':00 · '+c.credits+'학점</div><p class="bridge">'+escape(c.bridge)+'</p><button class="select" data-course-select="'+c.code+'">'+(state.courseChoices.includes(c.code)?'✓ 조합에서 빼기':'＋ 수강조합에 넣기')+'</button></div><details><summary>교과목 해설·근거 수준 보기</summary><p><b>과목명에서 추론할 수 있는 학습영역:</b> '+escape(c.learning)+'</p><p><b>시간표 캡처에서 확인:</b> 2026년 '+c.semester+'학기 '+escape(c.day)+' '+c.start+'–'+c.end+'시 / 3학점 / 세종. '+escape(c.status)+'</p><p><b>확인되지 않은 내용:</b> 실제 강의계획서 주차별 내용·평가방식, 2027 개설.</p></details></article>').join('')+'</div>'
+(D.courseEvidence&&D.courseEvidence.planNote?section('2026 실제 개설 교과목 분석','시간표·연구 적합도·요일 충돌 검증')+'<div class="card"><p>'+escape(D.courseEvidence.planNote)+'</p></div>':'')
+section('추천 수강조합','실제로 겹치지 않는 2026 편성 기준 예시')
+'<div class="course-plans">'+D.coursePlans.map((p,i)=>'<button class="course-plan '+(p.items.join(',')===state.courseChoices.join(',')?'active':'')+'" data-course-plan="'+i+'"><strong>'+escape(p.name)+'</strong><small>'+p.items.map(id=>escape(D.actualCourses.find(c=>c.code===id)?.name)).join(' · ')+'</small><div class="fine">'+escape(p.notes)+'</div></button>').join('')+'</div>'
+section('선택한 조합 판정','학점·요일·시간 충돌 계산')
+'<div class="course-result"><h3>'+(r.items.length?r.items.map(c=>escape(c.name)).join(' · '):'아직 선택한 과목이 없어')+'</h3>'+evaluated+'<p class="course-note">자율학습량은 과목당 주 2~3시간을 더한 계획상의 가정이고, 2027 실제 개설을 보증하지 않아.</p></div>'
+section('연구와의 연결','수업명을 연구목표의 언어로')
+'<div class="grid grid-2"><div class="card"><h3>RAG 기반 유지보수 연구</h3><p>SW 관리 → 코드·변경이력, 데이터마이닝/데이터사이언스 → 검색자료·실험평가, 연구방법론 → 비교실험, 정보보호 → 접근통제·자료 경계. 각 과목은 연구의 다른 단계를 뒷받침하는 선택지야.</p></div><div class="card warm"><h3>군수·공급사슬 확장</h3><p>AI 기반 의사결정 및 최적화 모델·국방경제학 등은 군수 운영을 이해하는 보조영역이야. <b>공급사슬관리라는 명칭의 과목은 네가 보낸 2026 두 시간표에는 없어.</b> 실제 개설이라고 말하지 않도록 주의해.</p></div></div>'
+curriculumSection()
+'<div class="banner"><div class="badge-icon">↗</div><div><b>과목 선택의 이유를 면접에서 설명해 보자.</b><p>먼저 학습목표와 실제 수업 편성을 구분해 말하는 것이 핵심이야.</p></div>'+btn('입학 후 계획 답변 →','go:interview:study','primary')+'</div>';
}

/* 페이지 레지스트리: nav·페이지 번호·breadcrumb·검색이 여기서 만들어진다. ready()가 false면 공통 placeholder()를 보여 준다. */
const GROUPS=[['today','오늘'],['speak','말하기 연습'],['story','내 이야기와 연구'],['plan','입학 후 계획'],['evidence','근거 자료']];
const BOTH=['hongik','ajou'];
const filled=v=>Array.isArray(v)?v.length>0:v&&typeof v==='object'?Object.values(v).some(filled):!!v;
const PAGES=[
 {id:'home',group:'today',label:'대시보드',tag:'OVERVIEW',fn:()=>M.status==='ready'?home():prepBoard(),schools:BOTH},
 {id:'briefing',group:'today',label:'면접 직전 한 장',tag:'LAST-MINUTE',fn:briefing,ready:()=>D.scripts.length>0,schools:BOTH},
 {id:'interview',group:'speak',label:'핵심 4문항',tag:'CORE QUESTIONS',fn:interview,ready:()=>D.scripts.length>0,schools:BOTH},
 {id:'followups',group:'speak',label:'꼬리질문 훈련',tag:'FOLLOW-UP TRAINING',fn:followups,ready:()=>D.followups.length>0,schools:BOTH},
 {id:'mock',group:'speak',label:'실전 모의면접',tag:'MOCK INTERVIEW',fn:mock,ready:()=>bank().length>0,schools:BOTH},
 {id:'cases',group:'story',label:'실무 경험 정리',tag:'FIELD EXPERIENCE',fn:sharedCases,schools:BOTH,shared:()=>!D.experiences.length},
 {id:'research',group:'story',label:'연구 설계 실험실',tag:'RESEARCH LAB',fn:research,ready:()=>!!D.research.question,schools:BOTH},
 {id:'wms-practice',group:'story',label:'WMS 연구 도해',tag:'WMS RESEARCH',fn:()=>wmsReader ? wmsReader.view() : title('WMS RESEARCH','WMS 연구 원문','원문 전체를 읽으려면 <a href="https://choisinho.github.io/interviews/#wms-practice">배포판 열기</a>'),schools:BOTH,shared:()=>school!=='hongik'},
 {id:'coursebook',group:'plan',label:'실제 교과목 탐구',tag:'COURSES 2026',fn:coursebook,ready:()=>D.actualCourses.length>0,schools:BOTH},
 {id:'graduation',group:'plan',label:'졸업요건',tag:'GRADUATION',fn:()=>GRAD.graduation(),ready:()=>school==='hongik'&&!!GRAD,schools:BOTH},
 {id:'roadmap',group:'plan',label:'2년 대학원 시뮬레이션',tag:'TWO-YEAR PLAN',fn:roadmap,ready:()=>D.semesters.length>=3,schools:BOTH},
 {id:'reality',group:'plan',label:'현실성 조사 결과',tag:'FEASIBILITY',fn:reality,ready:()=>D.feasibility.rows.length>0,schools:['hongik']},
 {id:'facts',group:'evidence',label:'근거·출처',tag:'EVIDENCE & SOURCES',fn:facts,ready:()=>D.facts.length>0||D.sources.length>0,schools:BOTH},
 {id:'dossier',group:'evidence',label:'심층 검증 자료실',tag:'DOSSIER',fn:dossier,ready:()=>!!D.dossierHTML,schools:['hongik']},
 {id:'archive',group:'evidence',label:'원문·조사 기록',tag:'SOURCE ARCHIVE',fn:archive,ready:()=>!!(D.planHTML||D.archiveHTML),schools:BOTH}
];
function pagesFor(s=school){return PAGES.filter(p=>p.schools.includes(s))}
function pageInfo(id,s=school){return pagesFor(s).find(p=>p.id===id)||null}
function navNumbers(s=school){const out={},list=pagesFor(s);GROUPS.filter(([g])=>list.some(p=>p.group===g)).forEach(([g],gi)=>list.filter(p=>p.group===g).forEach((p,i)=>{out[p.id]=(gi+1)+'·'+(i+1)}));return out}
function groupLabel(g){return (GROUPS.find(x=>x[0]===g)||[,''])[1]}
function buildNav(){const list=pagesFor(),nums=navNumbers();$('#sideNav').innerHTML=GROUPS.filter(([g])=>list.some(p=>p.group===g)).map(([g,label],gi)=>`<div class="nav-group-label${gi?' in-nav':''}">${escape(label)}</div>`+list.filter(p=>p.group===g).map(p=>`<button class="nav-btn${p.id===state.page?' active':''}" data-page="${p.id}"><span class="nav-num">${nums[p.id]}</span>${escape(p.label)}${p.shared&&p.shared()?'<span class="nav-shared" title="학교 공통 개인 자료">공유</span>':''}<span class="nav-arrow">↗</span></button>`).join('')).join('')}
function makeHash(s,page){return '#'+s+'/'+page}
function parseHash(raw){const parts=String(raw||'').split('/');if(SCHOOL_IDS.includes(parts[0]))return {school:parts[0],page:parts.slice(1).join('/')||'home'};return {school:null,page:raw||'home'}}
function schoolSwitchHTML(){return SCHOOL_IDS.map(id=>`<button type="button" data-school-switch="${id}" aria-pressed="${id===school}">${escape(SCHOOLS[id].meta.short||id)}</button>`).join('')}
function setSchool(id){
 if(!SCHOOL_IDS.includes(id))id='hongik';
 school=id;M=SCHOOLS[id].meta;D=SCHOOLS[id].data;schoolReady=true;
 for(const k of Object.keys(saved))delete saved[k];Object.assign(saved,readStore(M.storageKey));
 prefs.school=id;savePrefs();
 GRAD=id==='hongik'&&window.ATELIER_MODULES?.graduation?window.ATELIER_MODULES.graduation({state,saved,escape,section,pill,btn,check,checked,progress,$,data:()=>D}):null;
 state.courseTerm=1;state.courseGroup='전체';initCourseChoices();
 state.followFilter='전체';state.qSearch='';state.factFilter='전체';state.archiveTab='plan';
 stopMock();state.mockPool='전체';state.mockReveal=false;state.mockSeconds=0;state.mockId=bank()[0]?.id||'';
 document.documentElement.dataset.school=id;requestAnimationFrame(applySchoolMark);
 if(M.title)document.title=M.title;
 const mark=String(M.brandMark||M.short||id),cut=mark.indexOf('/');
 $('#brandMark').innerHTML=cut<0?escape(mark):escape(mark.slice(0,cut))+'<span class="brand-accent">'+escape(mark.slice(cut))+'</span>';
 $('#brandLink').setAttribute('href',makeHash(id,'home'));
 if(M.breadcrumb)$('#breadcrumbSchool').innerHTML=M.breadcrumb;
 if(M.footer)$('#footerSchool').textContent=M.footer;
 for(const el of [$('#schoolSwitch'),$('#schoolSwitchTop')])if(el)el.innerHTML=schoolSwitchHTML();
 buildNav();
}
function switchSchool(id){if(id===school||!SCHOOL_IDS.includes(id))return;const current=state.page;setSchool(id);nav(pageInfo(current)?current:'home');toast(M.name+' 모드로 전환했어.')}
function route(raw){
 const p=parseHash(raw);
 // 접두사 없는 해시는 홍익대. 단, WMS 원문(reader.js)이 쓰는 wms-practice/... 해시는 현재 학교를 유지한다(학교 공통 자료).
 // 처음 열 때(booted=false)는 마지막으로 쓴 학교(prefs.school)를 쓴다. WMS 내용은 두 학교가 같다.
 let s=p.school||(p.page.split('/')[0]==='wms-practice'?(booted?school:SCHOOL_IDS.includes(prefs.school)?prefs.school:'hongik'):'hongik');
 if(!p.school&&!raw)s=booted?school:SCHOOL_IDS.includes(prefs.school)?prefs.school:'hongik';
 const first=p.page.split('/')[0];
 if(booted&&!p.school&&raw&&!pageInfo(first,s)&&!['foreign','graduation-guide'].includes(first)&&document.getElementById(raw)){
  // 페이지 안 앵커(#roadmap-detail 등): 해당 위치로 이동하고 주소는 현재 페이지로 되돌린다.
  document.getElementById(raw).scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',makeHash(school,state.page));return;
 }
 if(s!==school||!schoolReady)setSchool(s);
 nav(p.page,makeHash(s,p.page)!==location.hash);
}
function sharedCases(){if(D.experiences.length)return cases();const own=D;D={...own,experiences:HONGIK.data.experiences,terms:own.terms.length?own.terms:HONGIK.data.terms};try{return cases().replace('</header>',()=>'</header><div class="callout navy shared-note"><strong>공유 자료 · 학교 공통.</strong> 아래 실무 경험과 용어 풀이는 홍익대 준비 때 정리한 개인 경험이야. 학교와 상관없이 같은 경험이라 '+escape(M.name)+' 모드에서도 그대로 보여 줘. '+escape(M.short||M.name)+' 전용 사례는 public/schools/'+escape(M.id)+'.js의 data.experiences에 채우면 이 화면이 그 내용으로 바뀌어.</div>')}finally{D=own}}
function plannedFor(id){return (M.plannedSections||{})[id]||{keys:[],items:[]}}
function placeholder(p){const plan=plannedFor(p.id);return title('00 / '+p.tag,escape(p.label),escape(M.name)+' 자료 준비 중 · 이 섹션에 들어갈 내용을 먼저 정리해 뒀어.',pill(M.short||M.name)+pill('준비 중'))
+'<section class="card placeholder-card"><div class="card-top"><div class="overline">COMING SOON</div>'+((plan.keys||[]).length?'<span class="prep-count">'+(plan.keys||[]).filter(k=>filled(D[k])).length+' / '+plan.keys.length+'</span>':'')+'</div><h3>'+escape(M.name)+' 자료 준비 중</h3><p>이 섹션에 들어갈 내용:</p><ul class="simple-list">'+(plan.items||[]).map(x=>'<li>'+escape(x)+'</li>').join('')+'</ul><div class="rule"></div>'
+((plan.keys||[]).length?'<p class="showcase-note">채우는 방법: public/schools/'+escape(M.id)+'.js 의 '+plan.keys.map(k=>'<code>data.'+escape(k)+'</code>').join(', ')+' 를 홍익대 파일(public/schools/hongik.js)과 같은 형식으로 채우면 이 화면이 실제 내용으로 바뀌어.</p>':'<p class="showcase-note">채우는 방법: 졸업요건은 학교별 모듈(public/graduation/graduation.js 형식)을 따로 추가해야 해.</p>')
+'</section><div class="atelier-launch"><div><strong>지금 바로 볼 수 있는 공통 자료</strong><p>WMS 연구 도해와 실무 경험은 학교와 상관없는 개인 자료라 이 모드에서도 열려.</p></div>'+btn('준비 현황 보드 →','go:home','primary')+btn('WMS 연구 도해','go:wms-practice','tiny')+btn('실무 경험','go:cases','tiny')+'</div>'}
/* 학교 준비 현황 보드(status: planned): 섹션 카드마다 채울 키(0/N), 들어갈 내용, 바로가기. 그룹은 nav와 같은 GROUPS 순서. */
function prepState(p){const plan=plannedFor(p.id),keys=plan.keys||[],shared=!!(p.shared&&p.shared()),done=p.ready?p.ready():true,filledKeys=keys.filter(k=>filled(D[k]));return {plan,keys,shared,done,filledKeys}}
function prepCard(p){const x=prepState(p),n=x.keys.length,k=x.filledKeys.length,pct=x.shared||x.done?100:n?Math.round(100*k/n):0;
const count=x.shared?'공유':x.done&&!n?'준비됨':n?k+' / '+n:'모듈 필요';
const status=x.shared?'<span class="status 원칙">공유 자료</span>':x.done?'<span class="status 확인">준비됨</span>':'<span class="status 미확정">'+(n?k+' / '+n:'모듈 필요')+' · 예정</span>';
const keys=n?x.keys.map(key=>'<code class="'+(x.filledKeys.includes(key)?'done':'')+'">data.'+escape(key)+'</code>').join(''):'<span class="prep-keys-note">'+(p.id==='wms-practice'?'public/wms/* (공통)':p.id==='graduation'?'학교별 졸업요건 모듈 필요':'—')+'</span>';
return '<article class="prep-card'+(x.shared?' is-shared':x.done?' is-ready':'')+'"><div class="prep-card-top"><h4>'+escape(p.label)+'</h4><span class="prep-count" title="채워진 키 / 필요한 키">'+count+'</span></div><div class="prep-bar" aria-hidden="true"><i style="width:'+pct+'%"></i></div>'+status
+((x.plan.items||[]).length?'<ul class="prep-items">'+x.plan.items.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ul>':'')
+'<div class="prep-keys" aria-label="채울 키 (public/schools/'+escape(M.id)+'.js)">'+keys+'</div>'+btn(x.shared||x.done?'열기 →':'미리 보기 →','go:'+p.id,'tiny')+'</article>'}
function prepBoard(){const list=pagesFor().filter(p=>p.id!=='home');const ready=list.filter(p=>p.ready&&p.ready()).length,planned=list.filter(p=>p.ready).length;
const allKeys=[...new Set(list.flatMap(p=>plannedFor(p.id).keys||[]))],doneKeys=allKeys.filter(k=>filled(D[k])).length,sharedN=list.filter(p=>p.shared&&p.shared()).length;
return title('00 / PREPARATION STATUS',escape(M.name)+' 준비 현황','아직 '+escape(M.name)+' 면접 자료를 채우기 전이야. 화면 틀은 홍익대와 똑같이 만들어 뒀고, 자료 파일의 키를 채우면 해당 화면이 바로 살아나.',pill('상태 · 준비 중')+pill(M.interviewDate?'면접일 '+M.interviewDate:'면접일 미정')+pill('학습 기록 '+M.storageKey))
+'<div class="prep-hero"><section class="prep-meter" aria-label="준비된 화면"><div class="overline">준비된 화면</div><strong>'+String(ready).padStart(2,'0')+'<small>/ '+String(planned).padStart(2,'0')+'</small></strong>'+'<div class="progress-track" aria-hidden="true"><div style="width:'+(planned?100*ready/planned:0)+'%"></div></div><p>자료를 채우면 자동으로 늘어나 · 채운 키 '+doneKeys+' / '+allKeys.length+'</p></section>'
+'<div class="prep-facts"><div class="prep-fact"><b>'+String(sharedN).padStart(2,'0')+'</b><span><strong>공유 자료</strong><br>WMS 연구 도해 · 실무 경험</span></div><div class="prep-fact"><b>'+String(allKeys.length).padStart(2,'0')+'</b><span><strong>채울 키</strong><br>아래 카드마다 <code>data.키</code>로 표시</span></div><div class="prep-fact"><b>JS</b><span><strong>자료 파일</strong><br><code>public/schools/'+escape(M.id)+'.js</code></span></div></div></div>'
+section('섹션별 준비 상태','어느 키를 채우면 어느 화면이 생기는지')
+'<div class="prep-groups">'+GROUPS.filter(([g])=>list.some(p=>p.group===g)).map(([g,label])=>{const ps=list.filter(p=>p.group===g);return '<section class="prep-group"><h3>'+escape(label)+'<small>'+ps.filter(p=>prepState(p).done||prepState(p).shared).length+' / '+ps.length+'</small></h3><div class="prep-grid">'+ps.map(prepCard).join('')+'</div></section>'}).join('')+'</div>'
+section('업데이트 방법','파일 하나만 고치면 돼')
+'<ol class="prep-steps"><li><b>학교 정보</b>public/schools/'+escape(M.id)+'.js 의 <code>meta</code>에 학과·캠퍼스·면접일(interviewDate)을 적어.</li><li><b>자료 채우기</b><code>data</code>의 키를 public/schools/hongik.js와 같은 형식으로 채워. 비어 있는 키는 화면에서 \'준비 중\' 카드로 보여.</li><li><b>대시보드 전환</b>모든 자료가 갖춰지면 <code>meta.status</code>를 \'ready\'로 바꾸면 이 보드 대신 대시보드가 열려.</li><li><b>검사</b><code>npm run build</code> — build.mjs가 두 학교 자료의 키가 서로 맞는지 검사해.</li></ol>'
+'<div class="atelier-launch"><div><strong>학교 공통 개인 자료는 지금도 열려.</strong><p>WMS 연구 도해와 실무 경험 정리는 학교와 상관없는 네 경험이라 그대로 쓰면 돼.</p></div>'+btn('WMS 연구 도해 →','go:wms-practice','primary')+btn('실무 경험','go:cases','tiny')+'</div>'}
function render(){const p=pageInfo(state.page)||pagesFor()[0];root.innerHTML=`<div class="view-transition">${p.ready&&!p.ready()?placeholder(p):p.fn()}</div>`;refreshChecks()}
/* 면접일(meta.interviewDate)과 오늘(한국 시간 날짜)의 차이. 당일은 0, 지나면 음수, 미정이면 null. */
function interviewDay(){const iso=M.interviewDate;if(!iso)return null;const today=new Date(Date.now()+9*3600e3).toISOString().slice(0,10);return Math.round((Date.parse(iso)-Date.parse(today))/86400000)}
function dDayLabel(days){return days==null?'면접일 미정':days>0?'D-'+days:days===0?'D-DAY':'면접 종료 · 복습 모드'}
/* 핵심 서사(D.narrative) 단일 정본: 홈은 전체, 직전 한 장은 한 줄만. */
function narrativeBlock(){const N=D.narrative||{},steps=N.steps||[];if(!N.oneLine&&!steps.length)return '';return '<section class="narrative" id="narrative">'
+(N.oneLine?'<div class="quote-strip"><div class="quote-mark">“</div><p>'+escape(N.oneLine)+'</p><div class="quote-note">'+escape(N.label)+'</div></div>':'')
+(steps.length?section(escape(N.heading),escape(N.sub))+'<div class="flow">'+steps.map(x=>'<div class="flow-step"><div class="flow-num">'+escape(x.num)+'</div><h3>'+escape(x.title)+'</h3><p>'+escape(x.body)+'</p>'+(x.link?btn(escape(x.link.label)+' →','go:'+x.link.go,'tiny'):'')+'</div>').join('')+'</div>':'')
+(N.briefLine?'<div class="narrative-brief-line"><div class="overline">'+escape(N.briefLabel)+' · 면접 직전 한 장에 쓰는 한 줄 버전</div><p><b>'+escape(N.briefLine)+'</b></p><p>'+escape(N.briefNote)+'</p>'+(N.detail&&N.detail.go?btn(escape(N.detail.label),'go:'+N.detail.go,'tiny'):'')+'</div>':'')
+'</section>'}
function clusterOf(i){return (D.followupClusters||[]).find(c=>(c.items||[]).includes(i))}
function expList(){return D.experiences.length?D.experiences:(HONGIK.data?.experiences||[])}
function qButton(i,full){const f=D.followups[i];return f?'<button class="btn tiny" data-action="go:followups:question-'+i+'" title="'+escape(f.question)+'">Q'+String(i+1).padStart(2,'0')+(full?' '+escape(f.question):'')+'</button>':''}
/* 숫자 = 꼬리질문 원래 index, 문자열 = 핵심 4문항 id */
function relatedQ(refs){const out=(refs||[]).map(r=>{if(typeof r==='number')return qButton(r,true);const x=D.scripts.find(z=>z.id===r);return x?btn(escape(x.no)+' '+escape(x.title),'go:interview:'+x.id,'tiny'):''}).filter(Boolean);return out.length?'<div class="brief-refs"><span class="related-label">관련 질문</span>'+out.join('')+'</div>':''}
function scriptRelated(x){const cl=(D.followupClusters||[]).filter(c=>(c.scripts||[]).includes(x.id)),ex=expList().map((e,i)=>({e,i})).filter(z=>((z.e.usedIn||{}).scripts||[]).includes(x.id)),more=x.more||[];if(!cl.length&&!ex.length&&!more.length)return '';
return '<div class="script-related">'+(cl.length?'<div class="related-row"><span class="related-label">관련 꼬리질문</span>'+cl.map(c=>btn(escape(c.title)+' · '+c.items.length,'go:followups:cluster-'+c.id,'tiny')).join('')+'</div>':'')+(ex.length?'<div class="related-row"><span class="related-label">관련 사례</span>'+ex.map(z=>btn(escape(z.e.label)+' · '+escape(z.e.name),'go:cases:case-'+z.i,'tiny')).join('')+'</div>':'')+(more.length?'<div class="related-row"><span class="related-label">원문</span>'+more.map(m=>btn(escape(m.label),'go:'+m.go,'tiny')).join('')+'</div>':'')+'</div>'}
function caseUses(e){const u=e.usedIn||{};const links=[...(u.scripts||[]).map(id=>D.scripts.find(x=>x.id===id)).filter(Boolean).map(x=>btn(escape(x.no)+' '+escape(x.title),'go:interview:'+x.id,'tiny')),...(u.followups||[]).map(i=>qButton(i,false)).filter(Boolean)];return (links.length?'<div class="related-row"><span class="related-label">이 사례가 쓰이는 질문</span>'+links.join('')+'</div>':'')+(e.wms&&e.wms.go?'<div class="related-row">'+btn(escape(e.wms.label),'go:'+e.wms.go,'tiny')+'</div>':'')}
function home(){const [q]=getProgress('question-',D.followups.length);const days=interviewDay(),ended=days!=null&&days<0,pad=n=>String(n).padStart(2,'0'),cards=D.alerts.filter(a=>a&&a.home);return `
<div class="hero"><div><div class="section-eyebrow">PERSONAL INTERVIEW PREPARATION · 2027 SPRING</div><h1>현장의 문제를,<br><em>연구의 질문으로.</em></h1><p>홍익대학교 일반대학원 · 세종캠퍼스 · 국방AI융합학과. 단순 암기장이 아니라 네 수학계획서와 실무 경험, 47개 조사 이력, 실제 대학원 2년을 하나로 연결한 준비 공간이야.</p></div><div class="hero-side${ended?' ended':''}"><div class="side-label">INTERVIEW / 2026.11.07 SAT</div><strong>${dDayLabel(days)}</strong><small>세종캠퍼스 · 대면 구술면접<br>${ended?'면접은 끝났고, 이 공간은 복습과 정정 기록 확인용으로 남겨 뒀어':'세부 시각·장소는 최종 공지 확인'}</small></div></div>
${days===0?`<div class="callout warn interview-day"><strong>오늘이 면접일이야.</strong> 새 내용을 늘리지 말고 면접 직전 한 장과 30초 핵심 문항만 다시 확인해. ${btn('면접 직전 한 장 →','go:briefing','tiny')}</div>`:''}${ended?`<div class="callout navy interview-day"><strong>면접 종료 · 복습 모드.</strong> 실제로 받은 질문을 꼬리질문 주제 클러스터에 맞춰 되짚어 보고, 정정 기록에서 바뀐 사실을 확인해 둬. ${btn('꼬리질문 클러스터 →','go:followups','tiny')}${btn('정정 기록','go:facts:revision-log','tiny')}</div>`:''}
<div class="grid grid-4"><div class="card kpi"><div class="kpi-name">핵심 면접 답변</div><div class="kpi-value">${pad(D.scripts.length)}<span class="mark-number">/</span>${pad(D.scripts.length)}</div><small>60초 / 상세 버전, 타이머</small></div><div class="card kpi"><div class="kpi-name">예상 꼬리질문</div><div class="kpi-value">${String(D.followups.length).padStart(2,'0')}</div><small>학습 완료 ${q}개 · 질문별 답변</small></div><div class="card kpi"><div class="kpi-name">석사 학업 시뮬레이션</div><div class="kpi-value">${pad(D.semesters.length)}</div><small>학기 · 학점 · 산출물 · 실패 대안</small></div><div class="card kpi"><div class="kpi-name">보존한 조사 이력</div><div class="kpi-value">47</div><small>원문 전체 · 자료별 검증 표시</small></div></div>
${narrativeBlock()}
<div class="atelier-launch"><div><strong>하나로 끝내는 면접 준비</strong><p>핵심 4문항 → 꼬리질문 ${D.followups.length}개 → 무작위 모의면접 → 면접 직전 한 장. 필요한 근거는 심층 검증 자료실에 남겨뒀어.</p></div>${btn('실전 모의면접 →','go:mock','primary')}${btn('WMS 연구 도해','go:wms-practice','tiny')}${btn('직전 한 장','go:briefing','tiny')}</div>
${section('실제 개설 과목 · 입학 후 어떤 걸 배울까?','2026년 1·2학기 시간표 '+D.actualCourses.length+'과목 분석')}<div class="card"><p>빅데이터마이닝, 국방소프트웨어관리, 경영연구방법론, 데이터사이언스 등 과목의 실제 편성을 확인했어. 수강 희망과목을 고르면 <b>학점·요일·시간 충돌</b>이 계산돼. 2027년 개설은 미확정이야.</p>${btn('실제 교과목 탐구 →','go:coursebook','primary')}</div>
${section('면접 4문항 · 바로 연습','가장 먼저 익힐 핵심 메시지')}
<div class="grid grid-2 quick-grid">${D.scripts.map(s=>`<article class="card quick-card"><div class="card-top"><div class="overline">${escape(s.no)} / ${escape(s.eng)}</div><span class="thin-pill">30 · 60 · 90초</span></div><h3>${escape(s.title)}</h3><p>${escape(s.core)}</p>${btn('답변 연습하기 →','go:interview:'+s.id,'primary')}</article>`).join('')}</div>
${cards.length?section('가장 먼저 주의할 '+cards.length+'가지','기존 조사와 공식 공지 차이'):''}
${cards.length?`<div class="grid grid-3">${cards.map(a=>`<div class="card ${escape(a.tone||'inset')}"><div class="overline">${escape(a.overline)}</div><h3>${escape(a.title)}</h3><p>${escape(a.body||a.text)}</p><span class="status ${escape(a.status)}">${escape(a.statusLabel)}</span>${a.link?`<div class="alert-link">${btn(escape(a.link.label)+' →','go:'+a.link.go,'tiny')}</div>`:''}</div>`).join('')}</div>`:''}
${section('면접 직전 7일',ended?'면접 종료 · 지난 일정 기록':'하루에 하나씩 끝내기')}
<div class="card"><div class="checklist">${D.practice.map((x,i)=>check('practice-'+i,`${x[0]} — ${x[1]}`)).join('')}</div><div style="margin-top:16px" id="weeklyProgress"></div></div>
<div class="section-gap"></div><div class="banner"><div class="badge-icon">↗</div><div><b>조사를 암기로 끝내지 않기</b><p>문항별 첫 문장과 마지막 문장을 익힌 뒤, 중간은 실제 경험의 흐름대로 말하는 것이 좋아.</p></div>${btn(D.followups.length+'개 꼬리질문 →','go:followups','primary')}</div>`}
function interview(){return `${title('01 / SPEAKING PRACTICE','핵심 4문항','실제 면접장에서 길게 쓰인 문장이 아니라 자연스럽게 말할 수 있도록 만든 답변이야. 숨기고 말해 본 뒤 열어서 비교하면 돼.',pill('30초·60초·90초 전환')+pill('말하기 타이머')+pill('답변 복사'))}
<div class="question-tools"><div class="segmented"><button data-duration="micro" class="segment ${state.duration==='micro'?'active':''}">압축 답변 · 약 30초</button><button data-duration="short" class="segment ${state.duration==='short'?'active':''}">기본 답변 · 약 60초</button><button data-duration="long" class="segment ${state.duration==='long'?'active':''}">확장 답변 · 약 90초+</button></div>${btn(state.focus?'집중모드 종료':'집중모드','focus','tiny')}</div>
<div class="callout navy"><strong>실전 요령.</strong> 답변 속도에 따라 소요 시간은 달라져. 초 단위로 맞추는 것보다 핵심 논리가 자연스럽게 전달되는지 점검해. 스크립트 안의 격식체는 실제 면접에서 말할 문장이야.</div>
${D.scripts.map(s=>`<section class="script-card" id="script-${s.id}"><div class="script-heading"><div><div class="overline">${escape(s.no)} · ${escape(s.eng)}</div><h2>${escape(s.title)}</h2></div><span class="thin-pill">${escape(s.core)}</span></div><div class="script-body"><div class="script-core">기억할 세 지점</div><div class="pill-row">${s.hooks.map(x=>pill(x,'a')).join('')}</div><div class="factcheck-glance"><div class="fc-glance-top"><b>팩트체크 · ${s.factCheck.length}건</b><span>답변과 구분해 읽기</span></div><div class="fc-glance-items">${s.factCheck.map(f=>'<span class="fc-glance-badge '+(['주의','한계','조건부','최소교정'].includes(f.kind)?'warn':'')+'">'+escape(f.kind)+' · '+escape(f.headline)+'</span>').join('')}</div></div><details class="interview-factcheck"><summary><span>근거·해설 자세히 보기 <span class="fc-sub">(출처 링크 포함)</span></span></summary><div class="fc-list">${s.factCheck.map(f=>'<div class="fc-row"><div class="fc-rowhead"><span class="fc-type '+(['주의','한계','조건부','최소교정'].includes(f.kind)?'fc-alert':'')+'">'+escape(f.kind)+'</span><strong>'+escape(f.headline)+'</strong></div><p>'+escape(f.body)+'</p><div class="fc-links">'+f.sourceIds.map(id=>{const ref=findSource(id);return ref?'<a href="'+escape(ref.url)+'" target="_blank" rel="noopener noreferrer" title="'+escape(ref.what)+'">'+escape(id)+' · 근거 ↗</a>':'<span>'+escape(id)+'</span>'}).join('')+'</div></div>').join('')}</div></details><div class="script-text ${checked('blur-'+s.id)?'hidden-text':''}" id="txt-${s.id}">${escape(state.duration==='micro'?s.micro:state.duration==='short'?s.short:s.long)}</div><div class="timerbar" id="timer-${s.id}"><span class="timer-digits">00:00</span><div class="timer-track"><div class="timer-fill"></div></div><div class="timer-controls"><button class="btn-quiet" data-action="timer:${s.id}">▶ 시작</button><button class="btn-quiet" data-action="resetTimer:${s.id}">↺</button></div></div><div class="script-footer"><div class="script-btns">${btn(checked('blur-'+s.id)?'답변 표시':'답변 가리기','blur:'+s.id,'tiny')}${btn('전체 답변 복사','copy:'+s.id,'tiny')}${btn(checked('script-'+s.id)?'✓ 연습 완료':'연습 완료 표시','mark:'+s.id,'tiny')}</div><div class="meta">${state.duration==='micro'?'압축':state.duration==='short'?'기본':'확장'} · 출처: 제출 수학계획서 + 면접 조사</div></div><div class="note-row"><div class="note-box"><b>말하기 메모</b>${escape(s.tip)}</div><div class="note-box warn"><b>피해야 할 주장</b>${escape(s.risk)}</div></div>${scriptRelated(s)}</div></section>`).join('')}
<div class="banner"><div class="badge-icon">↗</div><div><b>네 실무사례가 답변의 설득력을 만든다</b><p>바코드·조회 화면 수정 경험은 “기술 역량 자랑”보다 연구문제의 출발점으로 연결할 때 강해져.</p></div>${btn('사례 보기 →','go:cases','primary')}</div>`}
function qItem(q){return `<article class="q-item" id="question-${q.i}"><button class="q-title" data-q="${q.i}"><span class="q-label">Q${String(q.i+1).padStart(2,'0')}</span><span>${escape(q.question)}</span><span class="pill ${q.tag==='보안'?'c':''}">${escape(q.tag)}</span><span class="q-expand">+</span></button><div class="q-answer">${escape(q.answer)}<div class="q-tools">${btn(checked('question-'+q.i)?'✓ 연습 완료':'완료 표시','markq:'+q.i,'tiny')}${btn('답 복사','copyq:'+q.i,'tiny')}</div></div></article>`}
/* 꼬리질문 주제 클러스터(D.followupClusters). items·variants는 원래 배열 index라 저장 키(question-i, follow-i)가 그대로 유지된다. 클러스터에 없는 질문은 마지막 묶음에 모은다. */
function followClusters(){const list=[...(D.followupClusters||[])].map(c=>({...c,items:(c.items||[]).filter(i=>D.followups[i])})).filter(c=>c.items.length);const grouped=new Set(list.flatMap(c=>c.items));const rest=D.followups.map((_,i)=>i).filter(i=>!grouped.has(i));if(rest.length)list.push({id:'other',title:list.length?'아직 묶지 않은 질문':'전체 질문',summary:'',items:rest,variants:[],links:[]});return list}
function followups(){const tags=['전체',...new Set(D.followups.map(x=>x.tag))];const items=D.followups.map((q,i)=>({...q,i})).filter(x=>(state.followFilter==='전체'||x.tag===state.followFilter)&&(`${x.question} ${x.answer}`.includes(state.qSearch)));const all=D.followups.map((q,i)=>({...q,i}));const shown=new Set(items.map(x=>x.i));const [n,max]=getProgress('question-',D.followups.length);const clusters=followClusters();
const blocks=clusters.map(c=>{const vis=c.items.filter(i=>shown.has(i));if(!vis.length)return null;const groups=(c.variants||[]).map(g=>g.filter(i=>shown.has(i))).filter(g=>g.length>1),inVar=new Set(groups.flat()),single=vis.filter(i=>!inVar.has(i)),tagsIn=[...new Set(c.items.map(i=>D.followups[i].tag))];
return {c,vis,html:`<section class="q-cluster" id="cluster-${escape(c.id)}"><header class="q-cluster-head"><div><div class="overline">TOPIC CLUSTER · ${vis.length===c.items.length?c.items.length+'문항':vis.length+' / '+c.items.length+'문항'}</div><h3>${escape(c.title)}</h3>${c.summary?`<p>${escape(c.summary)}</p>`:''}</div><div class="q-cluster-meta">${tagsIn.map(t=>pill(t)).join('')}</div></header>${(c.links||[]).length?`<div class="related-row q-cluster-links"><span class="related-label">정본으로 가기</span>${c.links.map(l=>btn(escape(l.label),'go:'+l.go,'tiny')).join('')}</div>`:''}${groups.map(g=>`<div class="q-variants"><div class="q-variants-head"><span><b>변형 질문 ${g.length}개</b></span><button class="btn tiny" type="button" data-variant-toggle>나란히 펼치기</button></div><div class="q-variant-grid">${g.map(i=>qItem(all[i])).join('')}</div></div>`).join('')}${single.length?`<div class="q-list">${single.map(i=>qItem(all[i])).join('')}</div>`:''}</section>`}}).filter(Boolean);
return `${title('02 / FOLLOW-UP LAB','꼬리질문 훈련','교수가 실제로 되물을 법한 질문을 주제별로 묶었어. 정답을 외우기보다 20~35초 안에 핵심을 설명하는 연습이 목표야.',pill(String(D.followups.length)+'문항')+pill(clusters.length+'개 주제')+pill('무작위 문제')+pill('진도 저장'))}
<div class="card" style="margin-bottom:20px"><div class="card-top"><div><div class="overline">MASTERY TRACKER</div><h3>${n} / ${max} 답변 연습 완료</h3></div>${btn('무작위 질문 →','randomQuestion','primary')}</div>${progress(n,max)}</div>
<div class="question-tools"><input class="text-input" id="qSearch" type="search" placeholder="질문/답변 안에서 찾기" value="${escape(state.qSearch)}"><div class="chips">${tags.map(x=>`<button class="filter-chip ${state.followFilter===x?'active':''}" data-filter="${escape(x)}">${escape(x)}</button>`).join('')}</div></div>
${blocks.length>1?`<nav class="cluster-index" aria-label="주제 클러스터 바로가기"><span class="related-label">주제로 바로가기</span>${blocks.map(x=>`<button type="button" class="filter-chip" data-jump="cluster-${escape(x.c.id)}">${escape(x.c.title)} <small>${x.vis.length}</small></button>`).join('')}</nav>`:''}
${blocks.some(x=>x.html.includes('q-variants'))?'<p class="showcase-note">「변형 질문」 묶음은 같은 주제를 다르게 묻는 질문이야. 답변 원문은 각각 그대로 두었어.</p>':''}<div class="q-clusters">${blocks.map(x=>x.html).join('')}</div>${items.length?'':'<div class="card">검색 결과가 없어. 검색어를 바꿔줘.</div>'}`}
function cases(){return `${title('03 / FIELD-TO-RESEARCH','실무 경험 정리','수학계획서의 사례를 과장하지 않고 꺼내 쓰기 위한 카드야. 모든 기술 정보를 늘어놓기보다 한 사례에서 문제 → 대응 → 깨달음이 이어지게 설명하면 돼.')}
<div class="grid grid-3">${D.experiences.map((e,i)=>`<article class="card case-card" id="case-${i}"><div class="overline">${escape(e.label)}</div><h2>${escape(e.name)}</h2><div class="rule"></div><div class="tag">상황</div><p>${escape(e.context)}</p><div class="tag">대응</div><p>${escape(e.action)}</p><div class="tag">연구로 이어지는 지점</div><p>${escape(e.lesson)}</p><div class="callout">${escape(e.interview)}</div><div class="showcase-note">보안 주의: ${escape(e.caution)}</div>${caseUses(e)}</article>`).join('')}</div>
${section('사례를 말하는 3단 구조','이야기를 기술목록으로 만들지 않기')}${(D.narrative&&D.narrative.oneLine)||HONGIK.data?.narrative?.oneLine?`<p class="showcase-note">현장 → 대학원 → 환류로 이어지는 전체 이야기는 대시보드의 핵심 서사에 있어. 여기는 사례 하나를 말할 때의 순서야. ${school==='hongik'?btn('핵심 서사 →','go:home:narrative','tiny'):''}</p>`:''}
<div class="flow"><div class="flow-step"><div class="flow-num">01 · SYMPTOM</div><h3>어떤 현상이 발생했나?</h3><p>바코드가 인식되지 않거나 필요한 정보가 화면에 보이지 않는 문제</p></div><div class="flow-step"><div class="flow-num">02 · INVESTIGATION</div><h3>무엇을 연결해서 봤나?</h3><p>출력 형식, 현장 설비 조건 / 서버 프로그램, SQL과 데이터 구조</p></div><div class="flow-step"><div class="flow-num">03 · INSIGHT</div><h3>왜 대학원 문제인가?</h3><p>현장 지식이 흩어져 있어 신규 담당자가 같은 관계를 매번 재발견한다는 점</p></div></div>
<div id="glossary" class="glossary">${section('용어집 · 기술어를 풀어서 설명하기','면접에서는 정확성 > 용어의 양')}<div class="grid grid-3">${D.terms.map((t,i)=>`<div class="term-card" id="term-${i}"><strong>${escape(t.term)}</strong><p>${escape(t.meaning)}</p></div>`).join('')}</div></div>`}
function roadmapSimple(){
 const coursework=state.roadmapTrack==='credits30';
 const credits=coursework?[9,9,6,6]:[9,9,6,0];
 const total=credits.reduce((a,b)=>a+b,0);
 const stages=[
 {n:'01',term:'1학기',name:'기초를 배워',why:'기초가 있어야 AI가 내놓은 답을 검증할 수 있으니까.',subjects:'빅데이터마이닝 · AI·빅데이터 경영연구방법론 · 국방 정보보호',work:'연구주제 초안 1장 쓰고 지도교수 상담',courses:D.semesters[0].courses},
 {n:'02',term:'2학기',name:'실무에 연결해',why:'AI·데이터를 군수 운영 문제에 어떻게 적용할지 공부하는 시기야.',subjects:'정보보호 및 보안 · 국방 AI기술 응용 · 데이터사이언스',work:'WMS 장애 탐색 연구문제 구체화, 모사자료·비교방법 설계',courses:D.semesters[1].courses},
 {n:'03',term:'3학기',name:'연구를 본격화해',why:'과목을 3개에서 2개로 줄여 실험과 분석 시간을 확보해.',subjects:'국방소프트웨어관리 · 국방 IT 융합·정책 등',work:'가상 WMS 코드·DB·로그로 직접검색과 AI 근거검색을 비교',courses:D.semesters[2].courses},
 {n:'04',term:'4학기',name:coursework?'남은 두 과목을 들어':'논문을 마무리해',why:coursework?'방법 신청·승인 후 6학점을 추가해서 총 30학점을 채우는 대안이야.':'3학기까지 24학점을 쌓았다면 새 강의보다 논문·심사에 집중할 수 있어.',subjects:coursework?'추가 3학점 과목 2개 — 실제 개설 확인 후 선택':'추가 수업 0학점 가정 — 등록·심사 절차는 별도',work:coursework?'잔여 학점·학위청구·졸업시험 요건 확인':'비교실험 결과 정리, 논문 작성·수정·심사',courses:[],workNote:coursework?'방법 신청은 늦어도 4학기 초까지':''}
 ];
 return `<section class="roadmap-plain" id="roadmap-plain">
 <div class="roadmap-plain-head"><span class="plain-eyebrow">처음에는 여기부터 · EASY GUIDE</span><h2>2년 대학원 생활, 이렇게 하면 이해돼</h2><p>핵심은 간단해. <strong>1·2학기에 수업을 많이 듣고, 3학기부터 연구시간을 늘린 다음, 4학기에 졸업을 준비하는 계획</strong>이야. 아래 과목은 2026년 시간표를 참고한 <b>수강 후보</b>지, 2027년 수강 확정이 아니야.</p></div>
 <div class="plain-term-def"><div><strong>3학점</strong><span>여기 나온 과목 1개</span></div><div><strong>9학점</strong><span>한 학기 3과목</span></div><div><strong>6학점</strong><span>한 학기 2과목</span></div></div>
 <div class="plain-switch-intro"><h3>졸업 방법을 바꿔 보면 일정도 달라져</h3><p><b>논문 24학점</b>을 우선 목표로 잡고, <b>30학점 교과목이수</b>는 2026 학과 현황표에서 허용을 확인한 대안이야. 개인별 방법 신청·승인은 필요해.</p></div>
 <div class="plain-switch" role="group" aria-label="24학점과 30학점 시나리오 전환">
 <button type="button" data-roadmap-track="thesis" aria-pressed="${!coursework}" class="${!coursework?'active':''}"><small>우선 계획</small><strong>24학점 + ${state.graduationTrack==='project'?'보고서':'논문'}</strong><span>9 → 9 → 6 → 0</span></button>
 <button type="button" data-roadmap-track="credits30" aria-pressed="${coursework}" class="${coursework?'active':''}"><small>2026 허용 확인 · 승인 필요</small><strong>30학점 교과목이수</strong><span>9 → 9 → 6 → 6</span></button></div>
 <div class="plain-total"><div class="plain-total-head"><span>${coursework?'교과목이수 대안':'논문 우선 계획'} · 4학기 합계</span><strong>${total}<small>학점</small></strong></div><div class="plain-bars">${credits.map((n,i)=>`<div class="plain-bar ${i===3?'last':''}" style="flex:${n||2}"><strong>${n}</strong><small>${i+1}학기</small></div>`).join('')}</div></div>
 <div class="plain-grid">${stages.map((s,i)=>`<article class="plain-stage"><div class="plain-stage-top"><span>${s.n} · ${s.term}</span><div>${credits[i]}<small>학점${credits[i]===0?' 강의 가정':''}</small></div></div><h3>${escape(s.name)}</h3><p class="plain-stage-why">${escape(s.why)}</p><div class="plain-stage-field"><b>수강 구성</b><p>${escape(s.subjects)}</p></div><div class="plain-stage-field"><b>연구·준비할 일</b><p>${escape(s.work)}${s.workNote?" ("+escape(s.workNote)+")":""}</p></div>${i<3?`<details class="plain-courses"><summary>참고한 과목과 요일 보기</summary><ul>${s.courses.map(c=>`<li>${escape(c)}</li>`).join('')}</ul></details>`:''}</article>`).join('')}</div>
 <div class="plain-why"><h3>그럼 왜 9 → 9 → 6으로 듣는 걸까?</h3><p>예를 들어 1학기에는 <b>월·화·목 저녁에 한 과목씩</b> 총 9학점을 듣고, 2학기도 9학점을 채워. 그러면 2학기까지 <b>18학점</b>이 쌓여. 3학기에는 두 과목(6학점)만 들으면서 모사자료 실험을 본격화하면 <b>누적 24학점</b>이 돼. 논문 경로라면 4학기에는 수업보다 논문 작성과 심사에 시간을 쓰려는 거야.</p><div class="plain-progress"><span>1학기 후 <strong>9</strong></span><span>2학기 후 <strong>18</strong></span><span>3학기 후 <strong>24</strong></span><span>4학기 후 <strong>${total}</strong></span></div>${coursework?'<p class="plain-caveat-inline"><b>30학점 대안:</b> 4학기에 두 과목(6학점)을 더 들어 누적 30학점으로 만드는 계획이야. 2026 학과 현황표에서 교과목이수 졸업을 허용하고 있어. 방법 신청·승인과 공통요건이 필요해.</p>':''}</div>
 <div class="plain-faq"><h3>자주 헷갈리는 부분</h3><details><summary>9학점이면 일주일에 수업을 얼마나 들어?</summary><p>예시 과목은 3학점짜리 세 과목이라, 2026년 1학기 편성대로라면 월·화·목 19~22시에 각각 3시간, 주 9시간 수업이야. 복습과 과제, 연구시간은 별도로 필요해. 실제 2027년 시간표는 달라질 수 있어.</p></details><details><summary>3학기부터 연구한다는 건 1·2학기에는 연구를 안 하는 거야?</summary><p>아니. 1학기에는 지도교수 상담과 연구 질문 선정, 2학기에는 선행연구·모사자료·실험 방법을 준비하고, 수업이 줄어드는 3학기에 실험을 본격적으로 하는 흐름이야.</p></details><details><summary>4학기 0학점이면 등록도 안 하고 바로 졸업해?</summary><p>아니. 여기서 0학점은 추가 교과목을 듣지 않는다는 <b>수강 계획상 가정</b>이야. 등록, 논문지도, 종합·외국어시험, 연구윤리, 심사와 같은 요건은 별도로 충족해야 해.</p></details><details><summary>24학점과 30학점 중 내가 마음대로 선택할 수 있어?</summary><p>2026 학과 현황표에서 논문·개별연구과제·교과목이수 모두 허용을 확인했어. 다만 개인의 최종 방법은 지도교수·학과장 승인으로 확정돼. 구체적인 요건은 졸업요건 탭에 정리했어.</p></details></div>
 <div class="plain-foot"><b>확정된 시간표가 아니야.</b> 2026년 1학기 자료는 학과 필터를 확인했지만 2학기 자료는 학과 필터 상태가 불명확해. 2027~2028 실제 개설은 미확정이고, 2026년 교과목이수 방식 허용은 확인했어.<div><a href="https://cn.hongik.ac.kr/grad/ex/time" target="_blank" rel="noopener noreferrer">공식 시간표 ↗</a><a href="https://www.hongik.ac.kr/kr/newscenter/notice.do?articleNo=147598&mode=view" target="_blank" rel="noopener noreferrer">수강 규정 ↗</a><a href="https://www.hongik.ac.kr/kr/education/notice-grad.do?articleNo=148916&mode=view" target="_blank" rel="noopener noreferrer">학위청구 안내 ↗</a></div></div>
 <button class="plain-jump" data-action="go:graduation">→ 졸업요건 전체 보기</button><a class="plain-jump" href="#roadmap-detail">↓ 기존 4학기 상세계획도 살펴보기</a></section>`;
}
/* 졸업 경로 요약 카드: TRACK A/B/C 카드와 배너를 하나로 합쳤다. 경로별 고유 설명은 졸업요건(graduation.js GRAD_ROUTES.brief)이 정본. */
function routeSummary(){if(!GRAD)return '';const R=GRAD.GRAD_ROUTES,cur=state.graduationTrack;
return section('학위청구 경로 비교','국방AI 세 방식 허용 확인 · 2026.9.1')+'<section class="card route-summary" id="route-summary"><div class="route-summary-head"><div><span class="overline">졸업 경로 요약</span><h3>졸업 경로 요약 → 졸업요건</h3></div>'+btn('졸업요건 전체 보기 →','go:graduation:graduation-route','primary')+'</div>'
+'<div class="route-summary-grid" role="group" aria-label="졸업 경로 선택 (졸업요건 탭과 연결)">'+Object.entries(R).map(([k,x])=>'<button type="button" class="route-summary-item'+(k===cur?' selected':'')+'" data-grad-route="'+k+'" aria-pressed="'+(k===cur)+'"><strong>'+x.credits+'<small>교과학점</small></strong><b>'+escape(x.name)+'</b><span>'+escape(x.output)+'</span></button>').join('')+'</div>'
+'<div class="callout warn"><strong>학점 관련 핵심.</strong> 논문·개별연구과제 경로는 일반 안내상 24학점이며, 2026 수강 공지상 주간 석사가 4학기에 논문을 발표하려면 3학기까지 24학점 취득이 필요해. 9→9→6학점은 이를 고려한 예시야. 2026년 국방AI는 세 방식을 모두 허용하며 개인별 신청·승인과 나머지 요건은 별도야.</div>'
+'<p class="showcase-note">위 쉬운 가이드의 24/30학점 스위치와 이 카드, 졸업요건 탭의 경로 선택은 서로 연결돼 있어. 논문·개별연구과제를 고르면 24학점 + 논문/보고서 심사(9 → 9 → 6 → 0), 교과목이수를 고르면 30학점(9 → 9 → 6 → 6) 일정으로 바뀌어. 지금 선택: <b>'+escape(R[cur]?.name||'')+'</b>.</p></section>'}
/* 생활 리듬 아래의 주간 시간예산: feasibility '근무와 학업의 주간 시간' 행 + 계산 + 심층 보고서 4-1 표(복사본). */
function timeBudget(){const f=D.feasibility||{},W=f.weekTable||{},N=f.notes||{},row=(f.rows||[])[W.row];if(!N.timeBudget&&!(W.rows||[]).length)return '';
return '<div class="card time-budget" id="time-budget"><div class="overline">TIME BUDGET</div><h3>주간 시간예산 · 9학점 기준</h3>'
+((W.metrics||[]).length?'<div class="time-budget-metrics">'+W.metrics.map(([a,b,c])=>'<div><small>'+escape(a)+'</small><strong>'+escape(b)+'</strong><span>'+escape(c)+'</span></div>').join('')+'</div>':'')
+(N.timeBudget?'<div class="callout navy"><strong>주간 시간예산:</strong> '+rich(N.timeBudget)+'</div>':'')
+(row?'<p><b>현실성 판정 · '+escape(row.subject)+'</b> '+pill(row.status,'b')+' '+escape(row.conclusion)+' '+escape(row.implication)+' '+btn('판정 카드 보기','go:reality','tiny')+'</p>':'')
+((W.rows||[]).length?'<h4 class="time-budget-sub">'+escape(W.title||'')+'</h4><div class="table-scroll"><table class="data-table"><thead><tr>'+(W.head||[]).map(h=>'<th>'+escape(h)+'</th>').join('')+'</tr></thead><tbody>'+W.rows.map(r=>'<tr><th>'+escape(r[0])+'</th>'+r.slice(1).map(c=>'<td>'+escape(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'+(W.calc?'<p>'+escape(W.calc)+'</p>':'')+(W.source?'<p class="showcase-note">'+escape(W.source)+'</p>':''):'')+'</div>'}
function roadmap(){const B=(D.feasibility&&D.feasibility.notes&&D.feasibility.notes.burden)||{};return `${title('04 / STUDENT SIMULATION','2년 대학원 생활','2027년 3월 입학을 가정한 현실적 실행 시나리오야. 실제 개설 과목, 학위 방식, 군 취학추천 상태가 확정된 계획은 아니라는 점을 분명히 했어.',pill('2027.03 — 2029.02')+pill('4학기 가정')+pill('학점·연구·업무'))}
${roadmapSimple()}
${routeSummary()}
<div id="roadmap-detail" class="timeline">${D.semesters.map(s=>`<article class="semester"><div class="sem-top"><div><div class="overline">${escape(s.phase)} · ${escape(s.date)}</div><h3>${escape(s.title)}</h3></div><span class="pill a">${escape(s.credits)}</span></div><div class="course-cloud">${s.courses.map(x=>`<span class="course-chip">${escape(x)}</span>`).join('')}</div><ul>${s.goals.map(g=>`<li>${escape(g)}</li>`).join('')}</ul><div class="deliver">산출물 → ${escape(s.deliver)}</div>${s.burden?`<div class="burden"><b>현실 부담</b><span>${escape(s.burden.term)} · ${escape(s.burden.credits)}</span><p>${escape(s.burden.tasks)}</p></div>`:''}<div class="caveat">※ ${escape(s.caveat)}</div></article>`).join('')}</div>
${B.basis?`<p class="showcase-note">‘현실 부담’ 줄은 현실성 조사의 ‘${escape(B.title||'')}’ 표(${escape(B.sub||'')})를 학기 카드로 옮긴 거야. ${escape(B.basis)}</p>`:''}
${section('교과목은 실제 교과목 탐구 한 곳에','2026 시간표 · 교육과정 전체 목록 · 수강조합 판정')}<div class="card link-card"><p>2026년 시간표의 요일 충돌 계산, 교육과정 전체 ${D.courses.length}과목(2026 개설 배지·주제 분류), 종합시험 관련 이전 조사 기록은 실제 교과목 탐구 화면으로 옮겼어.</p><div class="pill-row">${btn('교과목과 수강조합 자세히 →','go:coursebook','primary')}${btn('교육과정 전체 목록 →','go:coursebook:curriculum','tiny')}</div></div>
${section('생활 리듬 · 주간 가상 시간표','3과목은 대체로 평일 저녁 3일, 일부는 토요일·16시 수업')}<div class="card">${D.week.map(w=>`<div class="week-row"><strong>${escape(w.day)}</strong><span>${escape(w.time)}</span><p>${escape(w.desc)}</p></div>`).join('')}<p class="showcase-note">※ 실제 시간표가 아닌 9학점 수강을 가정한 생활 설계야. 근무시간, 수업 형태, 이동 시간은 학기별로 조정해야 해.</p></div>
${timeBudget()}`}
function research(){const r=D.research;return `${title('05 / RESEARCH DESIGN','연구 설계 실험실','연구주제는 AI가 장애를 자동으로 고치는 일이 아니야. 신규 담당자의 원인 탐색에서 근거를 연결하는 것이 얼마나 도움이 되는지를 검증하는 거야.',pill('읽기 전용')+pill('모사 데이터')+pill('사람 최종 판단'))}
${(r.links||[]).filter(l=>pageInfo(String(l.go).split(':')[0])).length?`<div class="related-row research-links"><span class="related-label">더 깊이 읽기</span>${r.links.filter(l=>pageInfo(String(l.go).split(':')[0])).map(l=>btn(escape(l.label)+' →','go:'+l.go,'tiny')).join('')}</div>`:''}
<div class="card dark big"><div class="overline">PROPOSED RESEARCH QUESTION</div><h2 class="research-question">${escape(r.question)}</h2><div class="rule"></div><p>‘정확도가 올라갈 것이다’라는 결론을 미리 정하지 않아. 성능이 개선되지 않더라도 실험결과와 한계를 남기는 것이 연구야.</p></div>
${section('근거가 연결되는 5단계','운영체계 직접 변경 없음')}
<div class="card">${r.layers.map((l,i)=>`<div class="research-layer"><b>${String(i+1).padStart(2,'0')} / ${escape(l[0])}</b><span>${escape(l[1])}</span></div>`).join('')}</div>
${section('3개 비교 조건','모델 자체와 검색계층의 기여를 분리')}
<div class="grid grid-3">${r.conditions.map((c,i)=>`<div class="card"><div class="overline">EXPERIMENT ${String.fromCharCode(65+i)}</div><h3>${escape(c[0])}</h3><p>${escape(c[1])}</p></div>`).join('')}</div>
${section('평가지표','개선 주장 전에 측정 기준부터')}
<div class="metric-list">${r.metrics.map(m=>`<div class="metric"><b>${escape(m[0])}</b><p>${escape(m[1])}</p></div>`).join('')}</div>
${section('실험 단계','처음부터 대규모 AI 시스템을 만들 필요는 없어')}<div class="card"><ol class="simple-list">${r.method.map(s=>`<li>${escape(s)}</li>`).join('')}</ol></div>
<div class="grid grid-2" style="margin-top:18px"><div class="card"><div class="overline">IN SCOPE</div><h3>연구 범위 안</h3><ul class="simple-list">${r.inclusion.map(x=>`<li>${escape(x)}</li>`).join('')}</ul></div><div class="card warm"><div class="overline">OUT OF SCOPE</div><h3>명확히 제외</h3><ul class="simple-list">${r.exclusion.map(x=>`<li>${escape(x)}</li>`).join('')}</ul></div></div>
${section('석사 논문을 더 설득력 있게 만드는 질문')}
<div class="card"><div class="callout"><strong>에이전틱 확장을 시도한다면 반드시 단순 RAG(조건 C)를 기준선으로 두고 비교할 것.</strong> 또 차이가 지식베이스 정리, 자동 검색, 모델 추론 중 어디서 나왔는지 구분해 해석해야 해.</div><div class="callout navy"><strong>오답의 위험도 결과야.</strong> 업무시간만 줄어들어도 잘못된 파일·테이블을 확신하는 오류가 늘면 실무적 효용이 낮아질 수 있어.</div><div class="callout warn"><strong>보안은 연구 설계의 변수.</strong> 외부 반출을 전제하지 않은 가상자료로 시작하고, 실제 현장 적용은 별도의 승인절차로 분리해.</div></div>`}
function reality(){const f=D.feasibility,rows=f.rows||[],N=f.notes||{},Mo=f.money||{},refLink=srcLink;const badge=(s)=>s==='공식 확인'?'a':s==='현재 확인 불가'||s==='금액 검증 제한'||s==='학과별 미확정'?'c':'b';
const moneyRows=[...(Mo.ruleRows||[]),...(Mo.amountRow!=null?[Mo.amountRow]:[])].filter(i=>rows[i]),moneyUn=(Mo.unanswered||[]).filter(i=>(f.unanswered||[])[i]);
const card=i=>{const r=rows[i];return '<article class="card" id="review-'+(i+1)+'"><div class="card-top"><div class="overline">REVIEW / '+String(i+1).padStart(2,'0')+'</div>'+pill(r.status,badge(r.status))+'</div><h3>'+escape(r.subject)+'</h3><p class="review-conclusion">'+escape(r.conclusion)+'</p><div class="rule"></div><div class="tag">이렇게 판단한 이유</div><p>'+escape(r.basis)+'</p><div class="tag">현실적인 의미</div><p>'+escape(r.implication)+'</p><div class="fact-links" style="margin-top:12px">'+refLink(r.ref)+registry().filter(x=>(x.review||[]).includes(i)).map(x=>' '+btn('근거·출처 · '+escape(x.topic),'go:facts:fact-'+x.id,'tiny')).join('')+'</div></article>'};
const open=i=>{const x=f.unanswered[i];return '<div class="source-item"><span class="source-num">'+String(i+1).padStart(2,'0')+'</span><div><h4>'+escape(x[0])+'</h4><p>'+escape(x[1])+'</p><div class="tag">판정에 필요한 비공개·미발표 근거</div><p>'+escape(x[2])+'</p></div></div>'};
const step=(n,label,body)=>'<div class="money-step"><div class="money-step-label"><span>'+n+'</span>'+escape(label)+'</div>'+body+'</div>';
const ruleCard=(c,cls)=>c&&c.title?'<article class="card '+cls+'"><div class="overline">'+escape(c.label||'')+'</div><h3>'+escape(c.title)+'</h3><p>'+escape(c.body)+'</p>'+(c.refs||[]).map(refLink).join(' · ')+(c.note?'<p class="showcase-note">'+escape(c.note)+'</p>':'')+'</article>':'';
const budget=D.budget||[],Q=Mo.question||{};
return title('06 / INDEPENDENT FEASIBILITY REVIEW','현실성 조사 결과','네가 체크할 목록이 아니라 내가 학교 공식자료와 기존 조사기록을 대조해 내린 판단이야. 지금 가능한 것과 아직 공개되지 않은 사실을 분리했고, 각 항목에 근거와 실제 의미를 붙였어.',pill('공식 근거 · 2026')+pill('2027 확정과 구별')+pill('조사기준 '+f.checkedAt))
+(N.overall?'<div class="card dark big"><div class="overline">'+escape(N.overall.label||'')+'</div><h2 class="research-question">'+(N.overall.lines||[]).map(escape).join('<br>')+'</h2><p>'+escape(N.overall.body)+'</p></div>':'')
+section('검증 결과 '+f.rows.length+'건','사실 · 기존 기록 · 합리적 계획 · 공개 확인 불가')
+(moneyRows.length?'<p class="showcase-note">장학·학비 '+moneyRows.length+'건(REVIEW '+moneyRows.map(i=>String(i+1).padStart(2,'0')).join('·')+')은 아래 ‘'+escape(Mo.title||'')+'’ 섹션에서 제도 → 예산 → 검증 한계 → 미해결 순서로 함께 보여 줘.</p>':'')
+'<div class="grid grid-2">'+rows.map((r,i)=>moneyRows.includes(i)?'':card(i)).join('')+'</div>'
+section('3가지 현실 시나리오','2년 졸업을 무조건 약속하지 않음')
+'<div class="grid grid-3">'+f.scenarios.map((s,i)=>'<article class="card '+(i===1?'warm':i===2?'inset':'')+'"><div class="overline">SCENARIO '+String.fromCharCode(65+i)+'</div><h3>'+escape(s.name)+'</h3>'+pill(s.badge,i===0?'a':i===1?'c':'b')+'<p>'+escape(s.why)+'</p><div class="callout '+(i>0?'warn':'')+'"><strong>전제·한계</strong><br>'+escape(s.limit)+'</div></article>').join('')+'</div>'
+(N.burden&&N.burden.title?section(escape(N.burden.title),escape(N.burden.sub||''))+'<div class="card link-card"><p>'+rich(N.burden.summary)+'</p>'+(N.timeBudgetMoved?'<p class="showcase-note">'+rich(N.timeBudgetMoved)+'</p>':'')+'</div>':'')
+(Mo.title?section(escape(Mo.title),escape(Mo.sub||''))+'<section class="money" id="money">'
 +step('1','제도 · 무엇이 공식인가','<div class="grid grid-2">'+ruleCard(Mo.rule,'')+(Mo.ruleRows||[]).filter(i=>rows[i]).map(card).join('')+'</div>')
 +(budget.length?step('2',Mo.budgetTitle||'예산 시나리오','<div class="card">'+(Mo.budgetLead?'<p>'+escape(Mo.budgetLead)+'</p>':'')+'<div class="table-scroll"><table class="data-table money-table"><thead><tr><th>항목</th><th>금액</th></tr></thead><tbody>'+budget.map(b=>'<tr><th>'+escape(b[0])+'</th><td>'+escape(b[1])+'</td></tr>').join('')+'</tbody></table></div>'+(Mo.budgetNote?'<p class="showcase-note">'+escape(Mo.budgetNote)+'</p>':'')+(Mo.budgetSource?'<p class="source-date">'+escape(Mo.budgetSource)+'</p>':'')+'</div>'):'')
 +step('3','금액 검증 한계','<div class="grid grid-2">'+ruleCard(Mo.amount,'warm')+(Mo.amountRow!=null&&rows[Mo.amountRow]?card(Mo.amountRow):'')+'</div>')
 +(moneyUn.length||Q.text?step('4','아직 답이 없는 질문','<div class="card">'+moneyUn.map(open).join('')+(Q.text?'<div class="money-question">'+(Q.conflict?'<p>'+escape(Q.conflict)+'</p>':'')+'<blockquote>“'+escape(Q.text)+'”</blockquote>'+(Q.source?'<p class="source-date">'+escape(Q.source)+' · 이전 조사에서 만든 확인 질문</p>':'')+'</div>':'')+'</div>'):'')
 +'</section>':'')
+section('개인별·미래 학기에 남은 확인사항','네 숙제가 아니라 근거 접근의 한계')
+'<div class="card">'+(f.unanswered||[]).map((x,i)=>moneyUn.includes(i)?'':open(i)).join('')+(moneyUn.length?'<p class="showcase-note">장학 계속 적용 항목('+moneyUn.map(i=>String(i+1).padStart(2,'0')).join('·')+')은 위 장학·학비 섹션에 있어.</p>':'')+'</div>'
+(N.interview&&N.interview.title?'<div class="banner"><div class="badge-icon">↗</div><div><b>'+escape(N.interview.title)+'</b><p>'+escape(N.interview.body)+'</p></div>'+btn('핵심 4문항 연습 →','go:interview','primary')+'</div>':'');
}
/* 상태 필터 칩: 기본 칩에 부분확인·사용자 제공 화면과 데이터에 있는 모든 상태를 더한다. */
/* 근거·출처: D.facts는 주제별 팩트 레지스트리(행마다 facts=확인 내용, audit=심층조사 검증 결과 원문, review=현실성 판정 행). 옛 평면 형태도 한 행으로 읽는다. */
const STATUS_ORDER=['확인','공식 확인','부분확인','일부확인','사용자 제공 화면','미확정','주의','이전 기록','원칙'];
const STATUS_TONE={'확인':'확인','공식 확인':'확인','부분확인':'부분','일부확인':'부분','부분 확인':'부분','사용자 제공 화면':'부분','미확정':'미확정','주의':'주의','이전 기록':'이전-기록','원칙':'원칙'};
function statusBadge(st){return '<span class="status '+escape(STATUS_TONE[st]||'부분')+'">'+escape(st)+'</span>'}
function registry(){return (D.facts||[]).map((r,i)=>r.facts||r.audit?{id:r.id||'row-'+i,topic:r.topic,facts:r.facts||[],audit:r.audit||[],review:r.review||[]}:{id:'row-'+i,topic:r.topic,facts:[r],audit:[],review:[]})}
function rowStatuses(r){return [...new Set([...r.facts,...r.audit].map(x=>x.status).filter(Boolean))]}
function factTypes(rows){const seen=[...new Set(rows.flatMap(rowStatuses))];return ['전체',...STATUS_ORDER.filter(x=>seen.includes(x)),...seen.filter(x=>!STATUS_ORDER.includes(x))]}
function registryRow(r){const rv=pageInfo('reality')?(r.review||[]).filter(i=>(D.feasibility.rows||[])[i]):[];const on=x=>state.factFilter==='전체'||x.status===state.factFilter;
const item=(x,body,ref,label)=>'<div class="reg-item'+(on(x)?'':' reg-dim')+'"><div class="reg-head"><span class="reg-sub">'+escape(x.topic)+'</span>'+statusBadge(x.status)+'</div><p>'+escape(body)+'</p><div class="reg-ref">'+label+' '+refText(ref)+'</div></div>';
return '<tr id="fact-'+escape(r.id)+'"><th>'+escape(r.topic)+(rv.length?'<div class="reg-review">'+rv.map(i=>btn('현실성 판정 '+String(i+1).padStart(2,'0'),'go:reality:review-'+(i+1),'tiny')).join('')+'</div>':'')+'</th><td>'+(r.facts.map(x=>item(x,x.value,x.source,'출처')).join('')||'<span class="reg-none">—</span>')+'</td><td>'+(r.audit.map(x=>item(x,x.statement,x.ref,'근거')).join('')||'<span class="reg-none">—</span>')+'</td></tr>'}
function sourceList(){const list=D.sources||[];if(!list.length)return '';const ids=list.reduce((n,e)=>n+(e.records||[e]).length,0);
return '<div id="sources-list">'+section('출처 '+list.length+'곳 · 번호 '+ids+'개','URL당 1개 · 옛 번호(별칭)로도 찾을 수 있어')+'<div class="card">'+list.map(e=>{const recs=e.records||[e];return '<article class="source-item" id="src-'+escape(e.id)+'"><div class="source-num">'+escape(e.id)+'</div><div>'+(e.aliases&&e.aliases.length?'<div class="source-aliases">별칭 '+e.aliases.map(x=>'<span>'+escape(x)+'</span>').join('')+'</div>':'')
+recs.map((x,j)=>'<div class="source-record"'+(j?' id="src-'+escape(x.id)+'"':'')+'>'+(recs.length>1?'<span class="source-rec-id">'+escape(x.id)+'</span>':'')+'<h4>'+escape(x.name)+'</h4><p>'+escape(x.what)+'</p><div class="source-date">'+escape(x.kind)+' · '+escape(x.date)+(x.dossierCode?' · 심층 보고서 코드 '+escape(x.dossierCode):'')+'</div>'+(x.gradName&&pageInfo('graduation')?'<div class="source-tools">'+btn('졸업요건 원문 목록 '+escape(x.id)+' →','go:graduation:graduation-sources','tiny')+'</div>':'')+(x.url&&x.url!==e.url?'<a href="'+escape(x.url)+'" target="_blank" rel="noopener noreferrer">이 번호의 주소 ↗</a>':'')+'</div>').join('')
+'<a href="'+escape(e.url)+'" target="_blank" rel="noopener noreferrer">공식 자료 열기 ↗</a></div></article>'}).join('')+'</div></div>'}
function facts(){const rows=registry(),types=factTypes(rows),items=rows.filter(r=>state.factFilter==='전체'||rowStatuses(r).includes(state.factFilter)),nItems=rows.reduce((n,r)=>n+r.facts.length+r.audit.length,0);return `${title('07 / EVIDENCE & SOURCES','근거·출처','사용자 제공 조사자료와 새로 확인한 홍익대 공식 자료를 분리했어. 모든 값이 최신 확정 사실이라는 뜻은 아니므로 상태 표시부터 확인하면 돼.',pill('공식 자료')+pill('이전 조사')+pill('미확정 사항')+pill('팩트 레지스트리'))}
${notices('facts')}
<div class="related-row evidence-jumps"><span class="related-label">이 화면</span><button class="btn tiny" data-jump="fact-registry">팩트 레지스트리</button><button class="btn tiny" data-jump="fact-alerts">놓치기 쉬운 확인사항</button><button class="btn tiny" data-jump="sources-list">출처</button>${(D.revisions||[]).length?'<button class="btn tiny" data-jump="revision-log">정정 기록</button>':''}</div>
${rows.length?`<div id="fact-registry">${section('팩트 레지스트리 '+rows.length+'개 주제 · '+nItems+'건','확인 내용과 심층조사 검증 결과를 주제별로 함께')}</div>
<div class="question-tools"><div class="chips">${types.map(x=>`<button class="filter-chip ${state.factFilter===x?'active':''}" data-fact-filter="${escape(x)}">${escape(x)}${x==='전체'?'':' · '+rows.filter(r=>rowStatuses(r).includes(x)).length}</button>`).join('')}</div></div>
${items.length>4?`<nav class="page-toc" aria-label="팩트 레지스트리 주제 바로가기"><span class="related-label">주제</span>${items.map(r=>`<button class="btn tiny" type="button" data-jump="fact-${escape(r.id)}">${escape(r.topic)}</button>`).join('')}</nav>`:''}
<div class="card registry-card"><table class="data-table registry-table"><thead><tr><th>주제</th><th>확인 내용</th><th>심층조사 검증 결과</th></tr></thead><tbody>${items.map(registryRow).join('')}</tbody></table></div>`:''}
${(D.alerts||[]).length?`<div id="fact-alerts">${section('놓치기 쉬운 확인사항','내용이 달라질 수 있는 부분')}</div>
<div class="grid grid-2">${D.alerts.map((x,i)=>`<div class="card ${i===0?'warm':''}"><div class="overline">NOTICE / ${String(i+1).padStart(2,'0')}</div><p>${escape(x&&typeof x==='object'?x.text:x)}</p>${x&&x.notice&&(D.notices||[]).some(n=>n.id===x.notice)?btn('원문·조사 기록의 「기록 vs 현재」 안내 →','go:archive:notice-'+x.notice,'tiny'):''}</div>`).join('')}</div>`:''}
${sourceList()}
${revisionLog()}`}
function archive(){return `${title('08 / PRIMARY MATERIAL','원문·조사 기록','내용을 임의로 압축하거나 대체하지 않았어. 제출한 수학계획서 전체와 47개 조사 주제 원문 전체를 그대로 보존했어. 2026-10-31 이후(시간표 11.01, 졸업요건 11.02 포함) 바뀐 사실은 이 원문이 아니라 ‘근거·출처’와 ‘졸업요건’ 탭, 그리고 이 화면 위 「이후 정정」 안내에서 따로 표시했어.',pill('수학계획서 원문')+pill('47개 조사 주제 원문'))}
${notices('archive')}
<div class="archive-switch"><button class="btn ${state.archiveTab==='plan'?'primary':''}" data-archive="plan">제출 수학계획서 원문</button><button class="btn ${state.archiveTab==='history'?'primary':''}" data-archive="history">47개 주제 · 전체 조사 원문</button>${btn('현재 원문 전체 복사','copyArchive','tiny')}</div>
${state.archiveTab==='history'&&archiveItems().length?`<details class="card archive-index"><summary>${archiveItems().length}개 주제 바로가기</summary><ol>${archiveItems().map(x=>`<li><button type="button" data-jump="archive-item-${x.n}">${x.n}. ${escape(x.t)}</button></li>`).join('')}</ol></details>`:''}
<div class="archive-container" id="archive-${state.archiveTab}"><div class="md">${archiveDoc()}</div></div>`}
/* 원문 화면 바로가기: archiveHTML의 '<h1>27. …' 제목에 렌더할 때만 id="archive-item-27"을 붙인다(저장된 원문 문자열은 그대로). */
function archiveItems(){const out=[];String(D.archiveHTML||'').replace(/<h1>(\d+)\. ([^<]+)<\/h1>/g,(_,n,t)=>{out.push({n,t});return ''});return out}
function archiveDoc(){return state.archiveTab==='plan'?D.planHTML:String(D.archiveHTML||'').replace(/<h1>(\d+)\. /g,(_,n)=>'<h1 id="archive-item-'+n+'">'+n+'. ')}
function refreshChecks(){if(state.page==='home'){let n=D.practice.filter((_,i)=>checked('practice-'+i)).length;const el=$('#weeklyProgress');if(el)el.innerHTML=progress(n,D.practice.length)}}
function search(s){const q=s.trim().toLocaleLowerCase();const wmsResults=q && wmsReader ? wmsReader.searchItems : [];const H=school==='hongik'&&GRAD,terms=D.terms.length?D.terms:HONGIK.data.terms;const all=[...pagesFor().map(p=>({title:p.label,summary:groupLabel(p.group)+' · '+p.tag+(p.ready&&!p.ready()?' · 준비 중':(p.shared&&p.shared()?' · 학교 공통':'')),page:p.id})),{title:'WMS 연구 도해와 원문',summary:'WMS 유지보수 업무의 복잡성과 AI 기반 지식관리·오류 대응 지원체계 연구 · 면접 발언 전체 복원 및 연구계획 구체화',page:'wms-practice'},...(H?GRAD.GRAD_SOURCES.map(x=>({title:x[1],summary:x[3],page:'graduation'})):[]),...(H?[{title:'국방AI 졸업요건',summary:'논문·개별연구과제·교과목이수 30학점, 종합시험, 영어, 연구윤리, 졸업 체크리스트',page:'graduation'}]:[]),...wmsResults,...D.actualCourses.map(x=>({title:x.name,summary:x.semester+'학기 '+x.day+' '+x.start+'–'+x.end+'시 / '+x.bridge,page:'coursebook'})),...registry().flatMap(r=>[...r.facts.map(x=>({title:x.topic,summary:x.value+' / '+x.status,page:'facts',anchor:'fact-'+r.id})),...r.audit.map(x=>({title:x.topic,summary:x.statement+' / '+x.status,page:'facts',anchor:'fact-'+r.id}))]),...(D.revisions||[]).map(x=>({title:x.id+' · '+x.where,summary:'정정 기록 · '+x.after,page:'facts',anchor:x.id})),...(D.notices||[]).filter(x=>(x.pages||[]).some(p=>pageInfo(p))).map(x=>({title:x.title,summary:'이후 정정 안내 · '+x.body,page:(x.pages||[]).find(p=>pageInfo(p)),anchor:'notice-'+x.id})),...(pageInfo('dossier')?[...(D.dossierFrame&&D.dossierFrame.docTitle?[{title:D.dossierFrame.docTitle,summary:D.dossierFrame.lead,page:'dossier',anchor:'dossier-cover'},{title:D.dossierFrame.codeLegendTitle,summary:dossierCodes(D.dossierFrame).map(c=>c.code+(c.id?'→'+c.id:'')).join(' '),page:'dossier',anchor:'dossier-code-legend'}]:[]),...dossierHeads(2).map(x=>({title:x.t,summary:'심층 검증 자료실 · 장',page:'dossier',anchor:x.id})),...dossierHeads(3).map(x=>({title:x.t,summary:'심층 검증 자료실 · 절',page:'dossier',anchor:x.id}))]:[]),...(pageInfo('archive')?[...archiveItems().map(x=>({title:'#'+x.n+' '+x.t,summary:'원문·조사 기록 · 47개 주제 원문',page:'archive',anchor:'archive-item-'+x.n})),...(D.planHTML?[{title:'제출 수학계획서 원문',summary:'원문·조사 기록 · 수학계획서 전체',page:'archive',anchor:'archive-plan'}]:[])]:[]),...D.scripts.map(x=>({title:x.title,summary:x.core,page:'interview',anchor:'script-'+x.id})),...(D.followupClusters||[]).map(c=>({title:c.title,summary:'꼬리질문 주제 · '+(c.items||[]).length+'문항 · '+(c.summary||''),page:'followups',anchor:'cluster-'+c.id})),...(D.narrative&&D.narrative.oneLine&&M.status==='ready'?[{title:'핵심 서사',summary:D.narrative.oneLine,page:'home',anchor:'narrative'}]:[]),...D.followups.map((x,i)=>({title:x.question,summary:x.answer,page:'followups',anchor:'question-'+i})),...(D.sources||[]).flatMap(e=>(e.records||[e]).map(x=>({title:x.name,summary:x.id+(e.aliases&&e.aliases.length?' (같은 문서: '+[e.id,...e.aliases].filter(y=>y!==x.id).join('·')+')':'')+' · '+x.what,page:'facts',anchor:'src-'+x.id}))),...terms.map((x,i)=>({title:x.term,summary:x.meaning,page:'cases',anchor:'term-'+i})),...D.semesters.map(x=>({title:x.phase+' '+x.title,summary:x.goals.join(' ')+(x.burden?' / 현실 부담 '+x.burden.credits+' · '+x.burden.tasks:''),page:'roadmap',anchor:'roadmap-detail'})),...((D.curriculum&&D.curriculum.topics)||[]).flatMap(t=>t.courses.map(n=>({title:n,summary:'교육과정 · '+t.name+(t.priority?' · '+t.priority:''),page:'coursebook',anchor:'curriculum'}))),...(D.feasibility&&D.feasibility.notes&&D.feasibility.notes.timeBudget?[{title:'주간 시간예산',summary:D.feasibility.notes.timeBudget.replace(/\*\*/g,''),page:'roadmap',anchor:'time-budget'}]:[]),...(D.budget||[]).length?[{title:'장학·학비 시나리오',summary:(D.budget||[]).map(b=>b[0]+' '+b[1]).join(' / '),page:'reality',anchor:'money'}]:[],...registry().map(r=>({title:r.topic,summary:'팩트 레지스트리 · '+rowStatuses(r).join('·'),page:'facts',anchor:'fact-'+r.id}))];const res=all.filter(x=>!q||`${x.title} ${x.summary}`.toLocaleLowerCase().includes(q)).slice(0,18);$('#searchResults').innerHTML=res.map(x=>`<button class="search-result" data-search-page="${x.page}" data-search-anchor="${x.anchor||''}"><strong>${escape(x.title)}</strong><p>${escape(x.summary.slice(0,96))}${x.summary.length>96?'…':''}</p></button>`).join('')||'<p class="search-empty">검색 결과가 없어.</p>'}
function timerDisplay(s){const el=$('#timer-'+s);if(!el)return;const n=state.elapsed;const mm=String(Math.floor(n/60)).padStart(2,'0'),ss=String(n%60).padStart(2,'0');const digits=el.querySelector('.timer-digits');digits.textContent=`${mm}:${ss}`;digits.classList.toggle('over',n> (state.duration==='short'?60:110));el.querySelector('.timer-fill').style.width=Math.min(100,(n/(state.duration==='short'?60:110))*100)+'%';const b=el.querySelector('[data-action^="timer:"]');if(b)b.textContent=state.timer?'Ⅱ 일시정지':'▶ 시작'}
function clearTimer(){if(state.timer)clearInterval(state.timer);state.timer=null;state.timerStart=null;state.elapsed=0;state.activeScript=null}
function runTimer(id){if(state.activeScript && state.activeScript!==id){clearTimer();for(const s of D.scripts)timerDisplay(s.id)}state.activeScript=id;if(state.timer){clearInterval(state.timer);state.timer=null;timerDisplay(id);return}const start=Date.now(),before=state.elapsed;state.timer=setInterval(()=>{state.elapsed=before+Math.floor((Date.now()-start)/1000);timerDisplay(id)},200);timerDisplay(id)}
async function copy(v){try{await navigator.clipboard.writeText(v);toast('전체 내용을 복사했어.')}catch{const ta=document.createElement('textarea');ta.value=v;ta.style.position='fixed';ta.style.opacity=0;document.body.append(ta);ta.select();try{document.execCommand('copy');toast('전체 내용을 복사했어.')}catch{toast('복사 권한이 없어. 브라우저에서 선택해줘.')}ta.remove()}}
function toggleFocus(){state.focus=!state.focus;document.body.classList.toggle('fullscreen-mode',state.focus);render()}
document.addEventListener('click',e=>{
 const sw=e.target.closest('[data-school-switch]');if(sw){switchSchool(sw.dataset.schoolSwitch);return}
 const gr=e.target.closest('[data-grad-route]');if(gr&&GRAD&&Object.hasOwn(GRAD.GRAD_ROUTES,gr.dataset.gradRoute)){state.graduationTrack=gr.dataset.gradRoute;state.roadmapTrack=state.graduationTrack==='coursework'?'credits30':'thesis';saved['graduation-route']=state.graduationTrack;persist();const y=window.scrollY;render();window.scrollTo({top:y,behavior:'instant'});document.querySelector('[data-grad-route="'+state.graduationTrack+'"]')?.focus({preventScroll:true});return;}
 const gj=e.target.closest('[data-grad-jump]');if(gj){document.getElementById(gj.dataset.gradJump)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
 const track=e.target.closest('[data-roadmap-track]');if(track){state.roadmapTrack=track.dataset.roadmapTrack==='credits30'?'credits30':'thesis';if(GRAD){state.graduationTrack=state.roadmapTrack==='credits30'?'coursework':state.graduationTrack==='project'?'project':'thesis';saved['graduation-route']=state.graduationTrack;persist()}const y=window.scrollY;render();window.scrollTo({top:y,behavior:'instant'});return}
 const ct=e.target.closest('[data-course-term]');if(ct){state.courseTerm=ct.dataset.courseTerm==='전체'?'전체':Number(ct.dataset.courseTerm);render();return}
 const cg=e.target.closest('[data-course-group]');if(cg){state.courseGroup=cg.dataset.courseGroup;render();return}
 const cp=e.target.closest('[data-course-plan]');if(cp){const p=D.coursePlans[Number(cp.dataset.coursePlan)];state.courseChoices=[...p.items];state.courseTerm=p.term;state.courseGroup='전체';saved['course-choices-v1']=[...state.courseChoices];persist();render();document.querySelector('.course-result')?.scrollIntoView({behavior:'smooth',block:'center'});return}
 const cs=e.target.closest('[data-course-select]');if(cs){const code=cs.dataset.courseSelect,c=D.actualCourses.find(x=>x.code===code);if(c){if(state.courseChoices.includes(code))state.courseChoices=state.courseChoices.filter(x=>x!==code);else{if(selectedCourses().length&&selectedCourses()[0].semester!==c.semester){state.courseChoices=[];toast('학기가 달라 기존 조합을 비웠어.');}state.courseChoices.push(code)}saved['course-choices-v1']=[...state.courseChoices];persist();render();}return}
 const pool=e.target.closest('[data-mock-pool]');if(pool){state.mockPool=pool.dataset.mockPool;stopMock();state.mockSeconds=0;state.mockReveal=false;state.mockId=filteredBank()[0]?.id||'';render();return}
 const rating=e.target.closest('[data-confidence]');if(rating){setcheck('confidence-'+rating.dataset.confidenceId,Number(rating.dataset.confidence));render();return}
 const nb=e.target.closest('[data-page]');if(nb){if(nb.matches('a[href]')){/* 링크(보고서 인용 등): 기본 이동을 막고 새 기록을 한 번만 쌓아 뒤로 가기가 원래 화면으로 돌아오게 한다. */e.preventDefault();const target=nb.dataset.page;if(makeHash(school,target)!==location.hash)history.pushState(null,'',makeHash(school,target));nav(target,false);return}nav(nb.dataset.page);return}
 const dur=e.target.closest('[data-duration]');if(dur){state.duration=dur.dataset.duration;clearTimer();render();return}
 const fil=e.target.closest('[data-filter]');if(fil){state.followFilter=fil.dataset.filter;render();const x=$('#qSearch');if(x){x.focus();x.setSelectionRange(x.value.length,x.value.length)}return}
 const ff=e.target.closest('[data-fact-filter]');if(ff){state.factFilter=ff.dataset.factFilter;render();return}
 const vt=e.target.closest('[data-variant-toggle]');if(vt){const box=vt.closest('.q-variants'),list=[...box.querySelectorAll('.q-item')],open=!list.every(x=>x.classList.contains('open'));list.forEach(x=>x.classList.toggle('open',open));vt.textContent=open?'모두 접기':'나란히 펼치기';return}
 const jp=e.target.closest('[data-jump]');if(jp){const t=document.getElementById(jp.dataset.jump);if(t){if(t.tagName==='DETAILS')t.open=true;t.scrollIntoView({behavior:'smooth',block:'start'})}return}
 const qt=e.target.closest('[data-q]');if(qt){const el=qt.closest('.q-item');el.classList.toggle('open');return}
 const tab=e.target.closest('[data-archive]');if(tab){state.archiveTab=tab.dataset.archive;render();return}
 const sr=e.target.closest('[data-search-page]');if(sr){closeSearch();const pg=sr.dataset.searchPage,an=sr.dataset.searchAnchor;if(pg==='wms-practice'&&an){nav(an);return}prepAnchor(pg,an);nav(pg);if(an){setTimeout(()=>{const target=document.getElementById(an);if(target){target.closest('details')?.setAttribute('open','');target.scrollIntoView({behavior:'smooth',block:'center'});if(target.classList.contains('q-item'))target.classList.add('open')}},70)}return}
 const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
 if(a==='print'){window.print();return}
 if(a.startsWith('go:')){const[,pg,anchor]=a.split(':');prepAnchor(pg,anchor);nav(pg);if(anchor)jumpTo(anchor);return}
 if(a==='mockNext'){nextMock();return}
 if(a==='mockAll'){state.mockPool='전체';nextMock();return}
 if(a==='mockReveal'){state.mockReveal=!state.mockReveal;render();return}
 if(a==='mockReset'){stopMock();state.mockSeconds=0;render();return}
 if(a==='mockTimer'){if(state.mockInterval){stopMock();render();return}const then=Date.now()-state.mockSeconds*1000;state.mockInterval=setInterval(()=>{state.mockSeconds=Math.floor((Date.now()-then)/1000);formatMockTime()},250);e.target.textContent='■ 일시정지';return}
 if(a==='focus'){toggleFocus();return}
 if(a==='randomQuestion'){state.followFilter='전체';state.qSearch='';render();const i=Math.floor(Math.random()*D.followups.length),el=$('#question-'+i);el?.classList.add('open');el?.scrollIntoView({behavior:'smooth',block:'center'});return}
 if(a.startsWith('timer:')){runTimer(a.split(':')[1]);return}
 if(a.startsWith('resetTimer:')){clearTimer();for(const s of D.scripts)timerDisplay(s.id);return}
 if(a.startsWith('blur:')){let id=a.split(':')[1];setcheck('blur-'+id,!checked('blur-'+id));render();return}
 if(a.startsWith('markq:')){const id=a.split(':')[1];setcheck('question-'+id,!checked('question-'+id));render();$('#question-'+id)?.classList.add('open');return}
 if(a.startsWith('mark:')){let id=a.split(':')[1];setcheck('script-'+id,!checked('script-'+id));render();return}
 if(a.startsWith('copy:')){const s=D.scripts.find(x=>x.id===a.split(':')[1]);copy(s.title+'\n\n'+(state.duration==='micro'?s.micro:state.duration==='short'?s.short:s.long));return}
 if(a.startsWith('copyq:')){const s=D.followups[Number(a.split(':')[1])];copy('Q. '+s.question+'\nA. '+s.answer);return}
 if(a==='copyArchive'){const div=document.createElement('div');div.innerHTML=state.archiveTab==='plan'?D.planHTML:D.archiveHTML;copy(div.textContent||'');return}
});
document.addEventListener('change',e=>{if(e.target.matches('[data-check]')){setcheck(e.target.dataset.check,e.target.checked);if(state.page==='graduation')GRAD?.refreshGradProgress();if(state.page==='home')refreshChecks();if(state.page==='briefing'){render();return}if(state.page==='reality'){const p=$('#realProgress');if(p){const [n,max]=getProgress('reality-',D.risks.length);p.innerHTML=progress(n,max)}}}});
document.addEventListener('input',e=>{if(e.target.id==='qSearch'){state.qSearch=e.target.value;const caret=e.target.selectionStart;render();const x=$('#qSearch');x.focus();x.setSelectionRange(caret,caret)}if(e.target.id==='globalSearch')search(e.target.value)});
$('#searchOpen').onclick=openSearch;$('#searchClose').onclick=closeSearch;
$('#menuToggle').onclick=()=>{$('#sidebar').classList.toggle('mobile-open');$('#overlay').classList.add('menu-backdrop');$('#overlay').hidden=false};
$('#overlay').onclick=()=>{closeSearch();$('#sidebar').classList.remove('mobile-open');$('#overlay').classList.remove('menu-backdrop')};
$('#fontToggle').onclick=()=>{const now=parseFloat(document.documentElement.style.getPropertyValue('--text-scale')||'1');document.documentElement.style.setProperty('--text-scale',now>=1.23?'1':String((now+.12).toFixed(2)));toast('본문 글자 크기를 조정했어.')};
$('#printBtn').onclick=()=>window.print();
$('#themeToggle').onclick=cycleTheme;applyTheme();applyVersion();
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change',()=>applyTheme());
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSearch();$('#sidebar').classList.remove('mobile-open');$('#overlay').hidden=true}if(e.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName)){e.preventDefault();openSearch()}});
window.addEventListener('hashchange',()=>{route(location.hash.slice(1));applyVersion()});
route(location.hash.slice(1));booted=true;
})();
