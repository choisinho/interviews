# 국방 AI · 면접 아틀리에

홍익대학교 일반대학원 세종캠퍼스 국방AI융합학과 면접 준비와 입학 후 2년 학업·연구 가능성을 검증하는 **개인용 웹앱**이야.

## 배포 방식: GitHub만 사용

- 저장소: `choisinho/interviews` (현재 Private)
- 사이트: **GitHub Pages** — 별도의 Cloudflare, Vercel, Render, 로그인 서버를 쓰지 않아.
- 빌드·배포: **GitHub Actions** 수동 워크플로(`.github/workflows/publish-pages.yml`).
- 앱 설치: `manifest.webmanifest` + 서비스 워커 + 자동 생성되는 192/512px PNG 아이콘.
- 배포 후 예상 주소: `https://choisinho.github.io/interviews/`. **Pages가 켜지기 전에는 이 주소가 작동하지 않아.**

### 가장 중요한 공개 범위 안내

**개인 계정의 GitHub Pages 사이트는 공개 웹사이트야. Private 저장소에서 Pages를 운영할 수 있는 유료 GitHub 플랜이어도, 게시한 HTML은 누구나 열고 내려받을 수 있어.**
이 앱의 HTML에는 지원 수학계획서 원문과 군 물류정보체계 관련 본인 진술 및 과거 조사자료가 포함돼 있어. 별도 서버 인증 없이 HTML·JavaScript에서 비밀번호를 검증하는 방식은 실제 비공개 보호가 아니므로 구현하지 않았어.

- Github Free 계정: 일반적으로 **공개 저장소**에서만 Pages 지원.
- GitHub Pro 등 지원 플랜: **비공개 저장소에서도 Pages 생성 가능**, 단 **게시된 사이트는 공개**.
- 보안상 공개해도 되는 자료만 남기는 별도 공개판을 만들거나, 개인정보를 공개해도 되는지 먼저 충분히 검토해야 해.
- **현재는 배포를 자동으로 실행하지 않아. 저장소 visibility도 변경하지 않았어.**

## 휴대폰 홈 화면에서 앱처럼 실행하기

위 공개 범위 주의를 이해하고 Pages 사용을 결정했다면, GitHub 사이트에서 다음 작업을 한 번 수행하면 돼.

1. `choisinho/interviews` 저장소 → **Settings** → **Pages**.
2. **Build and deployment → Source**를 **GitHub Actions**로 설정. 현재 플랜과 저장소 설정에 따라 Pages가 제공되지 않을 수 있어.
3. 저장소의 **Actions** 탭 → **Publish interview atelier (manual)** → **Run workflow**. 처음 배포는 수동 실행이야.
4. 성공하면 `https://choisinho.github.io/interviews/` 접속.
5. **안드로이드 Chrome**에서 사이트를 열고, 메뉴 `⋮` → **홈 화면에 추가** 또는 **앱 설치**.
6. 설치되면 휴대폰 홈 화면에 '면접 아틀리에' 아이콘이 생겨. 이후에는 다운로드 없이 그 아이콘으로 들어오면 돼.

> GitHub Pages는 로그인 제한을 제공하지 않아. 설치한 앱만 열쇠가 필요한 구조는 GitHub Pages 단독으로 구현할 수 없어.

## 앱 내용

- 면접 핵심 4문항의 30초·60초·90초 이상 답변
- 꼬리질문 44개, 무작위 모의면접, 답변 가리기, 타이머, 약점 재출제
- 면접 직전 한 장 요약, 학습 진도
- WMS 실무 경험과 연구주제 연결
- 2027~2029년 학기별 학업·연구 시뮬레이션
- 근거 기반 현실성 조사 결과 및 공식 출처 검증
- RAG 기반 레거시 유지보수 연구설계
- 제출 수학계획서 원문과 기존 조사 47항목 원문

## 데이터 및 개인정보

오프라인 HTML 원본 `index.html`은 저장소에서 내려받아 파일로 실행할 수 있어. 학습 완료·약점 점수는 휴대폰 Chrome 등 **현재 브라우저의 localStorage**에만 저장되며 GitHub에 올라가지 않아. 앱을 삭제하거나 브라우저 데이터를 삭제하면 기록도 사라질 수 있어.

**군 내부자료, 실제 코드·로그·IP·부대·품목 식별값을 이 저장소에 추가하거나 GitHub Pages에 게시하지 마.**

## 개발 구조

```text
index.html                     전체 웹앱 (단일 HTML)
public/manifest.webmanifest     안드로이드 홈 화면 설치 정보
public/sw.js                    앱 설치를 돕는 서비스 워커
public/favicon.svg              아이콘 원형
scripts/build.mjs               Node 표준기능으로 dist/와 PNG 아이콘 생성
.github/workflows/publish-pages.yml  GitHub Actions 수동 배포
package.json                    GitHub 내부 빌드 명령만 정의
```

로컬 빌드는 Node.js가 있을 때 `npm run build`로 수행할 수 있어. Cloudflare 파일/설정은 제거했어.

2026-11-01 · GitHub-only mobile PWA edition
