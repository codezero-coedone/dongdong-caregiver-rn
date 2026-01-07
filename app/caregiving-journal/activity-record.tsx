import api from '@/services/apiClient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Status = 'caution' | 'normal' | 'good';
type ActivityRecord = { exercise?: Status; sleep?: Status; otherNotes?: string };
type JournalListItem = { id: number; date: string };
type JournalDetail = { id: number; activityRecord?: ActivityRecord };

function unwrapData<T>(resData: unknown): T {
  const anyRes = resData as any;
  if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
    return anyRes.data as T;
  }
  return anyRes as T;
}

const STATUS_OPTIONS: { label: string; value: Status }[] = [
  { label: '주의', value: 'caution' },
  { label: '보통', value: 'normal' },
  { label: '양호', value: 'good' },
];

const SegmentedControl = ({
  value,
  onChange,
}: {
  value: Status;
  onChange: (v: Status) => void;
}) => (
  <View style={styles.segmentWrapper}>
    {STATUS_OPTIONS.map((opt, idx) => {
      const selected = value === opt.value;
      return (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[
            styles.segmentItem,
            selected && styles.segmentItemSelected,
            idx === 0 && styles.segmentItemFirst,
            idx === STATUS_OPTIONS.length - 1 && styles.segmentItemLast,
          ]}
        >
          <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
            {opt.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export default function ActivityRecordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ matchId?: string; date?: string }>();

  const matchId = useMemo(() => {
    const raw = params.matchId;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.matchId]);
  const date = useMemo(() => String(params.date || ''), [params.date]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [journalId, setJournalId] = useState<number | null>(null);

  const [exercise, setExercise] = useState<Status>('caution');
  const [sleep, setSleep] = useState<Status>('caution');
  const [otherNotes, setOtherNotes] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!matchId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        if (!alive) return;
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const listRes = await api.get('/journals', { params: { matchId } });
        const list = unwrapData<JournalListItem[]>((listRes as any)?.data);
        const found = Array.isArray(list) ? list.find((r) => r.date === date) : undefined;
        if (!found) {
          if (!alive) return;
          setJournalId(null);
          return;
        }
        setJournalId(found.id);
        const detailRes = await api.get(`/journals/${found.id}`);
        const detail = unwrapData<JournalDetail>((detailRes as any)?.data);
        const rec = detail?.activityRecord;
        if (!alive || !rec) return;
        setExercise(rec.exercise ?? 'caution');
        setSleep(rec.sleep ?? 'caution');
        setOtherNotes(rec.otherNotes ?? '');
      } catch {
        // ignore
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [matchId, date]);

  const onSave = async () => {
    if (!matchId) {
      Alert.alert('오류', 'matchId가 없습니다.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('오류', 'date가 없습니다.');
      return;
    }

    const payload: ActivityRecord = {
      exercise,
      sleep,
      otherNotes: otherNotes.trim() ? otherNotes.trim() : undefined,
    };

    setSubmitting(true);
    try {
      if (journalId) {
        await api.put(`/journals/${journalId}`, { matchId, date, activityRecord: payload });
      } else {
        const res = await api.post('/journals', { matchId, date, activityRecord: payload });
        const saved = unwrapData<any>((res as any)?.data);
        const id = saved?.id;
        if (typeof id === 'number') setJournalId(id);
      }
      Alert.alert('저장 완료', '활동 기록이 저장되었습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '저장에 실패했습니다.';
      Alert.alert('오류', String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={{ color: '#6B7280' }}>불러오는 중…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>활동 기록</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>운동</Text>
            <SegmentedControl value={exercise} onChange={setExercise} />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>수면</Text>
            <SegmentedControl value={sleep} onChange={setSleep} />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>기타 사항</Text>
            <TextInput
              value={otherNotes}
              onChangeText={setOtherNotes}
              style={[styles.input, styles.textArea]}
              placeholder="전달사항 혹은 기타 특이 사항을 작성해주세요."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <Text style={styles.counter}>{otherNotes.length}/500</Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={onSave}
            disabled={submitting}
            style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>{submitting ? '저장 중…' : '저장하기'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#000000', marginBottom: 20 },

  field: { marginBottom: 28 },
  fieldLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },

  segmentWrapper: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  segmentItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segmentItemFirst: {},
  segmentItemLast: {},
  segmentItemSelected: { backgroundColor: '#EFF6FF', borderColor: '#7AA2F7' },
  segmentText: { fontSize: 18, fontWeight: '600', color: '#8B8B8B' },
  segmentTextSelected: { color: '#2563EB' },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  counter: { marginTop: 8, fontSize: 12, color: '#9CA3AF', textAlign: 'right' },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#fff' },
  saveButton: { backgroundColor: '#2563EB', paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  saveButtonDisabled: { backgroundColor: '#93C5FD' },
  saveButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});


