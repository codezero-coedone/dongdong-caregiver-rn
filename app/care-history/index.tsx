import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CareHistoryCard, {
  CareRecord,
} from '../../components/care/CareHistoryCard';
import { fetchMyMatches, type ApiMyMatch } from '@/services/careHistoryService';
import { devlog, isDevtoolsEnabled } from '@/services/devlog';
import { useAuthStore } from '@/store/authStore';

const DEVTOOLS_ENABLED = isDevtoolsEnabled();

function fmtYmd(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function periodLabel(start: string | null | undefined, end: string | null | undefined): string {
  return `${fmtYmd(start)} ~ ${fmtYmd(end)}`;
}

function genderLabel(v: string | null | undefined): string {
  const s = String(v || '').toUpperCase();
  if (s === 'MALE' || s === 'M') return '남';
  if (s === 'FEMALE' || s === 'F') return '여';
  return s || '-';
}

function daysRemaining(endIso: string | null | undefined): number | undefined {
  if (!endIso) return undefined;
  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) return undefined;
  const diffMs = end.getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

function buildTags(m: ApiMyMatch): string[] {
  const out: string[] = [];
  if (m.patientDiagnosis) out.push(String(m.patientDiagnosis));
  if (m.patientMobilityLevel) out.push(String(m.patientMobilityLevel));
  if (Array.isArray(m.patientAssistiveDevices)) {
    for (const t of m.patientAssistiveDevices) {
      const s = String(t || '').trim();
      if (s) out.push(s);
    }
  }
  return out.slice(0, 3);
}

function toOngoingRecord(m: ApiMyMatch): CareRecord {
  return {
    id: String(m.id),
    patient: {
      name: String(m.patientName || ''),
      age: Number(m.patientAge ?? 0),
      gender: genderLabel(m.patientGender),
    },
    tags: buildTags(m),
    period: periodLabel(m.startDate, m.endDate),
    diagnosis: m.patientDiagnosis ? String(m.patientDiagnosis) : undefined,
    status: 'ongoing',
    daysRemaining: daysRemaining(m.endDate),
  };
}

function toPastRecord(m: ApiMyMatch): CareRecord {
  return {
    id: String(m.id),
    jobNumber: String(m.id),
    patient: {
      name: String(m.patientName || ''),
      age: Number(m.patientAge ?? 0),
      gender: genderLabel(m.patientGender),
    },
    tags: buildTags(m),
    period: periodLabel(m.startDate, m.endDate),
    address: m.location ? String(m.location) : undefined,
    status: 'completed',
  };
}

export default function CareHistoryScreen() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isAuthenticated);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<ApiMyMatch[]>([]);

  React.useEffect(() => {
    let alive = true;
    if (!isLoggedIn) {
      setMatches([]);
      return () => {
        alive = false;
      };
    }
    setLoading(true);
    (async () => {
      try {
        const rows = await fetchMyMatches();
        if (!alive) return;
        setMatches(rows);
      } catch (e: any) {
        if (!alive) return;
        setMatches([]);
        if (DEVTOOLS_ENABLED) {
          devlog({ scope: 'API', level: 'warn', message: `care-history fetch failed: ${String(e?.message || e)}` });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  const ongoingMatch =
    matches.find((m) => String(m.status) === 'IN_PROGRESS') ??
    null;

  const pastMatches = matches.filter((m) => String(m.status) === 'COMPLETED');

  const filteredRecords = pastMatches
    .map(toPastRecord)
    .filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.patient.name.toLowerCase().includes(query) ||
      record.jobNumber?.toLowerCase().includes(query)
    );
  });

  const handleDetailPress = (record: CareRecord) => {
    console.log('Detail pressed:', record.id);
    router.push(`/care-history/detail?type=completed&matchId=${encodeURIComponent(record.id)}`);
  };

  const handleWriteJournalPress = () => {
    if (!ongoingMatch) return;
    const today = (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();
    router.push(`/caregiving-journal?matchId=${encodeURIComponent(String(ongoingMatch.id))}&date=${encodeURIComponent(today)}`);
  };

  const handleViewOngoingDetail = () => {
    if (!ongoingMatch) return;
    router.push(`/care-history/detail?type=ongoing&matchId=${encodeURIComponent(String(ongoingMatch.id))}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>간병내역</Text>

        <View style={{ width: 24 }} />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
      >
        {/* 진행 중인 간병 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>진행 중인 간병</Text>
            <TouchableOpacity
              style={styles.detailLink}
              onPress={handleViewOngoingDetail}
              disabled={!ongoingMatch}
            >
              <Text style={styles.detailLinkText}>상세보기</Text>
              <Ionicons name="chevron-forward" size={16} color="#37383C9C" />
            </TouchableOpacity>
          </View>

          {ongoingMatch ? (
            <CareHistoryCard
              record={toOngoingRecord(ongoingMatch)}
              variant="ongoing"
              onWriteJournalPress={handleWriteJournalPress}
            />
          ) : (
            <Text style={styles.emptyText}>
              {loading ? '불러오는 중…' : '진행 중인 간병이 없습니다.'}
            </Text>
          )}
        </View>

        {/* 과거 간병 내역 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>과거 간병 내역</Text>

          {/* 검색 입력창 */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#171719" />
            <TextInput
              style={styles.searchInput}
              placeholder="환자명 혹은 공고번호 검색하기"
              placeholderTextColor="#37383C47"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* 총 건수 */}
          <Text style={styles.totalCount}>총 {filteredRecords.length}건</Text>

          {/* 간병 카드 리스트 */}
          {filteredRecords.map((record) => (
            <CareHistoryCard
              key={record.id}
              record={record}
              variant="history"
              onDetailPress={() => handleDetailPress(record)}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 20,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37383C9C',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#70737C29',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  totalCount: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    paddingVertical: 8,
  },
});
