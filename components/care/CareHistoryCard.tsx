import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface CareRecord {
    id: string;
    jobNumber?: string;
    patient: {
        name: string;
        age: number;
        gender: string;
    };
    tags: string[];
    period: string;
    address?: string;
    diagnosis?: string;
    status: 'ongoing' | 'completed';
    daysRemaining?: number;
}

interface CareHistoryCardProps {
    record: CareRecord;
    onDetailPress?: () => void;
    onWriteJournalPress?: () => void;
    variant?: 'ongoing' | 'history';
}

export default function CareHistoryCard({
    record,
    onDetailPress,
    onWriteJournalPress,
    variant = 'history',
}: CareHistoryCardProps) {
    const isOngoing = variant === 'ongoing';

    return (
        <View style={[styles.card, isOngoing && styles.cardOngoing]}>
            {/* 남은 일수 (진행 중인 경우만) */}
            {isOngoing && record.daysRemaining && (
                <Text style={styles.daysRemaining}>{record.daysRemaining}일 남음</Text>
            )}

            {/* 공고번호 (과거 내역인 경우만) */}
            {!isOngoing && record.jobNumber && (
                <Text style={styles.jobNumber}>공고번호 {record.jobNumber}</Text>
            )}

            {/* 환자 정보 */}
            <Text style={styles.patientName}>
                {record.patient.name} ({record.patient.age}세, {record.patient.gender})
            </Text>

            {/* 태그들 */}
            <View style={styles.tagsContainer}>
                {record.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
            </View>

            {/* 상세 정보 */}
            <View style={styles.detailsContainer}>
                {isOngoing ? (
                    <>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                            <Text style={styles.detailLabel}>기간</Text>
                            <Text style={styles.detailValue}>{record.period}</Text>
                        </View>
                        {record.diagnosis && (
                            <View style={styles.detailRow}>
                                <Ionicons name="medical-outline" size={14} color="#6B7280" />
                                <Text style={styles.detailLabel}>병명</Text>
                                <Text style={styles.detailValue}>{record.diagnosis}</Text>
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        <Text style={styles.periodText}>{record.period}</Text>
                        {record.address && (
                            <Text style={styles.addressText}>{record.address}</Text>
                        )}
                    </>
                )}
            </View>

            {/* 버튼들 */}
            {isOngoing ? (
                <TouchableOpacity style={styles.primaryButton} onPress={onWriteJournalPress}>
                    <Text style={styles.primaryButtonText}>일지 작성하기</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.detailButton} onPress={onDetailPress}>
                    <Text style={styles.detailButtonText}>상세보기</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },
    cardOngoing: {
        borderColor: '#3B82F6',
        borderWidth: 1,
    },
    daysRemaining: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3B82F6',
        marginBottom: 8,
    },
    jobNumber: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 6,
    },
    patientName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    tag: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 12,
        color: '#6B7280',
    },
    detailsContainer: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6,
        marginRight: 8,
    },
    detailValue: {
        fontSize: 13,
        color: '#111827',
    },
    periodText: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 13,
        color: '#6B7280',
    },
    primaryButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    detailButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    detailButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
});
