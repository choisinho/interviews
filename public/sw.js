/*
 * GitHub Pages 용 PWA 등록 스크립트.
 * 개인 면접 자료는 HTML에 포함돼 있으므로 GitHub Pages에서는 전 세계에 공개될 수 있다.
 * 서비스 워커는 별도 저장소나 로그인 기능이 없고, 캐시도 만들지 않는다.
 * 앱이 오프라인일 때는 브라우저 자체의 일반 캐시 동작만 가능하다.
 */
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
