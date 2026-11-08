# 면접 아틀리에

대학원 면접 준비용 **개인 웹앱**이야. 2026-11-08부터 두 학교 모드를 가진다.

- **아주대학교 정보통신대학원 · 정보통신공학과 인공지능전공 (주력)** — 군인/군무원 전형, 면접 2026.11.14(토). 처음 열거나 `#`만 있는 주소는 아주대 대시보드로 열린다.
- **홍익대학교 일반대학원 세종캠퍼스 국방AI융합학과 (아카이브)** — 2026.11.07 면접 종료. 내용은 그대로 보존하고 더 이상 업데이트하지 않는다(사이드바·홈에 「아카이브 · 면접 종료 2026.11.07」 배지). 예전 접두사 없는 주소(`#interview`, `#wms-practice/...`, `#foreign`, `#graduation`)는 계속 홍익대로 열린다.

## 배포 방식: GitHub만 사용

- 저장소: `choisinho/interviews` (현재 Private)
- 사이트: **GitHub Pages** — 별도의 Cloudflare, Vercel, Render, 로그인 서버를 쓰지 않아.
- 빌드·배포: **GitHub Actions** 자동 배포 및 수동 재배포 워크플로(`.github/workflows/publish-pages.yml`).
- 앱 설치: `manifest.webmanifest` + 서비스 워커 + 자동 생성되는 192/512px PNG 아이콘.
- 배포 후 주소: `https://choisinho.github.io/interviews/`. **Pages가 켜지기 전에는 이 주소가 작동하지 않아.**

### 가장 중요한 공개 범위 안내

**개인 계정의 GitHub Pages 사이트는 공개 웹사이트야. Private 저장소에서 Pages를 운영할 수 있는 유료 GitHub 플랜이어도, 게시한 HTML은 누구나 열고 내려받을 수 있어.**
이 앱의 HTML에는 지원 수학계획서 원문과 군 물류정보체계 관련 본인 진술 및 과거 조사자료가 포함돼 있어. 사용자가 공개를 선택했기 때문에 **현재 인터넷에서 열람할 수 있는 상태**야. 별도 서버 인증 없이 HTML·JavaScript에서 비밀번호를 검증하는 방식은 실제 비공개 보호가 아니므로 구현하지 않았어.

- Github Free 계정: 일반적으로 **공개 저장소**에서만 Pages 지원.
- GitHub Pro 등 지원 플랜: **비공개 저장소에서도 Pages 생성 가능**, 단 **게시된 사이트는 공개**.
- 보안상 공개해도 되는 자료만 남기는 별도 공개판을 만들거나, 개인정보를 공개해도 되는지 먼저 충분히 검토해야 해.
- **현재 저장소는 Public으로 전환돼 있으며 Pages 배포가 활성화됐어. 따라서 모든 게시 HTML과 부록의 수학계획서 자료는 외부에서 읽을 수 있어.**

## 휴대폰 홈 화면에서 앱처럼 실행하기

위 공개 범위 주의를 이해하고 Pages 사용을 결정했다면, GitHub 사이트에서 다음 작업을 한 번 수행하면 돼.

1. `choisinho/interviews` 저장소 → **Settings** → **Pages**.
2. **Build and deployment → Source**를 **GitHub Actions**로 설정. 현재 플랜과 저장소 설정에 따라 Pages가 제공되지 않을 수 있어.
3. 저장소의 **main** 브랜치에서 `index.html`이나 PWA 파일이 수정되면 자동으로 Pages 재배포돼. 필요하면 **Actions → Publish interview atelier → Run workflow**로 수동 실행할 수도 있어.
4. 성공하면 `https://choisinho.github.io/interviews/` 접속.
5. **안드로이드 Chrome**에서 사이트를 열고, 메뉴 `⋮` → **홈 화면에 추가** 또는 **앱 설치**.
6. 설치되면 휴대폰 홈 화면에 '면접 아틀리에' 아이콘이 생겨. 이후에는 다운로드 없이 그 아이콘으로 들어오면 돼.

> GitHub Pages는 로그인 제한을 제공하지 않아. 설치한 앱만 열쇠가 필요한 구조는 GitHub Pages 단독으로 구현할 수 없어.

## 앱 내용

**아주대 (주력)**

- 대시보드: D-day(2026-11-14), 지원 요약, 오늘 할 일(D-6~D-1), 핵심 서사, 주의 카드, 빠른 진입, 아직 채울 자료
- 면접 참고자료 대조: 제출 양식 칸별 표(제출 내용 / 예상 질문 / 답변 포인트 / 주의) + 불일치·확인 필요 패널
- 핵심 5문항(자기소개·지원동기·학업계획·연구관심·개발경험), 꼬리질문 40개(13개 주제), 모의면접, 직전 한 장
- 경력·연구개발: 경력 타임라인, 라잇웨잇 TIPS·IRIS 연구노트(월별 33항목 원문, 기술 5영역, 작성 절차 11단계, 확인/미확인, 말할 범위 vs 단정 금지)
- 교육과정·시간표, 졸업요건·학비(공식 페이지 2026-11-08 기준), 근거·출처(AJ1~AJ24 + 개인 자료 P1~P4), 원문(제출 양식 전사 · 연구노트 기록 요약 원문)

**홍익대 (아카이브)**

- 면접 핵심 4문항의 30초·60초·90초 이상 답변
- 꼬리질문 55개, 무작위 모의면접, 답변 가리기, 타이머, 약점 재출제
- 면접 직전 한 장 요약, 학습 진도
- WMS 실무 경험과 연구주제 연결
- 2027~2029년 학기별 학업·연구 시뮬레이션(2026 실제 편성 근거로 9→9→6학점 시간표 조합 갱신)
- 근거 기반 현실성 조사 결과 및 공식 출처 검증
- 근거·출처: 주제별 팩트 레지스트리(상태 필터), URL당 1개로 합친 출처 목록(옛 번호는 별칭으로 계속 찾힘), 정정 기록
- 심층 검증 보고서(2026-10-31 원문)를 앱 안에서 표지·먼저 읽기·장 목차·출처 코드 대응표·인쇄 버튼과 함께 읽기 (보고서의 부록은 원문·조사 기록 화면 한 곳에 보존)
- RAG 기반 레거시 유지보수 연구설계
- 제출 수학계획서 원문과 기존 조사 47항목 원문

## 데이터 및 개인정보

오프라인 HTML 원본 `index.html`은 저장소에서 내려받아 파일로 실행할 수 있어. 학습 완료·약점 점수는 휴대폰 Chrome 등 **현재 브라우저의 localStorage**에만 저장되며 GitHub에 올라가지 않아. 앱을 삭제하거나 브라우저 데이터를 삭제하면 기록도 사라질 수 있어.

**군 내부자료, 실제 코드·로그·IP·부대·품목 식별값을 이 저장소에 추가하거나 GitHub Pages에 게시하지 마.**

## 개발 구조 (v5.1 · 2026-11-08)

`index.html`은 **셸**(head 메타, 사이드바·topbar 틀, 검색 창)과 로컬 `./public/...` 스크립트·스타일 태그만 가진다. 실제 화면은 `public/` 아래 소스에서 만들어지고, 빌드가 모두 인라인해 **오프라인 단일 HTML**(`dist/index.html`, `file://`에서도 동작)을 만든다.

```text
index.html                         셸 + 로컬 public/ 태그 (빌드 시 모두 인라인)
public/app/app.css                 디자인 시스템: 토큰(:root·학교 테마·다크 모드) → 기본 → 레이아웃 → 컴포넌트 → 페이지 블록 → 미디어 → 인쇄
public/app/app.js                  앱: 학교 모드 라우팅, 페이지 레지스트리(PAGES), 렌더 함수, 학습 기록, 검색, 테마 토글, 버전 상수
public/schools/hongik.js           홍익대 자료 (status: archived) (ATELIER_SCHOOLS.hongik = {meta, data}, window.HONGIK_DATA 호환 별칭)
public/schools/ajou.js             아주대 자료 (status: ready, 주력). 홍익대와 같은 키 + 전용 키 application·career·program
public/graduation/                 졸업요건 화면(graduation.js·graduation.css) + 원문 이미지·PDF (dist/graduation/로 복사)
public/wms/                        WMS 연구 도해: 원고(content.js, 수정 금지) · 가이드 · 도판 · 그림 · 리더
public/manifest.webmanifest        안드로이드 홈 화면 설치 정보
public/sw.js                       서비스 워커 (빌드 해시가 캐시 이름에 들어감)
public/favicon.svg                 아이콘 원형 (실행 중에는 학교 테마 색으로 다시 그림)
scripts/build.mjs                  dist/ 생성 · 인라인 · 문법 검사 · 학교 자료 키 파리티 검사 · PNG 아이콘
scripts/content-atoms.mjs          내용 보존 검사 (기준 텍스트 조각이 결과물에 남아 있는지)
.github/workflows/publish-pages.yml  GitHub Actions 배포
```

### 빌드와 검사

```bash
node scripts/build.mjs      # = npm run build → dist/index.html, dist/sw.js, 아이콘, 졸업요건 원문 자료
npm run check               # 모든 JS 소스 문법 검사 (node --check)
node scripts/content-atoms.mjs check <기준-조각.json> dist/index.html   # 내용 보존 검사 (missing 목록 출력)
```

빌드는 다음이 어긋나면 실패해: 인라인되지 않은 `./public/` 태그, 인라인 스크립트 문법 오류, `ATELIER_SCHOOLS.hongik`/`ajou` 누락, 홍익대 저장 키(`hongik-study-v2`) 변경, **아주대 data에 홍익대 data의 최상위 키(객체면 그 안의 필드까지)가 빠진 경우**, **홍익대에 없는 학교 전용 키를 `meta.ownKeys`에 선언하지 않은 경우**(오타·임의 키 방지), `meta.status`가 planned/ready/archived가 아닌 경우.

### 학교 모드

- 주소는 `#<학교>/<화면>[/<위치>]` 형식이야(예: `#hongik/followups`, `#ajou/home`). **접두사 없는 예전 주소**(`#interview`, `#graduation`, `#wms-practice/...`)는 홍익대로 열려.
- 사이드바 브랜드 아래(모바일은 topbar)의 **[아주대 | 홍익대(아카이브)]** 스위치로 전환해(순서는 `meta.order`). 같은 화면이 있으면 그 화면, 없으면 대시보드로 가고, 마지막 학교는 `atelier-prefs`에 저장돼.
- 학교마다 학습 기록 키가 따로야: 홍익대 `hongik-study-v2`(내부 키 이름 불변), 아주대 `ajou-study-v1`.
- `<html data-school>`이 테마 토큰을 바꿔: 홍익대는 소나무 녹색, 아주대는 남색(#0b2f6b 계열) + 하늘색 액센트. 사이드바·버튼·칩·표지(파비콘)까지 같은 토큰을 따른다.
- WMS 연구 도해와 실무 경험(`experiences`, `terms`)은 개인 자료라 **학교 공통**으로 아주대 모드에서도 열려(사이드바에 '공유' 표시).
- 화면 목록·번호·breadcrumb·검색은 `app.js`의 페이지 레지스트리 `PAGES`에서 자동으로 만들어져. 손으로 쓴 번호는 없어.

### 아주대 자료 채우기 (`public/schools/ajou.js`)

아주대는 **주력 모드**(`meta.status: 'ready'`, `meta.homeView: 'applicant'` → 지원자용 대시보드)야. 비어 있는 키의 화면은 '준비 중' 카드(+ `meta.plannedSections.<화면>.check`의 「확인할 것」 목록)로 보이고, 대시보드 아래 「아직 채울 자료」에 모여.

| 화면 (`PAGES` id) | 채울 키 | 들어갈 내용 |
|---|---|---|
| 대시보드 (home) | `narrative`, `alerts`(home:true 카드), `practice`(`[라벨, 할 일, 'YYYY-MM-DD']`), `application.summary` | D-day · 지원 요약 · 오늘 할 일 · 서사 · 주의 카드 |
| 면접 참고자료 대조 (application) · 아주대 전용 | `application` (`issues`, `rows`, `summary`) | 불일치·확인 필요 · 칸별 제출 내용/예상 질문/답변 포인트/주의 |
| 핵심 문항 (interview) · 직전 한 장 · 모의면접 | `scripts`, `badPhrases`, `lastMinute` | 30/60/90초 답변 · factCheck(`sourceIds`) · 금지 표현 |
| 꼬리질문 (followups) | `followups`, `followupClusters` | 배열 index = 저장 키(뒤에만 추가). 다른 학교 질문을 가져오면 `from` 필드에 출처. `mock: false`면 모의면접 출제에서 뺌. 아직 확인 못 한 사실·자리표시는 `answer`에 대괄호로 넣지 말고 `check` 필드에(답변 아래 「답변에 넣지 않음 · 확인할 것」 메모로 표시, 모의면접·답 복사에는 안 나옴) |
| 경력·연구개발 (career) · 아주대 전용 | `career` (`timeline`, `tips`, `wms`) | 타임라인 · TIPS/IRIS 연구노트(월별 원문) · 말할 범위 |
| 실무 경험 (cases) | `experiences`, `terms` | WMS 공유 사례 3 + 라잇웨잇 사례 2 (`cautionLabel`로 주의 문구 이름) |
| 연구 설계 (research) | `research` (+ `context`, `faculty`, `facultyNote`) | 연구 질문·조건·지표 · 지도교수·연구실 조사 |
| 교육과정·시간표 (coursebook) · 졸업요건·학비 (graduation) | `program` · 아주대 전용 | 수업형태·교과과정·시간표 / 졸업요건·등록금·장학 (공식) |
| 2년 시뮬레이션 (roadmap) | `semesters`, `week` | **비어 있음** — 2027-1 시간표 공개 전. 확인할 것 목록이 placeholder에 표시 |
| 근거·출처 (facts) | `facts`, `sources`, `notices` | 출처 `AJ#`(공식, URL) · `P#`(개인 자료, URL 없음 → "원본 비공개") · 상태 확인/이전 안내/미확인/제출 양식/개인 기록/사용자 확인 필요 |
| 원문 (archive) | `planHTML`, `archiveHTML` + `meta.archiveTabs` | 제출 양식 전사 · 연구노트 기록 요약 원문 |

**학교 전용 키 규칙:** 홍익대 data에 없는 키는 `meta.ownKeys`에 이름을 올려야 빌드가 통과해(현재 `application`, `career`, `program`). 반대로 홍익대 키는 아주대에 빈 값이라도 모두 있어야 해(키 파리티). 학교별 화면 문구는 `meta.copy`(예: `interviewMeta`, `interviewBanner`, `casesIntro`, `factsIntro`, `auditHead`, `archiveIntro`)로 바꾸고, 홍익대 문구는 `app.js`의 기본값으로 남아 있어.

#### 새 아주대 자료를 받았을 때 (private/ 폴더 규칙)

1. 원본(이미지·PDF·대화 정리본 등)은 **`private/ajou/`** 에 넣고 `private/ajou/README.md` 표에 한 줄 적어. `private/`는 `.gitignore`에 있어 GitHub·Pages에 올라가지 않아.
2. 공개 페이지(`ajou.js`)에는 **필요한 사실만** 옮겨. 성명·휴대폰·이메일, 제3자(라잇웨잇 공동창업자) 실명과 카카오톡 발화 원문·대화 파일명은 절대 옮기지 마. 제3자는 「공동창업자(대표)」로만.
3. 출처는 `data.sources`에 번호를 붙여(공식이면 `AJ#`+URL+확인일, 개인 자료면 `P#`+URL 없음), 값마다 상태를 적어. 모르면 지어내지 말고 「사용자 확인 필요」로.
4. 라잇웨잇 33개 항목처럼 "기록된 과제 내역"은 원문 그대로 두되 본인 구현으로 단정하는 문장을 대본에 쓰지 마.
5. `node scripts/build.mjs` → `npm run check` → 내용 보존 검사로 마무리하고, `grep`으로 dist/에 개인정보가 없는지 확인해.

### 정정 기록 (revision log)

말하기 대본·자료를 고칠 때 **이전 문구를 지우지 않아**. `data.revisions`에 `{id, area, where, before, after, reason, source, issues, date}`로 원래 문구 전문과 고친 문구, 이유와 근거를 남기고, '근거·출처' 화면 맨 아래 **정정 기록**(영역별로 접히는 표, 상단 영역 바로가기)으로 보여 줘. `where`는 가능한 한 현재 id(예: 팩트 레지스트리 `credits`)를 쓰고 옛 배열 번호는 괄호로 남겨.
원문 3종(수학계획서 `planHTML`, 47항목 조사 `archiveHTML`, 심층 보고서 `dossierHTML`)과 WMS 원고 본문(`public/wms/content.js`)은 고치지 않고, 화면 위 '이후 정정' 안내(`data.notices`)나 WMS 가이드 주석으로 처리해. 여러 화면에 같은 내용이 생기면 한 곳(정본)에만 두고 나머지는 링크로 바꾸며, 그때 사라지는 문장도 정정 기록에 '중복 통합'으로 보존해.

### 디자인 시스템 · 화면 테마

- 색·반경·간격·글자 크기는 `app.css` 맨 위 `:root` 토큰 한 곳에서 정해(`--bg --surface --surface-2 --ink --ink-2 --muted --line --brand --brand-ink --accent --warn --warn-bg --info --info-bg` 등). 졸업요건·WMS CSS의 접두 토큰(`--wms-*`, `--plate-*`, `--cf-*`)도 이 토큰을 가리켜.
- **다크 모드**: 시스템 설정을 따르고, topbar의 테마 버튼으로 **시스템 → 라이트 → 다크**를 순환해(`atelier-prefs.theme`, `<html data-theme>`).
- 글자는 최소 12px, 본문 15–16px·행간 약 1.75, 긴 글은 약 68자 폭, 한글은 `word-break: keep-all`. 흐린 글씨도 두 테마 모두 대비 4.5:1 이상.
- 브레이크포인트는 1200 / 850 / 560px. 850px 이하에서는 사이드바가 서랍으로 바뀌고 학교 스위치가 topbar에 나와. 375px 폭에서도 가로 스크롤이 생기지 않아.
- 터치 영역은 850px 이하에서 40px 이상(topbar 아이콘·학교 스위치·버전 링크·작은 버튼·칩·summary), 토스트는 topbar 아래에 떠서 하단 버튼을 가리지 않아. 768px 전후 breadcrumb는 학교 짧은 이름 + 현재 화면, 700px 이하는 현재 화면만.
- 버전 표시(topbar `v5.1 ↻`, footer)는 `app.js`의 `APP_VERSION` 상수 하나에서 만들어져.

Cloudflare 파일/설정은 제거했어.

2026-11-01 · GitHub-only mobile PWA edition


## 2026 실제 교과목 탐구 (2026-11-01 반영)

지원자가 올린 **홍익대학교 대학원 시간표 조회 화면 두 장**을 바탕으로 새 `실제 교과목 탐구` 메뉴를 추가했어.

- **1학기:** 국방AI융합학과(주간) 필터가 보이는 화면의 11개 3학점 교과목. 출처: `https://cn.hongik.ac.kr/grad/ex/time`.
- **2학기:** 12개 3학점 교과목이 화면에 있지만 검색필터의 일부가 `선택하세요`로 표시돼 **전공 귀속은 1학기와 동일한 수준으로 독립 확인하지 못했어**. 과목 코드와 세종 표기를 근거로 참고 자료에만 사용해.
- 실제 개설 시간표에 표시된 과목명, 월~토 요일·시각, 학점과 과목 간 **시간 충돌**을 계산해.
- 과목 카드에 표시된 학습 내용은 **강의계획서 원문을 검증한 것이 아니라 일반적인 학문적 범위를 해석한 설명**이야. 주차별 수업 내용, 평가방식, 연구실습 보장 등을 지어내지 않았어.
- 2026년 편성이 **2027년의 실제 개설과 출석방식을 보증하는 건 아냐**.
- 독립적인 2026 시간표에는 `공급사슬관리` 명칭 과목이 나타나지 않아. 기존 교육과정 후보를 실제 2026 개설과 동일시하지 않도록 수정했어.
- 첫 학기 `국방소프트웨어관리`와 `AI와 빅데이터를 활용한 경영연구방법론`은 둘 다 화요일 19~22시에 편성됐기 때문에 **같은 학기 동시 선택하면 충돌을 표시**해.
- 모바일에서도 과목 카드를 누르고 조합을 바꾸거나 **추천 조합 5가지**를 한 번에 선택할 수 있어.
- 4학기 시뮬레이션·면접 4문항·꼬리질문도 같이 갱신했고, **수학계획서 전문과 이전 조사 47항목 원문은 변경하지 않았어**.
- 각 교과목과 RAG 연구의 관계는 실무경험과 분야 일반론을 결합한 연구 적합도 **평가**이며 공식 교수 평가·실라버스 내용을 뜻하지 않아.

공식 조회 원문: https://cn.hongik.ac.kr/grad/ex/time  
학과 교육과정: https://gbai.hongik.ac.kr/gbai/0401.do  
2025-2 관련 분야 교원 모집 예: https://applicant.hongik.ac.kr/pdf/202525/202525_chobing.pdf



## 2026-11-02 졸업요건 탭

- 기존 `#foreign`을 `#graduation`으로 통합. 이전 링크도 새 탭으로 연결됩니다.
- 국방AI융합학과 세 학위 경로 허용을 현황표 2페이지에서 확인했습니다.
- 학점·성적·등록·선수·종합시험·영어·연구윤리·신청·심사·최종 제출과 출처를 정리했습니다.
- 학과의 2026 소개자료가 전 과목 선택 운영을 명시함을 확인했습니다. 2027 적용 교육과정과 개인별 선수 지정, 실제 종합시험 과목은 별도로 구분했습니다.
- 경로를 선택하면 4학기 예시와 체크리스트가 바뀌며, 점검 기록은 기존 localStorage에만 저장됩니다.
- `public/graduation/graduation.js`와 `.css`를 빌드 시 단일 HTML에 통합합니다. 확인한 학과별 표와 외국어 과목 PDF도 배포합니다.
- 기존 면접 답변·팩트체크·시뮬레이션의 미확인 표현을 수정했고, 제출 수학계획서 및 원문 기록은 그대로 보존했습니다.
- 조사 기준은 2026-2입니다. 2027~2029 공지의 일정과 적용 규정까지 보장하지 않습니다.
