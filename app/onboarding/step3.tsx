import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri, ResponseType, useAuthRequest } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LoginFailModal from '../../components/auth/LoginFailModal';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import { useAuthStore } from '../../store/authStore';

WebBrowser.maybeCompleteAuthSession();

// Kakao Endpoint
const discovery = {
    authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
    tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
};

export default function OnboardingStep3() {
    const router = useRouter();
    const { login, setError, error } = useAuthStore();
    const [modalVisible, setModalVisible] = useState(false);

    // Kakao Auth Request
    // REPLACE 'YOUR_KAKAO_REST_API_KEY' with actual key if available, or use a placeholder
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: 'YOUR_KAKAO_REST_API_KEY', // TODO: User needs to provide this
            scopes: ['profile_nickname', 'profile_image'],
            redirectUri: makeRedirectUri({
                scheme: 'your.app.scheme' // TODO: Configure scheme in app.json
            }),
            responseType: ResponseType.Code,
        },
        discovery
    );

    useEffect(() => {
        if (response?.type === 'success') {
            const { code } = response.params;
            // Here you would normally exchange code for token
            // Here you would normally exchange code for token
            console.log('Kakao Auth Code:', code);
            login('kakao');
            // Redirection to /signup/info handled by _layout because isSignupComplete is false
        } else if (response?.type === 'error') {
            setError('카카오 로그인에 실패했습니다.');
            setModalVisible(true);
        }
    }, [response]);

    const handleAppleLogin = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });
            // signed in
            console.log('Apple Credential:', credential);
            login('apple');
        } catch (e: any) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
            } else {
                setError('애플 로그인에 실패했습니다.');
                setModalVisible(true);
            }
        }
    };

    const handleKakaoLogin = () => {
        // For demo purposes, if no client ID, just mock success or fail
        // promptAsync(); 

        // MOCKING for now since we don't have API Key
        // To test failure, uncomment the next line:
        // setError('카카오 로그인 실패 테스트'); setModalVisible(true); return;

        login('kakao');
        // Redirection handled by _layout
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-10">
                <Header title="로그인" rightElement={<Text className="text-lg">A</Text>} />

                <Text className="text-2xl font-bold text-center mb-4">
                    맞춤 돌봄 서비스 이용
                </Text>
                <Text className="text-base text-gray-500 text-center mb-10 leading-6">
                    간병 매칭부터 관리까지 한 곳에서 해결{'\n'}
                    보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공
                </Text>

                <View className="w-full h-64 bg-gray-200 rounded-lg mb-auto" />

                <View className="mb-6 gap-3">
                    <Button
                        title="카카오 시작하기"
                        variant="kakao"
                        onPress={handleKakaoLogin}
                        icon={<Ionicons name="chatbubble-sharp" size={20} color="black" />}
                    />
                    {Platform.OS === 'ios' && (
                        <Button
                            title="애플 시작하기"
                            variant="apple"
                            onPress={handleAppleLogin}
                            icon={<Ionicons name="logo-apple" size={20} color="white" />}
                        />
                    )}
                </View>

                <LoginFailModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    message={error || '로그인에 실패했습니다.'}
                />
            </View>
        </SafeAreaView>
    );
}
