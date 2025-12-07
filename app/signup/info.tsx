import { requestPhoneVerification, verifyPhoneCode } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import ExistingMemberModal from '../../components/auth/ExistingMemberModal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import MaskedRRNInput from '../../components/ui/MaskedRRNInput';
import Typography from '../../components/ui/Typography';

// Zod Schema
const signupSchema = z.object({
    name: z.string().min(1, '이름을 입력해주세요.'),
    rrnFront: z.string().length(6, '주민등록번호 앞자리 6자리를 입력해주세요.'),
    rrnBack: z.string().length(7, '주민등록번호 뒷자리 7자리를 입력해주세요.'),
    phone: z.string().min(10, '올바른 휴대폰 번호를 입력해주세요.'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupInfoScreen() {
    const router = useRouter();
    const { setSignupInfo } = useAuthStore();
    const [isDomestic, setIsDomestic] = useState(true);

    // React Hook Form
    const { control, handleSubmit, formState: { errors }, trigger, watch } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        mode: 'onBlur',
        defaultValues: {
            name: '',
            rrnFront: '',
            rrnBack: '',
            phone: '',
        }
    });

    const name = watch('name');
    const phone = watch('phone');
    const [verificationCode, setVerificationCode] = useState('');

    // Phone number formatting helper
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (onChange: (value: string) => void) => (text: string) => {
        const numbers = text.replace(/[^\d]/g, '');
        onChange(numbers);
    };

    // Verification State
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [timer, setTimer] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        let interval: any;
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

    const onSubmit = (data: SignupFormData) => {
        if (!isVerified) {
            Alert.alert('알림', '휴대폰 인증을 완료해주세요.');
            return;
        }
        // Save validated data to store
        setSignupInfo({
            name: data.name,
            rrnFront: data.rrnFront,
            rrnBack: data.rrnBack,
            phone: data.phone,
            isDomestic,
        });
        // Navigate to terms screen
        router.replace('/signup/terms');
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Toggle */}
                <View className="flex-row mb-8 overflow-hidden">
                    <TouchableOpacity
                        className="flex-1 py-3 items-center justify-center"
                        style={isDomestic ? {
                            backgroundColor: 'rgba(0, 102, 255, 0.05)',
                            borderWidth: 1,
                            borderColor: 'rgba(0, 102, 255, 0.43)',
                            borderTopLeftRadius: 8,
                            borderBottomLeftRadius: 8,
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                        } : {
                            backgroundColor: 'white',
                            borderTopLeftRadius: 8,
                            borderBottomLeftRadius: 8,
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                        }}
                        onPress={() => setIsDomestic(true)}
                    >
                        <Typography variant="headline2.medium" color={isDomestic ? 'primary' : 'gray'}>내국인</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 py-3 items-center justify-center"
                        style={!isDomestic ? {
                            backgroundColor: 'rgba(0, 102, 255, 0.05)',
                            borderWidth: 1,
                            borderColor: 'rgba(0, 102, 255, 0.43)',
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8,
                        } : {
                            backgroundColor: 'white',
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8,
                        }}
                        onPress={() => setIsDomestic(false)}
                    >
                        <Typography variant="headline2.medium" color={!isDomestic ? 'primary' : 'gray'}>외국인</Typography>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View className="mb-4">
                    <Text className="text-sm font-bold mb-2 text-gray-800">
                        이름 <Text style={{ color: '#EF4444' }}>*</Text>
                    </Text>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                containerClassName="mb-0"
                                placeholder="홍길동"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.name?.message}
                                isValid={value.length > 0 && !errors.name}
                            />
                        )}
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-bold mb-2 text-gray-800">
                        주민등록번호 <Text style={{ color: '#EF4444' }}>*</Text>
                    </Text>
                    <View className="flex-row items-center">
                        <Controller
                            control={control}
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
                                    error={errors.rrnFront?.message}
                                />
                            )}
                        />
                        <Text className="mx-2 text-gray-400">-</Text>
                        <View className="flex-1">
                            <Controller
                                control={control}
                                name="rrnBack"
                                render={({ field: { onChange, value } }) => (
                                    <MaskedRRNInput
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                        </View>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-sm font-bold mb-2 text-gray-800">
                        휴대폰 <Text style={{ color: '#EF4444' }}>*</Text>
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
                                editable={!isVerified}
                                error={errors.phone?.message}
                                isValid={value.length >= 10 && !errors.phone}
                            />
                        )}
                    />
                </View>

                {isVerificationSent && !isVerified && (
                    <View className="mb-4">
                        <Text className="text-sm font-bold mb-2 text-gray-800">
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
                            />
                            {timer > 0 && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        right: 16,
                                        top: 16,
                                        height: 24,
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Text style={{ color: '#6B7280', fontSize: 14 }}>
                                        {formatTime(timer)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

            </ScrollView>

            <View className="p-6 border-t border-gray-100">
                {!isVerificationSent ? (
                    <Button title="인증번호 받기" onPress={handleRequestVerification} disabled={phone.length < 10 || !!errors.phone} />
                ) : !isVerified ? (
                    <Button title="인증 완료" onPress={handleVerifyCode} disabled={verificationCode.length !== 4} />
                ) : (
                    <Button title="다음" onPress={handleSubmit(onSubmit)} />
                )}
            </View>

            <ExistingMemberModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </SafeAreaView>
    );
}
