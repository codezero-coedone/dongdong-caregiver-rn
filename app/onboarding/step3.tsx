import Button from '@/components/ui/Button';
import { loginWithSocial } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import KakaoLogin from '@react-native-seoul/kakao-login';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Step3() {
  const router = useRouter();

  /**
   * ✅ 카카오 SDK 로그인
   */
  const handleKakaoLogin = async () => {
    try {
      const token = await KakaoLogin.login();

      /**
       * token.accessToken ← 이게 핵심
       */
      await loginWithSocial({
        provider: 'KAKAO',
        accessToken: token.accessToken,
      });

      router.replace('/(tabs)');
    } catch (e) {
      console.error('Kakao login error', e);
    }
  };

  /**
   * ✅ 애플 로그인 (지금 구조 그대로 OK)
   */
  const handleAppleLogin = async () => {
    // const credential = await AppleAuthentication.signInAsync({
    //   requestedScopes: [
    //     AppleAuthentication.AppleAuthenticationScope.EMAIL,
    //     AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    //   ],
    // });
    // if (!credential.identityToken) {
    //   throw new Error('Apple identityToken 없음');
    // }
    // await loginWithSocial({
    //   provider: 'APPLE',
    //   accessToken: credential.identityToken,
    //   email: credential.email ?? undefined,
    //   name: credential.fullName?.givenName ?? undefined,
    // });
    // router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>로그인</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 본문 */}
      <View style={styles.content}>
        <Text style={styles.title}>맞춤 돌봄 서비스 이용</Text>

        <Text style={styles.description}>
          간병 매칭부터 관리까지 한 곳에서 해결{'\n'}
          보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공
        </Text>

        <View style={styles.imageWrapper}>
          <Image
            source={require('@/assets/images/onboarding-3.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ width: '100%', gap: 12, paddingBottom: 24 }}>
          <Button
            title="카카오 시작하기"
            variant="kakao"
            icon={
              <Image
                source={require('@/assets/images/icons/kakao.png')}
                style={{ width: 18, height: 24 }}
              />
            }
            onPress={handleKakaoLogin}
          />

          {Platform.OS === 'ios' && (
            <Button
              title="애플 시작하기"
              variant="apple"
              icon={<Ionicons name="logo-apple" size={18} color="#fff" />}
              onPress={handleAppleLogin}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ===== styles ===== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#70737C29',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 60,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    marginTop: 42,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  imageWrapper: {
    marginTop: 80,
  },
  image: {
    width: 150,
    height: 120,
  },
});
