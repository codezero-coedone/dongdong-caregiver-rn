# PrimeEcho DongDong Runbook — SEALED v2

목적: **2앱(Caregiver/Guardian)에서 “간병일지 100%”까지**를 **결정적으로 완주**하기 위한 단일 실행 규격(봉인판).

원칙:
- **로컬 빌드 0**: 코드 수정 → push → Codemagic → Play 내부테스트 → 앱에서 DBG로 검증.
- **민감정보 0 커밋**: 키/비번/토큰/서비스계정 JSON은 git에 절대 포함 금지.
- **단일 SSOT**: “무엇을 봐야 하는지”는 이 문서가 유일 기준.

---

## 0) SSOT 구조(고정)

- **Caregiver RN repo (CM = 전투/DEV 트레일)**: `codezero-coedone/dongdong-caregiver-rn`
  - 로컬: `gitwork/dongdong-caregiver-rn`
  - CI: `gitwork/dongdong-caregiver-rn/codemagic.yaml`
- **Guardian RN repo (CM = 전투/DEV 트레일)**: `codezero-coedone/dongdong-rn`
  - 로컬: `gitwork/dongdong-rn`
  - CI: `gitwork/dongdong-rn/codemagic.yaml`
- **Z21(SSOT = 릴리즈/배포 기준선)**:
  - `Z21-ZeroToOne/dongdong-caregiver-rn`
  - `Z21-ZeroToOne/dongdong-rn`
  - `Z21-ZeroToOne/dongdong-client`
  - `Z21-ZeroToOne/dongdong-nest`
- **Backend (Nest)**: 서버에 배포된 도커 기준 (**배포 소스는 Z21만**)
  - API: `http://api.dongdong.io:3000/api/v1`

---

## 1) “구간(배선) 기준 간격” 정의 (G0~G5)

각 구간은 **둘 다** 만족하면 다음 구간으로 이동한다:
- **GATE-A**: Codemagic로 “내부테스트 설치 가능한 APK/AAB”가 1회 생성됨
- **GATE-B**: 앱 내 DBG(DEV TRACE)에서 해당 구간의 핵심 API가 **예상 상태코드**로 찍힘

구간:
- **G0. CI/서명/배포 루프 완주**
- **G1. 로그인(카카오) → `/auth/social` 토큰 발급**
- **G2. 역할 프로필 생성**
  - Caregiver: `/caregivers/profile` 404 → signup 플로우, 생성 후 200
  - Guardian: (해당 엔드포인트 기준으로 동일 원칙 적용)
- **G3. 매칭 전제조건 확보**
  - `matchId`가 확보돼야 간병일지 테스트가 가능
  - WebView(Guardian)가 먹통이면: **Guardian(DEVTOOLS=1)에서 “간병요청(공고) 1개 생성” → Caregiver에서 지원(apply) → `/my/matches`로 matchId 확보** (SSOT=서버)
- **G4. 간병일지 CRUD**
  - `POST /journals`, `GET /journals`, `GET /journals/:id`, `PUT /journals/:id`
- **G5. UX/정책/릴리즈 게이트**

---

## 2) DEV TRACE(관측 레이어) 사용 규칙

목표: “추측” 대신 **DBG에서 즉시 원인 분리**.

### 2.1 운영 프로토콜(고정) — “내 로그(rid) ↔ 서버 로그 비교”

앞으로의 작업 순서(강제):

1) **실기기 DBG에서 해당 실패 이벤트의 `[rid=...]` 1줄 확보**  
2) **서버 로그에서 동일 rid를 검색하여 원인 확정**  
3) **원인 확정 후 최소 diff 커밋 1개로만 수정**  

금지:
- rid 없이 “추측으로” 코드 수정 금지
- 앱/서버/웹 중 책임 컴포넌트를 rid 매칭 없이 바꾸지 않음

서버 로그 검색(예시, IP/경로는 SSOT 범위 밖이므로 문서에 고정하지 않음):
- `docker logs dongdong-api | grep -F "X-DD-Request-Id: <rid>" -n`
- 또는 앱 로그에 남는 형태에 맞춰 `grep -F "<rid>"`

DBG에서 보는 핵심:
- **`POST /auth/social`**: 200이면 로그인 성공, 500이면 백엔드/DB 문제
- **`GET /caregivers/profile`**:
  - 200: 프로필 존재(가입 완료)
  - 404: 신규 유저(가입 플로우로 이동이 정상)
- **SMS**
  - `POST /sms/verification/request`
  - `POST /sms/verification/verify`

---

## 2.2 권한(선택 권한) 정책 — “OS도 만족, 사용자 노이즈 0”

- 온보딩의 권한 페이지는 **안내 1회**만 수행한다(권한 팝업 폭탄 금지).
- 실제 OS 권한 요청은 **기능 진입 시점(JIT)**에만 수행한다. (거부/재시도/설정 이동 포함)
- 선택 권한 거부는 **서비스 이용 차단 사유가 아니다**. 기능 단위로만 제한/대체 UX를 제공한다.

---

## 3) Codemagic SSOT (2앱 공통)

공통 환경변수(앱 실행/빌드):
- `EXPO_PUBLIC_API_URL`: `http://api.dongdong.io:3000/api/v1`
- `EXPO_PUBLIC_KAKAO_APP_KEY`: 앱별 값(고정)

### 3.1 레일(프로필) 분리 — “AAB는 박아두고, 반복은 APK-DBG만”

- **DEV/폴리싱 레일 (APK-DBG)**: `internal-apk-dev`
  - 트리거: **push 자동**
  - `EXPO_PUBLIC_DEVTOOLS=1` (DBG/DEV 레버 ON)
- **쇼케이스 레일 (AAB/Release)**: `android-aab`
  - 트리거: **수동 Run만**
  - `EXPO_PUBLIC_DEVTOOLS=0` (DBG/DEV 레버 OFF, fail-fast)
  - 원칙: **쇼케이스 AAB는 “한 번 뽑아 박아두고 유지”**한다. 폴리싱 반복 중에는 AAB를 다시 돌리지 않는다.

---

## 4) Change Control (SEALED 규칙)

SEALED v2에서 변경 금지:
- 구간 정의(G0~G5) 및 각 GATE-A/B
- Codemagic 자동 배포 루프(수정→push→CI→internal)

변경이 필요하면:
- **SEALED v3로 문서 승격** 후 변경 사유/영향/롤백을 함께 기록.

