/*
 * 아주대학교 면접 자료 골격 (status: planned).
 * data는 홍익대 data와 같은 최상위 키를 모두 가진다(빈 값). build.mjs가 키 파리티를 검사한다.
 * 채우는 방법: meta.plannedSections의 keys에 적힌 data 키를 채우면 해당 화면이 '준비 중' 카드 대신 실제 내용으로 바뀐다.
 * (feasibility·budget·dossierHTML 등 홍익대 전용 화면의 키도 파리티를 위해 빈 값으로 둔다.)
 */
window.ATELIER_SCHOOLS = window.ATELIER_SCHOOLS || {};
window.ATELIER_SCHOOLS.ajou = {
"meta": {
 "id": "ajou",
 "name": "아주대학교",
 "short": "아주대",
 "dept": "",
 "campus": "",
 "degree": "",
 "interviewDate": null,
 "interviewLabel": "",
 "storageKey": "ajou-study-v1",
 "brandMark": "AJOU",
 "breadcrumb": "AJOU UNIVERSITY <span>/</span> GRADUATE ADMISSION",
 "footer": "AJOU · PERSONAL STUDY ATELIER",
 "title": "아주대학교 · 면접 아틀리에 — 준비 중",
 "status": "planned",
 "plannedSections": {
  "interview": {"keys": ["scripts"], "items": ["아주대 지원동기·자기소개 핵심 문항", "문항별 30초·60초·90초 답변", "문항별 팩트체크와 출처"]},
  "followups": {"keys": ["followups"], "items": ["아주대 학과·연구실 기준 예상 꼬리질문", "주제 태그별 답변 초안", "학습 완료 체크"]},
  "mock": {"keys": ["scripts", "followups"], "items": ["핵심 문항·꼬리질문 무작위 출제", "타이머와 자신감 1~5 자기평가", "약점만 다시 풀기"]},
  "briefing": {"keys": ["scripts", "badPhrases", "lastMinute"], "items": ["30초 핵심 문항 요약", "하지 않을 주장과 대체 표현", "면접 직전 확인 목록"]},
  "cases": {"keys": ["experiences", "terms"], "items": ["실무 경험 카드(비어 있으면 홍익대 준비 때 정리한 공유 경험을 표시)", "기술 용어 풀이"]},
  "research": {"keys": ["research"], "items": ["아주대 학과·연구실에 맞춘 연구질문", "비교 조건·평가지표·실험 단계", "연구 범위 안/밖"]},
  "coursebook": {"keys": ["actualCourses", "coursePlans", "courseEvidence"], "items": ["실제 개설 교과목과 시간표", "추천 수강조합과 시간 충돌 계산", "교과목 근거 수준"]},
  "graduation": {"keys": [], "items": ["학위청구 방법(논문·비논문 등)", "학점·시험·연구윤리 요건", "졸업 체크리스트와 원문 출처"]},
  "roadmap": {"keys": ["semesters", "week"], "items": ["4학기 학업·연구 시뮬레이션", "학기별 과목·산출물", "직장 병행 생활 리듬"]},
  "facts": {"keys": ["facts", "factAudit", "sources", "alerts"], "items": ["아주대 공식 출처 목록", "팩트 레지스트리와 상태", "주의할 공지"]},
  "archive": {"keys": ["planHTML", "archiveHTML"], "items": ["제출 학업계획서 원문", "아주대 조사 기록 원문"]},
  "home": {"keys": ["overviewKey", "practice"], "items": ["면접일 D-day", "핵심 이야기 한 줄", "면접 직전 7일 체크"]}
 }
},
"data": {
 "scripts": [],
 "followups": [],
 "terms": [],
 "semesters": [],
 "sources": [],
 "facts": [],
 "courses": [],
 "examCourses": [],
 "week": [],
 "risks": [],
 "experiences": [],
 "research": {
  "question": "",
  "inclusion": [],
  "exclusion": [],
  "layers": [],
  "conditions": [],
  "metrics": [],
  "method": []
 },
 "archiveHTML": "",
 "planHTML": "",
 "overviewKey": "",
 "generated": "",
 "practice": [],
 "budget": [],
 "studySummary": "",
 "alerts": [],
 "dossierHTML": "",
 "version": "",
 "factAudit": [],
 "lastMinute": [],
 "badPhrases": [],
 "feasibility": {
  "checkedAt": "",
  "rows": [],
  "scenarios": [],
  "unanswered": []
 },
 "actualCourses": [],
 "courseEvidence": {
  "officialTimeUrl": "",
  "curriculumUrl": "",
  "staffingUrl": "",
  "first": "",
  "second": "",
  "termLimit": "",
  "supply": ""
 },
 "coursePlans": [],
 "studyNotesVersion": "",
 "clientBuild": ""
}
};
