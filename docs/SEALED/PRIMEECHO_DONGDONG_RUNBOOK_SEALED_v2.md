# PrimeEcho DongDong Runbook — SEALED v2

목적: **2앱(Caregiver/Guardian)에서 “간병일지 100%”까지**를 **결정적으로 완주**하기 위한 단일 실행 규격(봉인판).

원칙:
- **로컬 빌드 0**: 코드 수정 → push → Codemagic → Play 내부테스트 → 앱에서 DBG로 검증.
- **민감정보 0 커밋**: 키/비번/토큰/서비스계정 JSON은 git에 절대 포함 금지.
- **단일 SSOT**: “무엇을 봐야 하는지”는 이 문서가 유일 기준.

---

## 0) SSOT 구조(고정)

- **Caregiver RN repo**: `codezero-coedone/dongdong-caregiver-rn`
  - 로컬: `gitwork/dongdong-caregiver-rn`
  - CI: `gitwork/dongdong-caregiver-rn/codemagic.yaml`
- **Guardian RN repo**: `codezero-coedone/dongdong-rn`
  - 로컬: `gitwork/dongdong-rn`
  - CI: `gitwork/dongdong-rn/codemagic.yaml`
- **Backend (Nest)**: 서버에 배포된 도커 기준
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
- **G4. 간병일지 CRUD**
  - `POST /journals`, `GET /journals`, `GET /journals/:id`, `PUT /journals/:id`
- **G5. UX/정책/릴리즈 게이트**

---

## 2) DEV TRACE(관측 레이어) 사용 규칙

목표: “추측” 대신 **DBG에서 즉시 원인 분리**.

DBG에서 보는 핵심:
- **`POST /auth/social`**: 200이면 로그인 성공, 500이면 백엔드/DB 문제
- **`GET /caregivers/profile`**:
  - 200: 프로필 존재(가입 완료)
  - 404: 신규 유저(가입 플로우로 이동이 정상)
- **SMS**
  - `POST /sms/verification/request`
  - `POST /sms/verification/verify`

---

## 3) Codemagic SSOT (2앱 공통)

공통 환경변수(앱 실행/빌드):
- `EXPO_PUBLIC_API_URL`: `http://api.dongdong.io:3000/api/v1`
- `EXPO_PUBLIC_KAKAO_APP_KEY`: 앱별 값(고정)
- `EXPO_PUBLIC_DEVTOOLS=1` (dev group로 주입)

---

## 4) Change Control (SEALED 규칙)

SEALED v2에서 변경 금지:
- 구간 정의(G0~G5) 및 각 GATE-A/B
- Codemagic 자동 배포 루프(수정→push→CI→internal)

변경이 필요하면:
- **SEALED v3로 문서 승격** 후 변경 사유/영향/롤백을 함께 기록.

