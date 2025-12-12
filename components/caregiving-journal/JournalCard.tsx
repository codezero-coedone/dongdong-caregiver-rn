import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ActivityRecord, MealRecord, MedicalRecord } from '../../store/journalStore';

type JournalCardType = 'morning' | 'lunch' | 'dinner' | 'medical' | 'activity';

interface JournalCardProps {
    type: JournalCardType;
    data?: MealRecord | MedicalRecord | ActivityRecord;
    onPress: () => void;
}

const CARD_TITLES: Record<JournalCardType, string> = {
    morning: '아침',
    lunch: '점심',
    dinner: '저녁',
    medical: '의료기록',
    activity: '활동기록',
};

// Type guard for MealRecord
const isMealRecord = (data: MealRecord | MedicalRecord | ActivityRecord | undefined): data is MealRecord => {
    return data !== undefined && 'mealType' in data;
};

// Type guard for MedicalRecord
const isMedicalRecord = (data: MealRecord | MedicalRecord | ActivityRecord | undefined): data is MedicalRecord => {
    return data !== undefined && 'injection' in data;
};

// Type guard for ActivityRecord
const isActivityRecord = (data: MealRecord | MedicalRecord | ActivityRecord | undefined): data is ActivityRecord => {
    return data !== undefined && 'exercise' in data;
};

const StatusBadge = ({ status }: { status: 'caution' | 'good' }) => (
    <View style={[styles.statusBadge, status === 'caution' ? styles.cautionBadge : styles.goodBadge]}>
        <Text style={[styles.statusText, status === 'caution' ? styles.cautionText : styles.goodText]}>
            {status === 'caution' ? '주의' : '양호'}
        </Text>
    </View>
);

const JournalCard: React.FC<JournalCardProps> = ({ type, data, onPress }) => {
    const title = CARD_TITLES[type];
    const hasData = data !== undefined;

    const renderMealContent = (record: MealRecord) => (
        <View style={styles.contentGrid}>
            <View style={styles.contentRow}>
                <Text style={styles.contentLabel}>상태</Text>
                <StatusBadge status={record.status} />
            </View>
            <View style={styles.contentRow}>
                <Text style={styles.contentLabel}>식사</Text>
                <Text style={styles.contentValue}>{record.mealType}</Text>
            </View>
            <View style={styles.contentRow}>
                <Text style={styles.contentLabel}>소변</Text>
                <Text style={styles.contentValue}>
                    {record.urination.count}회{record.urination.note ? `/${record.urination.note}` : ''}
                </Text>
            </View>
            <View style={styles.contentRow}>
                <Text style={styles.contentLabel}>대변량</Text>
                <Text style={styles.contentValue}>
                    {record.bowelMovement.count}회{record.bowelMovement.note ? `/${record.bowelMovement.note}` : ''}
                </Text>
            </View>
            {record.diaperUsage !== undefined && (
                <View style={styles.contentRow}>
                    <Text style={styles.contentLabel}>기저귀 사용량</Text>
                    <Text style={styles.contentValue}>{record.diaperUsage}장</Text>
                </View>
            )}
            {record.mobility && (
                <View style={styles.contentRow}>
                    <Text style={styles.contentLabel}>이동</Text>
                    <Text style={styles.contentValue}>{record.mobility}</Text>
                </View>
            )}
            {record.careNotes && (
                <View style={styles.contentRow}>
                    <Text style={styles.contentLabel}>돌이사항</Text>
                    <Text style={styles.contentValue}>{record.careNotes}</Text>
                </View>
            )}
        </View>
    );

    const renderMedicalContent = (record: MedicalRecord) => (
        <View style={styles.medicalContent}>
            <View style={styles.medicalTags}>
                {record.injection && (
                    <View style={styles.medicalTag}>
                        <Text style={styles.medicalTagText}>주사</Text>
                    </View>
                )}
                {record.medication && (
                    <View style={styles.medicalTag}>
                        <Text style={styles.medicalTagText}>약복용</Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderActivityContent = (record: ActivityRecord) => (
        <View style={styles.contentGrid}>
            <View style={styles.contentRow}>
                <Text style={styles.contentLabel}>운동</Text>
                <StatusBadge status={record.exercise} />
            </View>
            <View style={styles.contentRow}>
                <Text style={styles.contentLabel}>수면</Text>
                <StatusBadge status={record.sleep} />
            </View>
        </View>
    );

    const renderContent = () => {
        if (!hasData) {
            return (
                <Text style={styles.emptyText}>일지를 작성해주세요.</Text>
            );
        }

        if (isMealRecord(data)) {
            return renderMealContent(data);
        }
        if (isMedicalRecord(data)) {
            return renderMedicalContent(data);
        }
        if (isActivityRecord(data)) {
            return renderActivityContent(data);
        }
        return null;
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {hasData && <Text style={styles.moreIcon}>···</Text>}
            </View>
            <View style={styles.contentContainer}>
                {renderContent()}
            </View>
            <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        width: 60,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    moreIcon: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    contentContainer: {
        flex: 1,
        marginLeft: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    arrowContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    contentGrid: {
        gap: 6,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    contentLabel: {
        fontSize: 13,
        color: '#6B7280',
        width: 80,
    },
    contentValue: {
        fontSize: 13,
        color: '#111827',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    cautionBadge: {
        backgroundColor: '#FEE2E2',
    },
    goodBadge: {
        backgroundColor: '#DCFCE7',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    cautionText: {
        color: '#DC2626',
    },
    goodText: {
        color: '#16A34A',
    },
    medicalContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    medicalTags: {
        flexDirection: 'row',
        gap: 8,
    },
    medicalTag: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    medicalTagText: {
        fontSize: 12,
        color: '#2563EB',
        fontWeight: '500',
    },
});

export default JournalCard;
