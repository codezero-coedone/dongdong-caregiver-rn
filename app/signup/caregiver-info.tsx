import { CaregiverInfo, useAuthStore } from '@/store/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import FileUploadBox from '../../components/ui/FileUploadBox';
import Input from '../../components/ui/Input';
import MaskedRRNInput from '../../components/ui/MaskedRRNInput';
import WarningBanner from '../../components/ui/WarningBanner';

import { isDevtoolsEnabled } from '@/services/devlog';

const DEVTOOLS_ENABLED = isDevtoolsEnabled();

// Zod Schema
const caregiverInfoSchema = z
  .object({
    name: z.string().min(1, '이름을 입력해주세요.'),
    rrnFront: z.string().optional(),
    rrnBack: z.string().optional(),
    phone: z.string().min(10, '올바른 휴대폰 번호를 입력해주세요.'),
    address: z.string().min(1, '주소를 입력해주세요.'),
    addressDetail: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    // DEVTOOLS=1 레일에서는 PII(주민번호) 강제 입력을 걷어낸다.
    if (DEVTOOLS_ENABLED) return;
    if (!val.rrnFront || String(val.rrnFront).length !== 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rrnFront'],
        message: '주민등록번호 앞자리 6자리를 입력해주세요.',
      });
    }
    if (!val.rrnBack || String(val.rrnBack).length !== 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rrnBack'],
        message: '주민등록번호 뒷자리 7자리를 입력해주세요.',
      });
    }
  });

type CaregiverFormData = z.infer<typeof caregiverInfoSchema>;

export default function CaregiverInfoScreen() {
  const router = useRouter();
  const { setCaregiverInfo, caregiverInfo, signupInfo } = useAuthStore();
  const isDomestic = signupInfo?.isDomestic ?? true;
  const [criminalRecordFile, setCriminalRecordFile] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
  } | null>(caregiverInfo?.criminalRecordFile || null);

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CaregiverFormData>({
    resolver: zodResolver(caregiverInfoSchema),
    mode: 'onBlur',
    defaultValues: {
      name: caregiverInfo?.name || '',
      rrnFront: caregiverInfo?.rrnFront || '',
      rrnBack: caregiverInfo?.rrnBack || '',
      phone: caregiverInfo?.phone || '',
      address: caregiverInfo?.address || '',
      addressDetail: caregiverInfo?.addressDetail || '',
    },
  });

  const phone = watch('phone');

  // Phone number formatting helper
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

  const handlePhoneChange =
    (onChange: (value: string) => void) => (text: string) => {
      const numbers = text.replace(/[^\d]/g, '');
      onChange(numbers);
    };

  // SSOT: caregiver 앱은 WebView 사용 금지.
  // 주소 검색(다음/웹) 대신 수동 입력으로 진행합니다.

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

  const onSubmit = (data: CaregiverFormData) => {
    const caregiverData: CaregiverInfo = {
      name: data.name,
      phone: data.phone,
      address: data.address,
      addressDetail: data.addressDetail || '',
      rrnFront: DEVTOOLS_ENABLED ? undefined : data.rrnFront,
      rrnBack: DEVTOOLS_ENABLED ? undefined : data.rrnBack,
      criminalRecordFile: DEVTOOLS_ENABLED ? null : criminalRecordFile,
    };

    setCaregiverInfo(caregiverData);

    // Navigate to career screen (자격증 및 경력 등록)
    router.push('/signup/career');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Warning Banner */}
        <WarningBanner message="허위 정보 기재 시 계정 제재 가능성 고지 알림" />

        {/* Section Title */}
        <Text
          style={{
            marginBottom: 30,
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 28,
            color: '#171719',
          }}
        >
          간병인 정보를 입력해주세요
        </Text>

        {/* Name Field */}
        <View className="mb-5">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{
              color: 'rgba(46,47,51,0.88)',
              lineHeight: 20,
              letterSpacing: 0.2,
            }}
          >
            이름
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                containerClassName="mb-0"
                placeholder="김간병"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                isValid={value.length > 0 && !errors.name}
              />
            )}
          />
        </View>

        {/* ID Number Field (PII) */}
        {!DEVTOOLS_ENABLED && (
          <View className="mb-5">
            <Text
              className="mb-2 text-sm font-semibold"
              style={{
                color: 'rgba(46,47,51,0.88)',
                lineHeight: 20,
                letterSpacing: 0.2,
              }}
            >
              {isDomestic ? '주민등록번호' : '외국인등록번호'}
            </Text>
            <View className="flex-row items-center">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="rrnFront"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      containerClassName="flex-1 mb-0"
                      placeholder={isDomestic ? '801225' : '800515'}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.rrnFront?.message}
                    />
                  )}
                />
              </View>
              <Text className="mx-2 text-gray-400">-</Text>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="rrnBack"
                  render={({ field: { onChange, value } }) => (
                    <MaskedRRNInput value={value} onChangeText={onChange} />
                  )}
                />
              </View>
            </View>
          </View>
        )}

        {/* Phone Field */}
        <View className="mb-5">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{
              color: 'rgba(46,47,51,0.88)',
              lineHeight: 20,
              letterSpacing: 0.2,
            }}
          >
            휴대폰
          </Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                containerClassName="mb-0"
                placeholder="010-1234-5678"
                keyboardType="phone-pad"
                value={formatPhoneNumber(value)}
                onChangeText={handlePhoneChange(onChange)}
                onBlur={onBlur}
                error={errors.phone?.message}
                isValid={value.length >= 10 && !errors.phone}
              />
            )}
          />
        </View>

        {/* Address Field */}
        <View className="mb-5">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{
              color: 'rgba(46,47,51,0.88)',
              lineHeight: 20,
              letterSpacing: 0.2,
            }}
          >
            주소
          </Text>
          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                containerClassName="mb-0"
                placeholder="예) 서울특별시 강남구 테헤란로 123"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.address?.message}
                isValid={Boolean(value) && !errors.address}
              />
            )}
          />

          <View style={{ height: 8 }} />

          <Controller
            control={control}
            name="addressDetail"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                containerClassName="mb-0"
                placeholder="상세 주소 (선택)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>

        {/* Criminal Record File Upload (PII risk) */}
        {!DEVTOOLS_ENABLED && (
          <View className="mb-5">
            <Text
              className="mb-2 text-sm font-semibold"
              style={{
                color: 'rgba(46,47,51,0.88)',
                lineHeight: 20,
                letterSpacing: 0.2,
              }}
            >
              범죄경력회보서 (선택)
            </Text>
            <FileUploadBox file={criminalRecordFile} onPress={handleFileUpload} />
          </View>
        )}

        {/* Referral Code Field */}
        <View className="mb-6">
          <Text
            className="mb-2 text-sm font-semibold"
            style={{
              color: 'rgba(46,47,51,0.88)',
              lineHeight: 20,
              letterSpacing: 0.2,
            }}
          >
            지인 추천 코드 입력
          </Text>
          <Input containerClassName="mb-0" placeholder="예) A12345" />
          <Text className="mt-2 text-sm text-gray-400">
            가족이나 지인에게 추천받고 가입하셨다면 코드를 입력해주세요
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-6">
        <Button title="입력 완료" onPress={handleSubmit(onSubmit)} />
      </View>
    </SafeAreaView>
  );
}
