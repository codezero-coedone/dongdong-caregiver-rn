# 간병인 기본 정보 입력 화면 구현 계획

> **작성일**: 2025-12-08  
> **상태**: Planning

## 개요

간병인(Caregiver)의 기본 정보를 입력받는 화면을 구현합니다. 이 화면은 기존 `signup/info.tsx`와 유사하지만, 주소 검색 및 범죄경력회보서 파일 업로드 기능이 추가됩니다.

![스크린 목업](/Users/gyejinlee/.gemini/antigravity/brain/3ce8158c-f693-4e0c-bec0-0ff467a0bb6b/uploaded_image_1765144937413.png)

---

## 화면 구성 요소

### 1. 헤더
- 뒤로가기 버튼 (`<`)
- 타이틀: "기본 정보 입력"

### 2. 경고 배너
- 분홍색 배경
- 텍스트: "허위 정보 기재 시 계정 제재 가능성 고지 알림"

### 3. 입력 필드

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| 이름 | text | ✓ | 간병인 이름 (예: 김간병) |
| 주민등록번호 | masked | ✓ | 앞 6자리 + 뒤 7자리 (마스킹) |
| 휴대폰 | phone | ✓ | 전화번호 + 인증 체크 아이콘 |
| 주소 | address-search | ✓ | 검색 버튼 + 상세 주소 입력 |
| 범죄경력회보서 | file-upload | (선택) | 파일 업로드 영역 |

### 4. 제출 버튼
- "다음" 버튼 (하단 고정)

---

## 기술 요구사항

### Zustand + AsyncStorage Persist

기존 `authStore.ts`를 Zustand persist middleware와 통합하여 앱 재시작 시에도 입력 데이터를 유지합니다.

```typescript
// Best Practice: Zustand v5 + AsyncStorage
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // 저장할 필드만 선택
        signupInfo: state.signupInfo,
        caregiverInfo: state.caregiverInfo,
      }),
    }
  )
);
```

---

## 타임라인

| 단계 | 작업 내용 | 예상 시간 |
|------|----------|----------|
| 1 | AsyncStorage 설치 & Store 통합 | 15분 |
| 2 | UI 컴포넌트 생성 (AddressInput, FileUpload) | 30분 |
| 3 | 화면 구현 (caregiver-info.tsx) | 45분 |
| 4 | 검증 & 테스트 | 15분 |

---

## 변경 사항 기록

### v1.0 (2025-12-08)
- 초기 계획 작성
- 화면 구성 요소 정의
- Zustand persist 통합 방안 수립
