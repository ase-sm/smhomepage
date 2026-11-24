# 세명소프트 홈페이지

Figma 기획서(프런트 `3181:1179`, 어드민 `3181:1178`)를 기준으로 구현한 홈페이지입니다.

| 구분 | 기술 |
|---|---|
| Frontend | React 19 + TypeScript + Vite, React Router 7, Tiptap 3 (본문 에디터) |
| Backend | Java 21, Spring Boot 3.5 (Web / Data JPA / Security / Validation / Mail), Flyway, jsoup |
| DB | PostgreSQL 17 |
| Infra | Docker Compose (nginx 로 SPA 서빙 + `/api`, `/uploads` 프록시), Mailpit (개발용 SMTP) |

## 실행

```bash
cp .env.example .env        # 비밀번호 등 수정
docker compose up -d --build
```

| 주소 | 내용 |
|---|---|
| http://localhost:3000/news | 홈페이지 뉴스 목록 |
| http://localhost:3000/inquiry | 문의하기 |
| http://localhost:3000/admin | 관리자 (기본 계정 `admin` / `admin1234`, `.env` 에서 변경) |
| http://localhost:8025 | Mailpit – 문의 접수 시 발송된 메일 확인 |

> 관리자 계정은 **최초 기동 시 1회** 생성됩니다. 이후 `ADMIN_PASSWORD` 를 바꿔도 기존 계정 비밀번호는 바뀌지 않습니다.
> 데이터를 초기화하려면 `docker compose down -v` 후 다시 실행하세요.

### 로컬 개발

```bash
docker compose up -d db mailpit                      # DB, SMTP 만 실행
cd backend && mvn spring-boot:run                     # :8080 (Maven 필요)
cd frontend && npm install && npm run dev             # :5173 (/api 는 8080 으로 프록시)
```

## 구현 화면

### 홈페이지
| 화면 ID | 경로 | 내용 |
|---|---|---|
| N-news-01 | `/news` | 뉴스 목록 (텍스트 목록 5건 + 마우스를 올린 뉴스의 대표 이미지·요약 미리보기, 페이지네이션) |
| N-news-02 | `/news/:id` | 뉴스 상세 (요약, 본문, 출처·원문 보기, 목록으로 시 페이지 유지) |
| N-문의-01 | `/inquiry` | 문의하기 (입력 검증, 등록 확인/접수 완료/실패 모달) |
| N-문의-01-01 | (메일) | 접수 확인 메일(문의자) + 접수 알림 메일(help@smsoft.kr) |

### 관리자
| 화면 ID | 경로 | 내용 |
|---|---|---|
| A-뉴스관리-01 | `/admin/news` | 목록 (상태·검색어 검색, 10/30/50개, 페이지네이션) |
| A-뉴스관리-02 | `/admin/news/new`, `/admin/news/:id/edit` | 등록·수정 (에디터, 이미지 업로드, 예약 확인, 이탈 확인) |
| A-뉴스관리-03 | `/admin/news/:id` | 상세 (삭제/수정) |

## 주요 정책 구현

- **상태**: 공개 여부 + 게시일로 자동 결정 (`공개` / `예약`(게시일 > 오늘) / `비공개`). 한국 시간 기준으로 조회 시점에 계산하므로 예약 건은 게시일 00시에 자동 공개됩니다.
- **홈페이지 노출**: 공개 상태만 노출. 예약·비공개·없는 뉴스를 직접 주소로 열면 목록으로 이동.
- **대표 이미지**: 별도 항목 없이 본문 최상단 이미지를 저장 시 추출해 썸네일로 사용 (없으면 기본 이미지).
- **이미지 업로드**: jpg·jpeg·png·gif, 10MB 이하, 가로 1600px 초과 시 자동 리사이즈(GIF 는 원본 유지). Docker 볼륨 `uploads` 에 저장.
- **본문 보안**: 서버에서 jsoup 으로 허용 태그만 남기고 정리(XSS 방지). 링크는 새 창으로 열림.
- **문의 접수**: 접수번호 `INQ-YYYYMMDD-NN`. 저장 후 두 메일을 발송하며, 메일 발송 실패 시 저장도 롤백되고 화면에 실패 모달이 노출됩니다.
- **관리자 인증**: 세션 로그인 + CSRF(쿠키 `XSRF-TOKEN` → 헤더 `X-XSRF-TOKEN`).

## 운영 시 설정

- `.env` 의 `DB_PASSWORD`, `ADMIN_PASSWORD` 변경
- 실제 SMTP 사용: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SMTP_AUTH=true`, `MAIL_STARTTLS=true`
  (SMTP 가 발신 주소를 제한하면 `MAIL_FROM_ADDRESS` 지정) 후 `docker-compose.yml` 의 `mailpit` 서비스 제거
- `SEED_SAMPLE_NEWS=false` 로 샘플 뉴스 생성 끄기
- HTTPS 는 앞단 리버스 프록시/로드밸런서에서 처리
