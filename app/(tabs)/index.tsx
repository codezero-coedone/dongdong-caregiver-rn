import FilterModal from '@/components/home/FilterModal';
import Chip from '@/components/ui/Chip';
import Divider from '@/components/ui/Divider';
import HeaderWithLogo from '@/components/ui/HeaderWithLogo';
import Space from '@/components/ui/Space';
import Typography from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

interface JobCardProps {
  job: typeof MOCK_JOBS[0];
}

function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const isHourly = job.type === '시간제 간병';

  const handleViewDetail = () => {
    router.push(`/job/${job.id}`);
  };

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.typeBadge, isHourly && styles.typeBadgeHourly]}>
            <Ionicons
              name={isHourly ? 'time-outline' : 'document-text-outline'}
              size={12}
              color={isHourly ? '#10B981' : '#3B82F6'}
            />
            <Text style={[styles.typeBadgeText, isHourly && styles.typeBadgeTextHourly]}>
              {job.type}
            </Text>
          </View>
          {job.urgency && (
            <Chip label={job.urgency} variant="secondary" />
          )}
        </View>
        <Typography variant="label2.regular" color="gray">{job.timeAgo}</Typography>
      </View>

      {/* Patient Info */}
      <Space y={12} />
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

      <Space y={2} />

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Typography variant="label2.regular" color="gray" style={styles.detailLabel}>위치</Typography>
          <View style={styles.detailDivider} />
          <Typography variant="label2.regular" color="labelAlternative" style={styles.detailValue}>{job.location}</Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="label2.regular" color="gray" style={styles.detailLabel}>간병기간</Typography>
          <View style={styles.detailDivider} />
          <Typography variant="label2.regular" color="labelAlternative" style={styles.detailValue}>{job.period}</Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="label2.regular" color="gray" style={styles.detailLabel}>간병시간</Typography>
          <View style={styles.detailDivider} />
          <Typography variant="label2.regular" color="labelAlternative" style={styles.detailValue}>{job.hours}</Typography>
        </View>
        <View style={styles.detailRow}>
          <Typography variant="label2.regular" color="gray" style={styles.detailLabel}>급여</Typography>
          <View style={styles.detailDivider} />
          <Typography variant="label2.bold" color="primary" style={styles.payValue}>{job.pay}</Typography>
        </View>
      </View>

      <Space y={2} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.detailButton} onPress={handleViewDetail}>
          <Typography variant="label1.medium" color="label">상세보기</Typography>
        </TouchableOpacity>
        <Space x={8} />
        <TouchableOpacity style={styles.applyButton}>
          <Typography variant="label1.bold" color="primary">지원하기</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('latest');

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // TODO: 필터 적용 로직
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <HeaderWithLogo />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Typography variant="headline1.bold" color="strong" style={styles.title}>
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
          />
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <Typography variant="body2.medium" color="labelAlternative">상세조건을 선택해 주세요</Typography>
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
        <Space y={20} />
        <Divider height={8} color="#F5F5F5" />
        <Space y={24.5} />

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Typography variant="label1.bold" color="label">총 {MOCK_JOBS.length}건</Typography>
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
              onChange={item => setSortOption(item.value)}
              renderRightIcon={() => (
                <Ionicons name="caret-down" size={12} color="#171719" style={{ marginLeft: 4 }} />
              )}
            />
          </View>
        </View>

        {/* Job List */}
        <View style={styles.jobList}>
          {MOCK_JOBS.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </View>
      </ScrollView>

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
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
    color: '#111827',
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
    marginBottom: 16,
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  filterButtonText: {
    fontSize: 13,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortDropdown: {
    width: 100,
  },
  sortDropdownText: {
    fontSize: 13,
    color: '#171719', // Label color
    fontWeight: '500',
  },
  sortDropdownIcon: {
    width: 12,
    height: 12,
  },
  jobList: {
    gap: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    gap: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  typeBadgeHourly: {
    backgroundColor: '#ECFDF5',
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  typeBadgeTextHourly: {
    color: '#10B981',
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
    gap: 6,
    marginBottom: 12,
  },
  details: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    width: 52,
  },
  detailDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  detailValue: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  payValue: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    // handled by Typography
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066FF',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  helpButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
