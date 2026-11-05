function createWmsPractice({ data, root, escape, checked, setcheck }) {
  const { cards, pitches, notes } = data;
  const categories = ['전체', ...new Set(cards.map(card => card.group))];
  const modes = { questions: '예상 질문', pitches: '연구소개 대본', notes: '주제별 복습' };
  let mode = 'questions';
  let category = '전체';
  let card = cards[0];
  let pitch = pitches[1];
  let listOpen = !window.matchMedia('(max-width: 740px)').matches;
  let accumulatedMs = 0;
  let startedAt = null;
  let interval = null;

  const filteredCards = () => category === '전체' ? cards : cards.filter(item => item.group === category);
  const progressKey = item => 'wms-practised-' + item.id;
  const paragraphs = parts => parts.map(part => `<p>${escape(part)}</p>`).join('');
  const pressed = selected => `aria-pressed="${selected}"`;

  function stopClock() {
    clearInterval(interval);
    interval = null;
    startedAt = null;
    accumulatedMs = 0;
  }

  function updateClock() {
    const clock = root.querySelector('[data-wms-clock]');
    if (!clock) return;
    const elapsed = Math.floor((accumulatedMs + (startedAt === null ? 0 : performance.now() - startedAt)) / 1000);
    clock.textContent = String(Math.floor(elapsed / 60)).padStart(2, '0') + ':' + String(elapsed % 60).padStart(2, '0');
    clock.classList.toggle('wms-over', elapsed >= Number(clock.dataset.wmsClock));
    const toggle = root.querySelector('[data-wms-action="clock"]');
    toggle.textContent = startedAt !== null ? '일시정지' : accumulatedMs ? '이어서 말하기' : '말하기 시작';
  }

  function clockControls(seconds) {
    return `<div class="wms-clockbar">
      <div class="wms-readout"><span class="wms-target">목표 ${seconds}초</span><span role="timer" aria-label="발화 시간" aria-live="off" data-wms-clock="${seconds}">00:00</span></div>
      <div class="wms-buttons"><button class="wms-start" type="button" data-wms-action="clock">말하기 시작</button>
      <button class="wms-reset" type="button" data-wms-action="reset">초기화</button></div></div>`;
  }

  function practiceStatus() {
    const total = cards.filter(item => checked(progressKey(item))).length;
    return `연습 완료 <b>${total} / ${cards.length}</b>`;
  }

  function questionView() {
    const pool = filteredCards();
    const index = pool.indexOf(card);
    return `<div class="wms-tools">
      <label>질문 주제 <select data-wms-category>${categories.map(name => `<option${category === name ? ' selected' : ''}>${escape(name)}</option>`).join('')}</select></label>
      <span class="wms-status" id="wms-progress">${practiceStatus()}</span></div>
      <div class="wms-layout"><div class="wms-main">
      <section class="wms-stage" aria-labelledby="wms-question">
        <div class="wms-stagehead"><span>${escape(card.group)}</span><span>${index + 1} / ${pool.length}문항</span></div>
        <h2 id="wms-question" tabindex="-1">${escape(card.question)}</h2>
        ${clockControls(card.seconds)}
      </section>
      <div class="wms-reveal">
        <details><summary>예시 답변 <span class="wms-summary-hint">핵심어와 답변 보기</span></summary>
          <div class="wms-copy"><div class="wms-keywords">${card.keywords.map(word => `<span>${escape(word)}</span>`).join('')}</div><p>${escape(card.answer)}</p></div></details>
        <details><summary>꼬리질문</summary><div class="wms-copy"><p>${escape(card.followup)}</p></div></details>
      </div>
      <div class="wms-step"><label class="wms-check"><input type="checkbox" data-wms-done ${checked(progressKey(card)) ? 'checked' : ''}> 연습 완료</label>
        <div class="wms-buttons"><button type="button" data-wms-action="previous" ${index === 0 ? 'disabled' : ''}>← 이전</button>
        <button type="button" data-wms-action="next" ${index === pool.length - 1 ? 'disabled' : ''}>다음 질문 →</button></div></div>
      </div>
      <details class="wms-list" ${listOpen ? 'open' : ''}><summary>질문 목록 <span>${pool.length}문항</span></summary>
        <div class="wms-index">${pool.map((item, i) => `<button type="button" data-wms-card="${escape(item.id)}" ${item === card ? 'aria-current="true"' : ''}>
          <span class="wms-index-num">${String(i + 1).padStart(2, '0')}</span><span>${escape(item.question)}</span><span class="wms-done" aria-label="연습 완료" ${checked(progressKey(item)) ? '' : 'hidden'}>✓</span></button>`).join('')}</div></details>
      </div>`;
  }

  function pitchView() {
    return `<div class="wms-tools"><div class="wms-choices" role="group" aria-label="대본 길이">${pitches.map(item =>
      `<button type="button" data-wms-pitch="${item.seconds}" ${pressed(item === pitch)}>${escape(item.label)}</button>`).join('')}</div></div>
      <section class="wms-stage wms-pitch"><div class="wms-stagehead"><span>연구소개</span></div>
        <h2>어떤 연구를 하고 싶습니까?</h2>${clockControls(pitch.seconds)}</section>
      <details class="wms-script" open><summary>${escape(pitch.label)} 대본</summary><div class="wms-copy">${paragraphs(pitch.paragraphs)}</div></details>`;
  }

  function notesView() {
    return `<div class="wms-notes">${notes.map(note => `<details><summary>${escape(note.title)}</summary>
      <div class="wms-copy">${paragraphs(note.paragraphs)}</div></details>`).join('')}</div>`;
  }

  function view() {
    return `<section class="wms-practice" aria-labelledby="wms-title">
      <header class="page-intro"><h1 id="wms-title">WMS 연구 면접연습</h1>
      <p>창고관리시스템(WMS)을 인수하며 겪은 어려움부터 AI로 오류 대응 지식을 전달하는 연구까지, 면접에서 내 말로 설명해 보세요.</p></header>
      <div class="wms-modes" role="group" aria-label="연습 방식">${Object.entries(modes).map(([key, label]) =>
        `<button type="button" data-wms-mode="${key}" ${pressed(key === mode)}>${label}</button>`).join('')}</div>
      <div id="wms-panel">${mode === 'questions' ? questionView() : mode === 'pitches' ? pitchView() : notesView()}</div>
    </section>`;
  }

  function showPanel(focusSelector) {
    root.querySelector('.wms-practice').outerHTML = view();
    root.querySelector(focusSelector)?.focus({ preventScroll: true });
    const list = root.querySelector('.wms-index');
    const current = list?.querySelector('[aria-current]');
    if (list && current) list.scrollTop = current.offsetTop - list.clientHeight / 2 + current.clientHeight / 2;
  }

  function selectCard(item) {
    if (!item) return;
    stopClock();
    mode = 'questions';
    card = item;
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('.wms-practice button');
    if (!button) return;
    const { wmsMode, wmsCard, wmsPitch, wmsAction } = button.dataset;
    if (wmsMode) {
      if (mode === wmsMode) return;
      stopClock();
      mode = wmsMode;
      showPanel(`[data-wms-mode="${mode}"]`);
    } else if (wmsPitch) {
      if (pitch.seconds === Number(wmsPitch)) return;
      stopClock();
      pitch = pitches.find(item => item.seconds === Number(wmsPitch));
      showPanel(`[data-wms-pitch="${pitch.seconds}"]`);
    } else if (wmsAction === 'clock' || wmsAction === 'reset') {
      if (wmsAction === 'reset') stopClock();
      else if (startedAt === null) {
        startedAt = performance.now();
        interval = setInterval(updateClock, 250);
      } else {
        accumulatedMs += performance.now() - startedAt;
        startedAt = null;
        clearInterval(interval);
        interval = null;
      }
      updateClock();
    } else {
      const pool = filteredCards();
      const item = wmsCard ? pool.find(entry => entry.id === wmsCard) : pool[pool.indexOf(card) + (wmsAction === 'next' ? 1 : -1)];
      selectCard(item);
      showPanel('#wms-question');
      root.querySelector('#wms-question').scrollIntoView({ block: 'nearest' });
    }
  });
  root.addEventListener('toggle', event => {
    if (event.target.matches('.wms-list')) listOpen = event.target.open;
  }, true);
  root.addEventListener('change', event => {
    if (event.target.matches('[data-wms-category]')) {
      category = event.target.value;
      selectCard(filteredCards()[0]);
      showPanel('[data-wms-category]');
    }
    if (event.target.matches('[data-wms-done]')) {
      setcheck(progressKey(card), event.target.checked);
      root.querySelector('#wms-progress').innerHTML = practiceStatus();
      root.querySelector('[aria-current] .wms-done').hidden = !event.target.checked;
    }
  });
  function openCard(id) {
    const item = cards.find(entry => entry.id === id);
    if (item) {
      category = '전체';
      selectCard(item);
    }
  }
  return { view, stopClock, openCard };
}
