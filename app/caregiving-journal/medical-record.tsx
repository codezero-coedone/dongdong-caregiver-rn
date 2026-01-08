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

type MedicalRecord = { types?: string[]; otherNotes?: string };
type JournalListItem = { id: number; date: string };
type JournalDetail = { id: number; medicalRecord?: MedicalRecord };

function unwrapData<T>(resData: unknown): T {
  const anyRes = resData as any;
  if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
    return anyRes.data as T;
  }
  return anyRes as T;
}

const MEDICAL_TYPES = ['주사', '약 복용', '병원 방문', '검사', '처치', '응급/특이사항'] as const;

export default function MedicalRecordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ matchId?: string; date?: string }>();

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

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [otherNotes, setOtherNotes] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!paramOk) {
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
        const rec = detail?.medicalRecord;
        if (!alive || !rec) return;
        setSelectedTypes(Array.isArray(rec.types) ? rec.types : []);
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
  }, [paramOk, matchId, date]);

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const canSave = selectedTypes.length > 0 || otherNotes.trim().length > 0;

  const onSave = async () => {
    if (!paramOk) {
      if (isDevtoolsEnabled()) {
        devlog({
          scope: 'NAV',
          level: 'warn',
          message: 'journal: medical-record invalid params',
          meta: { matchId: params.matchId, date: params.date },
        });
      }
      Alert.alert('진입 오류', '일지 화면 정보를 확인할 수 없습니다.\n이전 화면으로 돌아갑니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
      return;
    }
    if (!canSave) {
      Alert.alert('알림', '의료기록을 선택해주세요.');
      return;
    }

    const payload: MedicalRecord = {
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      otherNotes: otherNotes.trim() ? otherNotes.trim() : undefined,
    };

    setSubmitting(true);
    try {
      if (journalId) {
        await api.put(`/journals/${journalId}`, { matchId, date, medicalRecord: payload });
      } else {
        const res = await api.post('/journals', { matchId, date, medicalRecord: payload });
        const saved = unwrapData<any>((res as any)?.data);
        const id = saved?.id;
        if (typeof id === 'number') setJournalId(id);
      }
      Alert.alert('저장 완료', '의료기록이 저장되었습니다.', [
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
          <Text style={styles.sectionTitle}>오늘의 의료기록</Text>

          {MEDICAL_TYPES.map((t) => {
            const checked = selectedTypes.includes(t);
            return (
              <Pressable key={t} style={styles.checkRow} onPress={() => toggleType(t)}>
                <View style={[styles.checkCircle, checked && styles.checkCircleChecked]}>
                  {checked && <View style={styles.checkDot} />}
                </View>
                <Text style={styles.checkLabel}>{t}</Text>
              </Pressable>
            );
          })}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>기타 사항</Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              value={otherNotes}
              onChangeText={setOtherNotes}
              style={styles.textArea}
              placeholder="전달사항 혹은 기타 특이 사항을 작성해주세요."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <View style={styles.textAreaFooter}>
              <Text style={styles.counterText}>{otherNotes.length}/500</Text>
              <Text style={styles.inputLabel}>입력</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={onSave}
            disabled={!canSave || submitting}
            style={[styles.saveButton, (!canSave || submitting) && styles.saveButtonDisabled]}
          >
            <Text style={[styles.saveButtonText, (!canSave || submitting) && styles.saveButtonTextDisabled]}>
              저장하기
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
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

  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleChecked: { borderColor: '#2563EB' },
  checkDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563EB' },
  checkLabel: { fontSize: 16, color: '#111827' },

  textAreaWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  textArea: { minHeight: 110, fontSize: 16, color: '#111827', textAlignVertical: 'top' },
  textAreaFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  counterText: { fontSize: 13, color: '#9CA3AF' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#2563EB' },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#fff' },
  saveButton: { backgroundColor: '#2563EB', paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  saveButtonDisabled: { backgroundColor: '#E5E7EB' },
  saveButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  saveButtonTextDisabled: { color: '#9CA3AF' },
});


