# PrimeEcho CI Pipeline — SEALED v1

본 문서는 **Caregiver / Guardian 2개의 RN 앱**에 대해, “빌드/서명/산출물/검증” 흐름을 **결정적으로 고정(봉인)**하기 위한 규격이다.
이 문서에 명시된 항목은 **사유 없이 변경 금지**이며, 변경 시에는 반드시 “버전 승격(SEALED v2)” 절차를 따른다.

---

## 1) SSOT / 구조 (변경 금지)

- **Caregiver Repo (임시/빌드용)**: `codezero-coedone/dongdong-caregiver-rn`
  - 로컬 경로: `gitwork/dongdong-caregiver-rn`
  - CI 설정 파일: `gitwork/dongdong-caregiver-rn/codemagic.yaml`
- **Guardian Repo (임시/빌드용)**: `codezero-coedone/dongdong-rn`
  - 로컬 경로: `gitwork/dongdong-rn`
  - CI 설정 파일: `gitwork/dongdong-rn/codemagic.yaml`

원칙:
- **서명키/비밀번호/민감정보는 git에 절대 커밋 금지**
- `*.jks`는 repo `.gitignore`로 항상 제외

---

## 2) 빌드 파이프라인 정의 (CI = Codemagic)

두 앱 모두 동일한 단계로 봉인한다:

1. **Install deps**
2. **Expo prebuild (android)**
3. **Gradle bundleRelease (AAB) + Signing**
4. **Verify signature (jarsigner) + SHA256 생성**
5. **Artifacts 업로드**

CI는 각 repo 루트의 `codemagic.yaml`을 SSOT로 사용한다.

---

## 3) Keystore / Signing 규격 (가장 중요)

### 3.1 Secure file 업로드 규칙 (Codemagic UI)

- Codemagic Secure files에 **업로드키스토어(.jks) 1개**만 업로드한다.
- 업로드 시 파일명은 **반드시 `upload.jks`**로 맞춘다.

### 3.2 Environment Variables 규칙 (Codemagic UI)

필수:
- `CM_KEYSTORE_PASSWORD` : keystore store password

선택(대부분 동일하지만, 다르면 반드시 입력):
- `CM_KEY_PASSWORD` : key password (없으면 store password로 대체됨)

선택(기본은 자동 감지):
- `CM_KEY_ALIAS` : keystore alias
  - **기본은 CI에서 자동 감지**한다(keystore 내 단일 엔트리 가정).

---

## 4) 산출물 규격

Codemagic artifacts로 반드시 아래가 남아야 한다:
- `android/app/build/outputs/bundle/release/*.aab`
- `android/app/build/outputs/bundle/release/*.sha256.txt`
- `android/app/build/outputs/mapping/release/mapping.txt` (있으면)
- `android/app/build/reports/**/*`

또한 CI 단계에서 아래 검증을 수행한다:
- `jarsigner -verify -verbose -certs <aab>`
- `sha256sum <aab> > <aab>.sha256.txt`

---

## 5) 변경 통제 (SEALED 규칙)

SEALED v1에서 변경 금지:
- env var 이름(`CM_KEYSTORE_PASSWORD`, `CM_KEY_PASSWORD`, `CM_KEY_ALIAS`)
- 파이프라인 단계 순서(Prebuild→Gradle→Verify→SHA)

변경이 필요한 경우:
- 이 문서를 **SEALED v2로 복제/승격**하고,
- 변경 사유/영향/롤백(이전 v1로 revert)을 함께 기록한다.

