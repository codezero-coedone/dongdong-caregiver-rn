# 과거 간병 상세보기 스크린 개발 계획

## 📅 타임라인

| 단계 | 작업 내용 | 상태 |
|------|----------|------|
| 1 | 디자인 분석 및 계획 수립 | ✅ 완료 |
| 2 | detail.tsx 수정 (variant 지원) | ⏳ 예정 |
| 3 | 네비게이션 연결 | ⏳ 예정 |
| 4 | 검증 | ⏳ 예정 |

---

## 구현 방식

기존 `detail.tsx`를 수정하여 `variant` query parameter로 ongoing/completed 구분

### URL 구조
- 진행 중: `/care-history/detail` 또는 `/care-history/detail?type=ongoing`
- 완료: `/care-history/detail?type=completed`

---

## 화면 차이점

### 과거 간병 상세보기만의 특징
1. **헤더**: "과거 간병 상세보기"
2. **공고번호 표시**: 환자 정보 상단에 표시
3. **남은 일수 없음**: 배지 숨김
4. **보호자 연락처 마스킹**: `010-1234-****` 형식
5. **하단 버튼 없음**: "간병 일지 작성하기" 제거
