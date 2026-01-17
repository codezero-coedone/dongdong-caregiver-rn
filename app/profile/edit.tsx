import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/ui/Button';
import FileUploadBox from '../../components/ui/FileUploadBox';
import Input from '../../components/ui/Input';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';

type Profile = {
  id: number;
  name: string;
  phone: string;
  address: string;
  addressDetail?: string;
  birthDate: string;
  gender: string;
  experienceYears: number;
  introduction?: string;
  licenseType?: string;
  licenseNumber?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
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
  const isLoggedIn = useAuthStore((s: any) => s.isLoggedIn);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Form state
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [hasExperience, setHasExperience] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>(
    [],
  );
  const [criminalRecordFile, setCriminalRecordFile] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
  } | null>(null);

  const [certificateFiles, setCertificateFiles] = useState<
    Record<string, { uri: string; name: string } | null>
  >({});

  const [otherCertificateName, setOtherCertificateName] = useState('');

  // Phone number formatting
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11,
    )}`;
  };

  const handlePhoneChange = (text: string) => {
    const numbers = text.replace(/[^\d]/g, '');
    setPhone(numbers);
  };

  function unwrapData<T>(resData: unknown): T {
    const anyRes = resData as any;
    if (anyRes && typeof anyRes === 'object' && 'data' in anyRes) {
      return anyRes.data as T;
    }
    return anyRes as T;
  }

  useEffect(() => {
    let alive = true;
    setLoadingProfile(true);
    setProfileError(null);
    if (!isLoggedIn) {
      // Guard: never call protected endpoints when not authenticated.
      setProfile(null);
      setLoadingProfile(false);
      setProfileError('로그인이 필요합니다.');
      return () => {
        alive = false;
      };
    }
    (async () => {
      try {
        const res = await apiClient.get('/caregivers/profile');
        const data = unwrapData<Profile>((res as any)?.data);
        if (!alive) return;
        setProfile(data ?? null);
        setPhone(String(data?.phone ?? ''));
        setAddress(String(data?.address ?? ''));
        setAddressDetail(String(data?.addressDetail ?? ''));
        setHasExperience(Number(data?.experienceYears ?? 0) > 0);
      } catch (e: any) {
        if (!alive) return;
        setProfile(null);
        setProfileError(
          e?.response?.data?.message ||
            e?.message ||
            '프로필을 불러오지 못했습니다.',
        );
      } finally {
        if (alive) setLoadingProfile(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

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
    setSelectedCertificates((prev) => {
      if (prev.includes(certId)) {
        setCertificateFiles((files) => {
          const { [certId]: _, ...rest } = files;
          return rest;
        });
        return prev.filter((id) => id !== certId);
      } else {
        setCertificateFiles((files) => ({
          ...files,
          [certId]: null,
        }));
        return [...prev, certId];
      }
    });
  };

  const handleCertificateUpload = async (certId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        setCertificateFiles((prev) => ({
          ...prev,
          [certId]: {
            uri: file.uri,
            name: file.name ?? 'certificate.jpg',
          },
        }));
      }
    } catch (e) {
      Alert.alert('오류', '이미지를 선택할 수 없습니다.');
    }
  };

  const handleSubmit = () => {
    void (async () => {
      try {
        await apiClient.put('/caregivers/profile', {
          phone,
          address,
          addressDetail,
        });
        Alert.alert('완료', '프로필이 수정되었습니다.', [
          { text: '확인', onPress: () => router.back() },
        ]);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          '프로필 수정에 실패했습니다.';
        Alert.alert('오류', String(msg));
      }
    })();
  };

  const genderLabel = (() => {
    const g = String(profile?.gender ?? '').toUpperCase();
    if (g === 'MALE') return '남성';
    if (g === 'FEMALE') return '여성';
    return String(profile?.gender ?? '');
  })();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>프로필 수정</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        nestedScrollEnabled
      >
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
              <Text style={styles.userName}>
                {loadingProfile ? '로딩 중…' : profile?.name ?? '간병인'}
              </Text>
              {!!profile?.isVerified && (
                <Ionicons name="checkmark-circle" size={18} color="#3B82F6" />
              )}
            </View>
          </View>

          {/* 생년월일 */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>생년월일</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>
                {profile?.birthDate ?? '-'}
              </Text>
              <Text style={styles.genderText}>{genderLabel || '-'}</Text>
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
            <View style={styles.verifyRow}>
              <Text style={styles.helperText}>
                이름, 성별, 생년월일 정보는 본인인증을 통해 변경할 수 있습니다.
              </Text>

              <TouchableOpacity>
                <Text style={styles.verifyLinkText}>본인인증하기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 주소 */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>주소</Text>
            {profileError && (
              <Text style={[styles.helperText, { color: '#EF4444' }]}>
                {String(profileError)}
              </Text>
            )}
            <Input
              containerClassName="mb-0"
              placeholder="주소"
              value={address}
              onChangeText={setAddress}
            />
            <View style={{ height: 8 }} />
            <Input
              containerClassName="mb-0"
              placeholder="상세 주소"
              value={addressDetail}
              onChangeText={setAddressDetail}
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
            {/* 신입 */}
            <TouchableOpacity
              style={[styles.toggleButton, styles.toggleButtonLeft]}
              onPress={() => setHasExperience(false)}
              activeOpacity={0.8}
            >
              {!hasExperience && (
                <>
                  <View style={styles.activeLeftBg} />
                  <View style={styles.activeLeftBorder} />
                </>
              )}

              {hasExperience && <View style={styles.middleDivider} />}

              <Text
                style={[
                  styles.toggleButtonText,
                  !hasExperience && styles.toggleButtonTextActive,
                ]}
              >
                신입
              </Text>
            </TouchableOpacity>

            {/* 경력 */}
            <TouchableOpacity
              style={[styles.toggleButton, styles.toggleButtonRight]}
              onPress={() => setHasExperience(true)}
              activeOpacity={0.8}
            >
              {hasExperience && (
                <>
                  <View style={styles.activeRightBg} />
                  <View style={styles.activeRightBorder} />
                </>
              )}

              <Text
                style={[
                  styles.toggleButtonText,
                  hasExperience && styles.toggleButtonTextActive,
                ]}
              >
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
              const file = certificateFiles[cert.id];

              return (
                <View key={cert.id}>
                  {/* 자격증 버튼 */}
                  <TouchableOpacity
                    style={[
                      styles.certificateItem,
                      isSelected && styles.certificateItemActive,
                    ]}
                    onPress={() => toggleCertificate(cert.id)}
                  >
                    <Text
                      style={[
                        styles.certificateText,
                        isSelected && styles.certificateTextActive,
                      ]}
                    >
                      {cert.label}
                    </Text>
                  </TouchableOpacity>

                  {isSelected && (
                    <>
                      {/* 기타 자격증 이름 입력 */}
                      {cert.id === 'other' && (
                        <View style={styles.otherNameContainer}>
                          <Text style={styles.otherNameLabel}>
                            자격증명 <Text style={styles.required}>*</Text>
                          </Text>

                          <View style={styles.otherNameInputContainer}>
                            <Text
                              style={styles.otherNameInput}
                              numberOfLines={1}
                            >
                              {otherCertificateName ||
                                '자격증 명을 입력해주세요'}
                            </Text>
                            {otherCertificateName.length > 0 && (
                              <TouchableOpacity
                                onPress={() => setOtherCertificateName('')}
                              >
                                <Ionicons
                                  name="close"
                                  size={18}
                                  color="#fff"
                                  style={styles.clearIcon}
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      )}

                      {/* 업로드 영역 */}
                      {file ? (
                        <View>
                          <Text style={{ fontSize: 14 }}>{file.name}</Text>
                          <TouchableOpacity
                            onPress={() => handleCertificateUpload(cert.id)}
                          >
                            <Text style={{ color: '#0066FF', marginTop: 6 }}>
                              다시 업로드
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.uploadBox}
                          onPress={() => handleCertificateUpload(cert.id)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.uploadIconWrapper}>
                            <Ionicons
                              name="arrow-up"
                              size={22}
                              color="#3B82F6"
                            />
                          </View>

                          <Text style={styles.uploadText}>자격증 등록하기</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
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
      {/* SSOT: caregiver 앱은 WebView 사용 금지. (주소 검색은 1차 범위에서 제외) */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#70737C29',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  sectionIcon: {
    fontSize: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#70737C14',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#171719',
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2F33E0',
    marginBottom: 8,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#70737C29',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#171719',
    flex: 1,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#37383C47',
  },
  verifyLink: {
    alignSelf: 'flex-end',
    marginTop: 14,
  },
  verifyLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066FF',
  },
  verifyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  helperText: {
    maxWidth: '70%',
    flex: 1,
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    marginTop: 8,
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
    borderColor: '#0066FF',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleButtonTextActive: {
    color: '#0066FF',
  },
  middleDivider: {
    position: 'absolute',
    right: 0,
    top: 1,
    width: 1,
    height: 46,
    backgroundColor: 'rgba(112,115,124,0.22)',
  },
  activeLeftBg: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#0066FF',
    opacity: 0.05,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  activeRightBg: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#0066FF',
    opacity: 0.05,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  activeLeftBorder: {
    position: 'absolute',
    inset: 0,
    borderWidth: 1,
    borderColor: '#0066FF',
    opacity: 0.43,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  activeRightBorder: {
    position: 'absolute',
    inset: 0,
    borderWidth: 1,
    borderColor: '#0066FF',
    opacity: 0.43,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
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
  otherNameContainer: {
    // marginBottom: 10,
  },
  otherNameLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 10,
  },
  required: {
    color: '#EF4444',
  },
  otherNameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  otherNameInput: {
    fontSize: 16,
    color: '#37383C9C',
    flex: 1,
  },
  clearIcon: {
    backgroundColor: '#3A1E1E',
    borderRadius: 999,
    padding: 6,
  },
  uploadContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#3B82F6',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  uploadBox: {
    height: 160,
    borderWidth: 1,
    borderColor: '#93B4FF',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
  },

  uploadIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },

  buttonContainer: {
    padding: 20,
  },
});
