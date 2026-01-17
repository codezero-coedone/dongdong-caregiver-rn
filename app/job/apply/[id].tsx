import Chip from '@/components/ui/Chip';
import Space from '@/components/ui/Space';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '@/services/apiClient';
import { getInsuranceAutoEnrolled } from '@/services/insuranceService';

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

export default function JobApplyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<ApiJobDetail | null>(null);
  const [insuranceDone, setInsuranceDone] = useState(false);

  const calcDays = (startIso: string | null | undefined, endIso: string | null | undefined): number => {
    const s = startIso ? new Date(startIso) : null;
    const e = endIso ? new Date(endIso) : null;
    if (!s || !e) return 0;
    const sm = s.getTime();
    const em = e.getTime();
    if (Number.isNaN(sm) || Number.isNaN(em)) return 0;
    return Math.max(0, Math.ceil((em - sm) / (1000 * 60 * 60 * 24)));
  };

  const formatYmd = (iso: string | null | undefined): string => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiClient.get(`/jobs/${id}`);
        const data = (res.data as any)?.data as ApiJobDetail | undefined;
        if (!alive) return;
        setJob(data ?? null);
      } catch {
        if (!alive) return;
        setJob(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  React.useEffect(() => {
    let alive = true;
    void (async () => {
      const done = await getInsuranceAutoEnrolled();
      if (!alive) return;
      setInsuranceDone(done);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 약관 동의 상태
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [contractAgreed, setContractAgreed] = useState(false);
  const [noticeAgreed, setNoticeAgreed] = useState(false);

  // 모든 약관 동의 여부
  const allAgreed = privacyAgreed && contractAgreed && noticeAgreed;

  const handleApply = () => {
    if (!allAgreed) return;
    (async () => {
      try {
        await apiClient.post(`/jobs/${id}/apply`, { message: null });
        router.replace('/job/apply/complete');
      } catch (e: any) {
        const msg =
          e?.response?.data?.message || e?.message || '지원하기에 실패했습니다.';
        Alert.alert('오류', String(msg));
      }
    })();
  };

  const handleInsuranceLink = () => {
    if (insuranceDone) return;
    router.push(`/job/insurance/${id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.frame}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>간병 지원하기</Text>
          <View style={styles.headerPlaceholder} />
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 지원 매칭 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지원 매칭 정보</Text>

          <View style={styles.infoCard}>
            {/* 환자 정보 */}
            <Text style={styles.patientName}>
              {job
                ? `환자 (${job.patientAge ?? 0}세, ${job.patientGender ?? '-'})`
                : '환자'}
            </Text>

            {/* 태그(진단/거동) */}
            {job && (
              <View style={styles.tags}>
                {!!job.patientDiagnosis && (
                  <Chip label={job.patientDiagnosis} variant="primary" />
                )}
                {!!job.patientMobilityLevel && (
                  <Chip label={job.patientMobilityLevel} variant="default" />
                )}
              </View>
            )}

            {/* 상세 정보 */}
            <View style={styles.infoRows}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>위치</Text>
                <Text style={styles.infoValue}>
                  {job?.location ?? '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>기간</Text>
                <Text style={styles.infoValue}>
                  {job
                    ? `${formatYmd(job.startDate)}~${formatYmd(job.endDate)}`
                    : '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>총 일수</Text>
                <Text style={styles.infoValue}>
                  {job ? `${calcDays(job.startDate, job.endDate)}일` : '-'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 급여 정보 */}
            <View style={styles.payInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>일급</Text>
                <Text style={styles.infoValue}>
                  {job ? `${Number(job.dailyRate ?? 0).toLocaleString()}원` : '-'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>총 급여</Text>
                <Text style={styles.totalPayValue}>
                  {job
                    ? `${(Number(job.dailyRate ?? 0) * calcDays(job.startDate, job.endDate)).toLocaleString()}원`
                    : '-'}
                </Text>
              </View>
            </View>
          </View>
          <Space y={20} />
        </View>

        <Space y={20} />
        {/* 간병인배상책임보험 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>간병인배상책임보험 자동가입</Text>

          <TouchableOpacity
            style={[styles.insuranceLink, insuranceDone && styles.insuranceLinkDone]}
            onPress={handleInsuranceLink}
            activeOpacity={insuranceDone ? 1 : 0.85}
          >
            <Text style={styles.insuranceLinkText}>
              {insuranceDone ? '간병인배상책임보험 가입 완료' : '간병인배상책임보험 가입'}
            </Text>
            {insuranceDone ? (
              <Ionicons name="checkmark" size={20} color="#0066FF" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#0066FF" />
            )}
          </TouchableOpacity>

          <View style={styles.insuranceInfo}>
            <Text style={styles.insuranceInfoTitle}>
              간병인배상책임보험이란?
            </Text>
            <Text style={styles.insuranceInfoText}>
              간병인배상책임보험은 간병 서비스 제공 중 발생하는 불의의 사고에
              따라 간병인에게 발생할 수 있는 배상 책임을 담보해 주는 상품으로
              한번의 가입만으로 동동에서 간병을 진행할 때마다
              간병인배상책임보험을 자동으로 가입할 수 있습니다.
            </Text>
          </View>
          <Space y={20} />
        </View>

        <Space y={20} />
        {/* 약관 동의 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>약관 동의</Text>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => setPrivacyAgreed(!privacyAgreed)}
          >
            <View style={styles.agreementLeft}>
              <View
                style={[
                  styles.checkbox,
                  privacyAgreed && styles.checkboxChecked,
                ]}
              >
                {privacyAgreed && (
                  <Ionicons name="checkmark-sharp" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.agreementText}>
                개인정보 제 3자 제공 동의서{' '}
                <Text style={styles.required}>(필수)</Text>
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => setContractAgreed(!contractAgreed)}
          >
            <View style={styles.agreementLeft}>
              <View
                style={[
                  styles.checkbox,
                  contractAgreed && styles.checkboxChecked,
                ]}
              >
                {contractAgreed && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.agreementText}>
                간병인 중개 계약서 <Text style={styles.required}>(필수)</Text>
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <Space y={20} />
        </View>

        {/* 유의사항 */}
        <View style={styles.noticeSection}>
          <TouchableOpacity
            style={styles.noticeRow}
            onPress={() => setNoticeAgreed(!noticeAgreed)}
          >
            <View
              style={[styles.checkbox, noticeAgreed && styles.checkboxChecked]}
            >
              {noticeAgreed && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.noticeText}>
              유의사항 내용을 숙지하고 동의합니다. (필수)
            </Text>
          </TouchableOpacity>

          <Text style={styles.noticeDescription}>
            지원하신 정보를 바탕으로 간병인 중개 계약서가 자동 작성됩니다.{'\n'}
            공고 지원이 완료되면 위 계약서를 수정할 수 없습니다.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.applyButton, !allAgreed && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={!allAgreed}
        >
          <Text
            style={[
              styles.applyButtonText,
              !allAgreed && styles.applyButtonTextDisabled,
            ]}
          >
            지원하기
          </Text>
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
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#70737C38',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  infoCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171719',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12,
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
  infoRows: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#2E2F33E0',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#171719',
  },
  divider: {
    height: 2,
    backgroundColor: '#70737C14',
    marginVertical: 12,
  },
  payInfo: {
    gap: 8,
  },
  totalPayValue: {
    fontSize: 14,
    color: '#0066FF',
    fontWeight: '600',
  },
  insuranceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#0066FF',
    borderRadius: 12,
    marginBottom: 20,
  },
  insuranceLinkDone: {
    borderColor: '#0066FF',
    backgroundColor: '#F3F8FF',
  },
  insuranceLinkText: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '600',
  },
  insuranceInfo: {
    backgroundColor: '#F7F7F8',
    borderRadius: 14,
    padding: 20,
  },
  insuranceInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171719',
    marginBottom: 12,
  },
  insuranceInfoText: {
    fontSize: 14,
    color: '#2E2F33E0',
    lineHeight: 20,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  agreementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#70737C38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  agreementText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#171719',
  },
  required: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0066FF',
  },
  noticeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#171719',
    flex: 1,
  },
  noticeDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF4242',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
  },
  applyButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#F4F4F5',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  applyButtonTextDisabled: {
    color: '#37383C47',
  },
});
