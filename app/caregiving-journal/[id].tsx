import apiClient from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MealRecord = {
  amount: 'NONE' | 'LITTLE' | 'HALF' | 'FULL';
  menu?: string;
  notes?: string;
};

type VitalSigns = {
  bloodPressure?: string;
  pulse?: number;
  temperature?: number;
  bloodSugar?: number;
};

type JournalDetail = {
  id: number;
  matchId: number;
  patientName: string;
  date: string;
  breakfast?: MealRecord;
  lunch?: MealRecord;
  dinner?: MealRecord;
  vitalSigns?: VitalSigns;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

function unwrapData<T>(resData: unknown): T {
  const anyRes = resData as any;
  if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
    return anyRes.data as T;
  }
  return anyRes as T;
}

export default function JournalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [row, setRow] = useState<JournalDetail | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await apiClient.get(`/journals/${id}`);
        const data = unwrapData<JournalDetail>((res as any)?.data);
        if (!alive) return;
        setRow(data ?? null);
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message || e?.message || '일지 조회에 실패했습니다.',
        );
        setRow(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const formatYmd = (iso: string | null | undefined): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };

  const MealBox = ({
    title,
    v,
  }: {
    title: string;
    v: MealRecord | undefined;
  }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardLine}>식사량: {v?.amount ?? 'NONE'}</Text>
      {!!v?.menu && <Text style={styles.cardLine}>메뉴: {v.menu}</Text>}
      {!!v?.notes && <Text style={styles.cardLine}>메모: {v.notes}</Text>}
      {!v && <Text style={styles.cardMuted}>기록 없음</Text>}
    </View>
  );

  const VitalBox = ({ v }: { v: VitalSigns | undefined }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>활력징후</Text>
      {v ? (
        <>
          <Text style={styles.cardLine}>혈압: {v.bloodPressure ?? '-'}</Text>
          <Text style={styles.cardLine}>맥박: {v.pulse ?? '-'}</Text>
          <Text style={styles.cardLine}>체온: {v.temperature ?? '-'}</Text>
          <Text style={styles.cardLine}>혈당: {v.bloodSugar ?? '-'}</Text>
        </>
      ) : (
        <Text style={styles.cardMuted}>기록 없음</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerRight: () =>
            row ? (
              <Pressable
                onPress={() =>
                  router.push(`/caregiving-journal/new?matchId=${row.matchId}`)
                }
                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Ionicons name="add" size={22} color="#2563EB" />
              </Pressable>
            ) : null,
        }}
      />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{String(error)}</Text>
          <Pressable onPress={() => router.replace(`/caregiving-journal/${id}`)}>
            <Text style={styles.retry}>다시 시도</Text>
          </Pressable>
        </View>
      ) : row ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>
              {row.patientName || '환자'} · {formatYmd(row.date)}
            </Text>
            <Text style={styles.headerSub}>match #{row.matchId}</Text>
          </View>

          <MealBox title="아침" v={row.breakfast} />
          <MealBox title="점심" v={row.lunch} />
          <MealBox title="저녁" v={row.dinner} />
          <VitalBox v={row.vitalSigns} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>특이사항</Text>
            <Text style={styles.cardLine}>{row.notes ?? '없음'}</Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.center}>
          <Text style={styles.cardMuted}>일지 데이터를 찾을 수 없습니다.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  headerBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  headerSub: { marginTop: 6, fontSize: 12, color: '#6B7280' },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#fff',
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 8 },
  cardLine: { color: '#111827', marginTop: 4, lineHeight: 18 },
  cardMuted: { color: '#6B7280', lineHeight: 18 },
  errorText: { color: '#B91C1C', textAlign: 'center', marginBottom: 10 },
  retry: { color: '#2563EB', fontWeight: '700' },
});


