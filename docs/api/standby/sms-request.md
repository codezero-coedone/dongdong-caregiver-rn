# 문자 인증 요청 API

## POST /api/auth/sms/request

SMS 인증번호를 요청합니다.

---

## Request

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Content-Type | string | ✅ | `application/json` |

### Body

```json
{
  "phone": "01012345678"
}
```

### Body Parameters

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `phone` | string | ✅ | 휴대폰 번호 | 10-11자리 숫자 (하이픈 없이) |

---

## Response

### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "requestId": "uuid-request-id",
    "expiresAt": "2025-12-16T11:18:30.000Z",
    "expiresInSeconds": 180
  },
  "message": "인증번호가 발송되었습니다."
}
```

### Error Responses

#### 400 Bad Request - 유효성 검증 실패

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "올바른 휴대폰 번호를 입력해주세요."
  }
}
```

#### 429 Too Many Requests - 요청 제한 초과

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "잠시 후 다시 시도해주세요.",
    "retryAfterSeconds": 60
  }
}
```

#### 500 Internal Server Error - SMS 발송 실패

```json
{
  "success": false,
  "error": {
    "code": "SMS_SEND_FAILED",
    "message": "인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요."
  }
}
```

---

## Notes

- 인증번호는 **4자리 숫자**입니다.
- 인증번호 유효시간은 **3분 (180초)** 입니다.
- 동일 번호로 **1분 내 재요청 불가** (Rate Limit).
- 하루 최대 **10회**까지 요청 가능합니다.
