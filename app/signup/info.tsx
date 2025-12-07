import { requestPhoneVerification, verifyPhoneCode } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Typography from '../../components/ui/Typography';

export default function SignupInfoScreen() {
    const router = useRouter();
    const { completeSignup } = useAuthStore();
    const [isDomestic, setIsDomestic] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [rrnFront, setRrnFront] = useState('');
    const [rrnBack, setRrnBack] = useState('');
    const [phone, setPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    // Verification State
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [timer, setTimer] = useState(0);

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
        if (!phone) {
            Alert.alert('알림', '휴대폰 번호를 입력해주세요.');
            return;
        }
        try {
            await requestPhoneVerification(phone);
            setIsVerificationSent(true);
            setTimer(180); // 3 minutes
            Alert.alert('알림', '인증번호가 발송되었습니다.');
        } catch (error) {
            Alert.alert('오류', '인증번호 발송에 실패했습니다.');
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode) {
            Alert.alert('알림', '인증번호를 입력해주세요.');
            return;
        }
        try {
            const success = await verifyPhoneCode(phone, verificationCode);
            if (success) {
                setIsVerified(true);
                setTimer(0);
                Alert.alert('알림', '인증이 완료되었습니다.');
            } else {
                Alert.alert('오류', '인증번호가 올바르지 않습니다.');
            }
        } catch (error) {
            Alert.alert('오류', '인증 확인 중 오류가 발생했습니다.');
        }
    };

    const handleSubmit = () => {
        if (!isVerified) {
            Alert.alert('알림', '휴대폰 인증을 완료해주세요.');
            return;
        }
        // Proceed to next step or complete signup
        Alert.alert('성공', '회원가입 정보 입력이 완료되었습니다.', [
            {
                text: '확인',
                onPress: () => {
                    completeSignup();
                    // Redirection handled by _layout
                }
            }
        ]);
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
                <Input
                    label="이름 *"
                    placeholder="홍길동"
                    value={name}
                    onChangeText={setName}
                />

                <View className="mb-4">
                    <Text className="text-sm font-bold mb-2 text-gray-800">주민등록번호 *</Text>
                    <View className="flex-row items-center">
                        <Input
                            containerClassName="flex-1 mb-0"
                            placeholder="801232"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={rrnFront}
                            onChangeText={setRrnFront}
                        />
                        <Text className="mx-2 text-gray-400">-</Text>
                        <View className="flex-1 flex-row items-center">
                            <Input
                                containerClassName="w-12 mb-0 text-center"
                                placeholder="1"
                                keyboardType="number-pad"
                                maxLength={1}
                                secureTextEntry
                                value={rrnBack}
                                onChangeText={setRrnBack}
                            />
                            <Text className="ml-2 text-gray-400 text-lg">●●●●●●</Text>
                        </View>
                    </View>
                </View>

                <Input
                    label="휴대폰 *"
                    placeholder="010-1234-5678"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    editable={!isVerified}
                />

                {isVerificationSent && !isVerified && (
                    <View className="mb-4 relative">
                        <Input
                            placeholder="인증번호"
                            keyboardType="number-pad"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                        />
                        <Text className="absolute right-4 top-4 text-red-500">{formatTime(timer)}</Text>
                    </View>
                )}

            </ScrollView>

            <View className="p-6 border-t border-gray-100">
                {!isVerificationSent ? (
                    <Button title="인증번호 받기" onPress={handleRequestVerification} />
                ) : !isVerified ? (
                    <Button title="인증 완료" onPress={handleVerifyCode} />
                ) : (
                    <Button title="다음" onPress={handleSubmit} />
                )}
            </View>
        </SafeAreaView>
    );
}
