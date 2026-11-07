/* 졸업요건 페이지 모듈. app.js가 ATELIER_MODULES.graduation(app)으로 앱의 상태·헬퍼를 넘겨 초기화한다. */
window.ATELIER_MODULES=window.ATELIER_MODULES||{};
window.ATELIER_MODULES.graduation=function(app){
const {state,saved,escape,section,pill,btn,check,checked,progress,$}=app;
const GRAD_SOURCES=[
 ['G1','학과별 석사학위청구방법 현황','https://ibook.hongik.ac.kr/Viewer/SKHSIBY3H5QR','2/2쪽 · 국방AI융합학과 ○/○/○ · 2026.9.1 기준'],
 ['G2','일반대학원 학칙','https://www.hongik.ac.kr/kr/introduction/regulations-book.do?mode=list&srCategoryId=111','제12·13·18·20·22·24·29~35조 · 기간·학점·학위'],
 ['G3','일반대학원 학사내규','https://www.hongik.ac.kr/kr/introduction/regulations-book.do?mode=list&srCategoryId=112','제4·17~24조 · 선수과목·시험 자격과 합격기준'],
 ['G4','2026-2 석사학위청구방법 신청·변경','https://www.hongik.ac.kr/kr/education/notice-grad.do?articleNo=155587&mode=view','2026.8.24 · 신청 시기·승인·교과목이수 신청 의무'],
 ['G5','2026-2 논문·개별연구과제 심사 안내책자','https://ibook.hongik.ac.kr/Viewer/COVWAKL776FU','3쪽 비교 / 5~6쪽 지도교수 / 12쪽 자격 / 31쪽 심사료 / 37쪽 제출 / 44쪽 교과목이수'],
 ['G6','졸업자격시험 공식 학사안내','https://www.hongik.ac.kr/kr/education/graduation-examination.do','종합시험·영어 대체점수·석사과목확인 PDF'],
 ['G7','2026-2 외국어시험 안내','https://www.hongik.ac.kr/kr/education/notice-grad.do?articleNo=154829&mode=view&noCat=377','2026.8.4 · 대체성적의 제출일 유효성·방식별 마감'],
 ['G8','2026-2 연구윤리교육 안내','https://www.hongik.ac.kr/kr/education/notice-grad.do?articleNo=154973&mode=view','2026.8.10 · 2시간 이상·교과목이수 졸업자도 의무'],
 ['G9','2026-2 논문·개별연구과제 양식과 심사 안내','https://www.hongik.ac.kr/kr/education/notice-grad.do?articleNo=159627&mode=view','2026.10.27 · 심사·표절검사·인쇄본 의무 제출 폐지'],
 ['G10','국방AI융합학과 교육과정','https://gbai.hongik.ac.kr/gbai/0401.do','학과 공개 교육과정 · 개인별 선수 지정 및 졸업학기 공지와 구별'],
 ['G11','학과 공식 소개자료 · 국방과 기술 제570호','https://gbai.hongik.ac.kr/gbai/0301.do?articleNo=155331&mode=view','2026.8.19 게시 · 첨부 PDF 4/12쪽(인쇄73쪽), 11/12쪽(인쇄80쪽): 모든 교과목 선택 운영'],
 ['G12','2026-2 종합시험 안내','https://www.hongik.ac.kr/kr/education/notice-grad.do?articleNo=154826&mode=view&noCat=377','신청·시험 공통요건 · 해당 학기 응시과목은 클래스넷 조회']
];
const GRAD_ROUTES={
 thesis:{name:'학위논문',credits:24,output:'논문 + 심사·구술시험',label:'연구를 논문으로 완성',steps:['교과 9학점 · 지도교수 상담','교과 9학점 · 연구계획','교과 6학점 · 지도·종합시험','논문 작성·심사·최종 제출'],note:'논문심사와 구술시험을 통과한 뒤 최종 원문과 인준서류까지 제출해야 해. 학칙은 교과 24학점 외에 논문·작품 6학점을 별도로 표기해.',checks:[['adviser','심사 전 1개 지도학기를 완료했다'],['eligibility','논문제출자격 조회의 모든 항목이 PASS다'],['thesis-review','논문 심사·구술시험에 합격했다'],['thesis-final','최종 PDF·인준지 업로드와 학과 제출서류를 완료했다']]},
 project:{name:'개별연구과제',credits:24,output:'연구과제보고서 + 심사',label:'연구를 보고서로 완성',steps:['교과 9학점 · 지도교수 상담','교과 9학점 · 연구과제 설계','교과 6학점 · 지도·종합시험','보고서 작성·심사·최종 제출'],note:'지도교수가 보고서를 심사해. 공동지도교수가 있으면 2인이 심사해. 일반대학원 공식 근거는 24학점과 과제 심사이며, 별도 과제 6학점 수강을 필수로 추가하지 않았어.',checks:[['adviser','심사 전 1개 지도학기를 완료했다'],['eligibility','논문제출자격 조회의 모든 항목이 PASS다'],['project-review','개별연구과제보고서 심사에 합격했다'],['project-final','최종 PDF·인준지 업로드와 학과 제출서류를 완료했다']]},
 coursework:{name:'교과목이수학점',credits:30,output:'추가 교과목 이수',label:'논문·보고서 없이 학위 취득',steps:['교과 9학점','교과 9학점 · 방법 변경 신청','교과 6학점 · 종합시험','교과 6학점 · 졸업요건 조회'],note:'논문·개별연구보고서 제출과 그 심사는 없어. 다만 종합시험·영어·연구윤리·지정 선수과목은 그대로 필요해. 청구방법 신청·승인이 없으면 30학점을 채워도 이 방식의 졸업사정에서 제외돼.',checks:[['coursework-approval','교과목이수학점 방식의 신청·승인이 완료됐다'],['coursework-final','교과목이수학점 졸업요건 조회에서 최종 PASS를 확인했다']]}
};
state.graduationTrack=Object.hasOwn(GRAD_ROUTES,saved['graduation-route'])?saved['graduation-route']:'thesis';
function gradRef(...ids){return '<span class="graduation-refs">'+ids.map(id=>{const s=GRAD_SOURCES.find(x=>x[0]===id);return `<a href="${escape(s[2])}" target="_blank" rel="noopener noreferrer" title="${escape(s[1])}">${id} ↗</a>`}).join(' ')+'</span>'}
function gradChecklist(){const r=GRAD_ROUTES[state.graduationTrack];return [
 ['registration','정규 4학기 이상 등록했다'],['credits-'+state.graduationTrack,`필수과목을 포함한 교과 ${r.credits}학점 이상과 평균 B0(3.0)를 충족했다`],
 ['prerequisites','개인별 지정 선수과목을 모두 이수했다 (미지정이면 해당 없음)'],['comprehensive','종합시험 2과목 합격이 반영됐다'],['english','영어시험 또는 대체성적·대체강좌 합격이 반영됐다'],['ethics','연구윤리교육 2시간 이상 이수가 반영됐다'],['method','학위청구방법과 필요한 승인 상태를 확인했다'],...r.checks,
 ['final-admin','해당자 연구등록금과 학과의 추가요건을 확인했다']
];}
function refreshGradProgress(){const items=gradChecklist(),n=items.filter(([k])=>checked('grad-'+k)).length;const el=$('#graduationProgress');if(el)el.innerHTML=progress(n,items.length);}
function graduation(){const route=state.graduationTrack,r=GRAD_ROUTES[route],coursework=route==='coursework',items=gradChecklist(),n=items.filter(([k])=>checked('grad-'+k)).length;
return `<div class="graduation-page">
<header class="graduation-hero"><div class="section-eyebrow">GRADUATION / 국방AI융합학과</div><h1>석사학위까지,<br><em>세 가지 길이 있어.</em></h1><p>홍익대학교 일반대학원 · 세종캠퍼스 · 한국인 석사생 기준.<br>학과별 표, 학칙, 심사 안내책자와 시험 공지를 직접 대조한 졸업요건이야.</p><div class="pill-row">${pill('확인일 2026.11.02','a')}${pill('학과 현황 2026.09.01')}${pill('2026-2 운영 기준')}</div></header>
<section class="graduation-verdict"><div><span class="overline">공식 표 직접 확인</span><h2>논문 · 개별연구과제 · 교과목이수<br>국방AI는 모두 허용돼.</h2><p>현황표 2페이지의 해당 행은 <b>○ / ○ / ○</b>. 최종 방법은 지도교수·학과장 승인으로 확정돼. ${gradRef('G1','G4')}</p></div><div class="graduation-seal" aria-label="세 경로 모두 허용"><strong>3 / 3</strong><span>학과 허용 확인</span></div></section>
<p class="graduation-scope">2027 입학을 준비할 때 사용할 수 있는 현재 기준이야. 2027~2029의 실제 개설과목·신청일·개정 규정은 해당 학기 공지가 정해. 과거 마감일을 미래 일정으로 사용하지 않았어.</p>
<nav class="graduation-jumps" aria-label="졸업요건 바로가기">${[['route','졸업 경로'],['common','공통요건'],['exams','종합·영어시험'],['process','신청·심사'],['checklist','내 체크리스트'],['sources','원문 근거']].map(([id,label])=>`<button data-grad-jump="graduation-${id}">${label}</button>`).join('')}</nav>

<section id="graduation-route"><div class="section-heading"><h2>01. 어떤 방식으로 졸업할까?</h2><span>선택하면 아래 일정·체크리스트가 바뀌어</span></div>
<div class="graduation-route-grid" role="group" aria-label="졸업 경로 선택">${Object.entries(GRAD_ROUTES).map(([key,x])=>`<button class="graduation-route ${key===route?'selected':''}" data-grad-route="${key}" aria-pressed="${key===route}"><span class="overline">${escape(x.label)}</span><strong>${x.credits}<small>교과학점</small></strong><h3>${escape(x.name)}</h3><span>${escape(x.output)}</span><b>${key===route?'선택한 경로 ✓':'경로 살펴보기 →'}</b></button>`).join('')}</div>
<p class="graduation-route-default"><b>면접 답변 기준:</b> 논문 24학점을 우선 목표로, 교과목이수 30학점은 방법 신청·승인 시 대안으로 말한다.</p>
<div class="graduation-route-note" role="status"><strong>${escape(r.name)}</strong><p>${escape(r.note)} ${gradRef('G2','G5')}</p></div>
<details class="graduation-details"><summary>24학점과 30학점을 정확히 구분하기</summary><p>논문 경로의 <b>교과 24학점 + 별도 논문·작품 6학점</b> 표기는 학칙 제29조①의 내용이야. 교과목 30학점 경로와는 다르며, 논문 6학점을 일반 수업 2과목으로 바꿔 계산하지 않아. 개별연구과제는 같은 조④와 안내책자에서 <b>24학점 + 보고서 심사</b>로 규정해. 특수대학원의 별도 연구과제 학점 규정을 이 학과에 적용하지 않았어. ${gradRef('G2','G5')}</p></details>
<h3 class="graduation-subtitle">4학기 계획 예시 · ${escape(r.name)}</h3><div class="graduation-timeline">${r.steps.map((s,i)=>`<article><span>0${i+1} / ${i+1}학기</span><strong>${coursework?[9,9,6,6][i]:[9,9,6,0][i]}<small>교과학점</small></strong><p>${escape(s)}</p></article>`).join('')}</div>
<p class="graduation-caption">2027.3 입학 → 2029.2 학위 취득 목표의 계획 예시야. ${coursework?'9+9+6+6=30학점. 마지막 학기에도 교과목을 이수해.':'9+9+6=24학점을 3학기까지 취득해야 4학기 심사가 가능해. 4학기 0은 추가 교과목 수강의 예시이며 등록·지도·심사가 면제되는 뜻이 아니야.'} ${gradRef('G5')}</p></section>

<section id="graduation-common"><div class="section-heading"><h2>02. 세 경로 모두 필요한 것</h2><span>비논문도 시험·윤리교육은 필요해</span></div>
<div class="graduation-common-grid">
<article class="card"><span class="overline">등록 · 기간</span><h3>기본 4학기</h3><p>일반 석사 수업연한 2년, 재학연한 3년(6학기). 휴학기간은 재학연한에 포함되지 않아. 수료 후 논문 제출시한과 재학연한은 구분해야 해. ${gradRef('G2')}</p></article>
<article class="card"><span class="overline">학점 · 성적</span><h3>평균 B0 · 3.0 이상</h3><p>경로별 교과 24 또는 30학점을 충족해야 해. 학점 인정은 C0 이상, 전체 평균은 B0 이상이야. 2026 학과 소개는 전 과목 선택 운영이라고 명시해. 2027 적용 교육과정은 입학 후 확인해. ${gradRef('G2','G11')}</p></article>
<article class="card"><span class="overline">개인별 지정</span><h3>선수과목 별도 이수</h3><p>학과가 필요하다고 인정하면 석사 선수과목을 지정해. 내규상 9학점 이내, C0(2.0) 이상. 선수학점은 졸업에 필요한 24·30학점에 합산하지 않아. ${gradRef('G2','G3')}</p></article>
<article class="card"><span class="overline">연구윤리</span><h3>2시간 이상 · 1회 이상</h3><p>재학 또는 수료 기간에 대학원생 대상 ‘연구윤리’ 교육을 이수해야 해. 교과목이수 졸업자도 필수야. 클래스넷 반영을 확인하고 외부 교육은 이수증을 제출해. ${gradRef('G8')}</p></article>
</div></section>

<section id="graduation-exams"><div class="section-heading"><h2>03. 종합시험과 영어</h2><span>합격 처리까지 확인</span></div>
<div class="grid grid-2"><article class="card"><span class="overline">COMPREHENSIVE EXAM</span><h3>3학기부터 · 2과목</h3><ul class="simple-list"><li>3학기 이상 등록 + 전공필수 포함 18학점 이상 취득 (학교 공통 문구)</li><li>지정 선수과목 이수 완료 + 전체 평균 B0(3.0) 이상</li><li>학과장 승인 후 신청, 과목별 70점 이상 합격</li><li>불합격 과목은 재응시 가능. 매년 3월·9월 시행</li></ul><p>실제 과목·문제은행은 클래스넷 ‘외국어 및 종합시험 → 종합시험 응시과목보기’에서 확인해. 공개 자료에서는 국방AI의 구체적인 2과목을 확인하지 못했어. ${gradRef('G3','G5','G12')}</p></article>
<article class="card"><span class="overline">FOREIGN LANGUAGE</span><h3>국방AI 한국인 학생은 영어</h3><p>공식 ‘석사학위과정 학과별 외국어자격시험 시행과목’ PDF 1페이지에서 <b>공학계열 → 국방AI융합학과 → 한국인: 영어</b>를 직접 확인했어.</p><p><b>JLPT N1은 국방AI 한국인 학생의 대체성적으로 인정되는 언어가 아니야.</b> 학교 공통 목록에 일본어가 있어도 학과 인정 언어 조건을 먼저 충족해야 해. 외국인에게 적용되는 영어·한국어 규정과 구별해. ${gradRef('G6','G7')}</p><a href="graduation/foreign-subjects.pdf" target="_blank" rel="noopener noreferrer">직접 확인한 학과별 PDF ↗</a></article></div>
<div class="graduation-english-ways"><article><b>A. 학교 영어시험</b><p>1차부터 신청 가능. 100점 만점 70점 이상. 2026-2 안내는 약 1시간 주관식, 석사 응시료 1만원이야.</p></article><article><b>B. 영어 공인성적</b><p>기준 이상의 유효 성적을 학기 공지의 제출 경로로 제출. 대체성적 제출자는 학교 시험 신청·응시료 납부가 필요 없어.</p></article><article><b>C. 인정 대체강좌</b><p>국제언어교육원의 대학원 외국어시험 대체강좌 이수·합격. 일반 어학강좌 수강만으로 자동 인정되지는 않아.</p></article></div>
<div class="card graduation-score-card"><h3>영어 대체성적 최소 기준 ${gradRef('G6')}</h3><dl class="graduation-scores">${[['TOEIC','700'],['TEPS','340'],['TOEFL iBT','71'],['IELTS','6.0'],['G-TELP Level 2','65'],['OPIc','IM3'],['TOEIC Speaking','130']].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}<small> 이상</small></dd></div>`).join('')}</dl><div class="callout"><b>유효기간은 제출일 기준이야.</b> 2026-2 공지는 발행일부터 2년 이내이며 제출일에 유효한 성적만 인정한다고 안내해. 졸업일까지 성적 유효기간을 유지해야 한다는 조건으로 바꾸어 쓰지 않았어. 상시 학사안내에는 응시일 기준 문구도 있어 제출 학기의 공지와 성적표 유효기간을 함께 확인해. ${gradRef('G7')}</div></div>
</section>

<section id="graduation-process"><div class="section-heading"><h2>04. 신청부터 학위 취득까지</h2><span>${escape(r.name)} 경로</span></div>
<ol class="graduation-process">
<li><b>학위청구방법 확인·신청</b><p>일반대학원의 기본값은 논문. 다른 방식은 2차부터 매 학기 초 신청하고 지도교수·학과장 승인을 확인해. 4월·10월 심사 신청 때 변경하는 절차가 아니야. ${gradRef('G4','G5')}</p></li>
${coursework?`<li><b>30학점과 공통요건 완료</b><p>남은 수업과 종합시험·영어·선수과목·윤리교육을 마치고, 고지된 연구등록금이 있는 경우 완납해. ${gradRef('G5')}</p></li><li><b>교과목이수학점 졸업요건 조회</b><p>클래스넷 ‘논문 및 졸업 → 교과목이수학점 졸업요건 조회’의 최종 자격을 확인해. 논문이나 과제보고서 심사·제출 단계는 없어. ${gradRef('G5')}</p></li>`:`<li><b>심사 전 학기에 지도·학점 준비</b><p>심사 전 1개 지도학기가 완료되어야 해. 4차 심사가 목표라면 늦어도 3차 초 지도교수 승인, 3차 말 교과 24학점 취득이 필요해. ${gradRef('G5')}</p></li><li><b>제출자격 PASS → 심사 신청·납부</b><p>클래스넷 ‘논문제출자격 조회’에서 자격을 확인하고 지도교수 허락 후 신청해. ${route==='thesis'?'논문은 통상 3인(공동지도 시 4인)이 심사하며 구술시험도 있어.':'개별연구과제는 지도교수(공동지도 시 2인)가 심사해.'} ${gradRef('G2','G5','G9')}</p></li><li><b>심사 통과 → 최종 제출</b><p>dCollection에 최종 PDF·인준지를 업로드하고, 학과에 인준지 원본·저작권동의서·윤리서약서·최종 표절검사결과 등 요구 서류를 제출해. 인쇄본 의무 제출은 폐지됐지만 심사위원 요청 시 가제본을 준비해. ${gradRef('G5','G9')}</p></li>`}
</ol>
<details class="graduation-details"><summary>2026학년도 2학기 실제 일정 보기 (2027 입학생의 확정 일정 아님)</summary><div class="graduation-table-wrap"><table class="data-table"><thead><tr><th>업무</th><th>2026-2 사례</th><th>근거</th></tr></thead><tbody><tr><th>청구방법 신청</th><td>9.1~9.11 / 교수 승인 ~9.16</td><td>${gradRef('G4')}</td></tr><tr><th>논문·과제 졸업자의 영어 대체성적·윤리교육</th><td>9.30까지</td><td>${gradRef('G7','G8')}</td></tr><tr><th>교과목이수 졸업자의 영어 대체성적·윤리교육</th><td>12.31까지</td><td>${gradRef('G7','G8')}</td></tr><tr><th>심사 신청·납부</th><td>10.12~10.16 / 석사 논문 75,000원·과제 25,000원</td><td>${gradRef('G5')}</td></tr><tr><th>심사</th><td>11.9~12.11</td><td>${gradRef('G9')}</td></tr><tr><th>최종 원문 / 학과 서류</th><td>2027.1.6 / 1.8까지</td><td>${gradRef('G5')}</td></tr></tbody></table></div><p>마감은 졸업학기마다 달라져. 특히 심사 경로는 영어·윤리를 학기 말로 미루면 심사를 신청하지 못할 수 있어.</p></details>
</section>

<section id="graduation-checklist"><div class="section-heading"><h2>05. 내 졸업 준비 체크리스트</h2><span>${escape(r.name)}</span></div><div class="card"><div id="graduationProgress">${progress(n,items.length)}</div><p class="graduation-caption">자가 점검 기록이야. 체크가 학교의 승인이나 합격 처리를 대신하지 않아. 공통 항목은 경로를 바꿔도 유지되고, 경로별 항목은 따로 저장돼.</p><div class="checklist">${items.map(([k,t])=>check('grad-'+k,t)).join('')}</div></div></section>

<section id="graduation-department"><div class="section-heading"><h2>06. 학과별 세부사항의 확인 범위</h2><span>확인한 것과 남은 것을 구분</span></div><div class="card"><p><b>전 과목 선택 운영:</b> 학과가 게시한 2026 소개자료 PDF 4쪽(인쇄 73쪽)과 학과장 인터뷰 11쪽(인쇄 80쪽)에서 직접 확인했어. 이를 ‘2027 입학생에게도 필수가 절대 없다’는 보장으로 확장하지 않았어. ${gradRef('G11')} <a href="https://gbai.hongik.ac.kr/gbai/0301.do?articleNo=155331&amp;attachNo=90819&amp;mode=download" target="_blank" rel="noopener noreferrer">확인한 소개 PDF ↗</a></p><p><b>공개 원문에서 아직 확정하지 못한 항목:</b> 실제 종합시험 2과목·문제은행, 학과 고유의 추가 연구실적·보고서 세부기준, 2027 교육과정의 최종 이수구분. 학과 공지와 소개자료·요람을 검토했으나 이 항목의 확정 자료는 찾지 못했어. 교육과정 웹페이지의 동적 목록도 오류 응답이어서 최신 행정상 이수구분을 검증할 수 없었어. ${gradRef('G10','G11','G12')}</p><p>개인별 선수 지정·지도교수 배정과 졸업학기의 추가 공지는 별도야. <b>세 졸업 경로가 모두 허용된다는 사실은 이미 원문으로 확인했어.</b></p><div class="graduation-contact"><span>시험·학사 교학팀 <a href="tel:023201297">02-320-1297</a></span><a href="mailto:grad1297@hongik.ac.kr">grad1297@hongik.ac.kr</a></div></div></section>

<section id="graduation-sources"><div class="section-heading"><h2>07. 직접 확인한 원문</h2><span>문서 위치까지 남겼어</span></div><details class="graduation-details"><summary>학과별 학위청구방법 표 2페이지 펼치기</summary><p>제목: 일반대학원 석사학위청구방법 현황. 세종 → 공학계열 → 국방AI융합학과. 논문 / 개별연구과제 / 교과목이수학점 순서로 모두 ○. 하단 기준일 2026.9.1 및 지도교수·학과장 승인 조건을 함께 확인했어.</p><a href="graduation/degree-methods-page2.jpg" target="_blank" rel="noopener noreferrer"><img class="graduation-proof" loading="lazy" src="graduation/degree-methods-page2.jpg" alt="2026년 9월 1일 기준 일반대학원 석사학위청구방법 현황 2페이지. 국방AI융합학과 논문·개별연구과제·교과목이수학점 모두 동그라미." width="2037" height="2880"></a></details><div class="card">${GRAD_SOURCES.map(s=>`<article class="source-item"><span class="source-num">${s[0]}</span><div><h4><a href="${escape(s[2])}" target="_blank" rel="noopener noreferrer">${escape(s[1])} ↗</a></h4><p>${escape(s[3])}</p></div></article>`).join('')}</div><div class="callout"><b>이번 조사에서 바로잡은 내용</b><br>‘개별연구과제만 허용’ → 세 방식 모두 허용.<br>‘개별연구과제 6학점 별도 수강 필수’ → 일반대학원 근거에서 확인되지 않음.<br>‘영어성적은 졸업일까지 유효해야 함’ → 제출일에 유효한 성적을 제출.<br>‘수업 30학점이면 자동 졸업’ → 시험·윤리·선수·신청·승인 등도 필요.</div></section>
</div>`;}
return {GRAD_SOURCES,GRAD_ROUTES,graduation,refreshGradProgress};
};
