function wmsDetailPlate(plate, section, id, escape) {
  const { kind, headers, rows } = plate;
  let contents;
  if (kind === 'matrix') {
    const head = headers.map(label => '<th scope="col">' + escape(label) + '</th>').join('');
    const records = rows.map(([label, ...cells]) => '<tr><th scope="row">' + escape(label) + '</th>' +
      cells.map((text, i) => '<td data-label="' + escape(headers[i + 1]) + '">' + escape(text) + '</td>').join('') + '</tr>').join('');
    contents = '<div class="wms-plate-table"><table><thead><tr>' + head + '</tr></thead><tbody>' + records + '</tbody></table></div>';
  } else if (kind === 'record') {
    contents = '<dl class="wms-plate-fields">' + rows.map(([field, detail]) =>
      '<div><dt>' + escape(field) + '</dt><dd>' + escape(detail) + '</dd></div>').join('') + '</dl>';
  } else {
    const flow = kind === 'trace';
    const tag = flow ? 'li' : 'div';
    const steps = rows.map(([label, detail]) =>
      '<' + tag + '><strong>' + escape(label) + '</strong><p>' + escape(detail) + '</p></' + tag + '>').join('');
    contents = flow ? '<ol class="wms-plate-track">' + steps + '</ol>' : '<div class="wms-plate-forks">' + steps + '</div>';
  }
  const sourceLabel = typeof plate.section === 'number' ? '원문 ' + plate.section + '절' : section.title;
  const sample = plate.section === 22 ? `<table class="wms-sample-records"><caption>원문 속 모의 연동 자료</caption>
    <thead><tr><th scope="col">레코드</th><th scope="col">부대부호</th><th scope="col">연동 결과</th></tr></thead>
    <tbody>${['A', 'B', 'C', 'D'].map(row => row === 'C'
      ? '<tr class="wms-record-missing"><th scope="row">C</th><td>공란</td><td>연동 오류 발생</td></tr>'
      : '<tr><th scope="row">' + row + '</th><td>정상 입력</td><td>정상</td></tr>').join('')}</tbody></table>` : '';
  return `<figure class="wms-detail-plate wms-plate-${kind}" id="${id}" tabindex="-1">
    <figcaption><h3>${escape(plate.title)}</h3><a class="wms-plate-source" href="#${section.id}" data-wms-route
      aria-label="${escape(section.title)} 원문 읽기">${escape(sourceLabel)} ↗</a></figcaption>
    ${sample}${contents}<p class="wms-plate-lesson"><b>면접에서</b> ${escape(plate.takeaway)}</p></figure>`;
}

function wmsOutreach(chapter) {
  const contest = 'wms-practice/guide-8/contest';
  const speech = 'wms-practice/guide-12/speech';
  if (chapter === 12) {
    return `<section class="wms-outreach" id="${speech}" tabindex="-1" aria-labelledby="wms-speech-title">
      <h3 id="wms-speech-title">장문 답변에 덧붙일 말 · 연구 결과를 어떻게 알리겠습니까?</h3>
      <blockquote><p>논문을 마치면 연구 과정에서 만든 오류 사례 검색 도구와 비교 실험 결과를 ‘데이터 한마당’에 출품하고 싶습니다.
      군수사령부에서 시작해 매년 열려 온 이 대회는 빅데이터와 AI를 활용해 현장의 일을 개선한 방법을 공유하는 자리입니다.</p>
      <p>예를 들어 출고 화면에 값이 빠진 모의 상황을 놓고, 새 담당자가 어떤 과거 기록을 찾고 무엇부터 확인하는지 직접 보여드리겠습니다.
      동료 실무자들에게는 다른 업무에서도 쓸 수 있을지 의견을 듣고 싶습니다.</p>
      <p>지휘부에는 어느 단계에서 시간이 걸렸고 어떤 기록이 도움이 됐는지 보여드리면서, 제가 현장에서 발견한 문제를 어떻게 연구했고 인수인계 절차를 어디부터 바꾸면 좋을지 말씀드리겠습니다.</p></blockquote>
      <a href="#${contest}" data-wms-route>대회와 출품 구상 보기 →</a></section>`;
  }
  if (chapter !== 8) return '';
  return `<section class="wms-outreach" id="${contest}" tabindex="-1" aria-labelledby="wms-contest-title">
    <h3 id="wms-contest-title">논문에서 검증한 방법을 ‘데이터 한마당’에서 보여주려면</h3>
    <p>육군군수사령부가 2023년에 시작한 ‘데이터 한마당 경진대회’는 매년 열려 왔다. 장병과 군무원이 빅데이터 분석·AI·업무 자동화로 현장의 반복 업무를 줄이거나 개선한 사례를 발표한다. 2026년 10월에 제7회가 열렸고, 제8회부터는 육군본부가 주관할 예정이다.</p>
    <div class="wms-outreach-sources"><a href="https://www.korea.kr/briefing/pressReleaseView.do?newsId=156599035">국방부 · 제1회 개최 취지</a>
      <a href="https://policetimes.co.kr/detail.php?number=173823&amp;thread=03r01">제7회 개최 및 차기 주관 계획</a></div>
    <h4>연구 후 출품 구상</h4>
    <ol class="wms-outreach-flow">
      <li><strong>논문에서 검증</strong><span>모의 오류에서 문서를 직접 찾는 방식과 과거 사례를 찾아 근거를 제시하는 방식을 비교한다. 어디서 시간이 걸렸고 어떤 원인 후보를 올바르게 찾았는지 기록한다.</span></li>
      <li><strong>대회에서 시연</strong><span>연구 산출물인 오류 사례 검색 도구와 실험 결과를 함께 출품하고 싶다. 출고 화면의 빈칸처럼 이해하기 쉬운 상황으로 후임자가 근거를 찾아가는 과정을 보여준다.</span></li>
      <li><strong>현장과 지휘부에 제안</strong><span>실무자에게는 다른 오류에도 이 확인 순서가 통하는지 묻는다. 지휘부에는 효과가 있었던 조건과 한계를 제시하고, 어떤 인수인계 기록과 교육부터 보완할지 제안한다.</span></li>
    </ol>
    <a href="#${speech}" data-wms-route>면접에서 말할 문단 읽기 →</a></section>`;
}
