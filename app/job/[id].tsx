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

const PRIMARY = '#0066FF';

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

    const isMatched = (j: ApiJobDetail | null): boolean => {
        if (!j) return false;
        const raw = j as any;
        if (raw?.isMatched === true) return true;
        const st = String(raw?.matchStatus || raw?.status || '').toUpperCase();
        if (st === 'MATCHED' || st === 'ACTIVE' || st === 'COMPLETED') return true;
        const diag = String(j.patientDiagnosis || '').trim();
        // Backend sometimes returns empty/hidden fields before match; treat as "매칭 전" when diagnosis is missing.
        if (!diag) return false;
        if (diag.includes('매칭') && diag.includes('공개')) return false;
        return true;
    };

    const matched = isMatched(job);

    const FieldBox = ({
        value,
        right,
        secret,
    }: {
        value: string;
        right?: React.ReactNode;
        secret?: boolean;
    }) => (
        <View style={[styles.box, secret && styles.boxSecret]}>
            <Text style={[styles.boxText, secret && styles.boxTextSecret]} numberOfLines={2}>
                {secret ? '매칭 후 공개' : value}
            </Text>
            {right ? <View style={styles.boxRight}>{right}</View> : null}
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <View style={styles.frame}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>매칭 요청 상세보기</Text>
                    <View style={styles.headerPlaceholder} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {loading && (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={PRIMARY} />
                        </View>
                    )}

                    {error && (
                        <View style={{ paddingVertical: 20 }}>
                            <Text style={{ color: '#EF4444', marginBottom: 8 }}>{String(error)}</Text>
                            <TouchableOpacity onPress={() => router.replace(`/job/${id}`)}>
                                <Text style={{ color: PRIMARY }}>다시 시도</Text>
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

                    {/* 지도 placeholder (Figma-style) */}
                    <View style={styles.mapPlaceholder}>
                        <View style={styles.mapNaverBadge}>
                            <Text style={styles.mapNaverText}>NAVER</Text>
                        </View>
                        <View style={styles.mapCrosshair}>
                            <Ionicons name="add" size={14} color="#6B7280" />
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>간병 장소</Text>
                        <InfoBox value={job.location || '-'} />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>상세 주소</Text>
                        <InfoBox variant={matched ? 'default' : 'secret'} value={(job as any)?.detailAddress || '-'} />
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
                        <InfoBox value={'09:00 - 18:00 (하루 9시간)'} />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>전화 요청 시간 *</Text>
                        <FieldBox
                            value={'09:00, 13:00'}
                            right={<Ionicons name="checkmark-circle" size={18} color={PRIMARY} />}
                        />
                        <Text style={styles.helpText}>
                            환자가 미리 요청한 전화 시간입니다. 해당 시간에 연락해 주세요.
                        </Text>
                    </View>
                        </View>

                        {/* 환자 정보 */}
                        <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Image source={require('@/assets/images/Person.png')} style={{ width: 20, height: 20 }} />
                        <Text style={styles.sectionTitle}>환자 정보</Text>
                    </View>

                    {!matched && (
                        <Text style={styles.maskNotice}>
                            환자 정보는 매칭이 완료된 후 확인 가능합니다.
                        </Text>
                    )}

                    <View style={styles.patientCard}>
                        <View style={styles.patientTags}>
                            <InfoBox
                                value={String(job.patientDiagnosis || '폐암 2기')}
                                variant={matched ? 'default' : 'secret'}
                                style={styles.patientTag}
                            />
                        </View>
                        <Text style={styles.patientNameLine}>
                            {matched ? `이환자 (${job.patientAge ?? 0}세, ${job.patientGender || '-'})` : `${job.patientAge ?? 0}세, ${job.patientGender || '-'}`}
                        </Text>
                        <View style={styles.patientMetaGrid}>
                            <View style={styles.patientMetaRow}>
                                <Text style={styles.patientMetaLabel}>키</Text>
                                <Text style={styles.patientMetaSep}>|</Text>
                                <Text style={styles.patientMetaValue}>{matched ? '173cm' : '매칭 후 공개'}</Text>
                            </View>
                            <View style={styles.patientMetaRow}>
                                <Text style={styles.patientMetaLabel}>몸무게</Text>
                                <Text style={styles.patientMetaSep}>|</Text>
                                <Text style={styles.patientMetaValue}>{matched ? '60kg' : '매칭 후 공개'}</Text>
                            </View>
                            <View style={styles.patientMetaRow}>
                                <Text style={styles.patientMetaLabel}>진단명</Text>
                                <Text style={styles.patientMetaSep}>|</Text>
                                <Text style={styles.patientMetaValue}>{matched ? (job.patientDiagnosis || '-') : '매칭 후 공개'}</Text>
                            </View>
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
                        <Text style={styles.fieldLabel}>선호하는 간병인의 성별</Text>
                        <InfoBox value={'상관없음'} />
                    </View>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>간병시 식사 도움 여부</Text>
                        <InfoBox value={'스스로 가능'} />
                    </View>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>간병시 배변 도움 여부</Text>
                        <InfoBox value={'스스로 가능'} />
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
            </View>
        </SafeAreaView>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
    },
    headerPlaceholder: {
        width: 32,
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
        height: 170,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        marginBottom: 16,
    },
    mapNaverBadge: {
        position: 'absolute',
        left: 10,
        bottom: 10,
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    mapNaverText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#03C75A',
    },
    mapCrosshair: {
        position: 'absolute',
        left: 10,
        top: 10,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fieldGroup: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 8,
    },
    helpText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '500',
        color: '#70737C',
        lineHeight: 18,
    },
    maskNotice: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 12,
    },
    patientCard: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    patientTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    patientTag: {
        width: 'auto',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    patientNameLine: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
    },
    patientMetaGrid: {
        gap: 10,
    },
    patientMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    patientMetaLabel: {
        width: 52,
        fontSize: 13,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    patientMetaSep: {
        width: 18,
        textAlign: 'center',
        color: '#E5E7EB',
        fontWeight: '700',
    },
    patientMetaValue: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
    },
    box: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    boxSecret: {
        backgroundColor: '#F9FAFB',
    },
    boxText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
        flex: 1,
        paddingRight: 10,
    },
    boxTextSecret: {
        color: '#9CA3AF',
    },
    boxRight: {
        marginLeft: 8,
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
        backgroundColor: PRIMARY,
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
