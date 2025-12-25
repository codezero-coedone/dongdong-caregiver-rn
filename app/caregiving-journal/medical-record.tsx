import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJournalStore } from '../../store/journalStore';

// 의료 기록 타입 목록
const MEDICAL_TYPES = [
  '주사',
  '약 복용',
  '병원 방문',
  '검사',
  '처치',
  '응급/특이사항',
];

// 체크 Row 컴포넌트
const CheckRow = ({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.checkRow} onPress={onPress}>
    <View style={[styles.checkCircle, checked && styles.checkCircleChecked]}>
      {checked && <View style={styles.checkDot} />}
    </View>
    <Text style={styles.checkLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function MedicalRecordScreen() {
  const router = useRouter();
  const { currentPatient, selectedDate, saveMedicalRecord, entries } =
    useJournalStore();

  const existingEntry = entries.find(
    (e) => e.date === selectedDate && e.patientId === currentPatient?.id,
  );
  const existingRecord = existingEntry?.medicalRecord;

  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    existingRecord?.types ?? [],
  );
  const [otherNotes, setOtherNotes] = useState(
    existingRecord?.otherNotes ?? '',
  );

  // 저장 가능 여부
  const canSave = useMemo(() => {
    return selectedTypes.length > 0 || otherNotes.trim().length > 0;
  }, [selectedTypes, otherNotes]);

  // 저장
  const handleSave = () => {
    if (!currentPatient) {
      Alert.alert('알림', '환자 정보가 없습니다.');
      return;
    }

    saveMedicalRecord(selectedDate, currentPatient.id, {
      types: selectedTypes,
      otherNotes: otherNotes.trim() || undefined,
    });

    Alert.alert('저장 완료', '의료 기록이 저장되었습니다.', [
      { text: '확인', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 오늘의 의료기록 */}
        <Text style={styles.sectionTitle}>오늘의 의료기록</Text>

        {MEDICAL_TYPES.map((type) => {
          const checked = selectedTypes.includes(type);

          return (
            <CheckRow
              key={type}
              label={type}
              checked={checked}
              onPress={() => {
                setSelectedTypes((prev) =>
                  checked ? prev.filter((v) => v !== type) : [...prev, type],
                );
              }}
            />
          );
        })}

        {/* 기타 사항 */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>기타 사항</Text>

        <View style={styles.textAreaWrapper}>
          <TextInput
            style={styles.textArea}
            placeholder="전달사항 혹은 기타 특이 사항을 작성해주세요."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            value={otherNotes}
            onChangeText={setOtherNotes}
          />

          <View style={styles.textAreaFooter}>
            <Text style={styles.counterText}>{otherNotes.length}/500</Text>
            <Text style={styles.inputLabel}>입력</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* =========================
          저장 버튼
      ========================= */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          disabled={!canSave}
          onPress={handleSave}
        >
          <Text
            style={[
              styles.saveButtonText,
              !canSave && styles.saveButtonTextDisabled,
            ]}
          >
            저장하기
          </Text>
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
    backgroundColor: '#FFFFFF',
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

  /* 체크 리스트 */
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
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
  checkCircleChecked: {
    borderColor: '#2563EB',
  },
  checkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  checkLabel: {
    fontSize: 16,
    color: '#111827',
  },

  /* 텍스트 영역 */
  textAreaWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  textArea: {
    minHeight: 110,
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  counterText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },

  /* 하단 버튼 */
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
