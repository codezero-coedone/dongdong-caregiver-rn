import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJournalStore, type ActivityRecord } from '../../store/journalStore';

type StatusType = 'caution' | 'good';

const StatusButton = ({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={[
            styles.statusButton,
            selected && (label === '주의' ? styles.cautionSelected : styles.goodSelected),
        ]}
        onPress={onPress}
    >
        <Text style={[styles.statusButtonText, selected && styles.statusButtonTextSelected]}>
            {label}
        </Text>
    </TouchableOpacity>
);

export default function ActivityRecordScreen() {
    const router = useRouter();
    const { currentPatient, selectedDate, saveActivityRecord, entries } = useJournalStore();

    // Get existing data if any
    const existingEntry = entries.find(
        (e) => e.date === selectedDate && e.patientId === currentPatient?.id
    );
    const existingRecord = existingEntry?.activityRecord;

    // Form state
    const [exercise, setExercise] = useState<StatusType>(existingRecord?.exercise || 'good');
    const [sleep, setSleep] = useState<StatusType>(existingRecord?.sleep || 'good');
    const [otherNotes, setOtherNotes] = useState(existingRecord?.otherNotes || '');

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
            { text: '확인', onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>활동 기록</Text>

                {/* Exercise */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>운동</Text>
                    <View style={styles.statusRow}>
                        <StatusButton
                            label="주의"
                            selected={exercise === 'caution'}
                            onPress={() => setExercise('caution')}
                        />
                        <StatusButton
                            label="양호"
                            selected={exercise === 'good'}
                            onPress={() => setExercise('good')}
                        />
                    </View>
                </View>

                {/* Sleep */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>수면</Text>
                    <View style={styles.statusRow}>
                        <StatusButton
                            label="주의"
                            selected={sleep === 'caution'}
                            onPress={() => setSleep('caution')}
                        />
                        <StatusButton
                            label="양호"
                            selected={sleep === 'good'}
                            onPress={() => setSleep('good')}
                        />
                    </View>
                </View>

                {/* Other Notes */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>기타 활동</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="기타 활동 관련 사항을 입력해주세요"
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
    statusRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statusButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    cautionSelected: {
        backgroundColor: '#FEE2E2',
        borderColor: '#DC2626',
    },
    goodSelected: {
        backgroundColor: '#DCFCE7',
        borderColor: '#16A34A',
    },
    statusButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    statusButtonTextSelected: {
        color: '#111827',
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
