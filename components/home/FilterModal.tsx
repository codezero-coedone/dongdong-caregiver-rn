import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
}

interface FilterState {
    regions: string[];
    period: string | null;
    timeSlot: string[];
    mealAssistance: string[];
    toiletAssistance: string[];
}

const REGIONS = [
    '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원',
];

const PERIODS = [
    '1주 이하', '1~2주', '2~4주', '1개월 이상',
];

const TIME_SLOTS = ['주간', '야간', '종일'];

const MEAL_OPTIONS = ['스스로 가능', '식사 도움 필요', '식사 불가능'];
const TOILET_OPTIONS = ['스스로 가능', '배변 도움 필요', '배변 불가능'];

const PRIMARY = '#0066FF';

export default function FilterModal({ visible, onClose, onApply }: FilterModalProps) {
    const [regions, setRegions] = useState<string[]>([]);
    const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
    const [period, setPeriod] = useState<string | null>(null);
    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const [timeSlot, setTimeSlot] = useState<string[]>([]);
    const [mealAssistance, setMealAssistance] = useState<string[]>([]);
    const [toiletAssistance, setToiletAssistance] = useState<string[]>([]);

    const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
        if (array.includes(item)) {
            setArray(array.filter(i => i !== item));
        } else {
            setArray([...array, item]);
        }
    };

    const handleApply = () => {
        onApply({
            regions,
            period,
            timeSlot,
            mealAssistance,
            toiletAssistance,
        });
        onClose();
    };

    const handleReset = () => {
        setRegions([]);
        setPeriod(null);
        setTimeSlot([]);
        setMealAssistance([]);
        setToiletAssistance([]);
    };

    const addRegion = (r: string) => {
        if (!regions.includes(r)) {
            setRegions([...regions, r]);
        }
        setRegionDropdownOpen(false);
    };

    const removeRegion = (r: string) => {
        setRegions(regions.filter(reg => reg !== r));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.frame}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerPlaceholder} />
                    <Text style={styles.headerTitle}>상세조건</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* 지역 설정 */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>지역 설정</Text>
                            <Text style={styles.sectionCount}>{regions.length}/10</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setRegionDropdownOpen(!regionDropdownOpen)}
                        >
                            <Text style={styles.placeholder}>
                                지역을 선택해 주세요
                            </Text>
                            <Ionicons
                                name={regionDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={PRIMARY}
                            />
                        </TouchableOpacity>
                        {regionDropdownOpen && (
                            <View style={styles.dropdownList}>
                                {REGIONS.filter(r => !regions.includes(r)).map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={styles.dropdownItem}
                                        onPress={() => addRegion(r)}
                                    >
                                        <Text style={styles.dropdownItemText}>
                                            {r}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        {/* Selected Region Chips */}
                        {regions.length > 0 && (
                            <View style={styles.chipContainer}>
                                {regions.map((r) => (
                                    <View key={r} style={styles.chip}>
                                        <Text style={styles.chipText}>{r}시</Text>
                                        <TouchableOpacity
                                            style={styles.chipClose}
                                            onPress={() => removeRegion(r)}
                                        >
                                            <Ionicons name="close" size={14} color={PRIMARY} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* 기간 설정 */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>기간 설정</Text>
                            <Text style={styles.sectionCount}>{period ? '1' : '0'}/1</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                        >
                            <Text style={[styles.dropdownText, !period && styles.placeholder]}>
                                {period || '간병 기간을 선택해 주세요'}
                            </Text>
                            <Ionicons
                                name={periodDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color={PRIMARY}
                            />
                        </TouchableOpacity>
                        {periodDropdownOpen && (
                            <View style={styles.dropdownList}>
                                {PERIODS.map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.dropdownItem,
                                            period === p && styles.dropdownItemSelected,
                                        ]}
                                        onPress={() => {
                                            setPeriod(p);
                                            setPeriodDropdownOpen(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            period === p && styles.dropdownItemTextSelected,
                                        ]}>
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* 간병 시간대 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>간병 시간대</Text>
                        <View style={styles.toggleGroup}>
                            {TIME_SLOTS.map((slot) => (
                                <TouchableOpacity
                                    key={slot}
                                    style={[
                                        styles.toggleButton,
                                        timeSlot.includes(slot) && styles.toggleButtonActive,
                                    ]}
                                    onPress={() => toggleArrayItem(timeSlot, setTimeSlot, slot)}
                                >
                                    <Text style={[
                                        styles.toggleButtonText,
                                        timeSlot.includes(slot) && styles.toggleButtonTextActive,
                                    ]}>
                                        {slot}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 환자 상태 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>환자 상태</Text>

                        <Text style={styles.subSectionTitle}>식사 도움 관련</Text>
                        <View style={styles.toggleGroup}>
                            {MEAL_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.toggleButton,
                                        mealAssistance.includes(option) && styles.toggleButtonActive,
                                    ]}
                                    onPress={() => toggleArrayItem(mealAssistance, setMealAssistance, option)}
                                >
                                    <Text style={[
                                        styles.toggleButtonText,
                                        mealAssistance.includes(option) && styles.toggleButtonTextActive,
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.subSectionTitle}>배변, 화장실 관련</Text>
                        <View style={styles.toggleGroup}>
                            {TOILET_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.toggleButton,
                                        toiletAssistance.includes(option) && styles.toggleButtonActive,
                                    ]}
                                    onPress={() => toggleArrayItem(toiletAssistance, setToiletAssistance, option)}
                                >
                                    <Text style={[
                                        styles.toggleButtonText,
                                        toiletAssistance.includes(option) && styles.toggleButtonTextActive,
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>적용하기</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    frame: {
        flex: 1,
        width: '100%',
        maxWidth: 375,
        alignSelf: 'center',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerPlaceholder: {
        width: 24,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    sectionCount: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    subSectionTitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 8,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
    },
    dropdownText: {
        fontSize: 15,
        color: '#111827',
    },
    placeholder: {
        color: '#9CA3AF',
    },
    dropdownList: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dropdownItemSelected: {
        backgroundColor: 'rgba(0, 102, 255, 0.05)',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#374151',
    },
    dropdownItemTextSelected: {
        color: PRIMARY,
        fontWeight: '500',
    },
    toggleGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    toggleButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    toggleButtonActive: {
        borderColor: PRIMARY,
        backgroundColor: '#F3F8FF',
    },
    toggleButtonText: {
        fontSize: 14,
        color: '#374151',
    },
    toggleButtonTextActive: {
        color: PRIMARY,
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    applyButton: {
        backgroundColor: PRIMARY,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F8FF',
        borderWidth: 1,
        borderColor: PRIMARY,
        paddingLeft: 12,
        paddingRight: 6,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    chipText: {
        fontSize: 13,
        color: PRIMARY,
        fontWeight: '500',
    },
    chipClose: {
        padding: 2,
    },
});
