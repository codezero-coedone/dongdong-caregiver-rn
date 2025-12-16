# 간병인 국내 추가 정보 등록 API

## POST /api/caregiver/domestic-info

국내 간병인의 추가 정보를 등록합니다.

---

## Request

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Content-Type | string | ✅ | `multipart/form-data` |
| Authorization | string | ✅ | `Bearer {accessToken}` |

### Body (multipart/form-data)

```json
{
  "name": "김간병",
  "rrnFront": "801225",
  "rrnBack": "1234567",
  "phone": "01012345678",
  "address": "서울특별시 강남구 테헤란로 123",
  "addressDetail": "456호",
  "criminalRecordFile": (file),
  "referralCode": "A12345"
}
```

### Body Parameters

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `name` | string | ✅ | 이름 (실명) | 2-20자, 한글/영문만 허용 |
| `rrnFront` | string | ✅ | 주민등록번호 앞자리 | 6자리 숫자 (YYMMDD) |
| `rrnBack` | string | ✅ | 주민등록번호 뒷자리 | 7자리 숫자 |
| `phone` | string | ✅ | 휴대폰 번호 | 10-11자리 숫자 (하이픈 없이) |
| `address` | string | ✅ | 기본 주소 | Daum 주소 API 응답값 |
| `addressDetail` | string | ❌ | 상세 주소 | 최대 100자 |
| `criminalRecordFile` | file | ❌ | 범죄경력회보서 파일 | PDF, JPG, PNG (최대 10MB) |
| `referralCode` | string | ❌ | 지인 추천 코드 | 영문+숫자 조합, 5-10자 |

---

## Response

### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "caregiverId": "uuid-caregiver-id",
    "name": "김간병",
    "phone": "01012345678",
    "address": "서울특별시 강남구 테헤란로 123 456호",
    "hasCriminalRecord": true,
    "referralApplied": true,
    "updatedAt": "2025-12-16T16:14:00.000Z"
  },
  "message": "간병인 정보가 등록되었습니다."
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
      { "field": "rrnBack", "message": "주민등록번호 뒷자리 7자리를 입력해주세요." }
    ]
  }
}
```

#### 400 Bad Request - 잘못된 추천 코드

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFERRAL_CODE",
    "message": "유효하지 않은 추천 코드입니다."
  }
}
```

#### 401 Unauthorized - 인증 실패

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "인증이 필요합니다."
  }
}
```

#### 409 Conflict - 이미 등록된 정보

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_REGISTERED",
    "message": "이미 간병인 정보가 등록되어 있습니다."
  }
}
```

#### 413 Payload Too Large - 파일 크기 초과

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "파일 크기가 10MB를 초과합니다."
  }
}
```

---

## Notes

- `rrnBack`은 암호화되어 저장됩니다.
- `criminalRecordFile`은 S3에 업로드되고, URL이 DB에 저장됩니다.
- `referralCode` 적용 시, 추천인과 피추천인 모두에게 혜택이 부여됩니다.
- 이 API 호출 전 **회원가입**이 완료되어 있어야 합니다.
