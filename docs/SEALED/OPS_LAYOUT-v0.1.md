# OPS Layout (v0.1) — /opt/dongdong 구조 봉인

목적: **API / WebView / RN Build**의 역할을 물리적으로 분리해 운영 혼선을 차단한다.

---

## 0) 봉인 규칙(최상위, 필수)

- **RN(Android) 빌드는 Codemagic CI만 수행한다.**
  - 로컬 빌드/원격 서버 빌드 금지.
  - 산출물(AAB/APK)은 **Codemagic artifacts / Play Console**을 통해서만 유통한다.
- **WebView 서버는 WebView(Next.js)만**, **API 서버는 API/DB만** 담당한다.
- `/opt/dongdong/build/**`에 **RN 소스(`*-rn-src`)나 RN 빌드 워크스페이스를 두지 않는다.**

---

## 1) 운영 역할 분리(서버 단위, 요약)

### 1.1 API/DB 서버

- **역할**: `dongdong-nest` API + Postgres(도커)
- **금지**:
  - Next(WebView) 실행/배포
  - RN 빌드/소스 업로드

### 1.2 WebView 서버

- **역할**: `dongdong-client`(Next.js)만 서비스
- **금지**:
  - RN 빌드 워크스페이스 생성/업로드
  - RN 빌드 산출물(AAB/APK) 서버 보관(“build 폴더에 쌓아두기” 금지)

---

## 2) /opt/dongdong 표준 디렉토리(권장)

- `/opt/dongdong/`
  - `dongdong-nest/` (API 서버)
  - `dongdong-client/` (WebView 서버)
  - `keystore/` (원칙: 서버 보관 금지)
  - `build/` (원칙: 비워둠)

---

## 3) 레거시/오염 징후(즉시 경고)

아래가 보이면 **레이아웃 오염(혼선)**이다.

## 4) Change Control

- 이 문서를 바꾸려면 `OPS_LAYOUT-v0.2.md`로 **복제** 후:
  - 변경 사유/영향/롤백을 함께 기록한다.

---

## 5) 마이그레이션(안전 절차 — 권장)

목적: `/opt/dongdong/build/**` 아래에 남아있는 RN 관련 흔적을 **삭제가 아니라 rename 격리**로 처리한다.

- 권장:
  - `build/` 아래 RN 관련 디렉토리는 `./.legacy-<timestamp>`로 rename 후 보관
  - 일정 기간 이후 최종 삭제(필요 시)

## 6) Codemagic-only 강제(클라이언트 쪽)

- 로컬/원격 RN 빌드 스크립트는 기본 실행 불가로 봉인하고,
  - 정말 예외적으로 필요할 때만 `ALLOW_LOCAL_RN_BUILD=1` 또는 `ALLOW_REMOTE_RN_BUILD=1`로 명시 override


