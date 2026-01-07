# 통합 DoD v0.1 — 4레포(Backend + WebView + RN 2종) (DEV→납품 기준)

> 목적: “요구사항 추가/확장”을 차단하고, **실사용에서 막힘 없이 동작하는 최소 완결(Definition of Done)**을 고정한다.  
> 단일 계약 기준: `docs/SEALED/SSOT-v0.1-DEV.md`

---

## 1) 범위(Deliverables) — “이번 납품에 포함”

### 1.1 공통(운영/연결)

- 외부에서 아래 URL이 **항상 200**이어야 함
  - `http://api.dongdong.io:3000/api/v1/health`
  - `http://api.dongdong.io:3000/api/docs`
  - `http://dev-client.dongdong.io/`
- Android 단말에서 HTTP(비TLS) 호출이 막히지 않아야 함
  - `usesCleartextTraffic=true` 필수(DEV 서버가 HTTP)

### 1.2 Backend (`dongdong-nest`) — API/DB

- SSoT의 v0.1 “현재 배포 완료” 섹션(특히 아래)
  - Auth: `POST /api/v1/auth/social` (**KAKAO 고정**, APPLE은 추후)
  - Caregiver: profile/bank-account
  - Matching: jobs/apply, my/matches
  - Review: create/list(my + caregiver)
  - Journal: create/list/detail/update
  - Payments(webhook 2개) + POC approve(문서상 mock 허용)

### 1.3 WebView (`dongdong-client`) — 보호자/환자 UI(웹)

- 핵심 탭/화면은 **실데이터 연동**이어야 함
  - 마이페이지: 내 정보(`/me`), 매칭현황(`/my/matches`), 내가 쓴 리뷰(`/my/reviews`)
  - 간병일지(조회): `/journals`, `/journals/:id` (UI가 존재하는 범위)
- 로그인/회원가입은 RN에서 처리(웹은 WebView 컨텐츠)

### 1.4 RN Guardian (`dongdong-rn`)

- Kakao 로그인/회원가입 **고정(필수)**
  - 버튼 탭 → 로그인 UI가 떠야 함(무반응 금지)
  - 로그인 완료 후 `/auth/social` 성공 → 토큰 저장
- 홈은 WebView로 `dev-client` 컨텐츠가 로드되어야 함
  - 토큰은 **앱(RN)이 단일 소유**하고, WebView에는 **주입(inject)**만 한다.
  - WebView는 “앱의 소유물(컨테이너)”이며, 인증/토큰 소유권을 WebView로 넘기지 않는다.

### 1.5 RN Caregiver (`dongdong-caregiver-rn`)

- Kakao 로그인/회원가입 **고정(필수, guardian과 동일)**
- 간병 일지 작성/수정(간병인 권한)
- job list / job detail / apply 연동(가능 범위)
- 프로필 조회/수정(가능 범위)

---

## 1.6 플로우 소유권(경계선) — “공통 재사용, 분기 금지”

공통 경계선(2앱 동일, 레이아웃 분기 금지):
- **온보딩 → 사용권한 → 카카오 로그인 → SMS 회원가입 → 인증완료**
  - UI/문구/필드/검증 규칙은 **2앱 동일**하게 유지한다.
  - 이 구간에서 “Care/Guardian 역할”에 따라 화면을 갈라치지 않는다(분기 금지).

분기 시작(경계선 이후, 앱 소유권 고정):
- **Guardian(보호/소비자 앱)**: 인증완료 후 **WebView 진입점부터 WebView**가 소유(하이브리드)
- **Caregiver(케어/노동자 앱)**: 인증완료 후 **홈/간병일지/프로필은 100% RN**이 소유(네이티브)

---

## 2) 비범위(Out of Scope) — 이번 범위에서 제외

- 효성 CMS 실결제/정산 “실연동” (현재 webhook 수신 로그 저장 수준)
- Google 소셜 로그인
- Apple 로그인(Apple Sign In) — **추후 범위**
- guardian 프로덕션 WebView 도메인(`guardian.dongdong.kr`) 전환(준비되면 별도 DoD)
- 사진 업로드/파일 업로드 고도화(신분증/범죄경력/서류 등)
- 공지/FAQ/카드/알림설정 등 비핵심 화면의 API화(현재 mock 유지 가능하나, 범위 확정이 필요)

---

## 3) 품질 게이트(필수 통과) — “결정성/신뢰도”

### 3.1 Gate A — 레포 상태(누수 0)

- 4레포 모두:
  - `git status` 결과가 **clean**
  - untracked(??) 파일 0

### 3.2 Gate B — 계약 일치(SSoT)

- 앱/웹의 baseURL/경로가 SSoT와 일치
  - `API Base = http://api.dongdong.io:3000/api/v1`
- “mock 데이터/임시 분기”가 **실사용 플로우에 섞이지 않음**
  - 노출될 수 있으면 반드시 제거/차단/Out-of-scope로 격리

### 3.3 Gate C — RN 선대응 프로토콜(강제)

- 문서: `docs/SEALED/PRIMEECHO_DONGDONG_RUNBOOK_SEALED_v2.md`
- Guardian/Caregiver 각각:
  - `npm run preflight` 통과(네트워크/설정/헬스 체크 포함)
  - `EXPO_PUBLIC_KAKAO_APP_KEY` 없으면 **빌드 실패**(노옵 로그인 차단)

### 3.4 Gate D — 서버/웹 실측 스모크(필수)

- (1) API health 200
- (2) API docs 200
- (3) dev-client 200

---

## 4) 실사용 스모크 시나리오(필수 8개)

1. (Guardian) 앱 설치 → Kakao 로그인 성공 → 홈(WebView) 정상 로드  
2. (Guardian/WebView) 마이페이지 진입 → `/me` 로딩 성공  
3. (Guardian/WebView) 매칭현황 탭 → `/my/matches` 로딩 성공  
4. (Guardian/WebView) 내가 쓴 리뷰 → `/my/reviews` 로딩 성공  
5. (Caregiver) 앱 설치 → Kakao 로그인 성공 → 홈(일자리) 목록 로딩 성공  
6. (Caregiver) 일자리 상세 진입 → 상세 로딩 성공  
7. (Caregiver) 간병일지 목록/상세 조회 성공  
8. (Caregiver) 간병일지 작성/수정 시도 → 서버 권한/락 정책 준수(불가 시 비활성+안내)

---

## 5) 운영 DoD(증빙/재현성) — “배포가 누가 해도 동일해야 함”

- 서버 배포 디렉토리(`/opt/dongdong/*`)에 **버전 증빙**이 남아야 함(둘 중 하나 필수)
  - A안: 정상 git clone 상태로 `git rev-parse HEAD`가 동작
  - B안: `VERSION` 파일에 `git sha + build time + repo name` 기록
- API는 docker 컨테이너 이름이 고정되어야 함(관측/운영 기준)
  - `dongdong-api`, `dongdong-postgres`, `dongdong-pgadmin`

