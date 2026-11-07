/*
 * GitHub Pages 용 PWA 등록 스크립트.
 * 개인 면접 자료는 HTML에 포함돼 있으므로 GitHub Pages에서는 전 세계에 공개될 수 있다.
 * 서비스 워커는 별도 저장소나 로그인 기능이 없고, 캐시도 만들지 않는다.
 * 앱이 오프라인일 때는 브라우저 자체의 일반 캐시 동작만 가능하다.
 */
// 빌드 해시: scripts/build.mjs가 'dev'를 실제 해시로 바꾼다. 캐시는 만들지 않으므로 이 값은 어디서도 쓰지 않고,
// 배포마다 sw.js 바이트를 바꿔 브라우저가 새 서비스 워커를 받게 하는 용도로만 남겨 둔다.
const BUILD_ID='dev';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
