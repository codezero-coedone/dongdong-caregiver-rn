import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import LanguageSelector from '../../components/ui/LanguageSelector';
import { useTranslation } from '../../i18n';

export default function OnboardingStep2() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-10">
                <Header title={t('login')} rightElement={<LanguageSelector />} />

                <Text className="text-2xl font-bold text-center mb-4">
                    {t('onboarding2_title')}
                </Text>
                <Text className="text-base text-gray-500 text-center mb-10 leading-6">
                    {t('onboarding2_desc')}
                </Text>

                <View className="w-full h-64 bg-gray-200 rounded-lg mb-auto" />

                <View className="mb-10">
                    <Button
                        title={t('next')}
                        onPress={() => router.push('/onboarding/step3')}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
