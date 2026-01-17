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
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterState = {
  regions: string[];
  period: string | null;
  timeSlot: string[];
  mealAssistance: string[];
  toiletAssistance: string[];
};

const PRIMARY = '#0066FF';

type UiJob = {
  id: string;
  type: string;
  urgency?: string;
  timeAgo: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  tags: string[];
  location: string;
  period: string;
  hours: string;
  pay: string;
  createdAtMs?: number;
};

// 정렬 옵션
const SORT_OPTIONS = [
  { label: '최신순', value: 'latest' },
  { label: '거리순', value: 'distance' },
  { label: '마감임박순', value: 'deadline' },
];

type ApiJobListing = {
  id: string;
  patientName?: string;
  careType: string;
  locationSummary: string;
  startDate: string;
  endDate: string;
  patientGender: string;
  patientAge: number;
  patientDiagnosis?: string;
  patientMobilityLevel?: string;
  dailyRate: number;
  createdAt: string;
};

interface JobCardProps {
  job: UiJob;
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
        <TouchableOpacity style={styles.detailButton} onPress={handleViewDetail}>
          <Typography variant="body1.medium" color="label">
            상세보기
          </Typography>
        </TouchableOpacity>
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
  const [filters, setFilters] = useState<FilterState>({
    regions: [],
    period: null,
    timeSlot: [],
    mealAssistance: [],
    toiletAssistance: [],
  });
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortAnchor, setSortAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const insets = useSafeAreaInsets();
  // Micro-UX: keep content/floating controls above system navigation + tab bar
  // even with android.edgeToEdgeEnabled=true.
  const bottomPad = Math.max(insets.bottom, 12);
  const tabBarHeight = 57 + bottomPad;
  const contentBottom = tabBarHeight + 24;

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

  const handleApplyFilters = (next: FilterState) => {
    setFilters(next);
  };

  const sortLabel = (v: string): string => {
    const hit = SORT_OPTIONS.find((o) => o.value === v);
    return hit?.label ?? '최신순';
  };

  const jobsForUi: UiJob[] =
    apiJobs.length > 0
      ? apiJobs.map((j: ApiJobListing) => ({
          id: j.id,
          type: careTypeLabel(j.careType),
          timeAgo: timeAgo(j.createdAt) || '신규',
          patientName: String(j.patientName || '환자'),
          patientAge: j.patientAge ?? 0,
          patientGender: j.patientGender ?? '',
          tags: [j.patientDiagnosis, j.patientMobilityLevel].filter(Boolean).map((x) => String(x)).slice(0, 3),
          location: j.locationSummary ?? '',
          period: `${formatYmd(j.startDate)} ~ ${formatYmd(j.endDate)}`,
          hours: '',
          pay: `일 ${Number(j.dailyRate ?? 0).toLocaleString()}원`,
          createdAtMs: Number.isFinite(new Date(j.createdAt).getTime())
            ? new Date(j.createdAt).getTime()
            : undefined,
        }))
      : [];

  const filterAppliedCount =
    filters.regions.length +
    (filters.period ? 1 : 0) +
    filters.timeSlot.length +
    filters.mealAssistance.length +
    filters.toiletAssistance.length;

  const appliedChips = (() => {
    const out: { key: string; label: string; onRemove?: () => void }[] = [];

    filters.regions.forEach((r) =>
      out.push({
        key: `r:${r}`,
        label: `${r}시`,
        onRemove: () =>
          setFilters((prev) => ({ ...prev, regions: prev.regions.filter((x) => x !== r) })),
      }),
    );
    if (filters.period) {
      const p = filters.period;
      out.push({
        key: `p:${p}`,
        label: p,
        onRemove: () => setFilters((prev) => ({ ...prev, period: null })),
      });
    }
    filters.timeSlot.forEach((t) =>
      out.push({
        key: `t:${t}`,
        label: t,
        onRemove: () =>
          setFilters((prev) => ({ ...prev, timeSlot: prev.timeSlot.filter((x) => x !== t) })),
      }),
    );
    filters.mealAssistance.forEach((m) =>
      out.push({
        key: `m:${m}`,
        label: m,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            mealAssistance: prev.mealAssistance.filter((x) => x !== m),
          })),
      }),
    );
    filters.toiletAssistance.forEach((t) =>
      out.push({
        key: `to:${t}`,
        label: t,
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            toiletAssistance: prev.toiletAssistance.filter((x) => x !== t),
          })),
      }),
    );

    return out;
  })();

  const normalize = (s: unknown): string => String(s ?? '').toLowerCase().trim();

  const filteredJobs = (() => {
    const q = normalize(searchQuery);
    const regionSet = new Set(filters.regions.map((r) => normalize(r)));

    let rows = [...jobsForUi];

    // Search (location or jobId)
    if (q) {
      rows = rows.filter((j) => {
        const id = normalize(j.id);
        const loc = normalize(j.location);
        return id.includes(q) || loc.includes(q);
      });
    }

    // Region filter (best-effort: location contains region text)
    if (regionSet.size > 0) {
      rows = rows.filter((j) => {
        const loc = normalize(j.location);
        for (const r of regionSet) {
          if (r && loc.includes(r)) return true;
        }
        return false;
      });
    }

    // Sort (deterministic; other modes are UI-only until backend supports)
    if (sortOption === 'latest') {
      rows.sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
    }

    return rows;
  })();

  useEffect(() => {
    const onShow = () => setKeyboardOpen(true);
    const onHide = () => setKeyboardOpen(false);
    const s1 = Keyboard.addListener('keyboardDidShow', onShow);
    const s2 = Keyboard.addListener('keyboardDidHide', onHide);
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.frame}>
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
            contentContainerStyle={{ paddingBottom: contentBottom }}
            onScrollBeginDrag={() => setSortMenuOpen(false)}
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
              onFocus={() => setSortMenuOpen(false)}
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.searchClear}
                accessibilityRole="button"
                accessibilityLabel="검색어 지우기"
                activeOpacity={0.85}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          {appliedChips.length > 0 ? (
            <View style={styles.appliedChipRow}>
              {appliedChips.slice(0, 2).map((c) => (
                <View key={c.key} style={styles.appliedChip}>
                  <Text style={styles.appliedChipText}>{c.label}</Text>
                  {c.onRemove ? (
                    <TouchableOpacity
                      onPress={c.onRemove}
                      style={styles.appliedChipClose}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="close" size={14} color={PRIMARY} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
              {appliedChips.length > 2 ? (
                <View style={[styles.appliedChip, styles.appliedChipMore]}>
                  <Text style={styles.appliedChipText}>+{appliedChips.length - 2}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Typography style={styles.filterText}>
              상세조건을 선택해 주세요
            </Typography>
          )}
          <View style={styles.filterRight}>
            <View style={styles.verticalDivider} />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setSortMenuOpen(false);
                setFilterModalVisible(true);
              }}
            >
              <Ionicons name="options-outline" size={16} color="#374151" />
              <Text style={styles.filterButtonText}>상세조건</Text>
              {filterAppliedCount > 0 ? <View style={styles.filterIndicator} /> : null}
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Divider */}
        <Divider height={6} color="#F5F5F5" />
        <Space y={24.5} />

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Typography variant="label1.bold" color="label">
            총 {filteredJobs.length}건
          </Typography>
          <View>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => {
                if (sortMenuOpen) {
                  setSortMenuOpen(false);
                  return;
                }
                // Measure for modal placement
                (global as any)?.requestAnimationFrame?.(() => {});
                setSortMenuOpen(true);
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.sortButtonText}>{sortLabel(sortOption)}</Text>
              <Ionicons name={sortMenuOpen ? 'caret-up' : 'caret-down'} size={12} color="#171719" />
            </TouchableOpacity>
          </View>
        </View>

          {/* Job List */}
          <View style={styles.jobList}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 18 }}>
                  {searchQuery.trim()
                    ? '검색 결과가 없습니다.\n검색어/필터를 확인해 주세요.'
                    : '현재 지원 가능한 공고가 없습니다.'}
                </Text>
              </View>
            )}
          </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Floating Help Button */}
        {!keyboardOpen && !sortMenuOpen && (
          <TouchableOpacity style={[styles.helpButton, { bottom: tabBarHeight + 12 }]}>
            <Ionicons name="call" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Sort Menu Overlay (Modal) */}
        {sortMenuOpen && (
          <View
            style={styles.sortOverlay}
            onLayout={(e) => {
              // Anchor near the sort button (top-right of the overlay)
              const { width } = e.nativeEvent.layout;
              setSortAnchor((prev) => prev ?? { x: width - 12 - 160, y: 160, w: 160, h: 0 });
            }}
          >
            <TouchableOpacity
              style={styles.sortOverlayBackdrop}
              activeOpacity={1}
              onPress={() => setSortMenuOpen(false)}
            />
            <View
              style={[
                styles.sortMenuModal,
                {
                  left: 375 - 12 - 160,
                  top: 24 + 56 + 56 + 140,
                },
              ]}
            >
              {SORT_OPTIONS.map((o, idx) => (
                <TouchableOpacity
                  key={o.value}
                  style={[
                    styles.sortMenuItem,
                    idx === SORT_OPTIONS.length - 1 ? { borderBottomWidth: 0 } : null,
                  ]}
                  onPress={() => {
                    setSortOption(o.value);
                    setSortMenuOpen(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.sortMenuItemText}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Filter Modal */}
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleApplyFilters}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 375,
    alignSelf: 'center',
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  searchClear: {
    paddingLeft: 8,
    paddingVertical: 6,
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
  appliedChipRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  appliedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRIMARY,
    backgroundColor: '#F3F8FF',
    gap: 6,
  },
  appliedChipText: { fontSize: 14, fontWeight: '700', color: PRIMARY },
  appliedChipClose: { padding: 2 },
  appliedChipMore: {
    paddingRight: 12,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginLeft: 6,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortButton: {
    height: 32,
    minWidth: 78,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sortButtonText: { fontSize: 14, fontWeight: '600', color: '#171719' },
  sortOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 999,
  },
  sortOverlayBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  sortMenuModal: {
    position: 'absolute',
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    zIndex: 1000,
    elevation: 1000,
  },
  sortMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortMenuItemText: { fontSize: 16, fontWeight: '600', color: '#111827' },
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
  helpButton: {
    position: 'absolute',
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
