import InfoBox from '@/components/ui/InfoBox';
import PatientInfoCard from '@/components/ui/PatientInfoCard';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock 상세 데이터
const MOCK_JOB_DETAIL = {
    id: '1',
    type: '기간제 간병',
    // 간병 위치
    location: {
        name: '서울아산병원',
        address: '서울 송파구 올림픽로 43길 88',
        detailAddress: '매칭 후 공개',
    },
    // 간병 기간
    schedule: {
        startDate: '2025.11.15',
        endDate: '2025.11.30',
        workDays: '월, 화, 수',
        workHours: '09:00 - 18:00 (하루 9시간)',
    },
    // 환자 정보
    patient: {
        matchCount: 2,
        name: '이환자',
        age: 68,
        gender: '남',
        height: '173cm',
        weight: '60kg',
        diagnosis: '폐렴',
    },
    // 입원 사유
    admission: {
        reason: '수술',
        roomType: '일반실',
    },
    // 간병 요청사항 (가변적 - 배열 형태)
    requirements: [
        { label: '선호하는 간병인의 성별', value: '상관없음' },
        { label: '기타 요청사항', value: '' },
    ],
    pay: '시급 15,000원',
};

export default function JobDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    // TODO: id로 실제 데이터 fetch
    const job = MOCK_JOB_DETAIL;

    const handleApply = () => {
        router.push(`/job/apply/${id}`);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: '매칭 요청 상세보기',
                    headerTitleAlign: 'center',
                    headerTitleStyle: {
                        fontSize: 17,
                        fontWeight: '600',
                        color: '#111827',
                    },
                    headerTintColor: '#EF4444',
                    headerBackTitle: '', // Hide back title
                    headerShadowVisible: true,
                    headerStyle: {
                        backgroundColor: '#fff',
                    },
                }}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 간병 위치 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Image source={require('@/assets/images/Location.png')} style={{ width: 20, height: 20 }} />
                        <Text style={styles.sectionTitle}>간병 위치</Text>
                    </View>

                    {/* 지도 placeholder */}
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="map-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.mapPlaceholderText}>지도 영역</Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>간병 장소</Text>
                        <InfoBox value={`${job.location.name}(${job.location.address})`} />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>상세 주소</Text>
                        <InfoBox variant="secret" />
                    </View>
                </View>

                {/* 간병 기간 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Image source={require('@/assets/images/Calendar.png')} style={{ width: 20, height: 20 }} />
                        <Text style={styles.sectionTitle}>간병 기간</Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>기간</Text>
                        <InfoBox value={`${job.schedule.startDate} - ${job.schedule.endDate}`} />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>근무 요일</Text>
                        <InfoBox value={job.schedule.workDays} />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>근무 시간</Text>
                        <InfoBox value={job.schedule.workHours} />
                    </View>
                </View>

                {/* 환자 정보 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Image source={require('@/assets/images/Person.png')} style={{ width: 20, height: 20 }} />
                        <Text style={styles.sectionTitle}>환자 정보</Text>
                    </View>

                    <PatientInfoCard patient={job.patient} isMatched={true} />
                </View>

                {/* 입원 사유 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Image source={require('@/assets/images/Write.png')} style={{ width: 20, height: 20 }} />
                        <Text style={styles.sectionTitle}>입원 사유</Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>입원 사유</Text>
                        <InfoBox value={job.admission.reason} />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>병실 종류</Text>
                        <InfoBox value={job.admission.roomType} />
                    </View>
                </View>

                {/* 간병 요청사항 */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Image source={require('@/assets/images/Mail_Open.png')} style={{ width: 20, height: 20 }} />
                        <Text style={styles.sectionTitle}>간병 요청사항</Text>
                    </View>

                    {job.requirements.map((req, index) => (
                        <View key={index} style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>{req.label}</Text>
                            <InfoBox value={req.value || '비어있음'} />
                        </View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* 하단 버튼 */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                    <Text style={styles.applyButtonText}>지원하기</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    mapPlaceholder: {
        height: 150,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    mapPlaceholderText: {
        marginTop: 8,
        fontSize: 14,
        color: '#9CA3AF',
    },
    fieldGroup: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 8,
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 34,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    applyButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
