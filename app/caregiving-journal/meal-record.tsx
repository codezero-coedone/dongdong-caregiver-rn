import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJournalStore, type MealRecord } from '../../store/journalStore';

const MEAL_TYPES = ['유동식', '일반식', '죽', '소프트', '금식'];
const MOBILITY_OPTIONS = ['자가 보행', '보행도움', '휠체어', '침상 안정'];

type StatusType = 'caution' | 'good';

const StatusButton = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
        style={[styles.statusButton, selected && (label === '주의' ? styles.cautionSelected : styles.goodSelected)]}
        onPress={onPress}
    >
        <Text style={[styles.statusButtonText, selected && styles.statusButtonTextSelected]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const OptionChip = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
        style={[styles.optionChip, selected && styles.optionChipSelected]}
        onPress={onPress}
    >
        <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const CounterInput = ({
    label,
    count,
    setCount,
    note,
    setNote,
    required = false,
}: {
    label: string;
    count: number;
    setCount: (n: number) => void;
    note: string;
    setNote: (s: string) => void;
    required?: boolean;
}) => (
    <View style={styles.field}>
        <Text style={styles.fieldLabel}>
            {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.counterRow}>
            <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setCount(Math.max(0, count - 1))}
            >
                <Ionicons name="remove" size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{count}회</Text>
            <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setCount(count + 1)}
            >
                <Ionicons name="add" size={20} color="#374151" />
            </TouchableOpacity>
        </View>
        <TextInput
            style={styles.noteInput}
            placeholder="메모 (선택)"
            placeholderTextColor="#9CA3AF"
            value={note}
            onChangeText={setNote}
        />
    </View>
);

export default function MealRecordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ time: 'morning' | 'lunch' | 'dinner' }>();
    const mealTime = params.time || 'morning';

    const { currentPatient, selectedDate, saveMealRecord, entries } = useJournalStore();

    // Get existing data if any
    const existingEntry = entries.find(
        (e) => e.date === selectedDate && e.patientId === currentPatient?.id
    );
    const existingRecord = existingEntry?.[mealTime];

    // Form state
    const [status, setStatus] = useState<StatusType>(existingRecord?.status || 'good');
    const [mealType, setMealType] = useState(existingRecord?.mealType || '');
    const [urinationCount, setUrinationCount] = useState(existingRecord?.urination?.count || 0);
    const [urinationNote, setUrinationNote] = useState(existingRecord?.urination?.note || '');
    const [bowelCount, setBowelCount] = useState(existingRecord?.bowelMovement?.count || 0);
    const [bowelNote, setBowelNote] = useState(existingRecord?.bowelMovement?.note || '');
    const [diaperUsage, setDiaperUsage] = useState(existingRecord?.diaperUsage?.toString() || '');
    const [mobility, setMobility] = useState(existingRecord?.mobility || '');
    const [careNotes, setCareNotes] = useState(existingRecord?.careNotes || '');

    const getMealTimeLabel = () => {
        switch (mealTime) {
            case 'morning': return '아침';
            case 'lunch': return '점심';
            case 'dinner': return '저녁';
            default: return '식사';
        }
    };

    const handleSave = () => {
        if (!mealType) {
            Alert.alert('알림', '식사 종류를 선택해주세요.');
            return;
        }

        if (!currentPatient) {
            Alert.alert('알림', '환자 정보가 없습니다.');
            return;
        }

        const record: MealRecord = {
            status,
            mealType,
            urination: {
                count: urinationCount,
                note: urinationNote || undefined,
            },
            bowelMovement: {
                count: bowelCount,
                note: bowelNote || undefined,
            },
            diaperUsage: diaperUsage ? parseInt(diaperUsage, 10) : undefined,
            mobility: mobility || undefined,
            careNotes: careNotes || undefined,
        };

        saveMealRecord(selectedDate, currentPatient.id, mealTime, record);
        Alert.alert('저장 완료', `${getMealTimeLabel()} 기록이 저장되었습니다.`, [
            { text: '확인', onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>{getMealTimeLabel()} 기록</Text>

                {/* Status */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>
                        상태 <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.statusRow}>
                        <StatusButton
                            label="주의"
                            selected={status === 'caution'}
                            onPress={() => setStatus('caution')}
                        />
                        <StatusButton
                            label="양호"
                            selected={status === 'good'}
                            onPress={() => setStatus('good')}
                        />
                    </View>
                </View>

                {/* Meal Type */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>
                        식사 종류 <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.chipContainer}>
                        {MEAL_TYPES.map((type) => (
                            <OptionChip
                                key={type}
                                label={type}
                                selected={mealType === type}
                                onPress={() => setMealType(type)}
                            />
                        ))}
                    </View>
                </View>

                {/* Urination */}
                <CounterInput
                    label="소변"
                    count={urinationCount}
                    setCount={setUrinationCount}
                    note={urinationNote}
                    setNote={setUrinationNote}
                    required
                />

                {/* Bowel Movement */}
                <CounterInput
                    label="대변"
                    count={bowelCount}
                    setCount={setBowelCount}
                    note={bowelNote}
                    setNote={setBowelNote}
                    required
                />

                {/* Diaper Usage */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>기저귀 사용량</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="장"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        value={diaperUsage}
                        onChangeText={setDiaperUsage}
                    />
                </View>

                {/* Mobility */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>이동</Text>
                    <View style={styles.chipContainer}>
                        {MOBILITY_OPTIONS.map((option) => (
                            <OptionChip
                                key={option}
                                label={option}
                                selected={mobility === option}
                                onPress={() => setMobility(option)}
                            />
                        ))}
                    </View>
                </View>

                {/* Care Notes */}
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>돌봄 특이사항</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="특이사항을 입력해주세요"
                        placeholderTextColor="#9CA3AF"
                        multiline
                        value={careNotes}
                        onChangeText={setCareNotes}
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
    required: {
        color: '#DC2626',
    },
    statusRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statusButton: {
        flex: 1,
        paddingVertical: 12,
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
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    optionChipSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    optionChipText: {
        fontSize: 14,
        color: '#374151',
    },
    optionChipTextSelected: {
        color: '#fff',
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8,
    },
    counterButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    counterValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        minWidth: 50,
        textAlign: 'center',
    },
    noteInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#374151',
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
        minHeight: 80,
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
