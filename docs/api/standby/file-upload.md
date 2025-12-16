# 이미지 업로드 API

## POST /api/files/upload

이미지 파일을 업로드합니다. 프로필 사진, 자격증, 범죄경력회보서 등에 사용됩니다.

---

## Request

### Headers

| Name | Type | Required | Description |
|------|------|----------|-------------|
| Content-Type | string | ✅ | `multipart/form-data` |
| Authorization | string | ✅ | `Bearer {accessToken}` |

### Body (multipart/form-data)

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `file` | file | ✅ | 업로드할 이미지 파일 | JPG, PNG, HEIC (최대 10MB) |
| `category` | string | ✅ | 파일 카테고리 | `profile`, `certificate`, `criminal_record`, `other` |
| `description` | string | ❌ | 파일 설명 | 최대 200자 |

### Category 종류

| Category | 설명 | 허용 확장자 |
|----------|------|------------|
| `profile` | 프로필 사진 | JPG, PNG, HEIC |
| `certificate` | 자격증 이미지 | JPG, PNG, HEIC, PDF |
| `criminal_record` | 범죄경력회보서 | JPG, PNG, HEIC, PDF |
| `other` | 기타 문서 | JPG, PNG, HEIC, PDF |

---

## Response

### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "fileId": "uuid-file-id",
    "url": "https://storage.example.com/uploads/uuid-file-id.jpg",
    "thumbnailUrl": "https://storage.example.com/uploads/uuid-file-id_thumb.jpg",
    "originalName": "certificate.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "category": "certificate",
    "uploadedAt": "2025-12-16T16:53:00.000Z"
  },
  "message": "파일이 업로드되었습니다."
}
```

### Error Responses

#### 400 Bad Request - 잘못된 파일 형식

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "지원하지 않는 파일 형식입니다.",
    "allowedTypes": ["image/jpeg", "image/png", "image/heic", "application/pdf"]
  }
}
```

#### 400 Bad Request - 필수 필드 누락

```json
{
  "success": false,
  "error": {
    "code": "MISSING_REQUIRED_FIELD",
    "message": "파일 카테고리를 지정해주세요."
  }
}
```

#### 413 Payload Too Large - 파일 크기 초과

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "파일 크기가 10MB를 초과합니다.",
    "maxSize": 10485760
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

---

## 다중 파일 업로드

### POST /api/files/upload-multiple

여러 파일을 한 번에 업로드합니다.

### Body (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `files` | file[] | ✅ | 업로드할 파일들 (최대 5개) |
| `category` | string | ✅ | 파일 카테고리 |

### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "fileId": "uuid-1",
        "url": "https://storage.example.com/uploads/uuid-1.jpg",
        "originalName": "certificate1.jpg"
      },
      {
        "fileId": "uuid-2",
        "url": "https://storage.example.com/uploads/uuid-2.jpg",
        "originalName": "certificate2.jpg"
      }
    ],
    "uploadedCount": 2
  },
  "message": "2개 파일이 업로드되었습니다."
}
```

---

## Notes

- 업로드된 파일은 AWS S3에 저장됩니다.
- 이미지 파일의 경우 자동으로 썸네일이 생성됩니다.
- 파일 URL은 24시간 유효한 pre-signed URL입니다.
- `profile` 카테고리는 사용자당 1개로 제한되며, 재업로드 시 기존 파일이 교체됩니다.
