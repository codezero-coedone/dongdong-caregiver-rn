import ChevronIcon from '@/assets/images/icons/bottom_chervon.svg';
import CheckboxOff from '@/assets/images/icons/checkbox_off.svg';
import CheckboxOn from '@/assets/images/icons/checkbox_on.svg';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import TermsAccordion from '../../components/ui/TermsAccordion';

export default function TermsScreen() {
    const router = useRouter();
    const { completeSignup } = useAuthStore();

    // Checkbox states
    const [allAgree, setAllAgree] = useState(false);
    const [termsAgree, setTermsAgree] = useState(false);
    const [privacyAgree, setPrivacyAgree] = useState(false);
    const [marketingAgree, setMarketingAgree] = useState(false);

    // Check if all required checkboxes are checked
    const isRequiredChecked = termsAgree && privacyAgree;

    // Handle "모두 동의하기" toggle
    const handleAllAgree = () => {
        const newValue = !allAgree;
        setAllAgree(newValue);
        setTermsAgree(newValue);
        setPrivacyAgree(newValue);
        setMarketingAgree(newValue);
    };

    // Update allAgree based on individual checkboxes
    const updateAllAgree = (terms: boolean, privacy: boolean, marketing: boolean) => {
        setAllAgree(terms && privacy && marketing);
    };

    const handleTermsToggle = () => {
        const newValue = !termsAgree;
        setTermsAgree(newValue);
        updateAllAgree(newValue, privacyAgree, marketingAgree);
    };

    const handlePrivacyToggle = () => {
        const newValue = !privacyAgree;
        setPrivacyAgree(newValue);
        updateAllAgree(termsAgree, newValue, marketingAgree);
    };

    const handleMarketingToggle = () => {
        const newValue = !marketingAgree;
        setMarketingAgree(newValue);
        updateAllAgree(termsAgree, privacyAgree, newValue);
    };

    const handleSubmit = () => {
        completeSignup();
        // Navigation handled by _layout based on auth state
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                {/* Title */}
                <Text style={styles.title}>
                    약관에 동의하시면{'\n'}회원가입이 완료됩니다.
                </Text>

                {/* Placeholder Image */}
                <View style={styles.imagePlaceholder} />

                {/* All Agree */}
                <View style={styles.allAgreeContainer}>
                    <TouchableOpacity onPress={handleAllAgree} style={styles.allAgreeRow}>
                        {allAgree ? (
                            <CheckboxOn width={18} height={18} style={styles.checkboxIcon} />
                        ) : (
                            <CheckboxOff width={18} height={18} style={styles.checkboxIcon} />
                        )}
                        <Text style={styles.allAgreeText}>모두 동의하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAllAgree}>
                        <ChevronIcon width={20} height={20} />
                    </TouchableOpacity>
                </View>

                {/* Individual Terms */}
                <TermsAccordion
                    title="이용약관"
                    required={true}
                    checked={termsAgree}
                    onCheck={handleTermsToggle}
                    contentTitle="이용약관"
                    contentDescription="동동 서비스 이용약관에 대한 상세 내용입니다. 본 약관은 서비스 이용에 관한 기본적인 사항을 규정합니다."
                />

                <TermsAccordion
                    title="개인정보 처리 방침"
                    required={true}
                    checked={privacyAgree}
                    onCheck={handlePrivacyToggle}
                    contentTitle="개인정보 처리 방침"
                    contentDescription="개인정보의 수집, 이용, 보관, 파기에 관한 사항을 안내합니다. 귀하의 개인정보는 안전하게 보호됩니다."
                />

                <TermsAccordion
                    title="마케팅 정보 수신 동의"
                    required={false}
                    checked={marketingAgree}
                    onCheck={handleMarketingToggle}
                    contentTitle="제목"
                    contentDescription="제목에 대한 상세 내용을 입력해주세요.
접은 상태를 기본값으로 사용하세요."
                />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
                <Button
                    title="가입하기"
                    onPress={handleSubmit}
                    disabled={!isRequiredChecked}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        lineHeight: 32,
        marginBottom: 24,
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        marginBottom: 32,
    },
    allAgreeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    allAgreeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxIcon: {
        marginRight: 12,
    },
    allAgreeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    buttonContainer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
});
