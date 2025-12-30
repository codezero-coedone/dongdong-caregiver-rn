import apiClient from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MyMatch = {
  id: number;
  patientName: string;
  careType: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  dailyRate: number;
};

type JournalListItem = {
  id: number;
  date: string;
  breakfastAmount: string;
  lunchAmount: string;
  dinnerAmount: string;
  createdAt: string;
};

function unwrapData<T>(resData: unknown): T {
  const anyRes = resData as any;
  if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
    return anyRes.data as T;
  }
  return anyRes as T;
}

export default function CaregivingJournalHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MyMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [journalsLoading, setJournalsLoading] = useState(false);
  const [journals, setJournals] = useState<JournalListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const selectedMatch = useMemo(
    () => matches.find((m) => m.id === selectedMatchId) ?? null,
    [matches, selectedMatchId],
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await apiClient.get('/my/matches');
        const data = unwrapData<MyMatch[]>((res as any)?.data);
        if (!alive) return;
        setMatches(Array.isArray(data) ? data : []);
        setSelectedMatchId((prev) => {
          if (typeof prev === 'number') return prev;
          return Array.isArray(data) && data.length > 0 ? data[0].id : null;
        });
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message || e?.message || '매칭 목록 조회에 실패했습니다.',
        );
        setMatches([]);
        setSelectedMatchId(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedMatchId) {
      setJournals([]);
      return;
    }

    let alive = true;
    setJournalsLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await apiClient.get('/journals', {
          params: { matchId: selectedMatchId },
        });
        const data = unwrapData<JournalListItem[]>((res as any)?.data);
        if (!alive) return;
        setJournals(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ||
            e?.message ||
            '일지 목록 조회에 실패했습니다.',
        );
        setJournals([]);
      } finally {
        if (alive) setJournalsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedMatchId]);

  const formatYmd = (iso: string | null | undefined): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };

  const MatchChip = ({ m }: { m: MyMatch }) => {
    const active = m.id === selectedMatchId;
    return (
      <Pressable
        onPress={() => setSelectedMatchId(m.id)}
        style={[styles.matchChip, active && styles.matchChipActive]}
      >
        <Text style={[styles.matchChipTitle, active && styles.matchChipTitleActive]}>
          {m.patientName || '환자'} · #{m.id}
        </Text>
        <Text style={[styles.matchChipSub, active && styles.matchChipSubActive]}>
          {formatYmd(m.startDate)} ~ {formatYmd(m.endDate)}
        </Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>간병일지</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{String(error)}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>매칭 선택</Text>
          {matches.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.matchRow}>
                {matches.map((m) => (
                  <MatchChip key={m.id} m={m} />
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                아직 매칭이 없습니다. 공고에 지원하면 매칭이 생성되고 일지를 작성할 수 있습니다.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>일지 목록</Text>
            <Pressable
              disabled={!selectedMatchId}
              onPress={() =>
                router.push(
                  `/caregiving-journal/new?matchId=${String(selectedMatchId)}`,
                )
              }
              style={[
                styles.primaryButton,
                !selectedMatchId && styles.primaryButtonDisabled,
              ]}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.primaryButtonText}>작성</Text>
            </Pressable>
          </View>

          {journalsLoading ? (
            <View style={styles.centerSmall}>
              <ActivityIndicator size="small" color="#3B82F6" />
            </View>
          ) : journals.length > 0 ? (
            <View style={{ gap: 10 }}>
              {journals.map((j) => (
                <Pressable
                  key={j.id}
                  onPress={() => router.push(`/caregiving-journal/${j.id}`)}
                  style={styles.journalCard}
                >
                  <View style={styles.journalCardLeft}>
                    <Text style={styles.journalDate}>{formatYmd(j.date)}</Text>
                    <Text style={styles.journalMeta}>
                      아침 {j.breakfastAmount} · 점심 {j.lunchAmount} · 저녁 {j.dinnerAmount}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {selectedMatch ? '아직 작성된 일지가 없습니다.' : '매칭을 선택해 주세요.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerSmall: { paddingVertical: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12 },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchRow: { flexDirection: 'row', gap: 10, paddingRight: 10 },
  matchChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 160,
  },
  matchChipActive: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  matchChipTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  matchChipTitleActive: { color: '#1D4ED8' },
  matchChipSub: { marginTop: 4, fontSize: 12, color: '#6B7280' },
  matchChipSubActive: { color: '#2563EB' },
  journalCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  journalCardLeft: { flex: 1, paddingRight: 10 },
  journalDate: { fontSize: 15, fontWeight: '700', color: '#111827' },
  journalMeta: { marginTop: 6, fontSize: 12, color: '#6B7280' },
  emptyBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FAFAFA',
  },
  emptyText: { color: '#6B7280', lineHeight: 18 },
  errorBox: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  errorText: { color: '#B91C1C' },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  primaryButtonDisabled: { backgroundColor: '#93C5FD' },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
});


