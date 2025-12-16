# API 문서 상태 관리

API 개발 진행 상황을 추적합니다.

---

## 📁 디렉토리 구조

```
docs/api/
├── README.md          # 이 파일
├── standby/           # 대기 중 (설계 완료, 개발 전)
├── inprogress/        # 개발 중
└── done/              # 완료
```

---

## 📋 API 상태 현황

### 🟡 Standby (대기 중)

| API | 설명 | 파일 |
|-----|------|------|
| 회원가입 | POST /api/auth/signup | [signup.md](./standby/signup.md) |
| 문자 인증 요청 | POST /api/auth/sms/request | [sms-request.md](./standby/sms-request.md) |
| 문자 검증 | POST /api/auth/sms/verify | [sms-verify.md](./standby/sms-verify.md) |
| 간병인 국내 추가 정보 | POST /api/caregiver/domestic-info | [caregiver-domestic-info.md](./standby/caregiver-domestic-info.md) |

### 🔵 In Progress (개발 중)

| API | 설명 | 파일 |
|-----|------|------|
| - | - | - |

### 🟢 Done (완료)

| API | 설명 | 파일 |
|-----|------|------|
| - | - | - |

---

## 📌 상태 변경 가이드

1. **Standby → In Progress**: 개발 시작 시 파일을 `inprogress/`로 이동
2. **In Progress → Done**: 개발 완료 및 테스트 후 `done/`으로 이동
3. 이 README 테이블도 함께 업데이트

---

## 🔗 관련 문서

- [인증 플로우](../plans/auth-flow.md)
