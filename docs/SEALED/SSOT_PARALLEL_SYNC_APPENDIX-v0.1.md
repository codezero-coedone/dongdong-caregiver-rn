## SSOT 부록 — 병렬구동/연동(시간선 Freeze + 사건 트리거 매트릭스) v0.1 (SEALED)

목적: 4레포가 동시에 움직여도 “방향/흐름/계약”이 흔들리지 않게,
**T0~T8을 시간선 좌표로 고정(Freeze)**하고 그 좌표에서 발생하는 **사건(Trigger)**을
레포 간 **배선(Contract)**으로 봉인한다.

원칙(고정):
- **SSOT는 서버 계약(OpenAPI/Swagger) + SEALED 문서**다.
- **Figma는 UI 참조**다. “흐름/권한/상태”는 Figma가 결정하지 않는다.
- **대장(Flow) 단위는 1개**: T0→T8. 세부는 사건 트리거로만 확장한다.

---

### 1) 시간선 좌표(Freeze) 정의

- **좌표 단위**: `T{stage}-{sub}` (예: `T1-0`, `T3-1`, `T8-2`)
- **Freeze의 의미**: 해당 좌표의 “입구 조건/출구 조건/주요 API”는 바꾸지 않는다.
- **변경은 해상도(UX/문구/레이아웃/컴포넌트 토큰)만** 허용한다.

---

### 2) 사건(Trigger) 매트릭스 — “무엇이 언제 발생하고 누가 소유하나”

표기:
- **Owner**: 사건을 발생/보장해야 하는 레포(단일)
- **Consumer**: 사건을 관측/반응하는 레포(복수 가능)
- **Proof**: DBG rid + 상태코드(또는 UI 상태)로 통과 증거를 남긴다

| 좌표 | Trigger | Owner(단일) | Consumer | Proof(통과 기준) |
|---|---|---|---|---|
| T0-0 | CI Build Artifact 생성 | Codemagic(YAML) | RN(설치) | apk-dev 설치 가능 / AAB 쇼케이스 유지 |
| T1-0 | Permission 안내 1회 완료(통과) | RN(Caregiver/Guardian) | RN | `ONBOARDING_COMPLETE=1` 저장, 루프 없음 |
| T1-1 | Kakao 로그인 성공 | RN(Caregiver/Guardian) | Backend | `POST /auth/social = 200` |
| T2-0 | 프로필 존재/생성 분기 | RN(Caregiver) | Backend | `GET /caregivers/profile` 200 or 404→signup |
| T3-0 | CareRequest(공고) 생성 | Backend(API) | RN(Caregiver) | `POST /care-requests = 201` → `/jobs` 노출 |
| T3-1 | Job Apply(지원) | RN(Caregiver) | Backend | `POST /jobs/:id/apply = 201` |
| T3-2 | Match 확보 | Backend(API) | RN(둘 다) | `GET /my/matches` count>0 (matchId 확보) |
| T8-0 | Journal CRUD | RN(Caregiver) | Backend | `POST/GET/PUT /journals` 2xx, 409은 안내/리턴 |

---

### 3) 병렬구동(4레포) 연동 규칙

- **Backend**: 상태 전이의 SSOT (match/journal/auth). “진짜 결과”는 API가 결정.
- **RN(2앱)**: Auth/Onboarding/Permission/Token/Route Gate의 SSOT.
- **WebView**: UI 서빙 + API 호출(있으면). 플로우 결정 금지.
- **관측(Observability)**: 앱 DBG rid ↔ 서버 로그 rid 매칭으로 원인 확정 후 최소 diff.

---

### 4) 피그마가 있어도 “배선 간격(T0~T8)”이 맞는 이유

- 피그마는 화면 순서를 “보여줄” 뿐, **입구/출구 조건과 사건 트리거(계약)는 서버+RN이 결정**한다.
- 따라서 T0~T8의 간격을 잡는 기준은 “피그마”가 아니라 **Trigger + Proof(실기기 DBG)**다.

