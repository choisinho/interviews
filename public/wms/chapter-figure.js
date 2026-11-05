function wmsChapterFigure(chapterIndex, guide, escape) {
  const icons = {
    screen: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8m-4-3v3M7 11h4m-4 3h6"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.1m-.1 9h.1M11 7.5h6m-6 9h6"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="3.5"/><path d="M4 5.5v13c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5v-13M4 12c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5"/>',
    query: '<path d="M4 3h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-9l-6 5v-5H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M7 7h9M7 11h6"/>',
    search: '<path d="M13 21H4V3h11l3 3v3M7 7h5m-5 4h3"/><circle cx="16" cy="14" r="4"/><path d="m19 17 3 4"/>',
    verify: '<path d="M19 10V4H5v17h7M8 8h7m-7 4h4"/><path d="m14 17 3 3 5-7"/>',
    manual: '<path d="M12 6C9 4 6 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-4-1-7 0-10 2Zm0 0v15"/>',
    time: '<circle cx="12" cy="13" r="8"/><path d="M12 13V8m0 5 3 2M9 2h6m-3 0v3"/>'
  };
  function icon(key) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[key] + '</svg>';
  }
  function figure(label, inner) {
    return '<figure class="wcf" aria-label="' + escape(label) + '">' + inner + '</figure>';
  }

  if (chapterIndex === 1) {
    const layers = [
      ['screen', '사용자 화면', 'DFM · PAS', '버튼에 연결된 이벤트와 서버에 보내는 입력값을 찾는다.'],
      ['server', '서버 프로그램', 'Pro*C', '호출된 함수가 어떤 SQL을 실행하고 무엇을 반환하는지 본다.'],
      ['database', '데이터베이스', 'SQL · 업무 코드', '조회한 값이 실제 입고·출고 단계에서 뜻하는 바를 대조한다.']
    ];
    return figure('화면에 보인 값을 따라가는 점검 경로', '<ol class="wcf-stack">' + layers.map(([key, name, tech, detail]) =>
      '<li><span class="wcf-stack-icon">' + icon(key) + '</span><div><strong>' + name +
      '</strong><span class="wcf-tech">' + tech + '</span><p>' + detail + '</p></div></li>').join('') + '</ol>');
  }

  if (chapterIndex === 3) {
    // A diagram of the layout change. The bars carry no warehouse identifier.
    const bars = '<path fill="currentColor" d="M0 0h2v23H0zm5 0h4v23H5zm7 0h1v23h-1zm4 0h3v23h-3zm5 0h1v23h-1zm4 0h4v23h-4zm7 0h2v23h-2zm5 0h1v23h-1zm3 0h3v23h-3zm6 0h2v23h-2zm5 0h3v23h-3zm6 0h1v23h-1z"/>';
    function mockLabel(adjusted) {
      const lines = adjusted ? 'M14 12h37m-37 52h61m-61 7h33' : 'M14 13h70m-70 9h53m-53 9h65m-65 9h36';
      const position = adjusted ? 'translate(14 21) scale(1.5 1.47)' : 'translate(50 44) scale(.82 .8)';
      return `<svg class="wcf-label-art" viewBox="0 0 120 82" aria-hidden="true"><rect x="1" y="1" width="118" height="80" rx="4" fill="#fffefa" stroke="#b6c0b2"/><path d="${lines}" stroke="#7a8b7d" stroke-width="3" stroke-linecap="round"/><g transform="${position}">${bars}</g></svg>`;
    }
    return figure('ZPL 라벨 양식 조정 전후 모식도', `<div class="wcf-labels">
      <div><strong>조정 전</strong>${mockLabel(false)}<span>로봇 카메라가 읽기 어려웠던 라벨</span></div>
      <div><strong>조정 후</strong>${mockLabel(true)}<span>바코드를 키우고 글자 위치·크기를 조정</span></div>
      </div><figcaption class="wcf-label-note"><b>라벨 배치 모식도</b> 내부 AI로 낯선 ZPL 명령을 해석하고 출력 양식을 직접 수정했다.</figcaption>`);
  }

  if (chapterIndex === 4) {
    return figure('증상에서 근거를 확인하기까지의 검색 흐름', `<div class="wcf-rag">
      <div class="wcf-query">${icon('query')}<div><small>가상 문의</small><strong>“출고 화면의 부대명이 빈칸입니다.”</strong></div></div>
      <div class="wcf-retrieval">${icon('search')}<div><strong>관련 기록 검색</strong><p>증상이 비슷한 사례를 찾아 발생 조건과 원인을 꺼낸다.</p></div></div>
      <div class="wcf-generation">${icon('manual')}<div><strong>근거 기반 답변 생성</strong><p>AI가 확인할 항목을 설명하고 참고한 기록을 제시한다.</p></div></div>
      <div class="wcf-evidence">${icon('verify')}<div><strong>담당자의 근거 확인</strong><p>현재 조건과 대조해 다음 점검 항목을 정한다.</p></div></div>
    </div>`);
  }

  if (chapterIndex === 5) {
    return figure('시제품의 핵심 범위와 확장 계획', `<div class="wcf-scope">
      <div class="wcf-core">${icon('search')}<div><small>첫 시제품</small><strong>유사 오류 사례와 근거 검색</strong></div></div>
      <div class="wcf-branch"><div><small>확장 후보</small><strong>데이터·코드 분석</strong><p>이상값 탐지, SQL 작성·해석, 관련 함수 탐색</p></div>
      <div><small>장기 구상</small><strong>여러 도구의 연계</strong><p>사례·코드·데이터 검색을 순서대로 수행하는 에이전트</p></div></div>
    </div>`);
  }

  if (chapterIndex === 8) {
    return figure('기존 방식과 연구 시제품의 비교 실험 설계', `<div class="wcf-trial">
      <div class="wcf-task">난도가 비슷한 모의 오류 과제</div>
      <div class="wcf-arms"><div>${icon('manual')}<strong>기존 방식</strong><span>담당자가 문서에서 직접 탐색</span></div>
        <div>${icon('search')}<strong>RAG 시제품</strong><span>같은 자료에서 근거를 검색해 제시</span></div></div>
      <div class="wcf-measures">${icon('time')}<strong>비교할 지표</strong><span>원인 탐색 시간</span><span>판단 정확도</span></div>
    </div>`);
  }

  const kind = ['flow', 'compare', 'layers', 'timeline'].includes(guide.kind) ? guide.kind : 'flow';
  const items = guide.steps.map(step => '<li><strong>' + escape(step.label) +
    '</strong><p>' + escape(step.detail) + '</p></li>').join('');
  const tag = kind === 'timeline' || kind === 'flow' ? 'ol' : 'ul';
  return figure(guide.short, '<' + tag + ' class="wcf-steps wcf-' + kind + '">' + items + '</' + tag + '>');
}
