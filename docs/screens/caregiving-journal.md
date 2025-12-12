# 간병일지 스크린 (Caregiving Journal Screen)

## 📋 개요

마이페이지에서 간병 중인 환자의 일일 간병 기록을 작성하고 관리하는 화면입니다.
MY 탭의 "간병일지" 탭에서 접근합니다.

---

## 🎨 화면 구성

### 화면 경로
- `/caregiving-journal` 또는 MY 탭 내 "간병일지" 탭 선택 시

### 16. 마이페이지 간병일지
간병 중인 환자의 간병 일지를 작성하는 화면

---

## 📱 UI 구성 요소

### 16a. 환자 선택
- 디폴트: 현재 진행 중인 환자
- 드롭다운 메뉴를 통해 이전 내역 확인 가능

### 16b. 일자 선택
- 디폴트: 오늘 날짜
- 날짜 영역 선택 시 Date Picker 팝업

### 오늘의 일지 섹션

#### 16c. 환자 기록-아침 (필수)
- 입력 X
  - 클릭 액션 → 입력 화면 이동 (17번 화면)
- 입력 O (작성 완료 시)
  - **상태** (필수): 주의 / 양호
  - **식사** (필수): 유동식, 일반식 등
  - **소변** (필수): 1회/양이 평소보다 적음
  - **대변량** (필수): 1회/설사
  - **기저귀 사용량** (선택): 2장
  - **이동** (선택): 보행도움
  - **돌이사항** (선택): 딤담의 회진
  - 입력 시 활성화

#### 16d. 환자 기록-점심 (선택)
- 입력 X
  - 클릭 액션 → 입력 화면 이동 (17번 화면)
- 입력 O
  - 아침과 동일한 필드

#### 16e. 환자 기록-저녁 (선택)
- 입력 X
  - 클릭 액션 → 입력 화면 이동 (17번 화면)
- 입력 O
  - 아침과 동일한 필드

#### 16f. 환자 기록-의료 기록 (선택)
- 입력 X
  - 클릭 액션 → 입력 화면 이동 (18번 화면)
- 입력 O
  - **의료 기록**: 주사, 약복용 버튼
  - **기타 사항**: 텍스트 박스

#### 16g. 환자 기록-활동 기록 (선택)
- 입력 X
  - 클릭 액션 → 입력 화면 이동 (18b번 화면)
- 입력 O
  - **운동**: 주의/양호
  - **수면**: 주의/양호
  - **기타**: 텍스트 박스

### 특이 및 전달 사항
- 자유 텍스트 입력 영역
- 예시: "37.8도로 매일저체 추가 필요"

---

## 📊 데이터 구조

### JournalEntry (일지 항목)
```typescript
interface JournalEntry {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  morning?: MealRecord;
  lunch?: MealRecord;
  dinner?: MealRecord;
  medicalRecord?: MedicalRecord;
  activityRecord?: ActivityRecord;
  specialNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MealRecord {
  status: 'caution' | 'good'; // 주의 / 양호
  mealType: string; // 유동식, 일반식 등
  urination: {
    count: number;
    note?: string;
  };
  bowelMovement: {
    count: number;
    note?: string;
  };
  diaperUsage?: number;
  mobility?: string; // 보행도움, 휠체어 등
  careNotes?: string; // 돌봄 특이사항
}

interface MedicalRecord {
  injection: boolean;
  medication: boolean;
  otherNotes?: string;
}

interface ActivityRecord {
  exercise: 'caution' | 'good';
  sleep: 'caution' | 'good';
  otherNotes?: string;
}
```

---

## 🔀 네비게이션 흐름

```
MY 탭
├── MY홈 (기본)
├── 간병일지 ← 현재 화면
│   ├── 환자 선택 (드롭다운)
│   ├── 날짜 선택 (DatePicker)
│   ├── 아침 → /caregiving-journal/meal-record?time=morning
│   ├── 점심 → /caregiving-journal/meal-record?time=lunch
│   ├── 저녁 → /caregiving-journal/meal-record?time=dinner
│   ├── 의료기록 → /caregiving-journal/medical-record
│   └── 활동기록 → /caregiving-journal/activity-record
└── 수익
```

---

## 🛠️ 구현 계획

### Phase 1: 기본 레이아웃
1. MY 탭의 "간병일지" 탭 콘텐츠 구현
2. 환자 선택 드롭다운
3. 날짜 선택 (DatePicker 연동)
4. 일지 카드 리스트 (아침/점심/저녁/의료기록/활동기록)

### Phase 2: 입력 화면
1. 식사 기록 입력 화면 (meal-record)
2. 의료 기록 입력 화면 (medical-record)
3. 활동 기록 입력 화면 (activity-record)

### Phase 3: 데이터 연동
1. Mock 데이터 구조 정의
2. Zustand 스토어 생성
3. 저장 및 불러오기 로직

---

## 📁 파일 구조

```
app/
├── (tabs)/
│   └── my.tsx                         # 간병일지 탭 추가
└── caregiving-journal/
    ├── _layout.tsx                    # 레이아웃
    ├── meal-record.tsx                # 식사 기록 입력
    ├── medical-record.tsx             # 의료 기록 입력
    └── activity-record.tsx            # 활동 기록 입력

components/
└── caregiving-journal/
    ├── PatientSelector.tsx            # 환자 선택 드롭다운
    ├── DateSelector.tsx               # 날짜 선택
    ├── JournalCard.tsx                # 일지 카드 (아침/점심/저녁 등)
    └── SpecialNotesInput.tsx          # 특이사항 입력

store/
└── journalStore.ts                    # 간병일지 상태 관리
```

---

## ✅ 체크리스트

- [ ] docs/screens/caregiving-journal.md 작성
- [ ] MY 탭 간병일지 탭 콘텐츠 구현
- [ ] 환자 선택 드롭다운 구현
- [ ] 날짜 선택 DatePicker 구현
- [ ] 일지 카드 컴포넌트 구현
- [ ] 식사 기록 입력 화면 구현
- [ ] 의료 기록 입력 화면 구현
- [ ] 활동 기록 입력 화면 구현
- [ ] 상태 관리 스토어 구현
- [ ] Mock 데이터 연동
