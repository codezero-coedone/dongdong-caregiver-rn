# 문자 인증 검증 API

## POST /api/auth/sms/verify

SMS 인증번호를 확인합니다.

---

## Request

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Content-Type | string | ✅ | `application/json` |

### Body

```json
{
  "phone": "01012345678",
  "requestId": "uuid-request-id",
  "code": "1234"
}
```

### Body Parameters

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `phone` | string | ✅ | 휴대폰 번호 | 10-11자리 숫자 (하이픈 없이) |
| `requestId` | string | ✅ | 인증 요청 시 받은 ID | UUID 형식 |
| `code` | string | ✅ | 인증번호 | 4자리 숫자 |

---

## Response

### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "verificationId": "uuid-verification-id",
    "phone": "01012345678",
    "verifiedAt": "2025-12-16T11:16:00.000Z",
    "expiresAt": "2025-12-16T11:26:00.000Z"
  },
  "message": "인증이 완료되었습니다."
}
```

### Error Responses

#### 400 Bad Request - 인증번호 불일치

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "인증번호가 일치하지 않습니다.",
    "remainingAttempts": 4
  }
}
```

#### 400 Bad Request - 인증번호 만료

```json
{
  "success": false,
  "error": {
    "code": "CODE_EXPIRED",
    "message": "인증번호가 만료되었습니다. 다시 요청해주세요."
  }
}
```

#### 400 Bad Request - 잘못된 요청 ID

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST_ID",
    "message": "유효하지 않은 인증 요청입니다."
  }
}
```

#### 429 Too Many Requests - 시도 횟수 초과

```json
{
  "success": false,
  "error": {
    "code": "MAX_ATTEMPTS_EXCEEDED",
    "message": "인증 시도 횟수를 초과했습니다. 새로운 인증번호를 요청해주세요."
  }
}
```

---

## Notes

- 인증 성공 시 받은 `verificationId`는 **회원가입 API 호출 시 필수**입니다.
- `verificationId`는 **10분간 유효**합니다.
- 인증번호 **5회 오입력 시** 해당 요청은 무효화됩니다.
- 보안을 위해 인증 성공/실패 여부와 관계없이 동일한 응답 시간을 유지합니다.
