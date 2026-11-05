function wmsVisualIntro() {
  return `<section class="wms-visual-intro" aria-labelledby="wms-visual-title">
    <header><h1 id="wms-visual-title">WMS 오류 대응 경험을<br><em>후임자에게 전하는 방법</em></h1></header>
    <ol class="wms-visual-path" aria-label="실무 경험에서 연구 목표까지">
      <li>
        <svg class="wms-visual-drawing" viewBox="0 0 146 88" aria-hidden="true" focusable="false">
          <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 29h27l6 7h60v41H18z" fill="#446a56" stroke="#9bbca2" stroke-width="1.6"/>
            <g transform="rotate(-10 55 40)"><rect x="32" y="15" width="44" height="52" rx="2" fill="#b5c9a5" stroke="#183d32" stroke-width="2"/>
              <path d="M39 24h21m-21 6h25" stroke="#688a72" stroke-width="1.7"/></g>
            <g transform="rotate(7 80 38)"><rect x="59" y="8" width="45" height="56" rx="2" fill="#f4ebcf" stroke="#183d32" stroke-width="2"/>
              <path d="M66 18h22m-22 7h29m-29 7h20m-20 7h24" stroke="#527565" stroke-width="1.8"/></g>
            <path d="M18 45h40l6-6h53l-7 39H24z" fill="#99bd8f" stroke="#d8e6c3" stroke-width="1.6"/>
            <path d="M33 55h32" stroke="#2e5644" stroke-width="3"/><path d="M33 62h20" stroke="#51765c" stroke-width="2"/>
          </g>
        </svg>
        <div class="wms-visual-caption"><span>실무 경험</span><h2>오류 기록 약 40건</h2><p>증상 · 원인 · 조치 결과</p></div>
      </li>
      <li>
        <svg class="wms-visual-drawing" viewBox="0 0 146 88" aria-hidden="true" focusable="false">
          <g stroke-linecap="round" stroke-linejoin="round">
            <g fill="#315548" stroke="#88a997" stroke-width="1.5">
              <rect x="15" y="10" width="64" height="16" rx="3"/><rect x="15" y="58" width="64" height="16" rx="3"/>
            </g>
            <rect x="12" y="32" width="70" height="20" rx="3" fill="#eed7a3" stroke="#f7e6bb" stroke-width="1.8"/>
            <path d="M24 18h34m-34 48h41" stroke="#abc4b1" stroke-width="2"/>
            <circle cx="23" cy="42" r="2.5" fill="#4a6149"/><path d="M31 42h39" stroke="#4a6149" stroke-width="2"/>
            <path d="M82 42h9" stroke="#f1ddb2" stroke-width="2" stroke-dasharray="2 3"/>
            <circle cx="102" cy="42" r="17" fill="#426958" stroke="#f1ddb2" stroke-width="3.8"/>
            <path d="m115 55 13 14" stroke="#f1ddb2" stroke-width="7"/>
            <path d="M95 41h14m-14 6h9" stroke="#c3d6bf" stroke-width="1.7"/>
          </g>
        </svg>
        <div class="wms-visual-caption"><span>시제품 구상</span><h2>증상으로 사례 검색</h2><p>RAG로 유사 기록과 근거 제시</p></div>
      </li>
      <li>
        <svg class="wms-visual-drawing" viewBox="0 0 146 88" aria-hidden="true" focusable="false">
          <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect x="56" y="13" width="64" height="62" rx="3" fill="#d5dfc3" stroke="#eef0d5" stroke-width="1.6"/>
            <path d="M75 12h24v8H75z" fill="#759e83" stroke="#254b3c" stroke-width="1.6"/>
            <path d="m66 34 3 3 6-7m-9 19 3 3 6-7" stroke="#396548" stroke-width="2.5"/>
            <path d="M81 34h26m-26 15h22m-22 13h15" stroke="#5d7d65" stroke-width="2"/>
            <rect x="66" y="59" width="6" height="6" rx="1" stroke="#5d7d65" stroke-width="1.5"/>
            <circle cx="35" cy="40" r="10" fill="#a8c5a2" stroke="#1c3d33" stroke-width="2"/>
            <path d="M16 72v-6c0-12 8-17 19-17s18 6 18 17v6z" fill="#82ab90" stroke="#1c3d33" stroke-width="2"/>
          </g>
        </svg>
        <div class="wms-visual-caption"><span>연구 목표</span><h2>후임자의 원인 판단</h2><p>원인 후보와 다음 점검 항목 선택</p></div>
      </li>
    </ol>
    <footer class="wms-visual-test"><strong>검증 계획</strong><span>모의 오류 과제에서 기존 문서 검색과 RAG를 비교해, <b>원인 탐색 시간과 판단 정확도</b>를 측정합니다.</span></footer>
  </section>`;
}
