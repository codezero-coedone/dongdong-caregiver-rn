import FilterModal from '@/components/home/FilterModal';
import Chip from '@/components/ui/Chip';
import Divider from '@/components/ui/Divider';
import HeaderWithLogo from '@/components/ui/HeaderWithLogo';
import Space from '@/components/ui/Space';
import Typography from '@/components/ui/Typography';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';

// 목업 데이터
const MOCK_JOBS = [
  {
    id: '1',
    type: '기간제 간병',
    timeAgo: '2시간 전',
    patientName: '이환자',
    patientAge: 68,
    patientGender: '남',
    tags: ['폐암 3기', '식사 가능', '배변 도움 필요'],
    location: '서울특별시 강남구 삼성동',
    period: '2025.11.15 ~ 11.30, 매일',
    hours: '24시간',
    pay: '시급 15,000원',
  },
  {
    id: '2',
    type: '시간제 간병',
    urgency: '마감 임박',
    timeAgo: '7일 전',
    patientName: '이환자',
    patientAge: 68,
    patientGender: '남',
    tags: ['후두암 4기', '식사 불가능', '배변 도움 필요'],
    location: '서울특별시 강남구 삼성동',
    period: '2025.11.08 ~ 11.15, 평일',
    hours: '10시간',
    pay: '시급 15,000원',
  },
  {
    id: '3',
    type: '기간제 간병',
    timeAgo: '1일 전',
    patientName: '이환자',
    patientAge: 68,
    patientGender: '남',
    tags: ['폐암 3기', '식사 가능'],
    location: '서울특별시 송파구 잠실동',
    period: '2025.12.01 ~ 12.15, 매일',
    hours: '24시간',
    pay: '시급 18,000원',
  },
];

// 정렬 옵션
const SORT_OPTIONS = [
  { label: '최신순', value: 'latest' },
  { label: '거리순', value: 'distance' },
  { label: '마감임박순', value: 'deadline' },
];

type ApiJobListing = {
  id: string;
  careType: string;
  locationSummary: string;
  startDate: string;
  endDate: string;
  patientGender: string;
  patientAge: number;
  dailyRate: number;
  createdAt: string;
};

type UiJob = (typeof MOCK_JOBS)[0];
interface JobCardProps {
  job: (typeof MOCK_JOBS)[0];
}

function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const isHourly = job.type === '시간제 간병';

  const handleViewDetail = () => {
    router.push(`/job/${job.id}`);
  };

  const handleApply = () => {
    router.push(`/job/apply/${job.id}`);
  };

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.typeBadge, isHourly && styles.typeBadgeHourly]}>
            <Ionicons
              name={isHourly ? 'time-outline' : 'document-text-outline'}
              size={16}
              color={isHourly ? '#429E00' : '#0098B2'}
            />
            <Text
              style={[
                styles.typeBadgeText,
                isHourly && styles.typeBadgeTextHourly,
              ]}
            >
              {job.type}
            </Text>
          </View>
          {job.urgency && <Chip label={job.urgency} variant="secondary" />}
        </View>
        <Typography variant="label2.regular" color="gray">
          {job.timeAgo}
        </Typography>
      </View>

      {/* Patient Info */}
      <Typography variant="headline1.bold" color="black">
        {job.patientName} ({job.patientAge}세, {job.patientGender})
      </Typography>

      {/* Tags */}
      <Space y={8} />
      <View style={styles.tags}>
        {job.tags.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            variant={index === 0 ? 'primary' : 'default'}
          />
        ))}
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Typography
            variant="label2.regular"
            color="gray"
            style={styles.detailLabel}
          >
            위치
          </Typography>
          <View style={styles.detailDivider} />
          <Typography
            variant="label2.regular"
            color="labelAlternative"
            style={styles.detailValue}
          >
            {job.location}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography
            variant="label2.regular"
            color="gray"
            style={styles.detailLabel}
          >
            간병기간
          </Typography>
          <View style={styles.detailDivider} />
          <Typography
            variant="label2.regular"
            color="labelAlternative"
            style={styles.detailValue}
          >
            {job.period}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography
            variant="label2.regular"
            color="gray"
            style={styles.detailLabel}
          >
            간병시간
          </Typography>
          <View style={styles.detailDivider} />
          <Typography
            variant="label2.regular"
            color="labelAlternative"
            style={styles.detailValue}
          >
            {job.hours}
          </Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography
            variant="label2.regular"
            color="gray"
            style={styles.detailLabel}
          >
            급여
          </Typography>
          <View style={styles.detailDivider} />
          <Typography
            variant="label2.bold"
            color="primary"
            style={styles.payValue}
          >
            {job.pay}
          </Typography>
        </View>
      </View>

      <Space y={2} />

      {/* Actions */}
      <View style={styles.actions}>
        {/* <TouchableOpacity
          style={styles.detailButton}
          onPress={handleViewDetail}
        >
          <Typography variant="body1.medium" color="label">
            상세보기
          </Typography>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Typography variant="body1.bold" color="primary">
            지원하기
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('latest');
  const [apiJobs, setApiJobs] = useState<ApiJobListing[]>([]);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const careTypeLabel = (v: string | null | undefined): string => {
    switch (v) {
      case 'HOSPITAL':
        return '병원 간병';
      case 'HOME':
        return '가정 간병';
      case 'NURSING_HOME':
        return '요양원';
      default:
        return v ?? '-';
    }
  };

  const formatYmd = (iso: string | null | undefined): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };

  const timeAgo = (iso: string | null | undefined): string => {
    if (!iso) return '';
    const d = new Date(iso);
    const ms = d.getTime();
    if (Number.isNaN(ms)) return '';
    const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}시간 전`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}일 전`;
  };

  useEffect(() => {
    let alive = true;
    if (!isLoggedIn) {
      // Guard: never call protected endpoints before auth is established.
      setApiJobs([]);
      return () => {
        alive = false;
      };
    }
    (async () => {
      try {
        const res = await apiClient.get('/jobs');
        const data = (res.data as any)?.data;
        if (!alive) return;
        setApiJobs(Array.isArray(data) ? (data as ApiJobListing[]) : []);
      } catch {
        if (!alive) return;
        setApiJobs([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // TODO: 필터 적용 로직
  };

  const jobsForUi: UiJob[] =
    apiJobs.length > 0
      ? apiJobs.map((j: ApiJobListing) => ({
          id: j.id,
          type: careTypeLabel(j.careType),
          timeAgo: timeAgo(j.createdAt) || '신규',
          patientName: '환자',
          patientAge: j.patientAge ?? 0,
          patientGender: j.patientGender ?? '',
          tags: [],
          location: j.locationSummary ?? '',
          period: `${formatYmd(j.startDate)} ~ ${formatYmd(j.endDate)}`,
          hours: '',
          pay: `일 ${Number(j.dailyRate ?? 0).toLocaleString()}원`,
        }))
      : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <HeaderWithLogo />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* Title */}
          <Typography
            variant="headline1.bold"
            color="strong"
            style={styles.title}
          >
            매칭 공고를 확인해보세요.
          </Typography>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="장소 또는 공고번호 검색하기"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <Typography style={styles.filterText}>
            상세조건을 선택해 주세요
          </Typography>
          <View style={styles.filterRight}>
            <View style={styles.verticalDivider} />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="options-outline" size={16} color="#374151" />
              <Text style={styles.filterButtonText}>상세조건</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Divider */}
        <Divider height={6} color="#F5F5F5" />
        <Space y={24.5} />

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Typography variant="label1.bold" color="label">
            총 {jobsForUi.length}건
          </Typography>
          <View style={styles.dropdownContainer}>
            <Dropdown
              style={styles.sortDropdown}
              selectedTextStyle={styles.sortDropdownText}
              iconStyle={styles.sortDropdownIcon}
              data={SORT_OPTIONS}
              maxHeight={200}
              labelField="label"
              valueField="value"
              value={sortOption}
              onChange={(item: { value: string }) => setSortOption(item.value)}
              renderRightIcon={() => (
                <Ionicons
                  name="caret-down"
                  size={12}
                  color="#171719"
                  style={{ marginLeft: 4 }}
                />
              )}
            />
          </View>
        </View>

          {/* Job List */}
          <View style={styles.jobList}>
            {jobsForUi.length > 0 ? (
              jobsForUi.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280' }}>
                  현재 지원 가능한 공고가 없습니다.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Help Button */}
      <TouchableOpacity style={styles.helpButton}>
        <Ionicons name="call" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
  },
  alertButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#171719',
    marginTop: 30,
    marginBottom: 20,
  },
  searchContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(112, 115, 124, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 13,
    color: '#171719',
  },
  searchIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    color: '#6B7280',
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 4,
  },
  filterIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginLeft: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownContainer: {
    width: 72,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(112, 115, 124, 0.16)',
    backgroundColor: '#FFFFFF',
    paddingLeft: 8,
    paddingRight: 6,
    paddingVertical: 6,
    justifyContent: 'center',
    overflow: 'visible',
  },
  sortDropdown: {
    flex: 1,
  },
  sortDropdownText: {
    fontSize: 14,
    color: '#171719', // Label color
    fontWeight: '500',
  },
  sortDropdownIcon: {
    width: 16,
    height: 16,
  },
  jobList: {
    gap: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#70737C29',
    // Removed shadow as per flat design, or keep very subtle if needed
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0098B214',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  typeBadgeHourly: {
    backgroundColor: '#429E0014',
  },
  typeBadgeText: {
    fontSize: 13,
    color: '#0098B2',
    fontWeight: '500',
  },
  typeBadgeTextHourly: {
    fontSize: 13,
    color: '#429E00',
    fontWeight: '500',
  },

  timeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
  },
  details: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: '#37383C9C',
    width: 60,
  },
  detailDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#70737C38',
    marginHorizontal: 8,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2E2F33E0',
    flex: 1,
  },
  payValue: {
    fontSize: 15,
    color: '#0066FF',
    fontWeight: '500',
    // handled by Typography
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#70737C29',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  detailButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    height: 48,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0066FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  helpButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#58CF04',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00000014',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
