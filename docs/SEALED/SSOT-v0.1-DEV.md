# DongDong Backend — SSoT v0.1 (DEV)

> 목적: “짬뽕 문서/피그마”를 대체하는 **단일 기준(SSoT, Single Source of Truth)** 입니다.  
> 앞으로 기능/변경/검증은 **이 문서(=배포된 Swagger + 데이터 계약 + 상태 규칙)** 기준으로 진행합니다.
>
> 제품 정책(봉인): **RN 2종(Guardian/Caregiver) 회원가입·로그인은 KAKAO 고정**, APPLE은 추후 범위.

---

## 0) Live URLs (DEV)

- **API Base (domain)**: `http://api.dongdong.io:3000`
- **API Base (ip)**: `http://156.228.169.106:3000`
- **/dev alias**: `http://api.dongdong.io:3000/dev` (same API/Swagger; path rewrite)
- **/dev/v1 alias**: `http://api.dongdong.io:3000/dev/v1` → `/api/v1` (PM 편의 경로; server-side rewrite)
- **Health**: `GET /api/v1/health`
- **Swagger UI**: `GET /api/docs`
- **OpenAPI JSON**: `GET /api/docs-json`

---

## 1) API 계약 (v0.1 / 현재 배포 완료)

### Auth / JWT 정책(DEV)

- 기본 정책: **JWT 필요**
  - 예외(공개): `GET /api/v1/health`, 효성 웹훅 2개 엔드포인트
- 프론트 호출 방식: `Authorization: Bearer <access_token>`
- 마이페이지(최소):
  - `GET /api/v1/me` (내 정보 조회)

### 확장 API (연동용 MVP)

- Caregiver
  - `POST /api/v1/caregivers/profile` (내 프로필 등록)
  - `GET /api/v1/caregivers/profile` (내 프로필 조회)
  - `PUT /api/v1/caregivers/profile` (내 프로필 수정)
  - `PUT /api/v1/caregivers/bank-account` / `GET /api/v1/caregivers/bank-account`
- Matching
  - `POST /api/v1/care-requests` (요청 생성 alias)
  - `GET /api/v1/jobs` / `GET /api/v1/jobs/:id` / `POST /api/v1/jobs/:id/apply`
  - `GET /api/v1/my/matches` (마이페이지 매칭 현황)
- Review/Report
  - `POST /api/v1/reviews` / `GET /api/v1/reviews/caregiver/:id` / `GET /api/v1/my/reviews`
  - `POST /api/v1/reports`
- Journal
  - `POST /api/v1/journals` (간병인만 작성)
  - `GET /api/v1/journals` (보호자/간병인 조회, `matchId` 필터)
  - `GET /api/v1/journals/:id` (상세)
  - `PUT /api/v1/journals/:id` (간병인만 수정, endDate 이후 수정 불가)

### 소셜 로그인(간편가입) 지원 범위(DEV)

- `POST /api/v1/auth/social`
  - 지원(서버): **KAKAO, APPLE**
  - 정책(v0.1 제품 플로우/피그마 기준): **RN 2종 회원가입·로그인은 KAKAO 고정**, APPLE은 추후 범위
  - 미지원: **GOOGLE(미구현)**

---

## 2) 데이터 계약 (ERD v0.1 / 요약)

> DEV는 TypeORM `synchronize` 기반으로 테이블이 생성됩니다.

- `T_PATIENTS`: 환자
- `T_CAREGIVERS`: 간병인 프로필(유저 1:1)
- `T_CARE_REQUESTS`: 간병 요청
- `T_MATCHES`: 매칭
- `T_REVIEWS`: 리뷰
- `T_REPORTS`: 신고
- `T_PAYMENTS`: 결제
- `T_RECEIPTS`: 영수증
- `T_ADMIN_POLICIES`: 정책

---

## 3) 상태 규칙 (v0.1)

### Journal 권한/락 정책(합의 반영)

- 권한:
  - **간병인만** 일지 작성/수정 가능
  - **보호자**는 조회만 가능
- 완료/수정락:
  - “일지 작성 완료” 기준은 **간병시간 종료(endDate)** 시점
  - endDate 이후에는 **수정 불가**

---

## 4) 운영/배포 기준 (DEV)

- DB Host: `156.228.169.105:5432`
- API Host: `api.dongdong.io:3000` (ip: `156.228.169.106:3000`)
- 주의: DEV는 **80/443 리버스프록시 없이 3000 포트로만** 외부 접근됩니다. (클라이언트 baseURL에 `:3000` 포함 필요)

