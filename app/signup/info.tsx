import { requestPhoneVerification, verifyPhoneCode } from '@/services/authService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function SignupInfoScreen() {
    const router = useRouter();
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
        let interval: NodeJS.Timeout;
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
        Alert.alert('성공', '회원가입 정보 입력이 완료되었습니다.');
        // router.push('/next-step');
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-4 border-b border-gray-100">
                <Text className="text-lg font-bold text-center">회원가입</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Toggle */}
                <View className="flex-row mb-8 border border-gray-200 rounded-lg overflow-hidden">
                    <TouchableOpacity
                        className={`flex-1 py-3 items-center ${isDomestic ? 'bg-blue-50 border-b-2 border-primary' : 'bg-white'}`}
                        onPress={() => setIsDomestic(true)}
                    >
                        <Text className={`${isDomestic ? 'text-primary font-bold' : 'text-gray-400'}`}>내국인</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3 items-center ${!isDomestic ? 'bg-blue-50 border-b-2 border-primary' : 'bg-white'}`}
                        onPress={() => setIsDomestic(false)}
                    >
                        <Text className={`${!isDomestic ? 'text-primary font-bold' : 'text-gray-400'}`}>외국인</Text>
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
