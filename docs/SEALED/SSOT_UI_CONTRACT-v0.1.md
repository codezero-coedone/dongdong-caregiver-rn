## SSOT-UI Contract (v0.1, SEALED)

목적: Figma “원본”을 따라다니지 않고, **페이지(화면) 단위 스냅샷**을 SSOT로 삼아
노이즈(겹겹 프레임/중복 문구/오버레이)를 제거하고 **실기기에서 동일 화면을 재현**한다.

원칙(고정):
- **1페이지 = 1프레임(1스크린)**: absolute overlay/중복 SafeArea/중복 Text 금지
- **상태는 4개만**: normal / loading / empty / error
- **동작은 1줄로 고정**: 탭/스와이프/뒤로가기/비활성 조건
- **QA 박제면 UI 변경 금지**: 기능/로그/가드만 최소 diff 허용

---

### 입력 포맷 (화면 1장당)

- **ID**: (예: `P0`, `O1`, `L0`, `T8-1`)
- **앱**: Caregiver / Guardian / Web
- **Figma Frame명**:
- **순서(Flow)**: (예: Onboarding → Permission → Login)
- **박제 여부(QA)**: yes/no
- **스크린샷**: (PNG 2x 권장)

#### 레이아웃/토큰 (필수)
- **SafeArea**: top/bottom 사용 여부
- **padding**: (좌/우/상/하)
- **typography**
  - title: size/weight/lineHeight/color
  - body: size/weight/lineHeight/color
- **colors**: 배경/구분선/CTA
- **CTA**
  - 라벨:
  - 높이/라운드:
  - 비활성 조건:

#### 컴포넌트(필수)
- 목록/카드/아이콘/구분선 등: “재사용 단위”로만 나열

#### 상태(4개)
- normal:
- loading:
- empty:
- error:

#### 인터랙션(1줄)
- (예: “전체 탭 → 다음”, “확인 탭 → 권한 요청 후 무조건 다음”)

---

### (예시) P0 — 권한 동의

- **ID**: P0
- **앱**: Caregiver
- **Flow**: Onboarding → Permission(P0) → Login(L0)
- **박제 여부(QA)**: no
- **인터랙션**: “확인 탭 → 권한 요청(에러/거부 포함) 후 무조건 다음”

