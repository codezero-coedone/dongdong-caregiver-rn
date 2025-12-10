import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';

// Mock 상세 데이터
const MOCK_CARE_DETAIL = {
    jobNumber: '12345',
    daysRemaining: 15,
    patient: {
        name: '이환자',
        age: 68,
        gender: '남',
        birthDate: '1945.12.12',
        height: '173cm',
        weight: '60kg',
    },
    tags: ['매칭 3기', '항암치료 중', '부분 도움'],
    status: {
        diagnosis: '폐렴',
        mealAssist: '부분적 도움 필요',
        mobility: '부족 필요, 지팡이 사용',
        requests: '계단 이용 불가',
    },
    guardian: {
        name: '나보호',
        phone: '010-1234-5678',
        relation: '자녀',
    },
    location: {
        hospital: '서울아산병원',
        address: '서울 송파구 올림픽로 43길 88',
        detail: 'A동 1405호',
    },
    period: {
        dateRange: '2025.11.15 ~ 2025.11.30',
        totalDays: 15,
        weekdays: '월, 화, 수',
        workHours: '09:00 ~ 18:00',
        hoursPerDay: 9,
    },
};

// 전화번호 마스킹 함수
const maskPhoneNumber = (phone: string) => {
    const parts = phone.split('-');
    if (parts.length === 3) {
        return `${parts[0]}-${parts[1]}-****`;
    }
    return phone.replace(/\d{4}$/, '****');
};

export default function CareDetailScreen() {
    const router = useRouter();
    const { type } = useLocalSearchParams<{ type?: string }>();

    // type이 'completed'면 완료된 간병, 그 외는 진행 중
    const isCompleted = type === 'completed';

    const handleWriteJournal = () => {
        console.log('Navigate to journal writing');
        // TODO: Navigate to journal writing screen
    };

    // 보호자 연락처 (완료된 간병은 마스킹)
    const guardianPhone = isCompleted
        ? maskPhoneNumber(MOCK_CARE_DETAIL.guardian.phone)
        : MOCK_CARE_DETAIL.guardian.phone;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* 환자 정보 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.sectionIcon}>👤</Text> 환자 정보
                    </Text>
                    <View style={[
                        styles.patientCard,
                        isCompleted && styles.patientCardCompleted
                    ]}>
                        {/* 공고번호 (완료된 간병만 표시) */}
                        {isCompleted && (
                            <Text style={styles.jobNumber}>
                                공고번호 {MOCK_CARE_DETAIL.jobNumber}
                            </Text>
                        )}

                        {/* 남은 일수 (진행 중인 간병만 표시) */}
                        {!isCompleted && (
                            <Text style={styles.daysRemaining}>
                                {MOCK_CARE_DETAIL.daysRemaining}일 남음
                            </Text>
                        )}

                        <Text style={styles.patientName}>
                            {MOCK_CARE_DETAIL.patient.name} ({MOCK_CARE_DETAIL.patient.age}세, {MOCK_CARE_DETAIL.patient.gender})
                        </Text>
                        <View style={styles.tagsContainer}>
                            {MOCK_CARE_DETAIL.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* 기본 정보 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionSubtitle}>기본 정보</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>생년월일</Text>
                            <Text style={styles.infoValue}>{MOCK_CARE_DETAIL.patient.birthDate}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>키</Text>
                            <Text style={styles.infoValue}>{MOCK_CARE_DETAIL.patient.height}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>몸무게</Text>
                            <Text style={styles.infoValue}>{MOCK_CARE_DETAIL.patient.weight}</Text>
                        </View>
                    </View>
                </View>

                {/* 환자 상태 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionSubtitle}>환자 상태</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>진단명</Text>
                            <Text style={styles.infoValue}>{MOCK_CARE_DETAIL.status.diagnosis}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>식사 도움</Text>
                            <Text style={styles.infoValue}>{MOCK_CARE_DETAIL.status.mealAssist}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>거동 상태</Text>
                            <Text style={styles.infoValue}>{MOCK_CARE_DETAIL.status.mobility}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>요청 사항</Text>
                            <Text style={styles.infoValue}>{MOCK_CARE_DETAIL.status.requests}</Text>
                        </View>
                    </View>
                </View>

                {/* 보호자 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.sectionIcon}>👥</Text> 보호자
                    </Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>이름</Text>
                            <Text style={styles.infoValue}>{MOCK_CARE_DETAIL.guardian.name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{isCompleted ? '휴대번호' : '휴대폰'}</Text>
                            <Text style={styles.infoValue}>{guardianPhone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>관계</Text>
                            <Text style={styles.infoValue}>{MOCK_CARE_DETAIL.guardian.relation}</Text>
                        </View>
                    </View>
                </View>

                {/* 간병 위치 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="location-outline" size={16} color="#EF4444" /> 간병 위치
                    </Text>
                    <View style={styles.locationCard}>
                        <Text style={styles.locationText}>
                            {MOCK_CARE_DETAIL.location.hospital}({MOCK_CARE_DETAIL.location.address})
                        </Text>
                    </View>
                    <View style={styles.locationCard}>
                        <Text style={styles.locationText}>{MOCK_CARE_DETAIL.location.detail}</Text>
                    </View>
                </View>

                {/* 간병 기간 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="calendar-outline" size={16} color="#111827" /> 간병 기간
                    </Text>
                    <View style={styles.periodCard}>
                        <Text style={styles.periodText}>
                            {MOCK_CARE_DETAIL.period.dateRange} ({MOCK_CARE_DETAIL.period.totalDays}일간)
                        </Text>
                    </View>
                    <View style={styles.periodCard}>
                        <Text style={styles.periodText}>{MOCK_CARE_DETAIL.period.weekdays}</Text>
                    </View>
                    <View style={styles.periodCard}>
                        <Text style={styles.periodText}>
                            {MOCK_CARE_DETAIL.period.workHours} (하루 {MOCK_CARE_DETAIL.period.hoursPerDay}시간)
                        </Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* 하단 CTA 버튼 (진행 중인 간병만 표시) */}
            {!isCompleted && (
                <View style={styles.buttonContainer}>
                    <Button title="간병 일지 작성하기" onPress={handleWriteJournal} />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 8,
        borderBottomColor: '#F3F4F6',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    sectionIcon: {
        fontSize: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    patientCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    patientCardCompleted: {
        borderColor: '#E5E7EB',
    },
    jobNumber: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 6,
    },
    daysRemaining: {
        fontSize: 13,
        fontWeight: '600',
        color: '#3B82F6',
        marginBottom: 8,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 12,
        color: '#6B7280',
    },
    infoGrid: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        width: 80,
    },
    infoValue: {
        fontSize: 14,
        color: '#111827',
        flex: 1,
    },
    locationCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#374151',
    },
    periodCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 14,
        marginBottom: 8,
    },
    periodText: {
        fontSize: 14,
        color: '#374151',
    },
    buttonContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
});
