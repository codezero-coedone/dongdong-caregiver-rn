import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import Button from '../../components/ui/Button';

export default function OnboardingStep2() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-10">
                <View className="flex-row justify-between items-center mb-10">
                    <Text className="text-lg font-bold">로그인</Text>
                    <Text className="text-lg">A</Text>
                </View>

                <Text className="text-2xl font-bold text-center mb-4">
                    실시간 확인으로 안심
                </Text>
                <Text className="text-base text-gray-500 text-center mb-10 leading-6">
                    간병 매칭부터 관리까지 한 곳에서 해결{'\n'}
                    보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공
                </Text>

                <View className="w-full h-64 bg-gray-200 rounded-lg mb-auto" />

                <View className="mb-10">
                    <Button
                        title="다음"
                        onPress={() => router.push('/onboarding/step3')}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
