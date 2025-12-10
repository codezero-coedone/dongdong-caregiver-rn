import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AddressInput from '../../components/ui/AddressInput';
import Button from '../../components/ui/Button';
import DaumPostcode, { PostcodeData } from '../../components/ui/DaumPostcode';
import FileUploadBox from '../../components/ui/FileUploadBox';
import Input from '../../components/ui/Input';

// Mock 사용자 데이터 (실제로는 Store에서 가져옴)
const MOCK_USER_DATA = {
    name: '김간병',
    isVerified: true,
    birthDate: '1980.12.25',
    gender: '남성',
    phone: '01012341234',
    address: '서울특별시 강남구 삼성동 꿈빛로 16',
    addressDetail: '레미안 아파트, 123-1234',
    hasExperience: true,
    certificates: ['caregiver', 'nursing_assistant'],
};

// 자격증 목록
const CERTIFICATES = [
    { id: 'caregiver', label: '요양보호사' },
    { id: 'nursing_assistant', label: '간호조무사' },
    { id: 'postpartum', label: '산후관리사' },
    { id: 'private_caregiver', label: '간병사(민간자격증)' },
    { id: 'other', label: '기타 자격증' },
];

export default function ProfileEditScreen() {
    const router = useRouter();

    // Form state
    const [phone, setPhone] = useState(MOCK_USER_DATA.phone);
    const [address, setAddress] = useState(MOCK_USER_DATA.address);
    const [addressDetail, setAddressDetail] = useState(MOCK_USER_DATA.addressDetail);
    const [hasExperience, setHasExperience] = useState(MOCK_USER_DATA.hasExperience);
    const [selectedCertificates, setSelectedCertificates] = useState<string[]>(MOCK_USER_DATA.certificates);
    const [criminalRecordFile, setCriminalRecordFile] = useState<{ uri: string; name: string; mimeType?: string } | null>(null);

    // Postcode modal state
    const [isPostcodeVisible, setIsPostcodeVisible] = useState(false);

    // Phone number formatting
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (text: string) => {
        const numbers = text.replace(/[^\d]/g, '');
        setPhone(numbers);
    };

    const handleAddressSearch = () => {
        setIsPostcodeVisible(true);
    };

    const handlePostcodeSelect = (data: PostcodeData) => {
        setAddress(data.roadAddress || data.address);
        setAddressDetail('');
    };

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setCriminalRecordFile({
                    uri: file.uri,
                    name: file.name,
                    mimeType: file.mimeType,
                });
            }
        } catch (error) {
            Alert.alert('오류', '파일을 선택하는 중 오류가 발생했습니다.');
        }
    };

    const toggleCertificate = (certId: string) => {
        setSelectedCertificates(prev => {
            if (prev.includes(certId)) {
                return prev.filter(id => id !== certId);
            } else {
                return [...prev, certId];
            }
        });
    };

    const handleSubmit = () => {
        // TODO: Save profile changes to store/backend
        console.log('Profile updated:', {
            phone,
            address,
            addressDetail,
            hasExperience,
            certificates: selectedCertificates,
            criminalRecordFile,
        });

        Alert.alert('완료', '프로필이 수정되었습니다.', [
            { text: '확인', onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* 회원 정보 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.sectionIcon}>👤</Text> 회원 정보
                    </Text>

                    {/* 프로필 이미지 */}
                    <View style={styles.profileRow}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={28} color="#9CA3AF" />
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.userName}>{MOCK_USER_DATA.name}</Text>
                            {MOCK_USER_DATA.isVerified && (
                                <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
                            )}
                        </View>
                    </View>

                    {/* 생년월일 */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>생년월일</Text>
                        <View style={styles.readOnlyField}>
                            <Text style={styles.readOnlyText}>{MOCK_USER_DATA.birthDate}</Text>
                            <Text style={styles.genderText}>{MOCK_USER_DATA.gender}</Text>
                        </View>
                    </View>

                    {/* 휴대폰 */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>휴대폰</Text>
                        <Input
                            containerClassName="mb-0"
                            placeholder="010-1234-5678"
                            keyboardType="phone-pad"
                            value={formatPhoneNumber(phone)}
                            onChangeText={handlePhoneChange}
                        />
                        <TouchableOpacity style={styles.verifyLink}>
                            <Text style={styles.verifyLinkText}>본인인증하기</Text>
                        </TouchableOpacity>
                        <Text style={styles.helperText}>
                            이름, 성별, 생년월일 정보는 본인인증을 통해 변경할 수 있습니다.
                        </Text>
                    </View>

                    {/* 주소 */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>주소</Text>
                        <AddressInput
                            address={address}
                            addressDetail={addressDetail}
                            onAddressDetailChange={setAddressDetail}
                            onSearchPress={handleAddressSearch}
                        />
                    </View>

                    {/* 범죄경력회보서 */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>범죄경력회보서</Text>
                        <FileUploadBox
                            file={criminalRecordFile}
                            onPress={handleFileUpload}
                        />
                        <Text style={styles.helperText}>
                            파일은 최대 5MB까지 업로드할 수 있습니다.
                        </Text>
                    </View>
                </View>

                {/* 경력 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.sectionIcon}>📋</Text> 경력
                    </Text>
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                styles.toggleButtonLeft,
                                !hasExperience && styles.toggleButtonActive,
                            ]}
                            onPress={() => setHasExperience(false)}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                !hasExperience && styles.toggleButtonTextActive,
                            ]}>
                                신입
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                styles.toggleButtonRight,
                                hasExperience && styles.toggleButtonActive,
                            ]}
                            onPress={() => setHasExperience(true)}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                hasExperience && styles.toggleButtonTextActive,
                            ]}>
                                경력
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 자격증 섹션 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Text style={styles.sectionIcon}>📜</Text> 자격증
                    </Text>
                    <View style={styles.certificateList}>
                        {CERTIFICATES.map((cert) => {
                            const isSelected = selectedCertificates.includes(cert.id);
                            return (
                                <TouchableOpacity
                                    key={cert.id}
                                    style={[
                                        styles.certificateItem,
                                        isSelected && styles.certificateItemActive,
                                    ]}
                                    onPress={() => toggleCertificate(cert.id)}
                                >
                                    <Text style={[
                                        styles.certificateText,
                                        isSelected && styles.certificateTextActive,
                                    ]}>
                                        {cert.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* 수정하기 버튼 */}
            <View style={styles.buttonContainer}>
                <Button title="수정하기" onPress={handleSubmit} />
            </View>

            {/* 주소 검색 모달 */}
            <DaumPostcode
                visible={isPostcodeVisible}
                onClose={() => setIsPostcodeVisible(false)}
                onSelected={handlePostcodeSelect}
            />
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
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
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
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    readOnlyField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    readOnlyText: {
        fontSize: 15,
        color: '#6B7280',
        flex: 1,
    },
    genderText: {
        fontSize: 15,
        color: '#6B7280',
    },
    verifyLink: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    verifyLinkText: {
        fontSize: 13,
        color: '#EF4444',
        textDecorationLine: 'underline',
    },
    helperText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 6,
        lineHeight: 16,
    },
    toggleContainer: {
        flexDirection: 'row',
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    toggleButtonLeft: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        borderRightWidth: 0,
    },
    toggleButtonRight: {
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    toggleButtonActive: {
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
    },
    toggleButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#6B7280',
    },
    toggleButtonTextActive: {
        color: '#3B82F6',
    },
    certificateList: {
        gap: 10,
    },
    certificateItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    certificateItemActive: {
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
    },
    certificateText: {
        fontSize: 15,
        color: '#374151',
    },
    certificateTextActive: {
        color: '#3B82F6',
        fontWeight: '500',
    },
    buttonContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
});
