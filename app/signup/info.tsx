import ExistingMemberModal from '@/components/auth/ExistingMemberModal';
import Button from '@/components/ui/Button';
import DateInput from '@/components/ui/DateInput';
import Input from '@/components/ui/Input';
import MaskedRRNInput from '@/components/ui/MaskedRRNInput';
import SelectInput from '@/components/ui/SelectInput';
import ToggleButtonGroup from '@/components/ui/ToggleButtonGroup';
import {
  requestPhoneVerification,
  verifyPhoneCode,
} from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

// 비자 종류 옵션
const VISA_TYPES = [
  { label: 'E-9 (비전문취업)', value: 'E-9' },
  { label: 'H-2 (방문취업)', value: 'H-2' },
  { label: 'F-4 (재외동포)', value: 'F-4' },
  { label: 'F-5 (영주)', value: 'F-5' },
  { label: 'F-6 (결혼이민)', value: 'F-6' },
  { label: 'D-2 (유학)', value: 'D-2' },
  { label: 'D-6 (종교)', value: 'D-6' },
  { label: 'E-7 (특정활동)', value: 'E-7' },
  { label: '기타', value: 'OTHER' },
];

// 가입 불가 비자 타입
const DISALLOWED_VISA_TYPES = ['D-6'];

// 내국인용 Zod Schema
const domesticSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  rrnFront: z.string().length(6, '주민등록번호 앞자리 6자리를 입력해주세요.'),
  rrnBack: z.string().length(7, '주민등록번호 뒷자리 7자리를 입력해주세요.'),
  phone: z.string().min(10, '올바른 휴대폰 번호를 입력해주세요.'),
});

// 외국인용 Zod Schema
const foreignerSchema = z.object({
  koreanName: z.string().min(1, '한글 이름을 입력해주세요.'),
  englishName: z.string().min(1, '영문 이름을 입력해주세요.'),
  foreignRegFront: z
    .string()
    .length(6, '외국인등록번호 앞자리 6자리를 입력해주세요.'),
  foreignRegBack: z
    .string()
    .length(7, '외국인등록번호 뒷자리 7자리를 입력해주세요.'),
  visaType: z
    .string()
    .min(1, '비자 종류를 선택해주세요.')
    .refine((val) => !DISALLOWED_VISA_TYPES.includes(val), {
      message: '가입할 수 없는 비자입니다.',
    }),
  visaExpiryDate: z.string().min(1, '비자 만료일을 선택해주세요.'),
  phone: z.string().min(10, '올바른 휴대폰 번호를 입력해주세요.'),
});

type DomesticFormData = z.infer<typeof domesticSchema>;
type ForeignerFormData = z.infer<typeof foreignerSchema>;

export default function SignupInfoScreen() {
  const router = useRouter();
  const { setSignupInfo, signupInfo } = useAuthStore();
  const [isDomestic, setIsDomestic] = useState(signupInfo?.isDomestic ?? true);

  // 내국인용 React Hook Form
  const domesticForm = useForm<DomesticFormData>({
    resolver: zodResolver(domesticSchema),
    mode: 'onBlur',
    defaultValues: {
      name: signupInfo?.name || '',
      rrnFront: signupInfo?.rrnFront || '',
      rrnBack: signupInfo?.rrnBack || '',
      phone: signupInfo?.phone || '',
    },
  });

  // 외국인용 React Hook Form
  const foreignerForm = useForm<ForeignerFormData>({
    resolver: zodResolver(foreignerSchema),
    mode: 'onBlur',
    defaultValues: {
      koreanName: signupInfo?.koreanName || '',
      englishName: signupInfo?.englishName || '',
      foreignRegFront: signupInfo?.foreignRegFront || '',
      foreignRegBack: signupInfo?.foreignRegBack || '',
      visaType: signupInfo?.visaType || '',
      visaExpiryDate: signupInfo?.visaExpiryDate || '',
      phone: signupInfo?.phone || '',
    },
  });

  // Watch phone from both forms
  const domesticPhone = domesticForm.watch('phone');
  const foreignerPhone = foreignerForm.watch('phone');
  const phone = isDomestic ? domesticPhone : foreignerPhone;

  const [verificationCode, setVerificationCode] = useState('');
  const [visaExpiryDateValue, setVisaExpiryDateValue] = useState<Date | null>(
    signupInfo?.visaExpiryDate ? new Date(signupInfo.visaExpiryDate) : null,
  );

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

  // Verification State
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // Reset verification state when switching between domestic/foreigner
  useEffect(() => {
    setIsVerificationSent(false);
    setIsVerified(false);
    setVerificationCode('');
    setTimer(0);
  }, [isDomestic]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRequestVerification = async () => {
    // Trigger phone validation first
    const trigger = isDomestic ? domesticForm.trigger : foreignerForm.trigger;
    const isPhoneValid = await trigger('phone');
    if (!isPhoneValid) return;

    // Check if phone is already registered (mock: 01024669262)
    if (phone === '01024669262') {
      setModalVisible(true);
      return;
    }

    try {
      const result = await requestPhoneVerification(phone);
      if (result.success) {
        setIsVerificationSent(true);
        setTimer(180); // 3 minutes
        Alert.alert('알림', result.message);
      }
    } catch (error) {
      Alert.alert('오류', '인증번호 발송에 실패했습니다.');
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 4) {
      Alert.alert('알림', '인증번호 4자리를 입력해주세요.');
      return;
    }
    try {
      const result = await verifyPhoneCode(phone, verificationCode);
      if (result.success) {
        setIsVerified(true);
        setTimer(0);
        Alert.alert('알림', result.message);
      } else {
        Alert.alert('오류', result.message);
      }
    } catch (error) {
      Alert.alert('오류', '인증 확인 중 오류가 발생했습니다.');
    }
  };

  const onDomesticSubmit = (data: DomesticFormData) => {
    if (!isVerified) {
      Alert.alert('알림', '휴대폰 인증을 완료해주세요.');
      return;
    }
    setSignupInfo({
      name: data.name,
      rrnFront: data.rrnFront,
      rrnBack: data.rrnBack,
      phone: data.phone,
      isDomestic: true,
    });
    router.replace('/signup/terms');
  };

  const onForeignerSubmit = (data: ForeignerFormData) => {
    if (!isVerified) {
      Alert.alert('알림', '휴대폰 인증을 완료해주세요.');
      return;
    }
    setSignupInfo({
      koreanName: data.koreanName,
      englishName: data.englishName,
      foreignRegFront: data.foreignRegFront,
      foreignRegBack: data.foreignRegBack,
      visaType: data.visaType,
      visaExpiryDate: data.visaExpiryDate,
      phone: data.phone,
      isDomestic: false,
    });
    router.replace('/signup/terms');
  };

  const handleDateChange = (date: Date | null) => {
    setVisaExpiryDateValue(date);
    if (date) {
      const formattedDate = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      foreignerForm.setValue('visaExpiryDate', formattedDate, {
        shouldValidate: true,
      });
    } else {
      foreignerForm.setValue('visaExpiryDate', '', { shouldValidate: true });
    }
  };

  const currentErrors = isDomestic
    ? domesticForm.formState.errors
    : foreignerForm.formState.errors;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Toggle */}
        <ToggleButtonGroup
          options={[
            { label: '내국인', value: 'domestic' },
            { label: '외국인', value: 'foreigner' },
          ]}
          selectedValue={isDomestic ? 'domestic' : 'foreigner'}
          onSelect={(value) => setIsDomestic(value === 'domestic')}
          variant="headline"
        />

        {/* 내국인 Form */}
        {isDomestic ? (
          <>
            <View className="mb-5">
              <Text
                className="mb-2 text-sm font-semibold"
                style={{
                  color: 'rgba(46,47,51,0.88)',
                  lineHeight: 20,
                  letterSpacing: 0.2,
                }}
              >
                이름 <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>

              <Controller
                control={domesticForm.control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="홍길동"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={domesticForm.formState.errors.name?.message}
                    isValid={
                      value.length > 0 && !domesticForm.formState.errors.name
                    }
                  />
                )}
              />
            </View>

            <View className="mb-5">
              <Text
                className="mb-2 text-sm font-semibold"
                style={{
                  color: 'rgba(46,47,51,0.88)',
                  lineHeight: 20,
                  letterSpacing: 0.2,
                }}
              >
                주민등록번호 <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>

              <View className="flex-row items-center">
                <View className="flex-1">
                  <Controller
                    control={domesticForm.control}
                    name="rrnFront"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        containerClassName="flex-1 mb-0"
                        placeholder="801232"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={domesticForm.formState.errors.rrnFront?.message}
                      />
                    )}
                  />
                </View>
                <Text
                  style={{
                    marginHorizontal: 8,
                    fontSize: 16,
                    lineHeight: 24,
                    color: 'rgba(112,115,124,0.48)',
                  }}
                >
                  -
                </Text>
                <View className="flex-1">
                  <Controller
                    control={domesticForm.control}
                    name="rrnBack"
                    render={({ field: { onChange, value } }) => (
                      <MaskedRRNInput value={value} onChangeText={onChange} />
                    )}
                  />
                </View>
              </View>
            </View>

            <View className="mb-5">
              <Text
                className="mb-2 text-sm font-semibold"
                style={{
                  color: 'rgba(46,47,51,0.88)',
                  lineHeight: 20,
                  letterSpacing: 0.2,
                }}
              >
                휴대폰 <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <Controller
                control={domesticForm.control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    containerClassName="mb-0"
                    placeholder="010-1234-5678"
                    keyboardType="phone-pad"
                    value={formatPhoneNumber(value)}
                    onChangeText={handlePhoneChange(onChange)}
                    onBlur={onBlur}
                    editable={!isVerified}
                    error={domesticForm.formState.errors.phone?.message}
                    isValid={
                      value.length >= 10 && !domesticForm.formState.errors.phone
                    }
                  />
                )}
              />
            </View>
          </>
        ) : (
          /* 외국인 Form */
          <>
            <View className="mb-4">
              <Text className="mb-2 text-sm font-bold text-gray-800">
                한글 이름 <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <Controller
                control={foreignerForm.control}
                name="koreanName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    containerClassName="mb-0"
                    placeholder="홍길동"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={foreignerForm.formState.errors.koreanName?.message}
                    isValid={
                      value.length > 0 &&
                      !foreignerForm.formState.errors.koreanName
                    }
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-bold text-gray-800">
                영문 이름 <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <Controller
                control={foreignerForm.control}
                name="englishName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    containerClassName="mb-0"
                    placeholder="Hong Gildong"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={foreignerForm.formState.errors.englishName?.message}
                    isValid={
                      value.length > 0 &&
                      !foreignerForm.formState.errors.englishName
                    }
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-bold text-gray-800">
                외국인등록번호 <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <View className="flex-row items-center">
                <Controller
                  control={foreignerForm.control}
                  name="foreignRegFront"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      containerClassName="flex-1 mb-0"
                      placeholder="801232"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={
                        foreignerForm.formState.errors.foreignRegFront?.message
                      }
                      isValid={
                        value.length === 6 &&
                        !foreignerForm.formState.errors.foreignRegFront
                      }
                    />
                  )}
                />
                <Text className="mx-2 text-gray-400">-</Text>
                <View className="flex-1">
                  <Controller
                    control={foreignerForm.control}
                    name="foreignRegBack"
                    render={({ field: { onChange, value } }) => (
                      <MaskedRRNInput value={value} onChangeText={onChange} />
                    )}
                  />
                </View>
              </View>
            </View>

            <Controller
              control={foreignerForm.control}
              name="visaType"
              render={({ field: { onChange, value } }) => (
                <SelectInput
                  label="비자 종류"
                  placeholder="선택해주세요."
                  value={value}
                  options={VISA_TYPES}
                  onSelect={(val) => {
                    onChange(val);
                    // 선택 시 즉시 유효성 검사 트리거
                    foreignerForm.trigger('visaType');
                  }}
                  error={foreignerForm.formState.errors.visaType?.message}
                  isValid={!!value && !foreignerForm.formState.errors.visaType}
                />
              )}
            />

            <DateInput
              label="비자 만료일"
              placeholder="yyyy-mm-dd"
              value={visaExpiryDateValue}
              onChange={handleDateChange}
              error={foreignerForm.formState.errors.visaExpiryDate?.message}
              isValid={
                !!visaExpiryDateValue &&
                !foreignerForm.formState.errors.visaExpiryDate
              }
              minimumDate={new Date()}
            />

            <View className="mb-4">
              <Text className="mb-2 text-sm font-bold text-gray-800">
                휴대폰 <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <Controller
                control={foreignerForm.control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    containerClassName="mb-0"
                    placeholder="010-1234-6789"
                    keyboardType="phone-pad"
                    value={formatPhoneNumber(value)}
                    onChangeText={handlePhoneChange(onChange)}
                    onBlur={onBlur}
                    editable={!isVerified}
                    error={foreignerForm.formState.errors.phone?.message}
                    isValid={
                      value.length >= 10 &&
                      !foreignerForm.formState.errors.phone
                    }
                  />
                )}
              />
            </View>
          </>
        )}

        {/* 인증번호 입력 */}
        {isVerificationSent && (
          <View className="mb-5">
            <Text
              className="mb-2 text-sm font-semibold"
              style={{
                color: 'rgba(46,47,51,0.88)',
                lineHeight: 20,
                letterSpacing: 0.2,
              }}
            >
              인증번호를 입력해주세요
            </Text>
            <View className="relative">
              <Input
                containerClassName="mb-0"
                placeholder="인증번호"
                keyboardType="number-pad"
                maxLength={4}
                value={verificationCode}
                onChangeText={setVerificationCode}
                editable={!isVerified}
                isValid={isVerified}
              />
              {timer > 0 && !isVerified && (
                <View
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 0,
                    bottom: 0,
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      paddingHorizontal: 4,
                      fontSize: 16,
                      lineHeight: 24,
                      letterSpacing: 0.09,
                      color: 'rgba(55,56,60,0.28)',
                    }}
                  >
                    {formatTime(timer)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View className="p-6 border-gray-100">
        {!isVerificationSent ? (
          <Button
            title="인증번호 받기"
            onPress={handleRequestVerification}
            disabled={phone.length < 10 || !!currentErrors.phone}
          />
        ) : !isVerified ? (
          <Button
            title="인증 완료"
            onPress={handleVerifyCode}
            disabled={verificationCode.length !== 4}
          />
        ) : (
          <Button
            title="다음"
            onPress={
              isDomestic
                ? domesticForm.handleSubmit(onDomesticSubmit)
                : foreignerForm.handleSubmit(onForeignerSubmit)
            }
            disabled={
              isDomestic
                ? !domesticForm.formState.isValid
                : !foreignerForm.formState.isValid
            }
          />
        )}
      </View>

      <ExistingMemberModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
