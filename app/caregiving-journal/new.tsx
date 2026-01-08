import apiClient from '@/services/apiClient';
import { devlog, isDevtoolsEnabled } from '@/services/devlog';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
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

function unwrapData<T>(resData: unknown): T {
  const anyRes = resData as any;
  if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
    return anyRes.data as T;
  }
  return anyRes as T;
}

type JournalResponse = {
  id: number;
  matchId: number;
  date: string;
  notes?: string;
};

type JournalListItem = { id: number; date: string };

export default function JournalCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ matchId?: string; date?: string }>();

  const matchId = useMemo(() => {
    const raw = params.matchId;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.matchId]);

  const fixedDateParam = useMemo(() => {
    const raw = params.date;
    if (typeof raw !== 'string') return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
  }, [params.date]);

  const todayYmd = (): string => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [date, setDate] = useState(fixedDateParam ?? todayYmd());
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const matchIdOk = matchId != null;
  const devtools = isDevtoolsEnabled();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [journalId, setJournalId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!matchIdOk || !dateOk) {
        if (!alive) return;
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const listRes = await apiClient.get('/journals', { params: { matchId } });
        const list = unwrapData<JournalListItem[]>((listRes as any)?.data);
        const found = Array.isArray(list) ? list.find((r) => r.date === date) : undefined;
        if (!found) {
          if (!alive) return;
          setJournalId(null);
          setNotes('');
          return;
        }
        if (!alive) return;
        setJournalId(found.id);
        const detailRes = await apiClient.get(`/journals/${found.id}`);
        const detail = unwrapData<any>((detailRes as any)?.data);
        const existingNotes = typeof detail?.notes === 'string' ? detail.notes : '';
        if (!alive) return;
        setNotes(existingNotes);
      } catch {
        // ignore; user can still write and save
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [matchIdOk, dateOk, matchId, date]);

  const onSubmit = async () => {
    if (!matchIdOk) {
      if (devtools) {
        devlog({
          scope: 'NAV',
          level: 'warn',
          message: 'journal: notes missing matchId',
          meta: { matchId: params.matchId, date: params.date },
        });
      }
      Alert.alert('진입 오류', '선택된 환자가 없습니다.\n이전 화면에서 다시 선택해주세요.', [
        { text: '확인', onPress: () => router.back() },
      ]);
      return;
    }
    if (!dateOk) {
      if (devtools) {
        devlog({
          scope: 'NAV',
          level: 'warn',
          message: 'journal: notes invalid date',
          meta: { date },
        });
      }
      Alert.alert('날짜 확인', '날짜 형식을 확인해주세요.\n예) 2026-01-08');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        matchId,
        date,
        notes: notes.trim() ? notes.trim() : undefined,
      };

      if (journalId) {
        await apiClient.put(`/journals/${journalId}`, payload);
      } else {
        try {
          const res = await apiClient.post('/journals', payload);
          const saved = unwrapData<JournalResponse>((res as any)?.data);
          const id = (saved as any)?.id;
          if (typeof id === 'number') setJournalId(id);
        } catch (e: any) {
          const status = e?.response?.status;
          // If a journal already exists for (matchId, date), fall back to PUT.
          if (status === 409) {
            const listRes = await apiClient.get('/journals', { params: { matchId } });
            const list = unwrapData<JournalListItem[]>((listRes as any)?.data);
            const found = Array.isArray(list) ? list.find((r) => r.date === date) : undefined;
            const existingId = found?.id;
            if (typeof existingId === 'number') {
              setJournalId(existingId);
              await apiClient.put(`/journals/${existingId}`, payload);
            } else {
              throw e;
            }
          } else {
            throw e;
          }
        }
      }

      Alert.alert('저장 완료', '특이사항이 저장되었습니다.', [
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
      const msg =
        e?.response?.data?.message || e?.message || '일지 작성에 실패했습니다.';
      Alert.alert('오류', String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
            <Text style={styles.hintText}>
              특이사항(메모)을 작성합니다. (식사/의료/활동은 각각의 카드에서 작성)
            </Text>
          </View>

          {devtools && (
            <View style={styles.field}>
              <Text style={styles.label}>매칭 ID (DBG)</Text>
              <View style={styles.readonly}>
                <Text style={styles.readonlyText}>{matchId ?? '-'}</Text>
              </View>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>날짜 *</Text>
            {fixedDateParam ? (
              <View style={styles.readonly}>
                <Text style={styles.readonlyText}>{date}</Text>
              </View>
            ) : (
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="2025-12-30"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                autoCapitalize="none"
              />
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>특이사항</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="환자 상태/주의사항/메모"
              placeholderTextColor="#9CA3AF"
              style={[styles.input, styles.textarea]}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.counter}>{notes.length}/500</Text>
          </View>

          <Pressable
            disabled={submitting}
            onPress={onSubmit}
            style={[styles.submit, submitting && styles.submitDisabled]}
          >
            <Text style={styles.submitText}>
              {submitting ? '저장 중…' : '저장'}
            </Text>
          </Pressable>
        </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  hintBox: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  hintText: { flex: 1, color: '#1D4ED8', lineHeight: 18 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#111827',
  },
  textarea: { minHeight: 120 },
  counter: { marginTop: 6, fontSize: 12, color: '#9CA3AF', textAlign: 'right' },
  readonly: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  readonlyText: { color: '#111827', fontWeight: '600' },
  submit: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: { backgroundColor: '#93C5FD' },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});


