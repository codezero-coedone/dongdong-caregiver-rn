import Button from '@/components/ui/Button';
import { loginWithSocial } from '@/services/authService';
import { apiClient } from '@/services/apiClient';
import { Ionicons } from '@expo/vector-icons';
import { login as kakaoNativeLogin } from '@react-native-seoul/kakao-login';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Step3() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const formatKakaoError = (e: unknown): string => {
    const raw = (e as any)?.message ? String((e as any).message) : String(e);

    // Native SDK error (Kakao Developers Android key hash mismatch)
    if (/keyhash/i.test(raw)) {
      return (
        'Android keyhash가 Kakao Developers 콘솔에 등록되지 않았습니다.\n\n' +
        '조치:\n' +
        '- Kakao Developers > 내 애플리케이션 > 플랫폼(Android)\n' +
        '- 패키지: kr.slicemind.dongdong.caregiver\n' +
        '- 현재 설치 채널(Play 내부테스트/사이드로드)에 맞는 keyhash를 추가 등록\n\n' +
        '등록 후 앱을 재설치(Play 내부테스트 링크)하고 다시 시도해 주세요.'
      );
    }

    if (/kakao/i.test(raw) && /appkey/i.test(raw)) {
      return (
        '카카오 앱키(AppKey)가 앱에 주입되지 않았습니다.\n\n' +
        '빌드 시 EXPO_PUBLIC_KAKAO_APP_KEY(=6800df...)가 설정되어야 합니다.'
      );
    }

    return raw || '카카오 로그인에 실패했습니다.';
  };

  /**
   * ✅ 카카오 SDK 로그인
   */
  const handleKakaoLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const kakaoAppKey =
        process.env.EXPO_PUBLIC_KAKAO_APP_KEY || process.env.KAKAO_APP_KEY;
      if (!kakaoAppKey) {
        Alert.alert(
          '설정 오류',
          'EXPO_PUBLIC_KAKAO_APP_KEY가 설정되지 않은 빌드입니다.\n(카카오 로그인 불가)',
        );
        return;
      }

      const token = await kakaoNativeLogin();
      const accessToken: string | undefined = (token as any)?.accessToken;
      if (!accessToken) {
        throw new Error('카카오 accessToken을 가져올 수 없습니다.');
      }

      /**
       * token.accessToken ← 이게 핵심
       */
      await loginWithSocial({
        provider: 'KAKAO',
        accessToken,
      });

      // 로그인 후: 프로필이 없으면 회원가입 플로우로 유도
      try {
        await apiClient.get('/caregivers/profile');
        router.replace('/(tabs)');
      } catch {
        router.replace('/signup/info');
      }
    } catch (e) {
      console.error('Kakao login error', e);
      Alert.alert('카카오 로그인 실패', formatKakaoError(e));
    } finally {
      setIsLoading(false);
    }
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
            isLoading={isLoading}
            icon={
              <Image
                source={require('@/assets/images/icons/kakao.png')}
                style={{ width: 18, height: 24 }}
              />
            }
            onPress={handleKakaoLogin}
          />
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
