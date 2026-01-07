import Button from '@/components/ui/Button';
import ToggleButtonGroup from '@/components/ui/ToggleButtonGroup';
import Typography from '@/components/ui/Typography';
import { apiClient } from '@/services/apiClient';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 자격증 목록
const CERTIFICATES = [
  { id: 'caregiver', label: '요양보호사' },
  { id: 'nursing_assistant', label: '간호조무사' },
  { id: 'postpartum', label: '산후관리사' },
  { id: 'private_caregiver', label: '간병사(민간자격증)' },
  { id: 'other', label: '기타 자격증' },
];

const DEVTOOLS_ENABLED = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === '1');

interface CertificateImage {
  uri: string;
  name: string;
}

export default function CareerScreen() {
  const router = useRouter();
  const { setCareerInfo, careerInfo, completeSignup, signupInfo, caregiverInfo } =
    useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 경력 여부 (false: 신입, true: 경력)
  const [hasExperience, setHasExperience] = useState(
    careerInfo?.hasExperience ?? false,
  );

  // 선택된 자격증 (id -> image 매핑)
  const [certificateImages, setCertificateImages] = useState<
    Record<string, CertificateImage | null>
  >({});

  // 기타 자격증 이름
  const [otherCertificateName, setOtherCertificateName] = useState('');

  const isCertificateSelected = (certId: string) => {
    return certId in certificateImages;
  };

  const toggleCertificate = (certId: string) => {
    setCertificateImages((prev) => {
      if (certId in prev) {
        // 선택 해제 - 해당 키 삭제
        const { [certId]: _, ...rest } = prev;
        // 기타 자격증인 경우 이름도 초기화
        if (certId === 'other') {
          setOtherCertificateName('');
        }
        return rest;
      } else {
        // 선택 - null 이미지로 추가 (펼쳐진 상태)
        return { ...prev, [certId]: null };
      }
    });
  };

  const handleImageUpload = async (certId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCertificateImages((prev) => ({
          ...prev,
          [certId]: {
            uri: asset.uri,
            name: asset.fileName || `certificate_${certId}.jpg`,
          },
        }));
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const handleRemoveImage = (certId: string) => {
    setCertificateImages((prev) => ({
      ...prev,
      [certId]: null,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Store에 저장
    const selectedCerts = Object.keys(certificateImages);
    setCareerInfo({
      hasExperience,
      certificates: selectedCerts,
    });

    try {
      const toDigits = (s: string) => s.replace(/\D/g, '');

      const isForeigner = signupInfo?.isDomestic === false;
      const front =
        (isForeigner ? signupInfo?.foreignRegFront : signupInfo?.rrnFront) ??
        caregiverInfo?.rrnFront ??
        '';
      const back =
        (isForeigner ? signupInfo?.foreignRegBack : signupInfo?.rrnBack) ??
        caregiverInfo?.rrnBack ??
        '';
      const idNumber = toDigits(`${front}${back}`);
      const DEV_DUMMY_ID = '9001011234567';
      const effectiveId = idNumber.length === 13 ? idNumber : DEV_DUMMY_ID;

      const phone = caregiverInfo?.phone ?? signupInfo?.phone ?? '';
      const address = caregiverInfo?.address ?? '';

      if (!phone || !address) {
        Alert.alert('알림', '간병인 정보(휴대폰/주소)를 먼저 입력해주세요.');
        router.replace('/signup/caregiver-info');
        return;
      }
      if (!DEVTOOLS_ENABLED && idNumber.length !== 13) {
        Alert.alert('알림', '주민/외국인등록번호 13자리를 확인해주세요.');
        router.replace('/signup/info');
        return;
      }

      const licenseType =
        selectedCerts.length > 0
          ? selectedCerts.join(',').slice(0, 64)
          : undefined;

      const payload = {
        phone,
        address,
        addressDetail: caregiverInfo?.addressDetail ?? undefined,
        experienceYears: hasExperience ? 1 : 0,
        licenseType,
        // Backend requires id number to exist to derive birthDate/gender.
        // DEV mode uses a deterministic dummy (non-PII) to keep the flow unblocked.
        isForeigner,
        residentNumber: isForeigner ? undefined : effectiveId,
        foreignerNumber: isForeigner ? effectiveId : undefined,
      };

      try {
        await apiClient.post('/caregivers/profile', payload);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 409) {
          await apiClient.put('/caregivers/profile', payload);
        } else {
          throw e;
        }
      }

      completeSignup();
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        '회원가입(프로필 생성)에 실패했습니다.';
      Alert.alert('오류', String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* 주의사항 배너 */}
        <View style={styles.warningBanner}>
          <Typography variant="label2.bold" color="#0066FF">
            주의해주세요!
          </Typography>
          <View style={styles.warningList}>
            {[
              '개인정보(주민등록번호, 주소 등)를 반드시 가린 후 촬영해주세요.',
              '자격증 명칭과 동일한 자격증 사진을 전체 이미지가 보이도록 촬영해주세요',
              '등록한 자격증은 인감 지원 시 보호자가 확인할 수 있습니다.',
            ].map((text, index) => (
              <View key={index} style={styles.listRow}>
                <Typography
                  variant="label2.regular"
                  color="label"
                  style={styles.listIndex}
                >
                  {index + 1}.
                </Typography>
                <Typography
                  variant="label2.regular"
                  color="label"
                  style={styles.listText}
                >
                  {text}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        {/* 경력 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            간병 경력이 있으신가요? <Text style={styles.required}>*</Text>
          </Text>
          <ToggleButtonGroup
            options={[
              { label: '신입', value: 'new' },
              { label: '경력', value: 'experienced' },
            ]}
            selectedValue={hasExperience ? 'experienced' : 'new'}
            onSelect={(value) => setHasExperience(value === 'experienced')}
            variant="label"
          />
        </View>

        {/* 자격증 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>보유한 자격증을 등록해주세요.</Text>
          <View style={styles.certificateList}>
            {CERTIFICATES.map((cert) => {
              const isSelected = isCertificateSelected(cert.id);
              const image = certificateImages[cert.id];

              return (
                <View key={cert.id}>
                  {/* 자격증 헤더 */}
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

                  {/* 이미지 업로드 영역 (선택된 경우에만 표시) */}
                  {isSelected && (
                    <View style={styles.uploadContainer}>
                      {/* 기타 자격증인 경우 자격증명 입력 필드 추가 */}
                      {cert.id === 'other' && (
                        <View style={styles.otherNameContainer}>
                          <Text style={styles.otherNameLabel}>
                            자격증명 <Text style={styles.required}>*</Text>
                          </Text>
                          <View style={styles.otherNameInputContainer}>
                            <TextInput
                              style={styles.otherNameInput}
                              placeholder="자격증 이름을 입력해주세요"
                              placeholderTextColor="#9CA3AF"
                              value={otherCertificateName}
                              onChangeText={setOtherCertificateName}
                            />
                            {otherCertificateName.length > 0 && (
                              <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => setOtherCertificateName('')}
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={20}
                                  color="#9CA3AF"
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      )}

                      {image ? (
                        // 이미지가 있는 경우
                        <View style={styles.imagePreviewContainer}>
                          <Image
                            source={{ uri: image.uri }}
                            style={styles.imagePreview}
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemoveImage(cert.id)}
                          >
                            <Ionicons
                              name="close-circle"
                              size={24}
                              color="#EF4444"
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        // 이미지가 없는 경우 - 업로드 버튼
                        <TouchableOpacity
                          style={styles.uploadButton}
                          onPress={() => handleImageUpload(cert.id)}
                        >
                          <Ionicons
                            name="cloud-upload-outline"
                            size={32}
                            color="#3B82F6"
                          />
                          <Text style={styles.uploadText}>자격증 등록하기</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* 가입 완료(상태 기반 CTA) */}
      <View style={styles.buttonContainer}>
        <Button title="가입 완료" onPress={handleSubmit} isLoading={isSubmitting} />
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  warningBanner: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F2F7FF',
    borderRadius: 10,
    marginBottom: 30,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  listIndex: {
    width: 18,
  },

  listText: {
    flex: 1,
    paddingRight: 2,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0066FF', // primary.normal
    marginBottom: 10,
  },
  warningList: {
    marginTop: 10,
  },
  warningItem: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  section: {
    // marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#171719',
    lineHeight: 20,
    marginBottom: 20,
  },
  required: {
    color: '#EF4444',
  },
  certificateList: {
    gap: 12,
  },
  certificateItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(112, 115, 124, 0.16)',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  certificateItemActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  certificateText: {
    fontSize: 16,
    color: 'rgba(55, 56, 60, 0.61)',
  },
  certificateTextActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  uploadContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#3B82F6',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderStyle: 'dashed',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  buttonContainer: {
    padding: 16,
  },
  // 기타 자격증 스타일
  otherNameContainer: {
    marginBottom: 16,
  },
  otherNameLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  otherNameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  otherNameInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
});
