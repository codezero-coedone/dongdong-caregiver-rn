import apiClient from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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

export default function JournalCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ matchId?: string }>();

  const matchId = useMemo(() => {
    const raw = params.matchId;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.matchId]);

  const todayYmd = (): string => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [date, setDate] = useState(todayYmd());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!matchId) {
      Alert.alert('오류', 'matchId가 없습니다. 매칭을 선택한 뒤 작성해 주세요.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('오류', '날짜는 YYYY-MM-DD 형식이어야 합니다.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/journals', {
        matchId,
        date,
        notes: notes.trim() ? notes.trim() : undefined,
      });
      const saved = unwrapData<JournalResponse>((res as any)?.data);
      const id = (saved as any)?.id;
      if (id) {
        router.replace(`/caregiving-journal/${String(id)}`);
        return;
      }
      router.back();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || '일지 작성에 실패했습니다.';
      Alert.alert('오류', String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
            <Text style={styles.hintText}>
              최소 입력: 날짜(YYYY-MM-DD) + 특이사항. 식사/활력징후는 추후 단계에서 확장 가능합니다.
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>매칭 ID</Text>
            <View style={styles.readonly}>
              <Text style={styles.readonlyText}>{matchId ?? '-'}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>날짜 *</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="2025-12-30"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              autoCapitalize="none"
            />
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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


