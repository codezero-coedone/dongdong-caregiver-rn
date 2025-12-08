import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterModal from '../../components/home/FilterModal';

// 목업 데이터
const MOCK_JOBS = [
  {
    id: '1',
    type: '기간제 간병',
    timeAgo: '2시간 전',
    patientName: '이환자',
    patientAge: 68,
    patientGender: '남',
    tags: ['매칭 3기', '식사 가능', '배변 도움 필요'],
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
    tags: ['매칭 3기', '식사 가능'],
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
              size={14}
              color={isHourly ? '#10B981' : '#3B82F6'}
            />
            <Text style={[styles.typeBadgeText, isHourly && styles.typeBadgeTextHourly]}>
              {job.type}
            </Text>
          </View>
          {job.urgency && (
            <View style={styles.urgencyBadge}>
              <Text style={styles.urgencyText}>{job.urgency}</Text>
            </View>
          )}
        </View>
        <Text style={styles.timeAgo}>{job.timeAgo}</Text>
      </View>

      {/* Patient Info */}
      <Text style={styles.patientName}>
        {job.patientName} ({job.patientAge}세, {job.patientGender})
      </Text>

      {/* Tags */}
      <View style={styles.tags}>
        {job.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>위치</Text>
          <Text style={styles.detailValue}>{job.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>간병기간</Text>
          <Text style={styles.detailValue}>{job.period}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>간병시간</Text>
          <Text style={styles.detailValue}>{job.hours}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>급여</Text>
          <Text style={styles.payValue}>{job.pay}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.detailButton} onPress={handleViewDetail}>
          <Text style={styles.detailButtonText}>상세보기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>지원하기</Text>
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
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>☺️ 동반자동행</Text>
        </View>
        <TouchableOpacity style={styles.alertButton}>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>매칭 공고를 확인해보세요.</Text>

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
          <Text style={styles.filterText}>상세조건을 선택해 주세요</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="options-outline" size={16} color="#3B82F6" />
            <Text style={styles.filterButtonText}>상세조건</Text>
          </TouchableOpacity>
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>총 {MOCK_JOBS.length}건</Text>
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
              <Ionicons name="chevron-down" size={14} color="#374151" />
            )}
          />
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
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    color: '#111827',
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: '#fff',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sortDropdown: {
    width: 100,
  },
  sortDropdownText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'right',
  },
  sortDropdownIcon: {
    width: 14,
    height: 14,
  },
  jobList: {
    gap: 12,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  typeBadgeHourly: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  typeBadgeTextHourly: {
    color: '#10B981',
  },
  urgencyBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  urgencyText: {
    fontSize: 12,
    color: '#6B7280',
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
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  details: {
    gap: 6,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    width: 60,
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
    backgroundColor: '#3B82F6',
    alignItems: 'center',
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
