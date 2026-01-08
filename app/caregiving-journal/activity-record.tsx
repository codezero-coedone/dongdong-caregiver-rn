import api from '@/services/apiClient';
import { devlog, isDevtoolsEnabled } from '@/services/devlog';
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
  const params = useLocalSearchParams<{ matchId?: string; date?: string; journalId?: string; hasJournal?: string }>();

  const matchId = useMemo(() => {
    const raw = params.matchId;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.matchId]);
  const date = useMemo(() => String(params.date || ''), [params.date]);
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const paramOk = Boolean(matchId && dateOk);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [journalId, setJournalId] = useState<number | null>(null);

  const journalIdParam = useMemo(() => {
    const raw = params.journalId;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.journalId]);

  const hasJournalParam = useMemo(() => {
    const raw = params.hasJournal;
    if (raw === '1') return true;
    if (raw === '0') return false;
    return null;
  }, [params.hasJournal]);

  const [exercise, setExercise] = useState<Status>('caution');
  const [sleep, setSleep] = useState<Status>('caution');
  const [otherNotes, setOtherNotes] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!paramOk) {
        if (!alive) return;
        setLoading(false);
        return;
      }
      // If home already knows "no journal for this day", skip list/detail prefetch (network 0).
      if (hasJournalParam === false) {
        if (!alive) return;
        setJournalId(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Prefer journalId passed from home to avoid list fetch duplication.
        let idToFetch: number | null = journalIdParam;
        if (!idToFetch) {
          const listRes = await api.get('/journals', { params: { matchId } });
          const list = unwrapData<JournalListItem[]>((listRes as any)?.data);
          const found = Array.isArray(list) ? list.find((r) => r.date === date) : undefined;
          if (!found) {
            if (!alive) return;
            setJournalId(null);
            return;
          }
          idToFetch = found.id;
        }

        if (!idToFetch) return;
        if (alive) setJournalId(idToFetch);
        const detailRes = await api.get(`/journals/${idToFetch}`);
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
  }, [paramOk, matchId, date, journalIdParam, hasJournalParam]);

  const onSave = async () => {
    if (submitting) return;
    if (!paramOk) {
      if (isDevtoolsEnabled()) {
        devlog({
          scope: 'NAV',
          level: 'warn',
          message: 'journal: activity-record invalid params',
          meta: { matchId: params.matchId, date: params.date },
        });
      }
      Alert.alert('진입 오류', '일지 화면 정보를 확인할 수 없습니다.\n이전 화면으로 돌아갑니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
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
      const status = e?.response?.status;
      if (status === 409) {
        Alert.alert('수정 불가', '간병 시간이 종료되어 더 이상 수정할 수 없습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
        return;
      }
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

  if (!paramOk) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
            일지 화면을 열 수 없습니다
          </Text>
          <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 16 }}>
            진입 정보가 확인되지 않습니다.{'\n'}이전 화면으로 돌아가 다시 시도해주세요.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
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
  backBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: { color: '#fff', fontWeight: '700' },
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


