# NightWave

Node.js와 MySQL로 구성한 밤문화 커뮤니티입니다. 프론트엔드와 백엔드를 분리했으며, 본인인증에서 전달받은 성별에 따라 전용 게시판 접근을 제어합니다.

## 구조

```text
backend/
  database/schema.sql   # MySQL 스키마 및 샘플 게시글
  src/                  # Express API, 인증, 접근 제어
  test/                 # 권한 정책 단위 테스트
frontend/
  assets/               # 로고
  css/                  # UI 스타일
  js/                   # 화면 및 API 연동
  index.html             # SPA 진입점
  server.js              # 정적 파일 서버 및 API 프록시
scripts/
  start.js               # 백엔드와 프론트엔드 동시 실행
```

## 실행

1. `cp .env.example .env` 후 DB 접속 정보와 안전한 `JWT_SECRET`을 입력합니다.
2. `mysql -u root -p < backend/database/schema.sql`로 DB를 준비합니다.
3. 최초 한 번 `npm install`로 의존성을 설치합니다.
4. 이후 `npm start` 명령어 하나로 백엔드와 프론트엔드를 동시에 실행합니다.
5. 브라우저에서 `http://localhost:5173`을 엽니다. 프론트엔드 서버가 `/api` 요청을 백엔드(`http://localhost:3000`)로 자동 전달합니다.

개발 중에는 `npm run dev`를 사용하면 두 서버가 모두 watch 모드로 실행됩니다. 개별 실행이 필요할 때만 `npm run start:backend` 또는 `npm run start:frontend`를 사용할 수 있습니다.

> 개발용 회원가입 화면은 본인인증 사업자가 최종 반환한 이름·성별을 입력받는 형태입니다. 운영에서는 `/api/auth/register` 호출 전에 PASS/휴대폰 본인인증 서버 콜백에서 이 값을 검증해 전달해야 합니다. 성별 게시판 권한은 화면 숨김뿐 아니라 API에서도 재검증합니다.
