# DongDong Docs Hub — SEALED_INDEX (v1)

목적: **문서 난립/충돌/중복**을 끝내고, “최신(봉인) 문서 1세트”만 기준으로 사용한다.

원칙(고정):
- **SSOT(계약/데이터/상태)**: Swagger/OpenAPI + 본 SEALED 문서
- **피그마**: UI/UX·컴포넌트·문구 “참조”만 (플로우/권한/계약을 피그마로 결정하지 않는다)
- **로그인/회원가입**: **KAKAO 고정**, Apple/Google은 추후(Out-of-scope)

---

## SEALED (최신, 우선 참조)

0. **대표/PM 1페이지 요약(SEALED)**  
   - `docs/SEALED/EXEC_SUMMARY-v0.1.md`

1. **DoD (4레포 통합)**  
   - `docs/SEALED/DoD-4REPOS-RELEASE-v0.1.md`

2. **Backend SSOT (DEV)**  
   - `docs/SEALED/SSOT-v0.1-DEV.md`

3. **로그인공통(피그마 기준) 누수/누전 감사서**  
   - `docs/SEALED/AUDIT-LOGIN_COMMON-4REPOS-v1.md`

4. **CI/배포 파이프라인(봉인)**  
   - `docs/SEALED/PRIMEECHO_CI_PIPELINE_SEALED_v1.md`
   - `docs/SEALED/PRIMEECHO_DONGDONG_RUNBOOK_SEALED_v2.md`

5. **GUARDRAILS (핵심 금지/보호 규칙)**  
   - `docs/SEALED/GUARDRAILS-v0.1.md`

6. **Tooling 실행 규격(Win/Codemagic/Remote 단일 규격)**  
   - `docs/SEALED/TOOLING_EXEC_SPEC-v0.1.md`

7. **OPS 레이아웃(서버 역할/디렉토리 분리 봉인)**  
   - `docs/SEALED/OPS_LAYOUT-v0.1.md`

---

## ARCHIVE (참고만, 실행 기준 아님)

- `docs/plans/**`, `docs/screens/**`, `docs/api/**`  
  - 설계 메모/과거 플랜/standby 문서. 최신 봉인 기준은 위 SEALED를 따른다.

---

## Change Control (봉인 규칙)

- SEALED 문서 변경이 필요하면:
  - **새 버전으로 복제**(예: `SEALED_INDEX v2`, `DoD v0.2`) 후
  - 변경 사유/영향/롤백을 함께 기록한다.

