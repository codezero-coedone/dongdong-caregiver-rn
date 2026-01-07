# GUARDRAILS — v0.1 (SEALED)

목적: “스파게티 재발”을 방지하기 위해, **무엇을 묶고(유지) 무엇을 버릴지(격리/폐기)**를 **절대 규칙으로 봉인**한다.

---

## 0) 로컬 코어 서버(절대 보호) — 127.0.0.1:8001

- **127.0.0.1:8001 은 “로컬 시스템 코어 서버”다. 절대 끊지 않는다.**
- 어떤 자동화/정리 스크립트도:
  - **8001 리스너 PID를 종료(taskkill/Stop-Process)하면 안 된다.**
  - “광역 kill(프로세스명 기반 일괄 종료)”을 추가할 때는 8001 예외를 먼저 넣는다.

---

## 1) 관제(Observability) 범위 — “지금은 이걸로만 본다”

### 1.1 앱 내부 관제 (필수)
- **DEV TRACE(DBG) 오버레이**: `__DEV__` 또는 `EXPO_PUBLIC_DEVTOOLS=1` 일 때만 활성
  - 런타임 표시: `package`, `api`, `webview(guardian)`, `kakao_app_key`, `kakao_key_hash`, `devtools`
  - API 라인: `METHOD path → status (ms)` (200/400/401/500/NETWORK)

### 1.2 CI 관제 (필수)
- Codemagic artifacts:
  - `kakao_key_hash*.txt` (서명키 기반 KeyHash)
  - AAB/APK sha256
  - build reports

---

## 2) 소유권(Ownership) 봉인 — “절대 흔들지 말 것”

- **토큰/인증의 단일 소유자는 RN 앱**이다.
- **WebView는 앱의 컨테이너(UI)**이며, 앱이 **주입(inject)**한 토큰을 사용한다.
- 백엔드는 **서빙 + API**만 한다(인증/토큰 소유권을 WebView로 넘기지 않는다).

---

## 3) 공통 경계선(2앱 동일) 봉인 — “레이아웃 분기 금지”

공통 경계선(2앱 동일, 분기 금지):
- **온보딩 → 사용권한 → 카카오 → SMS → 인증완료**

경계선 이후(분기 시작):
- **Guardian**: WebView 진입점부터 WebView 컨텐츠(하이브리드)
- **Caregiver**: 홈/프로필/간병일지 100% RN

---

## 4) “유지(묶기)” 목록 — v0.1에서 반드시 유지해야 하는 모듈

- **DBG/DEV TRACE**: API/라우팅/웹뷰 로드 원인 분리 (추측 금지)
- **API client interceptors**: status/ms/NETWORK/401-refresh 관측
- **WebView allowlist + auth-route block**: WebView에서 `/login` 등 인증 라우트 노출 금지

---

## 5) “폐기/격리(버리기)” 목록 — v0.1 Guardian 기준

Guardian은 “WebView 컨테이너 앱”이다. 따라서 아래 네이티브 플로우는 **혼선 유발(스파게티 핵심 원인)**이며:
- **v0.1 기준으로는 사용 금지(Dead path)**로 간주한다.
- 간병일지 완주 후 일괄 정리(삭제/격리)한다.

대표 예:
- `app/(auth)/caregiver/**`
- `app/(auth)/signup.tsx`, `terms.tsx`, `role-selection.tsx`, `patient-info.tsx`, `patient-condition.tsx`

