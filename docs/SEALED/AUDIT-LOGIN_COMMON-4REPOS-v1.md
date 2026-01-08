# AUDIT — 로그인공통(피그마) 기준 4레포 흐름/누수점 (v1)

> 기준: `gitwork/figmacopy/로그인공통/**` (온보딩/권한/회원가입 PNG) + 4레포 현재 구현
>
> 정책(봉인): **회원가입/로그인 = 카카오(KAKAO) 고정**, Apple은 추후 범위

---

## 1) 피그마(로그인공통) 페이지 순서(요약)

### 1.1 공통 온보딩(로그인)
- **온보딩 1 → 2 → 3**
  - 3번에서 **카카오 시작하기** (애플 버튼은 디자인에는 있으나 v0.1 범위에서 제외)
- **언어 토글** UI 존재(상단 A/한 표시) — v0.1에서는 기능화/동기화 범위 밖(표시만 남기거나 제거는 추후)

### 1.2 공통 권한 동의
- 위치/카메라/저장공간/블루투스/전화/연락처 등 “선택 권한” UI 존재
- **정책(SEALED)**: 온보딩에서는 “안내 1회”만 수행하고, 실제 OS 권한 요청은 **기능 진입 시점(JIT)**에만 수행

### 1.3 보호자(환자앱) 회원가입(SMS)
- 회원가입 입력(이름/생년월일/성별/휴대폰) → **인증번호 받기**
- 인증번호 입력 → **인증 완료**
- 예외 UX:
  - **이미 가입된 회원 → 로그인 하러가기**
  - **인증번호 시간 초과**
  - **인증번호 5회 이상 입력 실패**

---

## 2) 4레포 구현 매핑(현재)

### 2.1 Guardian RN (`gitwork/dongdong-rn`)
- **온보딩**: `app/(auth)/login.tsx`
  - 스와이프/탭으로 슬라이드 이동 + 마지막 슬라이드에서 **카카오 시작하기**
- **카카오 로그인**: `useAuthStore().socialLogin('kakao')` (RN 네이티브 SDK)
- **로그인 성공 후 진입**: `router.replace('/(tabs)')`
- **WebView 진입 차단 규칙**: `src/shared/config/webview.ts`
  - WebView 내부에서 `/login`, `/auth`, `/signup`, `/onboarding` 차단
- **WebView 토큰 주입(결정성)**: `src/features/webview/ui/WebViewContainer.tsx`
  - `injectedJavaScriptBeforeContentLoaded`로 `localStorage.accessToken` 선주입 + `dd-auth-token` 이벤트

### 2.2 WebView (`gitwork/dongdong-client`)
- **토큰 수신(브릿지)**: `src/app/providers.tsx`
  - RN 메시지 `AUTH_TOKEN` 수신 → `localStorage.accessToken` 저장 → `dd-auth-token` 이벤트
- **간병일지/마이/매칭/리뷰**:
  - 홈에서 `/journals` 호출 및 상세 조회 흐름 존재
  - 마이페이지에서 `/me`, `/my/matches`, `/my/reviews` 호출
- **주의**: `/login` 페이지는 “브라우저 DEV용”으로 존재(앱 WebView에서는 차단되어야 정상)

### 2.3 Backend (`gitwork/dongdong-nest`)
- **소셜 로그인**: `POST /api/v1/auth/social` (서버는 APPLE도 지원하지만 v0.1 제품은 KAKAO 고정)
- **SMS 인증**: `POST /api/v1/sms/verification/request`, `POST /api/v1/sms/verification/verify`
  - DEV에서는 외부 SMS 미설정 시 메시지에 “DEV 코드”를 포함해 QA 진행 가능
- **/me**: `GET /api/v1/me`

### 2.4 Caregiver RN (`gitwork/dongdong-caregiver-rn`)
- **온보딩**: `app/onboarding/*`
  - 탭 anywhere로 다음(UX 개선 포함)
- **카카오 로그인**: `app/onboarding/step3.tsx` → `/auth/social` 성공 → `/caregivers/profile` 체크 → 탭/회원가입 분기
- **회원가입(SMS/약관)**: `app/signup/info.tsx` → `app/signup/terms.tsx` → `app/signup/caregiver-info.tsx` …
- **간병일지(간병인 작성)**: `app/caregiving-journal/*`

---

## 3) 대표가 보면 “데스크탑 부수는” 누수/누전 포인트(핵심 4개)

1. **Guardian RN에 네이티브 환자등록 플로우가 잔존**
   - `app/(auth)/role-selection.tsx`, `patient-info.tsx`, `patient-condition.tsx`는
     “가디언=웹뷰 진입점부터 웹” 정책과 충돌 가능.
   - 결론(단일 최적해): Guardian RN은 **카카오 로그인 + 토큰저장 + WebView 진입**만 유지하고,
     환자/보호자 선택/환자등록/간병신청은 **WebView로 일원화**.

2. **WebView에서 /login 등 Auth 라우트를 열면 카카오/인증이 WebView로 새는 문제**
   - 현재는 `webview.ts`에서 **차단**하고 있어야 정상.
   - 결론: 차단 규칙 유지 + “토큰 선주입”을 절대 깨지 않기.

3. **SMS 인증 UX/에러 메시지 불일치**
   - 피그마: 시간초과/5회실패/이미가입 모달 명시
   - 백엔드: 현재는 `400 BadRequestException(message)` 중심
   - 결론: RN에서 상태코드/메시지 매핑 테이블을 만들어 피그마 문구로 정규화(DEV overlay로 원문은 보존)

4. **Apple 버튼/문구가 플로우에 등장하면 정책 위반**
   - 결론: v0.1에서는 화면 노출 0 유지(문서/DoD/SSOT에 이미 봉인).

---

## 4) v0.1 고정 결론(한 줄)

**로그인/회원가입(KAKAO 고정) → (Guardian) WebView 토큰 주입/진입 → (Caregiver) 네이티브 회원가입/SMS/간병일지 작성**

