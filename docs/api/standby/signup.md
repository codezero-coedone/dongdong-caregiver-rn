# 회원가입 API

## POST /api/auth/signup

회원가입 요청을 처리합니다.

---

## Request

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Content-Type | string | ✅ | `application/json` |

### Body

```json
{
  "name": "홍길동",
  "rrnFront": "800101",
  "rrnBack": "1234567",
  "phone": "01012345678",
  "verificationId": "uuid-verification-id"
}
```

### Body Parameters

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `name` | string | ✅ | 이름 (실명) | 2-20자, 한글/영문만 허용 |
| `rrnFront` | string | ✅ | 주민등록번호 앞자리 | 6자리 숫자 (YYMMDD) |
| `rrnBack` | string | ✅ | 주민등록번호 뒷자리 | 7자리 숫자 |
| `phone` | string | ✅ | 휴대폰 번호 | 10-11자리 숫자 (하이픈 없이) |
| `verificationId` | string | ✅ | 문자 인증 완료 후 받은 ID | UUID 형식 |

---

## Response

### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "userId": "uuid-user-id",
    "name": "홍길동",
    "phone": "01012345678",
    "createdAt": "2025-12-16T11:15:30.000Z"
  },
  "message": "회원가입이 완료되었습니다."
}
```

### Error Responses

#### 400 Bad Request - 유효성 검증 실패

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      { "field": "rrnFront", "message": "주민등록번호 앞자리는 6자리 숫자여야 합니다." }
    ]
  }
}
```

#### 400 Bad Request - 인증 미완료

```json
{
  "success": false,
  "error": {
    "code": "VERIFICATION_REQUIRED",
    "message": "휴대폰 인증이 필요합니다."
  }
}
```

#### 409 Conflict - 중복 회원

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_USER",
    "message": "이미 가입된 회원입니다."
  }
}
```

---

## Notes

- `rrnBack`은 암호화되어 저장됩니다.
- `verificationId`는 문자 검증 API 성공 시 발급되며, 10분간 유효합니다.
- 회원가입 성공 시 자동으로 로그인 처리되며, JWT 토큰이 발급됩니다.
