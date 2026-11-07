function createWmsReader({ source, guides, plates, root, escape }) {
  const route = 'wms-practice';
  const wide = window.matchMedia('(min-width: 1121px)');
  const lines = source.split(/\r?\n/);
  const parts = [];
  const searchItems = [];
  const article = [];
  let part = null;
  let sectionNumber = 0;
  let index = 3;
  let full = false;
  let chapter = 0;

  // The manuscript uses bold and inline code. A single star in Pro*C is literal.
  function inline(text) {
    return escape(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\x60([^\x60]+)\x60/g, '<code>$1</code>');
  }

  function groupWhile(matches) {
    const start = index;
    while (index < lines.length && matches(lines[index])) index++;
    return lines.slice(start, index);
  }

  function table(rows) {
    const cells = row => row.trim().slice(1, -1).split('|').map(cell => inline(cell.trim()));
    const head = cells(rows[0]).map(cell => '<th scope="col">' + cell + '</th>').join('');
    const body = rows.slice(2).map(row => '<tr>' + cells(row).map(cell => '<td>' + cell + '</td>').join('') + '</tr>').join('');
    return '<div class="wms-table" tabindex="0" role="region" aria-label="본문 표"><table><thead><tr>' + head +
      '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  function heading(line) {
    const [, marks, title] = line.match(/^(#{1,3}) (.+)$/);
    if (marks.length === 1) {
      const id = route + '/part-' + (parts.length + 1);
      if (part) {
        article.push('</section>');
        part.html = article.slice(part.start).join('\n');
      } else {
        article.push('</div>');
      }
      part = { title, id, sections: [], start: article.length };
      parts.push(part);
      article.push(`<section class="wms-part" aria-labelledby="${id}"><h2 data-source-heading id="${id}" tabindex="-1">${inline(title)}</h2>`);
      searchItems.push({ title, summary: 'WMS 연구 원문 · ' + title, page: route, anchor: id });
    } else {
      const level = marks.length + 1;
      const id = route + '/section-' + (++sectionNumber);
      article.push(`<h${level} id="${id}" tabindex="-1">${inline(title)}</h${level}>`);
      if (marks.length === 2) part.sections.push({ title, id });
      searchItems.push({ title, summary: 'WMS 연구 원문 · ' + part.title + ' · ' + title, page: route, anchor: id });
    }
  }

  const title = lines[0].replace(/^# /, '');
  const subtitle = lines[1].replace(/^### /, '');
  article.push(`<article id="wms-document" class="wms-document" aria-labelledby="wms-title">
    <header class="wms-document-heading"><h1 id="wms-title" tabindex="-1">${inline(title)}</h1>
    <h2 class="wms-reader-subtitle">${inline(subtitle)}</h2><p class="wms-reader-meta">${inline(lines[2])}</p></header>
    <div class="wms-preface">`);

  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith('|')) {
      article.push(table(groupWhile(text => text.startsWith('|'))));
    } else if (line.startsWith('>')) {
      const quoted = groupWhile(text => text.startsWith('>')).map(text => text.replace(/^> ?/, ''));
      article.push('<blockquote>' + quoted.join('\n').split(/\n\s*\n/).map(text => '<p>' + inline(text) + '</p>').join('') + '</blockquote>');
    } else if (/^- |^\d+\. /.test(line)) {
      const ordered = /^\d/.test(line);
      const pattern = ordered ? /^\d+\. / : /^- /;
      const list = groupWhile(text => pattern.test(text));
      const tag = ordered ? 'ol' : 'ul';
      const start = ordered && !list[0].startsWith('1.') ? ' start="' + parseInt(list[0], 10) + '"' : '';
      article.push('<' + tag + start + '>' + list.map(text => '<li>' + inline(text.replace(pattern, '')) + '</li>').join('') + '</' + tag + '>');
    } else {
      index++;
      if (line.startsWith('#')) heading(line);
      else if (line === '---') article.push('<hr>');
      else if (line.trim()) article.push('<p>' + inline(line) + '</p>');
    }
  }
  article.push('</section>');
  part.html = article.slice(part.start).join('\n');
  article.push('</article>');
  const body = article.join('\n');
  const link = item => `<a href="#${item.id}">${escape(item.title)}</a>`;
  const toc = parts.map((item, i) => `<li class="wms-toc-part"><div class="wms-toc-row">${link(item)}
    <button type="button" data-wms-expand aria-expanded="false" aria-controls="wms-toc-${i}" aria-label="제${i + 1}부의 절 목록">⌄</button></div>
    <ul class="wms-toc-sections" id="wms-toc-${i}" hidden>${item.sections.map(s => '<li>' + link(s) + '</li>').join('')}</ul></li>`).join('');

  function manuscript() {
    return `<div class="wms-reader-layout">
      <nav class="wms-reader-toc" aria-label="연구 원문 목차"><details ${wide.matches ? 'open' : ''}>
        <summary>목차 · 전체 ${parts.length}부</summary><div class="wms-toc-body"><ol>${toc}</ol></div>
      </details><a class="wms-transcript-extra" data-wms-route href="#${route}/guide-12/speech">보충 발언 · 데이터 한마당 ↗</a></nav>
      ${allNotes()}${body}</div><div class="wms-reader-end"><a href="#${route}/full" data-wms-top>문서 처음으로 ↑</a></div>`;
  }

  const chapterUrl = i => '#' + route + '/guide-' + (i + 1);
  // 가이드 주석(overview-data.js의 WMS_GUIDE_NOTES): 원고 본문은 그대로 두고 이후 정정만 보여 준다.
  const noteItem = n => `<li><b>${escape(n.at)} · ${escape(n.title)}</b> ${escape(n.body)}</li>`;
  function guideNotes(guide) {
    const list = guide.notes || [];
    return list.length ? `<aside class="wms-guide-notes" aria-label="가이드 주석"><h3>가이드 주석 · 이후 정정</h3>
      <p>원고 본문은 대화 기록이라 그대로 두고, 면접에서 말할 때 바꿀 점만 적었어.</p><ul>${list.map(noteItem).join('')}</ul></aside>` : '';
  }
  function allNotes() {
    const items = guides.flatMap((g, i) => (g.notes || []).map(n => `<li><a href="${chapterUrl(i)}" data-wms-route>제${i + 1}부</a> ${noteItem(n).slice(4)}`));
    return items.length ? `<details class="wms-guide-notes wms-guide-notes-all"><summary>가이드 주석 ${items.length}건 · 원고를 읽기 전에 (이후 정정)</summary><ul>${items.join('')}</ul></details>` : '';
  }
  function setRoute(anchor) {
    const found = /^wms-practice\/guide-(\d+)(?:\/(?:fig-\d+|contest|speech))?$/.exec(anchor);
    full = !!anchor && !found;
    chapter = found ? Math.min(parts.length - 1, Math.max(0, Number(found[1]) - 1)) : 0;
  }

  const excerpts = guides.map((guide, i) => {
    const template = document.createElement('template');
    template.innerHTML = parts[i].html;
    const paragraphs = Array.from(template.content.querySelectorAll('p'));
    return paragraphs.find(p => p.textContent.startsWith(guide.excerptStart))?.innerHTML || '';
  });

  // Source section numbers and browser heading IDs differ (IDs include subheadings).
  const detailChapters = parts.map((item, i) => plates[i + 1].map((plate, j) => {
    const section = item.sections.find(s => typeof plate.section === 'number'
      ? s.title.startsWith(plate.section + '. ') : s.title === plate.section);
    if (!section) throw Error('WMS diagram source section missing: ' + plate.section);
    const id = route + '/guide-' + (i + 1) + '/fig-' + (j + 1);
    searchItems.push({ title: plate.title, summary: guides[i].short + ' · ' + plate.takeaway, page: route, anchor: id });
    return { id, title: plate.title, html: wmsDetailPlate(plate, section, id, escape) };
  }));
  const additions = {
    8: { title: '데이터 한마당 출품 구상', id: route + '/guide-8/contest' },
    12: { title: '데이터 한마당 면접 발언', id: route + '/guide-12/speech' }
  };
  for (const entry of Object.values(additions)) {
    searchItems.push({ title: entry.title, summary: '논문 산출물 · 대회 출품 · 지휘부에 인수인계 개선 제안', page: route, anchor: entry.id });
  }

  function guideView() {
    const guide = guides[chapter];
    const item = parts[chapter];
    const details = detailChapters[chapter];
    const addition = additions[chapter + 1];
    const topics = addition ? [...details, addition] : details;
    const optionLabel = (entry, i) => `제${i + 1}부 · ${escape(entry.short)}`;
    const chapterList = guides.map((entry, i) => `<li><a href="${chapterUrl(i)}" data-wms-route ${i === chapter ? 'aria-current="location"' : ''}>
      <span>${i + 1}부</span>${escape(entry.short)}</a></li>`).join('');
    return `${wmsVisualIntro()}
      <section class="wms-guides" id="wms-guides" aria-label="부별 연구 내용">
        <nav class="wms-guide-index" aria-label="부별 탐색"><h2>부별로 읽기</h2><ol>${chapterList}</ol></nav>
        <label class="wms-guide-picker">부별로 읽기 <select data-wms-guide-picker>
          ${guides.map((entry, i) => `<option value="${i}" ${i === chapter ? 'selected' : ''}>${optionLabel(entry, i)}</option>`).join('')}</select></label>
        <article class="wms-guide" aria-labelledby="wms-guide-title">
          <header><div class="wms-guide-kicker">제${chapter + 1}부 · ${escape(guide.short)}</div>
          <h2 id="wms-guide-title" tabindex="-1">${escape(guide.headline)}</h2>
          <p>${escape(guide.intro)}</p></header>
          ${guideNotes(guide)}
          ${wmsChapterFigure(chapter, guide, escape)}
          ${excerpts[chapter] ? `<aside class="wms-passage"><h3>원문에서</h3><blockquote>${excerpts[chapter]}</blockquote></aside>` : ''}
          <nav class="wms-plate-links" aria-label="이 부의 세부 도해">${topics.map(topic =>
            `<a href="#${topic.id}" data-wms-route>${escape(topic.title)}</a>`).join('')}</nav>
          <section class="wms-detail-plates" aria-label="원문 절별 도해">${details.map(d => d.html).join('')}</section>
          ${wmsOutreach(chapter + 1)}
          <details class="wms-chapter-original"><summary>제${chapter + 1}부 원문 읽기</summary>
          <div class="wms-document wms-inline-document">${item.html}</div></details>
          <nav class="wms-guide-paging" aria-label="이전 부와 다음 부">
          ${chapter > 0 ? `<a href="${chapterUrl(chapter - 1)}" data-wms-route>← ${optionLabel(guides[chapter - 1], chapter - 1)}</a>` : ''}
          ${chapter + 1 < parts.length ? `<a href="${chapterUrl(chapter + 1)}" data-wms-route>다음 · ${escape(guides[chapter + 1].short)} →</a>` : ''}</nav>
        </article>
      </section>`;
  }

  function view() {
    return `<div class="wms-reader">
      <nav class="wms-reading-modes" aria-label="읽기 방식">
      <a href="#${route}" data-wms-route ${full ? '' : 'aria-current="page"'}>도해와 원문</a>
      <a href="#${route}/full" data-wms-route ${full ? 'aria-current="page"' : ''}>원문 전체</a>
      <a class="wms-speech-link" href="#${route}/part-12" data-wms-route>장문 답변 원고 ↗</a></nav>
      ${full ? manuscript() : guideView()}</div>`;
  }

  function jump(id) {
    if (id?.startsWith(route + '/guide-')) {
      const detail = document.getElementById(id);
      if (detail && detail.closest('.wms-guide')) {
        detail.focus({ preventScroll: true });
        detail.scrollIntoView({ block: 'start', behavior: 'instant' });
        return;
      }
      root.querySelector('#wms-guide-title')?.focus({ preventScroll: true });
      root.querySelector('#wms-guides')?.scrollIntoView({ block: 'start', behavior: 'instant' });
      return;
    }
    if (id === route + '/full') return;
    const target = document.getElementById(id || 'wms-title');
    if (!target || !target.closest('#wms-document')) return;
    if (!wide.matches) root.querySelector('.wms-reader-toc > details').open = false;
    root.querySelector('.wms-reader-toc [aria-current]')?.removeAttribute('aria-current');
    const current = Array.from(root.querySelectorAll('.wms-reader-toc a')).find(a => a.hash.slice(1) === id);
    current?.setAttribute('aria-current', 'location');
    if (current?.closest('.wms-toc-sections')) {
      const list = current.closest('.wms-toc-sections');
      list.hidden = false;
      list.parentElement.querySelector('[aria-controls]').setAttribute('aria-expanded', 'true');
    }
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-wms-expand]');
    if (button) {
      const list = document.getElementById(button.getAttribute('aria-controls'));
      list.hidden = !list.hidden;
      button.setAttribute('aria-expanded', String(!list.hidden));
      return;
    }
    const anchor = event.target.closest('.wms-reader a[href^="#"]');
    if (!anchor || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    // Let the app router select the view before scrolling to a deep link.
    if (anchor.hasAttribute('data-wms-route')) {
      const fromPlate = anchor.closest('.wms-plate-source')?.closest('figure');
      if (fromPlate && location.hash !== '#' + fromPlate.id) history.replaceState(null, '', '#' + fromPlate.id);
      if (location.hash === anchor.hash) {
        event.preventDefault();
        if (anchor.hash === '#' + route || anchor.hash === '#' + route + '/full') {
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else {
          jump(anchor.hash.slice(1));
        }
      }
      return;
    }
    event.preventDefault();
    if (location.hash !== anchor.hash) history.pushState(null, '', anchor.hash);
    jump(anchor.hasAttribute('data-wms-top') ? '' : anchor.hash.slice(1));
  });

  root.addEventListener('change', event => {
    if (event.target.matches('[data-wms-guide-picker]')) location.hash = chapterUrl(Number(event.target.value));
  });
  return { view, jump, setRoute, searchItems };
}
