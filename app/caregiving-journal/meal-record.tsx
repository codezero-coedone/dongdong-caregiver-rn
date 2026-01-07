import api from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
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
type CountNote = { count: number; tags?: string[]; note?: string };
type MealRecord = {
  status?: Status;
  mealType?: string;
  urination?: CountNote;
  bowelMovement?: CountNote;
  diaperUsage?: number;
  mobility?: string;
  careNotes?: string;
};

type JournalListItem = { id: number; date: string };
type JournalDetail = {
  id: number;
  breakfast?: MealRecord;
  lunch?: MealRecord;
  dinner?: MealRecord;
};

function unwrapData<T>(resData: unknown): T {
  const anyRes = resData as any;
  if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
    return anyRes.data as T;
  }
  return anyRes as T;
}

const MEAL_TYPES = ['일반식', '죽', '유동식'] as const;
const URINATION_TAGS = ['붉은색', '거품', '냄새'] as const;
const MOBILITY_OPTIONS = ['자가 보행', '보행도움', '휠체어', '침상 안정'] as const;

function statusLabel(s: Status): string {
  if (s === 'caution') return '주의';
  if (s === 'normal') return '보통';
  return '양호';
}

function statusFromLabel(label: string): Status {
  if (label === '주의') return 'caution';
  if (label === '보통') return 'normal';
  return 'good';
}

export default function MealRecordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    matchId?: string;
    date?: string;
    time?: 'morning' | 'lunch' | 'dinner';
  }>();

  const matchId = useMemo(() => {
    const raw = params.matchId;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [params.matchId]);

  const date = useMemo(() => String(params.date || ''), [params.date]);
  const mealTime = (params.time || 'morning') as 'morning' | 'lunch' | 'dinner';

  const mealKey = useMemo(() => {
    if (mealTime === 'morning') return 'breakfast' as const;
    if (mealTime === 'lunch') return 'lunch' as const;
    return 'dinner' as const;
  }, [mealTime]);

  const mealTitle = useMemo(() => {
    if (mealTime === 'morning') return '아침';
    if (mealTime === 'lunch') return '점심';
    return '저녁';
  }, [mealTime]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [journalId, setJournalId] = useState<number | null>(null);

  const [status, setStatus] = useState<Status>('caution');
  const [mealType, setMealType] = useState<string>('');

  const [urinationCount, setUrinationCount] = useState(0);
  const [urinationTags, setUrinationTags] = useState<string[]>([]);
  const [urinationDirect, setUrinationDirect] = useState('');

  const [bowelCount, setBowelCount] = useState(0);
  const [bowelNote, setBowelNote] = useState('');

  const [diaperUsed, setDiaperUsed] = useState(false);
  const [diaperCount, setDiaperCount] = useState(0);

  const [moved, setMoved] = useState(false);
  const [mobility, setMobility] = useState<string>('');

  const [careNotes, setCareNotes] = useState('');

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
        const existing = (detail as any)?.[mealKey] as MealRecord | undefined;
        if (!existing || !alive) return;

        setStatus(existing.status ?? 'caution');
        setMealType(existing.mealType ?? '');
        setUrinationCount(existing.urination?.count ?? 0);
        setUrinationTags(Array.isArray(existing.urination?.tags) ? (existing.urination?.tags as any) : []);
        setUrinationDirect(existing.urination?.note ?? '');
        setBowelCount(existing.bowelMovement?.count ?? 0);
        setBowelNote(existing.bowelMovement?.note ?? '');

        const du = existing.diaperUsage;
        setDiaperUsed(typeof du === 'number' && du > 0);
        setDiaperCount(typeof du === 'number' ? du : 0);

        setMoved(!!existing.mobility);
        setMobility(existing.mobility ?? '');
        setCareNotes(existing.careNotes ?? '');
      } catch {
        // ignore; user can still fill and save
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [matchId, date, mealKey]);

  const toggleTag = (t: string) => {
    setUrinationTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const onSave = async () => {
    if (!matchId) {
      Alert.alert('오류', 'matchId가 없습니다.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('오류', 'date가 없습니다.');
      return;
    }
    if (!mealType) {
      Alert.alert('알림', '식사를 선택해주세요.');
      return;
    }

    const urination: CountNote = {
      count: urinationCount,
      tags: urinationTags.length > 0 ? urinationTags : undefined,
      note: urinationDirect.trim() ? urinationDirect.trim() : undefined,
    };
    const bowelMovement: CountNote = {
      count: bowelCount,
      note: bowelNote.trim() ? bowelNote.trim() : undefined,
    };

    const payload: MealRecord = {
      status,
      mealType,
      urination,
      bowelMovement,
      diaperUsage: diaperUsed ? diaperCount : undefined,
      mobility: moved ? (mobility || undefined) : undefined,
      careNotes: careNotes.trim() ? careNotes.trim() : undefined,
    };

    setSubmitting(true);
    try {
      if (journalId) {
        await api.put(`/journals/${journalId}`, {
          matchId,
          date,
          [mealKey]: payload,
        });
      } else {
        const res = await api.post('/journals', {
          matchId,
          date,
          [mealKey]: payload,
        });
        const saved = unwrapData<any>((res as any)?.data);
        const id = saved?.id;
        if (typeof id === 'number') setJournalId(id);
      }
      Alert.alert('저장 완료', `${mealTitle} 기록이 저장되었습니다.`, [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || '저장에 실패했습니다.';
      Alert.alert('오류', String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const Chip = ({
    label,
    selected,
    onPress,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );

  const Segmented = ({
    value,
    onChange,
  }: {
    value: Status;
    onChange: (v: Status) => void;
  }) => (
    <View style={styles.segment}>
      {(['주의', '보통', '양호'] as const).map((label) => {
        const v = statusFromLabel(label);
        const selected = value === v;
        return (
          <Pressable
            key={label}
            onPress={() => onChange(v)}
            style={[styles.segmentItem, selected && styles.segmentItemSelected]}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>{mealTitle}</Text>

          <Text style={styles.sectionTitle}>환자 상태</Text>
          <Segmented value={status} onChange={setStatus} />

          <Text style={styles.sectionTitle}>식사</Text>
          <View style={styles.rowWrap}>
            {MEAL_TYPES.map((t) => (
              <Chip key={t} label={t} selected={mealType === t} onPress={() => setMealType(t)} />
            ))}
          </View>

          <Text style={styles.sectionTitle}>소변</Text>
          <View style={styles.counterRow}>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setUrinationCount(Math.max(0, urinationCount - 1))}
            >
              <Ionicons name="remove" size={18} color="#111827" />
            </Pressable>
            <Text style={styles.counterVal}>{urinationCount}회</Text>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setUrinationCount(urinationCount + 1)}
            >
              <Ionicons name="add" size={18} color="#111827" />
            </Pressable>
          </View>
          <View style={styles.rowWrap}>
            {URINATION_TAGS.map((t) => (
              <Chip key={t} label={t} selected={urinationTags.includes(t)} onPress={() => toggleTag(t)} />
            ))}
            <Chip
              label="직접 입력"
              selected={!!urinationDirect.trim()}
              onPress={() => {}}
            />
          </View>
          <TextInput
            value={urinationDirect}
            onChangeText={setUrinationDirect}
            style={styles.inputInline}
            placeholder="직접 입력해주세요."
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.sectionTitle}>대변량</Text>
          <View style={styles.counterRow}>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setBowelCount(Math.max(0, bowelCount - 1))}
            >
              <Ionicons name="remove" size={18} color="#111827" />
            </Pressable>
            <Text style={styles.counterVal}>{bowelCount}회</Text>
            <Pressable
              style={styles.counterBtn}
              onPress={() => setBowelCount(bowelCount + 1)}
            >
              <Ionicons name="add" size={18} color="#111827" />
            </Pressable>
          </View>
          <TextInput
            value={bowelNote}
            onChangeText={setBowelNote}
            style={styles.inputInline}
            placeholder="메모 (예: 설사)"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.sectionTitle}>기저귀 사용량</Text>
          <View style={styles.segment2}>
            <Pressable
              onPress={() => {
                setDiaperUsed(false);
                setDiaperCount(0);
              }}
              style={[styles.segment2Item, !diaperUsed && styles.segment2ItemSelected]}
            >
              <Text style={[styles.segment2Text, !diaperUsed && styles.segment2TextSelected]}>
                사용 안함
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDiaperUsed(true)}
              style={[styles.segment2Item, diaperUsed && styles.segment2ItemSelected]}
            >
              <Text style={[styles.segment2Text, diaperUsed && styles.segment2TextSelected]}>
                사용함
              </Text>
            </Pressable>
          </View>
          {diaperUsed && (
            <View style={styles.counterRow}>
              <Pressable
                style={styles.counterBtn}
                onPress={() => setDiaperCount(Math.max(0, diaperCount - 1))}
              >
                <Ionicons name="remove" size={18} color="#111827" />
              </Pressable>
              <Text style={styles.counterVal}>{diaperCount}회</Text>
              <Pressable
                style={styles.counterBtn}
                onPress={() => setDiaperCount(diaperCount + 1)}
              >
                <Ionicons name="add" size={18} color="#111827" />
              </Pressable>
            </View>
          )}

          <Text style={styles.sectionTitle}>이동</Text>
          <View style={styles.segment2}>
            <Pressable
              onPress={() => {
                setMoved(false);
                setMobility('');
              }}
              style={[styles.segment2Item, !moved && styles.segment2ItemSelected]}
            >
              <Text style={[styles.segment2Text, !moved && styles.segment2TextSelected]}>
                이동하지 않음
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMoved(true)}
              style={[styles.segment2Item, moved && styles.segment2ItemSelected]}
            >
              <Text style={[styles.segment2Text, moved && styles.segment2TextSelected]}>
                이동함
              </Text>
            </Pressable>
          </View>
          {moved && (
            <View style={styles.rowWrap}>
              {MOBILITY_OPTIONS.map((o) => (
                <Chip key={o} label={o} selected={mobility === o} onPress={() => setMobility(o)} />
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>특이 사항</Text>
          <View style={styles.textAreaBox}>
            <TextInput
              value={careNotes}
              onChangeText={setCareNotes}
              style={styles.textArea}
              placeholder="기타 특이 사항을 입력하세요."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
            />
            <View style={styles.textAreaFooter}>
              <Text style={styles.counterText}>{careNotes.length}/500</Text>
              <Text style={styles.inputHint}>텍스트</Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            disabled={submitting}
            onPress={onSave}
            style={[styles.saveBtn, submitting && styles.saveBtnDisabled]}
          >
            <Text style={styles.saveText}>{submitting ? '저장 중…' : '저장하기'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },

  pageTitle: { fontSize: 18, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 18, marginBottom: 10 },

  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  segmentItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  segmentItemSelected: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  segmentText: { fontWeight: '700', color: '#6B7280' },
  segmentTextSelected: { color: '#2563EB' },

  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  chipSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  chipText: { color: '#111827', fontWeight: '700' },
  chipTextSelected: { color: '#2563EB' },

  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  counterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterVal: { fontSize: 16, fontWeight: '800', color: '#111827' },

  inputInline: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111827',
  },

  segment2: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  segment2Item: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  segment2ItemSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  segment2Text: { fontWeight: '800', color: '#6B7280' },
  segment2TextSelected: { color: '#2563EB' },

  textAreaBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 110, color: '#111827', fontSize: 15, textAlignVertical: 'top' },
  textAreaFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  counterText: { color: '#9CA3AF', fontSize: 12 },
  inputHint: { color: '#2563EB', fontWeight: '700' },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#fff' },
  saveBtn: { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#93C5FD' },
  saveText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});


