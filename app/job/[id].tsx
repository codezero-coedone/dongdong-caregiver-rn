import InfoBox from '@/components/ui/InfoBox';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '@/services/apiClient';

type ApiJobDetail = {
    id: string;
    careType: string;
    locationSummary: string;
    startDate: string;
    endDate: string;
    patientGender: string;
    patientAge: number;
    dailyRate: number;
    createdAt: string;
    location: string;
    requirements?: string;
    patientDiagnosis: string;
    patientMobilityLevel: string;
    guardianName: string;
};

export default function JobDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [job, setJob] = useState<ApiJobDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatYmd = (iso: string | null | undefined): string => {
        if (!iso) return '-';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return String(iso);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}.${m}.${day}`;
    };

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const res = await apiClient.get(`/jobs/${id}`);
                const data = (res.data as any)?.data as ApiJobDetail | undefined;
                if (!alive) return;
                if (!data) throw new Error('공고 데이터를 불러올 수 없습니다.');
                setJob(data);
            } catch (e: any) {
                if (!alive) return;
                setError(e?.response?.data?.message || e?.message || '조회에 실패했습니다.');
                setJob(null);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [id]);

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
                {loading && (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                    </View>
                )}

                {error && (
                    <View style={{ paddingVertical: 20 }}>
                        <Text style={{ color: '#EF4444', marginBottom: 8 }}>{String(error)}</Text>
                        <TouchableOpacity onPress={() => router.replace(`/job/${id}`)}>
                            <Text style={{ color: '#3B82F6' }}>다시 시도</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!loading && !error && job && (
                    <>
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
                        <InfoBox value={job.location || '-'} />
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
                        <InfoBox value={`${formatYmd(job.startDate)} - ${formatYmd(job.endDate)}`} />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>근무 요일</Text>
                        <InfoBox value={'미정'} />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>근무 시간</Text>
                        <InfoBox value={'미정'} />
                    </View>
                        </View>

                        {/* 환자 정보 */}
                        <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Image source={require('@/assets/images/Person.png')} style={{ width: 20, height: 20 }} />
                        <Text style={styles.sectionTitle}>환자 정보</Text>
                    </View>

                    <View style={{ gap: 12 }}>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>성별/나이</Text>
                            <InfoBox value={`${job.patientGender || '-'} / ${job.patientAge ?? 0}세`} />
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>진단명</Text>
                            <InfoBox value={job.patientDiagnosis || '-'} />
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>거동상태</Text>
                            <InfoBox value={job.patientMobilityLevel || '-'} />
                        </View>
                    </View>
                        </View>

                        {/* 입원 사유 */}
                        <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Image source={require('@/assets/images/Write.png')} style={{ width: 20, height: 20 }} />
                        <Text style={styles.sectionTitle}>입원 사유</Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>입원 사유</Text>
                        <InfoBox value={'-'} />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>병실 종류</Text>
                        <InfoBox value={'-'} />
                    </View>
                        </View>

                        {/* 간병 요청사항 */}
                        <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Image source={require('@/assets/images/Mail_Open.png')} style={{ width: 20, height: 20 }} />
                        <Text style={styles.sectionTitle}>간병 요청사항</Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>요청 사항</Text>
                        <InfoBox value={job.requirements || '없음'} />
                    </View>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>일당</Text>
                        <InfoBox value={`${Number(job.dailyRate ?? 0).toLocaleString()}원`} />
                    </View>
                        </View>

                        <View style={{ height: 100 }} />
                    </>
                )}
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
