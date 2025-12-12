import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJournalStore, type MedicalRecord } from '../../store/journalStore';

const ToggleButton = ({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={[styles.toggleButton, selected && styles.toggleButtonSelected]}
        onPress={onPress}
    >
        <Text style={[styles.toggleButtonText, selected && styles.toggleButtonTextSelected]}>
            {label}
        </Text>
    </TouchableOpacity>
);

export default function MedicalRecordScreen() {
    const router = useRouter();
    const { currentPatient, selectedDate, saveMedicalRecord, entries } = useJournalStore();

    // Get existing data if any
    const existingEntry = entries.find(
        (e) => e.date === selectedDate && e.patientId === currentPatient?.id
    );
    const existingRecord = existingEntry?.medicalRecord;

    // Form state
    const [injection, setInjection] = useState(existingRecord?.injection ?? false);
    const [medication, setMedication] = useState(existingRecord?.medication ?? false);
    const [otherNotes, setOtherNotes] = useState(existingRecord?.otherNotes || '');

    const handleSave = () => {
        if (!currentPatient) {
            Alert.alert('알림', '환자 정보가 없습니다.');
            return;
        }

        const record: MedicalRecord = {
            injection,
            medication,
            otherNotes: otherNotes || undefined,
        };

        saveMedicalRecord(selectedDate, currentPatient.id, record);
        Alert.alert('저장 완료', '의료 기록이 저장되었습니다.', [
            { text: '확인', onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>의료 기록</Text>

                {/* Injection */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>주사</Text>
                    <View style={styles.toggleRow}>
                        <ToggleButton
                            label="예"
                            selected={injection}
                            onPress={() => setInjection(true)}
                        />
                        <ToggleButton
                            label="아니오"
                            selected={!injection}
                            onPress={() => setInjection(false)}
                        />
                    </View>
                </View>

                {/* Medication */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>약복용</Text>
                    <View style={styles.toggleRow}>
                        <ToggleButton
                            label="예"
                            selected={medication}
                            onPress={() => setMedication(true)}
                        />
                        <ToggleButton
                            label="아니오"
                            selected={!medication}
                            onPress={() => setMedication(false)}
                        />
                    </View>
                </View>

                {/* Other Notes */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>기타 사항</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="기타 의료 관련 사항을 입력해주세요"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        value={otherNotes}
                        onChangeText={setOtherNotes}
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Save Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>저장하기</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 24,
    },
    field: {
        marginBottom: 24,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    toggleRow: {
        flexDirection: 'row',
        gap: 12,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    toggleButtonSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    toggleButtonTextSelected: {
        color: '#3B82F6',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#374151',
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    saveButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
