import Divider from '@/components/ui/Divider';
import Space from '@/components/ui/Space';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setInsuranceAutoEnrolled } from '@/services/insuranceService';

// Mock 보험 데이터
const MOCK_INSURANCE_DATA = {
  caregiverName: '김간병',
  insurerName: 'OO보험',
  insuranceType: '전문인배상책임보험',
  period: {
    start: '2025.11.21. 13:00',
    end: '2025.11.25 10:00',
  },
  location: '서울특별시 동작구 흑석로 102 (흑석동)',
  coverage: {
    type: '전문인 배상책임위험(대인/대물)',
    work: '간병인업무(개인간병)',
    perIncident: '10,000,000원',
    perYear: '연 100,000,000원',
    deductible: '300,000원',
  },
  careDays: 15,
  totalPremium: '2,100원',
};

// 약관 상세 내용
const TERMS_CONTENT = [
  {
    title: '1. 알릴 의무와 통지의 의무',
    content:
      '보험계약자 또는 피보험자는 보험청약 시 드리는 질문 내용에 대하여 알고있는 내용을 반드시 사실대로 알려야 합니다. 만일 고의 또는 중대한 과실로 사실과 다르게 알린 경우, 회사는 보험계약자 또는 피보험자의 의사와 관계없이 계약을 해지하거나 보장을 제한할 수 있습니다.',
  },
  {
    title: '2. 해지 환급금',
    content:
      '보험계약자 또는 피보험자는 보험청약 시 드리는 질문 내용에 대하여 알고있는 내용을 반드시 사실대로 알려야 합니다. 만일 고의 또는 중대한 과실로 사실과 다르게 알린 경우, 회사는 보험계약자 또는 피보험자의 의사와 관계없이 계약을 해지하거나 보장을 제한할 수 있습니다.',
  },
  {
    title: '3. 청약의 철회',
    content:
      '보험계약자 또는 피보험자는 보험청약 시 드리는 질문 내용에 대하여 알고있는 내용을 반드시 사실대로 알려야 합니다. 만일 고의 또는 중대한 과실로 사실과 다르게 알린 경우, 회사는 보험계약자 또는 피보험자의 의사와 관계없이 계약을 해지하거나 보장을 제한할 수 있습니다.',
  },
];

// 동의 항목
const AGREEMENT_ITEMS = [
  { id: 'groupTerms', label: '단체규약 동의', required: true },
  { id: 'privacyCollect', label: '개인정보 수집 이용 동의', required: true },
  { id: 'privacyUse', label: '개인정보 수집 이용 동의', required: false },
  { id: 'privacyInquiry', label: '개인정보보호 조회 동의', required: false },
  { id: 'sensitiveInfo', label: '민감정보 수집 동의', required: false },
];

export default function InsuranceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // 동의 상태
  const [agreements, setAgreements] = useState<Record<string, boolean>>({
    groupTerms: false,
    privacyCollect: false,
    privacyUse: false,
    privacyInquiry: false,
    sensitiveInfo: false,
  });

  // 필수 항목 모두 동의 여부
  const requiredItems = AGREEMENT_ITEMS.filter((item) => item.required);
  const allRequiredAgreed = requiredItems.every((item) => agreements[item.id]);

  // 모두 동의하기
  const allAgreed = AGREEMENT_ITEMS.every((item) => agreements[item.id]);

  const handleToggleAgreement = (id: string) => {
    setAgreements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleAll = () => {
    const newValue = !allAgreed;
    const newAgreements: Record<string, boolean> = {};
    AGREEMENT_ITEMS.forEach((item) => {
      newAgreements[item.id] = newValue;
    });
    setAgreements(newAgreements);
  };

  const handleSubmit = () => {
    if (!allRequiredAgreed) return;
    // TODO: 보험 가입 처리
    console.log('Insurance enrollment submitted');
    void (async () => {
      await setInsuranceAutoEnrolled(true);
      router.back();
    })();
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
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>간병인배상책임보험 자동가입</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 보험 소개 */}
        <View style={styles.section}>
          <Text style={styles.insuranceTitle}>
            {MOCK_INSURANCE_DATA.caregiverName} 간병인을 위한{'\n'}
            {MOCK_INSURANCE_DATA.insurerName}
            {'\n'}
            {MOCK_INSURANCE_DATA.insuranceType}
          </Text>
          <Text style={styles.insuranceDesc}>
            전문인배상책임보험은 돌봄 서비스 중 발생할 수 있는 간병인의
            배상책임을 부담하는 보험입니다.
          </Text>

          {/* 자동가입 안내 */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>
              전문인배상책임보험 자동가입이란?
            </Text>
            <Text style={styles.infoBoxText}>
              최초 보험 자동가입 이후에는 별도의 본인인증 절차 없이 보험
              자동가입 동의만으로 일감 지원 및 매칭된 일감을 시작할 수 있습니다.
            </Text>
            <Text style={styles.infoBoxSubtitle}>
              전문인배상책임보험 자동가입 순서
            </Text>
            <Text style={styles.infoBoxList}>1. 본인 인증하기</Text>
            <Text style={styles.infoBoxList}>
              2. 가입 내용 확인 및 정보 제공 동의하기
            </Text>
            <Text style={styles.infoBoxList}>3. 가입 완료</Text>
          </View>
        </View>

        <Space y={10} />
        {/* 가입내용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가입내용</Text>

          <View style={styles.tableCard}>
            {/* Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableCellLeft}>
                <Text style={styles.tableLabel}>보험기간</Text>
              </View>
              <View style={styles.tableCellRight}>
                <Text style={styles.tableValueText}>
                  2025.11.21. 13:00{'\n'}~ 2025.11.25 10:00
                </Text>
              </View>
            </View>

            {/* Row */}
            <View style={styles.tableRow}>
              <View style={styles.tableCellLeft}>
                <Text style={styles.tableLabel}>소재지</Text>
              </View>
              <View style={styles.tableCellRight}>
                <Text style={styles.tableValueText}>
                  서울특별시 동작구 흑석로 102 (흑석동)
                </Text>
              </View>
            </View>

            {/* Row */}
            <View style={styles.tableRowLast}>
              <View style={styles.tableCellLeftLast}>
                <Text style={styles.tableLabel}>
                  담보사항{'\n'}전문업무{'\n'}보장내용
                </Text>
              </View>
              <View style={styles.tableCellRightLast}>
                <Text style={styles.tableValueText}>
                  전문인 배상책임위험(대인/대물){'\n'}
                  간병인업무(개인간병){'\n'}
                  1사고당 : 10,000,000원{'\n'}
                  1인당 : 연 100,000,000원{'\n'}
                  자기부담금 : 300,000원
                </Text>
              </View>
            </View>
          </View>

          {/* 전자 금융 약관보기 */}
          <TouchableOpacity style={styles.termsLink}>
            <Text style={styles.termsLinkText}>전자 금융 약관보기</Text>
            <Ionicons name="chevron-forward" size={16} color="#37383C9C" />
          </TouchableOpacity>

          {/* 기간 및 보험료 */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>이번 간병 기간</Text>
            <Text style={styles.summaryValue}>
              총 {MOCK_INSURANCE_DATA.careDays}일
            </Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.premiumRow}>
            <Text style={styles.premiumLabel}>총 기간 보험료</Text>
            <Text style={styles.premiumValue}>
              {MOCK_INSURANCE_DATA.totalPremium}
            </Text>
          </View>
        </View>

        <Divider
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#70737C38',
          }}
        />

        {/* 약관 상세 */}
        <Space y={20} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>약관 상세</Text>

          <View style={styles.termsDetailCard}>
            {TERMS_CONTENT.map((term, index) => (
              <View key={index} style={styles.termItem}>
                <Text style={styles.termTitle}>{term.title}</Text>
                <Text style={styles.termContent}>{term.content}</Text>
              </View>
            ))}
          </View>

          {/* 모두 동의하기 */}
          <TouchableOpacity
            style={styles.allAgreeRow}
            onPress={handleToggleAll}
          >
            <View
              style={[styles.checkbox, allAgreed && styles.checkboxChecked]}
            >
              {allAgreed && (
                <Ionicons name="checkmark-sharp" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.allAgreeText}>모두 동의하기</Text>
          </TouchableOpacity>
          <Space y={8} />

          {/* 개별 동의 항목 */}
          {AGREEMENT_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.agreementRow}
              onPress={() => handleToggleAgreement(item.id)}
            >
              <View style={styles.agreementLeft}>
                <View
                  style={[
                    styles.checkbox,
                    agreements[item.id] && styles.checkboxChecked,
                  ]}
                >
                  {agreements[item.id] && (
                    <Ionicons name="checkmark-sharp" size={14} color="#fff" />
                  )}
                </View>

                <Text style={styles.agreementText}>
                  {item.label}{' '}
                  <Text
                    style={item.required ? styles.required : styles.optional}
                  >
                    ({item.required ? '필수' : '선택'})
                  </Text>
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !allRequiredAgreed && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!allRequiredAgreed}
        >
          <Text
            style={[
              styles.submitButtonText,
              !allRequiredAgreed && styles.submitButtonTextDisabled,
            ]}
          >
            간병인배상책임보험 자동가입
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
    color: '#000000',
  },
  headerPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  insuranceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 32,
    marginBottom: 12,
  },
  insuranceDesc: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171719',
    lineHeight: 22,
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: '#F2F7FF',
    borderRadius: 10,
    padding: 20,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066FF',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#171719',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoBoxSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066FF',
    marginBottom: 8,
  },
  infoBoxList: {
    fontSize: 14,
    color: '#171719',
    marginBottom: 4,
  },
  tableCard: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  tableRowLast: {
    flexDirection: 'row',
  },

  tableCellLeft: {
    width: 80,
    padding: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },

  tableCellLeftLast: {
    width: 80,
    padding: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },

  tableCellRight: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },

  tableCellRightLast: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },

  tableLabel: {
    fontSize: 13,
    color: '#2E2F33E0',
    lineHeight: 20,
  },

  tableValueText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    textAlign: 'right',
  },

  termsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#70737C29',
    marginBottom: 8,
  },
  termsLinkText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2E2F33E0',
    marginRight: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#37383C9C',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2F33E0',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#70737C38',
    borderStyle: 'dashed',
  },
  premiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  premiumLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#282828',
  },
  premiumValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#282828',
  },
  termsDetailCard: {
    backgroundColor: '#F7F7F8',
    borderRadius: 14,
    padding: 20,
  },
  termItem: {
    marginBottom: 12,
  },
  termTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171719',
    marginBottom: 8,
    marginLeft: 8,
  },
  termContent: {
    fontSize: 14,
    color: '#2E2F33E0',
    lineHeight: 20,
  },
  allAgreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#70737C38',
  },
  allAgreeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginLeft: 3,
  },
  agreementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSmallChecked: {
    borderColor: '#EF4444',
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  agreementText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#171719',
  },
  required: {
    color: '#282828',
  },
  optional: {
    color: '#282828',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
  },
  submitButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#F4F4F5',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonTextDisabled: {
    color: '#37383C47',
  },
});
