import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import { fetchMyMatches, type ApiMyMatch } from '@/services/careHistoryService';

// 전화번호 마스킹 함수
const maskPhoneNumber = (phone: string) => {
  const parts = phone.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1]}-****`;
  }
  return phone.replace(/\d{4}$/, '****');
};

export default function CareDetailScreen() {
  const router = useRouter();
  const { type, matchId: matchIdParam, date: dateParam } = useLocalSearchParams<{
    type?: string;
    matchId?: string;
    date?: string;
  }>();

  // type이 'completed'면 완료된 간병, 그 외는 진행 중
  const isCompleted = type === 'completed';

  const matchId = typeof matchIdParam === 'string' ? Number(matchIdParam) : NaN;
  const [loading, setLoading] = useState(false);
  const [row, setRow] = useState<ApiMyMatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    if (!Number.isFinite(matchId) || matchId <= 0) {
      setRow(null);
      setError('matchId가 없습니다.');
      return () => {
        alive = false;
      };
    }

    setLoading(true);
    setError(null);
    (async () => {
      try {
        const rows = await fetchMyMatches();
        if (!alive) return;
        const hit = rows.find((m) => m.id === matchId) ?? null;
        if (!hit) {
          setError('내역을 찾을 수 없습니다.');
          setRow(null);
          return;
        }
        setRow(hit);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || '조회에 실패했습니다.');
        setRow(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [matchId]);

  const tags = useMemo(() => {
    if (!row) return [];
    const out: string[] = [];
    if (row.patientDiagnosis) out.push(String(row.patientDiagnosis));
    if (row.patientMobilityLevel) out.push(String(row.patientMobilityLevel));
    if (Array.isArray(row.patientAssistiveDevices)) {
      for (const t of row.patientAssistiveDevices) {
        const s = String(t || '').trim();
        if (s) out.push(s);
      }
    }
    return out.slice(0, 6);
  }, [row]);

  const ymdDot = (iso: string | null | undefined): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };

  const genderLabel = (v: string | null | undefined): string => {
    const s = String(v || '').toUpperCase();
    if (s === 'MALE' || s === 'M') return '남';
    if (s === 'FEMALE' || s === 'F') return '여';
    return s || '-';
  };

  const handleWriteJournal = () => {
    const todayYmd = () => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const date =
      typeof dateParam === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : todayYmd();

    if (!Number.isFinite(matchId) || matchId <= 0) return;
    router.push(
      `/caregiving-journal?matchId=${encodeURIComponent(String(matchId))}&date=${encodeURIComponent(date)}`,
    );
  };

  // 보호자 연락처: 백엔드에 phone이 없어 묵데이터를 쓰지 않습니다.
  // 완료된 간병의 경우엔 노출 자체를 하지 않고, 진행 중인 경우도 "-"로 처리합니다.
  const guardianPhone = isCompleted ? '-' : '-';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>진행 중인 간병 상세보기</Text>

        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator />
          </View>
        )}
        {error && (
          <Text style={{ color: '#EF4444', paddingHorizontal: 20, paddingTop: 10 }}>
            {error}
          </Text>
        )}
        {/* 환자 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionIcon}>👤</Text> 환자 정보
          </Text>
          <View
            style={[
              styles.patientCard,
              isCompleted && styles.patientCardCompleted,
            ]}
          >
            {/* 공고번호 (완료된 간병만 표시) */}
            {isCompleted && (
              <Text style={styles.jobNumber}>
                공고번호 {Number.isFinite(matchId) ? String(matchId) : '-'}
              </Text>
            )}

            {/* 남은 일수 (진행 중인 간병만 표시) */}
            {!isCompleted && (
              <Text style={styles.daysRemaining}>
                {row?.endDate ? (() => {
                  const end = new Date(row.endDate);
                  const days = Number.isNaN(end.getTime())
                    ? 0
                    : Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                  return `${days}일 남음`;
                })() : '—'}
              </Text>
            )}

            <Text style={styles.patientName}>
              {row?.patientName ?? '-'} ({Number(row?.patientAge ?? 0)}세,{' '}
              {genderLabel(row?.patientGender)})
            </Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 기본 정보 섹션 */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            {/* 기본 정보 */}
            <View>
              <Text style={styles.cardSectionTitle}>기본 정보</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>생년월일</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>
                  {row?.patientBirthDate ? row.patientBirthDate : '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>키</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>
                  {typeof row?.patientHeight === 'number' ? `${row.patientHeight}cm` : '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>몸무게</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>
                  {typeof row?.patientWeight === 'number' ? `${row.patientWeight}kg` : '-'}
                </Text>
              </View>
            </View>

            {/* 환자 상태 */}
            <View>
              <Text style={styles.cardSectionTitle}>환자 상태</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>진단명</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>
                  {row?.patientDiagnosis ?? '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>식사 도움</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>
                  {'-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>거동 상태</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>
                  {row?.patientMobilityLevel ?? '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>요청 사항</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>
                  {'-'}
                </Text>
              </View>
            </View>

            {/* 보호자 */}
            <View>
              <Text style={styles.cardSectionTitle}>보호자</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이름</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>
                  {'-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>휴대폰</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>{guardianPhone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>관계</Text>
                <View style={styles.verticalDivider} />
                <Text style={styles.infoValue}>
                  {'-'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 간병 위치 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={16} color="#EF4444" /> 간병
            위치
          </Text>
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>
              {row?.location ?? '-'}
            </Text>
          </View>
        </View>

        {/* 간병 기간 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar-outline" size={16} color="#111827" /> 간병
            기간
          </Text>
          <View style={styles.periodCard}>
            <Text style={styles.periodText}>
              {row ? `${ymdDot(row.startDate)} ~ ${ymdDot(row.endDate)}` : '-'}
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 하단 CTA 버튼 (진행 중인 간병만 표시) */}
      {!isCompleted && (
        <View style={styles.buttonContainer}>
          <Button title="간병 일지 작성하기" onPress={handleWriteJournal} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#70737C29',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    gap: 20,
  },
  cardSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  patientCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0066FF',
  },
  patientCardCompleted: {
    borderColor: '#E5E7EB',
  },
  jobNumber: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  daysRemaining: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: '#37383C9C',
    width: 60,
  },
  verticalDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#70737C38',
    marginHorizontal: 8,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2E2F33E0',
  },
  locationCard: {
    // backgroundColor: '#F9FAFB',
    borderColor: '#70737C29',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#',
  },
  periodCard: {
    // backgroundColor: '#F9FAFB',
    borderColor: '#70737C29',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  periodText: {
    fontSize: 14,
    color: '#374151',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2F33E0',
    marginTop: 8,
    marginBottom: 12,
  },

  buttonContainer: {
    padding: 20,
  },
});
