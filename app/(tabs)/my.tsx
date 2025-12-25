import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import JournalCard from '../../components/caregiving-journal/JournalCard';
import { useJournalStore } from '../../store/journalStore';

// Mock 사용자 데이터
const MOCK_USER = {
  name: '김간병',
  isVerified: true,
  rating: 4.7,
  experience: '경력 3년',
  certificates: '요양보호사 외 3',
  hasIntroduction: false,
};

// Mock 진행 중인 간병 데이터
const MOCK_ONGOING_CARE = {
  daysRemaining: 15,
  patient: {
    name: '이환자',
    age: 68,
    gender: '남',
  },
  tags: ['폐암 3기', '입원치료 중', '부분 도움'],
  period: '2025.11.15~11.30',
  diagnosis: '폐렴 및 심압',
};

// Mock 나의 소개 데이터
const MOCK_INTRODUCTION = {
  selfIntro: '친절하고 섬세하게 간병하겠습니다.',
  strengths: ['친절함', '책임감', '세심함'],
  specialties: ['골절', '재활 치료', '외상 환자', '기저귀 케어'],
};

// Mock 리뷰 데이터
const MOCK_REVIEWS = [
  {
    id: '1',
    patientName: '이환자',
    rating: 4,
    period: '2025.11.19~2025.11.26',
    content:
      '"항상 시간 약속을 잘 지켜주시고, 환자를 세심하게 케어해주셔서 너무 감사했습니다. 대화도 친절하게 해주셔서 환자분도 편안해하셨습니다. 다음에도 꼭 부탁드리고 싶어요!"',
  },
  {
    id: '2',
    patientName: '이환자',
    rating: 5,
    period: '2025.11.19~2025.11.26',
    content: '"좋아요! 자주 부탁드리러구요 !"',
  },
  {
    id: '3',
    patientName: '이환자',
    rating: 4,
    period: '2025.11.19~2025.11.26',
    content:
      '"센스가 있으셔서 매번 말안해도 척척해주시더라구요 이래서 경력직을 쓰나봅니다ㅎㅎ"',
  },
];

const MOCK_EARNING_SUMMARY = {
  total: 1123000,
  workDays: 10,
  workHours: 80,
};

const MOCK_EARNINGS = [
  {
    id: '1',
    noticeNo: '12345',
    patientName: '이환자',
    period: '2025.11.15 ~ 11.30',
    amount: 500000,
  },
  {
    id: '2',
    noticeNo: '12345',
    patientName: '이환자',
    period: '2025.11.15 ~ 11.30',
    amount: 100000,
  },
  {
    id: '3',
    noticeNo: '12345',
    patientName: '이환자',
    period: '2025.11.15 ~ 11.30',
    amount: 523000,
  },
];

const TABS = ['MY홈', '간병일지', '수익'];

export default function MyScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('MY홈');

  // Journal store
  const { currentPatient, selectedDate, setSelectedDate, entries } =
    useJournalStore();

  // Get current journal entry
  const currentEntry = entries.find(
    (e) => e.date === selectedDate && e.patientId === currentPatient?.id,
  );

  // Special notes state
  const [specialNotes, setSpecialNotes] = useState(
    currentEntry?.specialNotes || '',
  );

  // Date navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const newDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    setSelectedDate(newDate);
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Ionicons
          key={index}
          name="star"
          size={14}
          color={index < rating ? '#F59E0B' : '#E5E7EB'}
        />
      ));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.referralButton}>
          <Ionicons name="ticket-outline" size={16} color="#3B82F6" />
          <Text style={styles.referralText}>추천인코드</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>MY</Text>

        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MY홈 Tab Content */}
      {activeTab === 'MY홈' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileLeft}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={28} color="#9CA3AF" />
                </View>
                <View style={styles.profileInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{MOCK_USER.name}</Text>
                    {MOCK_USER.isVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#3B82F6"
                      />
                    )}
                  </View>
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingLabel}>평점</Text>
                    <Text style={styles.ratingValue}>{MOCK_USER.rating}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push('/profile/edit')}
              >
                <Text style={styles.editButtonText}>프로필 수정</Text>
                <Ionicons name="pencil" size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>근무 경력</Text>
                <Text style={styles.detailValue}>{MOCK_USER.experience}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>보유 자격증</Text>
                <Text style={styles.detailValue}>{MOCK_USER.certificates}</Text>
              </View>
            </View>
          </View>

          {/* 진행 중인 간병 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>진행 중인 간병</Text>
              <TouchableOpacity
                style={styles.moreLink}
                onPress={() => router.push('/care-history')}
              >
                <Text style={styles.moreLinkText}>이전 내역</Text>
                <Ionicons name="chevron-forward" size={16} color="#37383C9C" />
              </TouchableOpacity>
            </View>

            {MOCK_ONGOING_CARE ? (
              <View style={styles.ongoingCareCard}>
                {/* 남은 일수 */}
                <Text style={styles.daysRemaining}>
                  {MOCK_ONGOING_CARE.daysRemaining}일 남음
                </Text>

                {/* 환자 정보 */}
                <Text style={styles.ongoingPatientName}>
                  {MOCK_ONGOING_CARE.patient.name} (
                  {MOCK_ONGOING_CARE.patient.age}세,{' '}
                  {MOCK_ONGOING_CARE.patient.gender})
                </Text>

                {/* 태그 */}
                <View style={styles.ongoingTags}>
                  {MOCK_ONGOING_CARE.tags.map((tag, index) => (
                    <View key={index} style={styles.ongoingTag}>
                      <Text style={styles.ongoingTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* 상세 정보 */}
                <View style={styles.ongoingDetails}>
                  <View style={styles.ongoingDetailRow}>
                    {/* 왼쪽 영역 */}
                    <View style={styles.ongoingDetailLeft}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#6B7280"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.ongoingDetailLabel}>기간</Text>
                    </View>

                    {/* 오른쪽 값 */}
                    <Text style={styles.ongoingDetailValue}>
                      {MOCK_ONGOING_CARE.period}
                    </Text>
                  </View>

                  <View style={styles.ongoingDetailRow}>
                    <View style={styles.ongoingDetailLeft}>
                      <Ionicons
                        name="medical-outline"
                        size={14}
                        color="#6B7280"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.ongoingDetailLabel}>병명</Text>
                    </View>
                    <Text style={styles.ongoingDetailValue}>
                      {MOCK_ONGOING_CARE.diagnosis}
                    </Text>
                  </View>
                </View>

                {/* 버튼 */}
                <View style={styles.ongoingButtons}>
                  <TouchableOpacity
                    style={styles.writeJournalButton}
                    onPress={() => setActiveTab('간병일지')}
                  >
                    <Text style={styles.writeJournalButtonText}>
                      일지 작성하기
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.viewDetailButton}
                    onPress={() => router.push('/care-history/detail')}
                  >
                    <Text style={styles.viewDetailButtonText}>상세보기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.actionCard}>
                <View style={styles.actionCardContent}>
                  <Text style={styles.actionCardTitle}>간병 지원하기</Text>
                  <Text style={styles.actionCardDesc}>
                    홈에서 요청 중인 매칭에{'\n'}지원할 수 있어요/
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* 나의 소개 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>나의 소개</Text>
              {MOCK_INTRODUCTION && (
                <TouchableOpacity
                  style={styles.editLink}
                  onPress={() => router.push('/profile/introduction')}
                >
                  <Text style={styles.editLinkText}>편집</Text>
                  <Ionicons name="pencil" size={14} color="#171719" />
                </TouchableOpacity>
              )}
            </View>

            {MOCK_INTRODUCTION ? (
              <View style={styles.introductionCard}>
                {/* 자기소개 */}
                <View style={styles.introSection}>
                  <Text style={styles.introLabel}>자기소개</Text>
                  <View style={styles.introTextBox}>
                    <Text style={styles.introText}>
                      {MOCK_INTRODUCTION.selfIntro}
                    </Text>
                  </View>
                </View>

                {/* 나만의 강점 */}
                <View style={styles.introSection}>
                  <Text style={styles.introLabel}>나만의 강점</Text>
                  <View style={styles.chipContainer}>
                    {MOCK_INTRODUCTION.strengths.map((strength, index) => (
                      <View key={index} style={styles.chip}>
                        <Text style={styles.chipText}>{strength}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 자신 있는 돌봄 */}
                <View style={styles.introSection}>
                  <Text style={styles.introLabel}>자신 있는 돌봄</Text>
                  <View style={styles.chipContainer}>
                    {MOCK_INTRODUCTION.specialties.map((specialty, index) => (
                      <View key={index} style={styles.chip}>
                        <Text style={styles.chipText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/profile/introduction')}
              >
                <View style={styles.actionCardContent}>
                  <Text style={styles.actionCardTitle}>나의 소개 등록하기</Text>
                  <Text style={styles.actionCardDesc}>
                    소개를 등록하면{'\n'}지원 수락 확률이 올라가요.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* 나의 리뷰 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.reviewTitleRow}>
                <Text style={styles.sectionTitle}>나의 리뷰</Text>
                <Text style={styles.reviewRating}>평점 {MOCK_USER.rating}</Text>
              </View>
              <TouchableOpacity style={styles.moreLink}>
                <Text style={styles.moreLinkText}>더보기</Text>
                <Ionicons name="chevron-forward" size={16} color="#37383C9C" />
              </TouchableOpacity>
            </View>

            {MOCK_REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewPatient}>{review.patientName}</Text>
                  <View style={styles.reviewStars}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                <Text style={styles.reviewPeriod}>기간 {review.period}</Text>
                <Text style={styles.reviewContent}>{review.content}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* 간병일지 Tab Content */}
      {activeTab === '간병일지' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Patient Header */}
          {currentPatient && (
            <TouchableOpacity style={styles.patientHeader}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>
                  {currentPatient.name} ({currentPatient.age}세,{' '}
                  {currentPatient.gender})
                </Text>
                <View style={styles.patientTags}>
                  {currentPatient.tags.map((tag, index) => (
                    <View key={index} style={styles.patientTag}>
                      <Text style={styles.patientTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}

          {/* Date Navigation */}
          <View style={styles.dateNavigation}>
            <TouchableOpacity
              onPress={() => navigateDate('prev')}
              style={styles.dateArrow}
            >
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateDisplay}>
              <Text style={styles.dateText}>
                {formatDisplayDate(selectedDate)}
              </Text>
              <Ionicons name="caret-down" size={14} color="#DC2626" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigateDate('next')}
              style={styles.dateArrow}
            >
              <Ionicons name="chevron-forward" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Today's Journal Section */}
          <View style={styles.journalSection}>
            <Text style={styles.journalSectionTitle}>오늘의 일지</Text>

            <JournalCard
              type="morning"
              data={currentEntry?.morning}
              onPress={() =>
                router.push('/caregiving-journal/meal-record?time=morning')
              }
            />
            <JournalCard
              type="lunch"
              data={currentEntry?.lunch}
              onPress={() =>
                router.push('/caregiving-journal/meal-record?time=lunch')
              }
            />
            <JournalCard
              type="dinner"
              data={currentEntry?.dinner}
              onPress={() =>
                router.push('/caregiving-journal/meal-record?time=dinner')
              }
            />
            <JournalCard
              type="medical"
              data={currentEntry?.medicalRecord}
              onPress={() => router.push('/caregiving-journal/medical-record')}
            />
            <JournalCard
              type="activity"
              data={currentEntry?.activityRecord}
              onPress={() => router.push('/caregiving-journal/activity-record')}
            />
          </View>

          {/* Special Notes Section */}
          {/* <View style={styles.specialNotesSection}>
            <Text style={styles.specialNotesTitle}>특이 및 전달 사항</Text>
            <View style={styles.specialNotesBox}>
              <TextInput
                style={styles.specialNotesInput}
                placeholder="특이 사항을 입력해주세요."
                placeholderTextColor="#9CA3AF"
                multiline
                value={specialNotes}
                onChangeText={setSpecialNotes}
              />
            </View>
          </View> */}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* 수익 Tab Content */}
      {activeTab === '수익' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 이번달 총 수익 */}
          <View style={styles.earningHeader}>
            <Text style={styles.earningTitle}>이번달 총 수익</Text>
            <Text style={styles.earningTotal}>
              {MOCK_EARNING_SUMMARY.total.toLocaleString()}원
            </Text>
          </View>

          {/* 근무 요약 */}
          <View style={styles.earningSummaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>근무 일수</Text>
              <Text style={styles.summaryValue}>
                {MOCK_EARNING_SUMMARY.workDays}일
              </Text>
            </View>
            <View style={[styles.summaryRow, { marginBottom: 0 }]}>
              <Text style={styles.summaryLabel}>근무 시간</Text>
              <Text style={styles.summaryValue}>
                {MOCK_EARNING_SUMMARY.workHours}시간
              </Text>
            </View>
          </View>

          {/* 출금 관련 */}
          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>출금 계좌 설정</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow}>
            <Text style={styles.linkText}>출금 내역</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.dividerWrapper}>
            <View style={styles.divider} />
          </View>

          {/* 수익 내역 */}
          <Text style={styles.earningListTitle}>수익 내역</Text>
          <View style={styles.earningListSection}>
            <View style={styles.earningMonthRow}>
              <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
              <View style={styles.monthCenter}>
                <Text style={styles.earningMonthText}>2025년 11월</Text>
                <Ionicons name="caret-down" size={14} color="#111827" />
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </View>

            {MOCK_EARNINGS.map((item) => (
              <View key={item.id} style={styles.earningCard}>
                <View style={styles.earningCardTop}>
                  <Text style={styles.noticeText}>
                    공고번호 {item.noticeNo}
                  </Text>
                  <Text style={styles.periodText}>{item.period}</Text>
                </View>

                <View style={styles.earningCardBottom}>
                  <Text style={styles.patientText}>{item.patientName}</Text>
                  <Text style={styles.amountText}>
                    {item.amount.toLocaleString()} 원
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#70737C14',
  },
  referralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#0066FF0D',
  },
  referralText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  notificationButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#111827',
  },
  tabText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8C919634',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#171719',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E2F33E0',
  },
  ratingValue: {
    fontSize: 16,
    color: '#2E2F33E0',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderColor: '#70737C29',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#171719',
  },
  profileDetails: {
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F7F7F8',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  moreLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37383C9C',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionCardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  reviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewRating: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '500',
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#70737C38',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171719',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewPeriod: {
    fontSize: 14,
    color: '#2E2F33E0',
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E2F33E0',
    lineHeight: 20,
  },
  ongoingCareCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#70737C29',
    padding: 16,
  },
  daysRemaining: {
    fontSize: 14,
    color: '#0066FF',
    marginBottom: 8,
  },
  ongoingPatientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  ongoingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  ongoingTag: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#70737C29',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ongoingTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#37383C9C',
  },
  ongoingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  ongoingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ongoingDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ongoingDetailIcon: {
    width: 20,
    marginRight: 4,
  },
  ongoingDetailLabel: {
    fontSize: 15,
    color: '#2E2F33E0',
  },
  ongoingDetailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#171719',
  },
  ongoingButtons: {
    gap: 12,
  },
  writeJournalButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  writeJournalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  viewDetailButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#70737C29',
    alignItems: 'center',
  },
  viewDetailButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171719',
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderColor: '#70737C29',
    borderRadius: 8,
  },
  editLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#171719',
  },
  introductionCard: {
    borderWidth: 1,
    borderColor: '#70737C38',
    borderRadius: 10,
    padding: 20,
  },
  introSection: {
    marginBottom: 20,
  },
  introLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  introTextBox: {
    backgroundColor: '#F7F7F8',
    padding: 16,
    borderRadius: 12,
  },
  introText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#37383C9C',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#70737C29',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
  },
  // Caregiving Journal Tab Styles
  patientHeader: {
    backgroundColor: '#fff',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0066FF',
    marginHorizontal: 20,
    marginVertical: 30,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  patientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  patientTag: {
    borderWidth: 1,
    borderColor: '#70737C29',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  patientTagText: {
    fontSize: 12,
    color: '#37383C9C',
    fontWeight: '500',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dateArrow: {
    // padding: 8,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171719',
  },
  journalSection: {
    padding: 20,
  },
  journalSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  specialNotesSection: {
    padding: 20,
    paddingTop: 0,
  },
  specialNotesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  specialNotesBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    minHeight: 100,
  },
  specialNotesInput: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },

  earningHeader: {
    padding: 20,
  },
  earningTitle: {
    fontSize: 14,
    color: '#2E2F33E0',
    marginBottom: 4,
  },
  earningTotal: {
    fontSize: 24,
    fontWeight: '700',
    color: '#171719',
  },
  earningSummaryCard: {
    backgroundColor: '#F7F7F8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#37383C9C',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171719',
  },

  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#171719',
  },
  dividerWrapper: {
    marginTop: 20,
    marginBottom: 20,
    color: '#70737C38',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  earningListTitle: {
    paddingHorizontal: 20,
    fontSize: 17,
    fontWeight: '600',
    color: '#171719',
  },
  earningListSection: {
    padding: 20,
  },
  earningMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  monthCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  earningMonthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171719',
  },
  earningCard: {
    borderWidth: 1,
    borderColor: '#70737C29',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  earningCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 14,
    color: '#2E2F33E0',
  },
  periodText: {
    fontSize: 14,
    color: '#2E2F33E0',
  },
  earningCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#171719',
  },
  amountText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#0066FF',
  },
});
