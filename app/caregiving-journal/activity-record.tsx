import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  DimensionValue,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJournalStore, type ActivityRecord } from '../../store/journalStore';

/* =========================
   타입
========================= */
type StatusType = 'caution' | 'normal' | 'good';

const STATUS_OPTIONS: { label: string; value: StatusType }[] = [
  { label: '주의', value: 'caution' },
  { label: '보통', value: 'normal' },
  { label: '양호', value: 'good' },
];

/* =========================
   공통 세그먼트 컴포넌트
========================= */
const SegmentedControl = ({
  value,
  onChange,
}: {
  value: StatusType;
  onChange: (v: StatusType) => void;
}) => {
  const selectedIndex = STATUS_OPTIONS.findIndex((opt) => opt.value === value);

  const segmentWidth = `${100 / STATUS_OPTIONS.length}%` as DimensionValue;
  const segmentLeft = `${
    (100 / STATUS_OPTIONS.length) * selectedIndex
  }%` as DimensionValue;

  return (
    <View style={styles.segmentWrapper}>
      <View
        pointerEvents="none"
        style={[
          styles.segmentActive,
          {
            width: segmentWidth,
            left: segmentLeft,
            borderTopLeftRadius: selectedIndex === 0 ? 12 : 0,
            borderBottomLeftRadius: selectedIndex === 0 ? 12 : 0,
            borderTopRightRadius:
              selectedIndex === STATUS_OPTIONS.length - 1 ? 12 : 0,
            borderBottomRightRadius:
              selectedIndex === STATUS_OPTIONS.length - 1 ? 12 : 0,
          },
        ]}
      />

      {/* 버튼 */}
      {STATUS_OPTIONS.map((opt, index) => (
        <TouchableOpacity
          key={opt.value}
          style={styles.segmentItem}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              value === opt.value && styles.segmentTextSelected,
            ]}
          >
            {opt.label}
          </Text>

          {/* divider */}
          {index !== STATUS_OPTIONS.length - 1 && (
            <View style={styles.segmentDivider} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

/* =========================
   화면
========================= */
export default function ActivityRecordScreen() {
  const router = useRouter();
  const { currentPatient, selectedDate, saveActivityRecord, entries } =
    useJournalStore();

  const existingEntry = entries.find(
    (e) => e.date === selectedDate && e.patientId === currentPatient?.id,
  );
  const existingRecord = existingEntry?.activityRecord;

  const [exercise, setExercise] = useState<StatusType>(
    existingRecord?.exercise ?? 'caution',
  );
  const [sleep, setSleep] = useState<StatusType>(
    existingRecord?.sleep ?? 'caution',
  );
  const [otherNotes, setOtherNotes] = useState(
    existingRecord?.otherNotes || '',
  );

  const handleSave = () => {
    if (!currentPatient) {
      Alert.alert('알림', '환자 정보가 없습니다.');
      return;
    }

    const record: ActivityRecord = {
      exercise,
      sleep,
      otherNotes: otherNotes || undefined,
    };

    saveActivityRecord(selectedDate, currentPatient.id, record);
    Alert.alert('저장 완료', '활동 기록이 저장되었습니다.', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>활동 기록</Text>

        {/* 운동 */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>운동</Text>
          <SegmentedControl value={exercise} onChange={setExercise} />
        </View>

        {/* 수면 */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>수면</Text>
          <SegmentedControl value={sleep} onChange={setSleep} />
        </View>

        {/* 기타 사항 */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>기타 사항</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="전달사항 혹은 기타 특이 사항을 작성해주세요."
            placeholderTextColor="#9CA3AF"
            multiline
            value={otherNotes}
            onChangeText={setOtherNotes}
          />
          <Text style={styles.counter}>{otherNotes.length}/500</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 저장 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>저장하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* =========================
   스타일
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  field: {
    marginBottom: 28,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  /* ===== 세그먼트 ===== */
  segmentWrapper: {
    flexDirection: 'row',
    position: 'relative',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  segmentActive: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#7AA2F7',
  },

  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  segmentText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B8B8B',
  },

  segmentTextSelected: {
    color: '#2563EB',
  },

  segmentDivider: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E5E7EB',
  },

  /* ===== 입력 ===== */
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  counter: {
    marginTop: 6,
    fontSize: 13,
    color: '#9CA3AF',
  },

  /* ===== 하단 ===== */
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
