/*
 * 앱 설치용 최소 서비스 워커.
 * 기기의 캐시에 면접 원문(군 업무·진학 개인 자료)이 남지 않도록 HTML은 캐싱하지 않는다.
 * 인증 만료/로그아웃 뒤에는 서버의 읽기 문이 다시 열쇠를 요구한다.
 */
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
