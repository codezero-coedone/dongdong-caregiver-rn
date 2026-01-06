import Button from '@/components/ui/Button';
import { loginWithSocial } from '@/services/authService';
import {
  apiClient,
  API_HEALTH_PATH,
  getApiBaseUrl,
  pingHealth,
} from '@/services/apiClient';
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
import { useAuthStore } from '@/store/authStore';
import type { AxiosError } from 'axios';
import { devlog } from '@/services/devlog';

export default function Step3() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const setLoggedIn = useAuthStore((s) => s.login);
  const completeSignup = useAuthStore((s) => s.completeSignup);

  const devtoolsEnabled = Boolean(__DEV__ || process.env.EXPO_PUBLIC_DEVTOOLS === '1');

  const formatApiError = (e: unknown, label: string): string => {
    const ax = e as AxiosError;
    const status = (ax as any)?.response?.status;
    const data = (ax as any)?.response?.data;
    const base = getApiBaseUrl();
    if (typeof status === 'number') {
      const msg = (data as any)?.message
        ? String((data as any)?.message)
        : (data as any)?.error
          ? String((data as any)?.error)
          : '';
      // Avoid dumping tokens/PII; show only deterministic status + backend message.
      return `${label} 실패: HTTP ${status}\nbase=${base}\n${msg ? `message=${msg}` : ''}`.trim();
    }
    return `${label} 실패: ${String((e as any)?.message || e)}`.trim();
  };

  const userFacingFailMessage = (label: string): string => {
    // Keep UX clean; route all details to DBG overlay only.
    return `${label}에 실패했습니다.\n잠시 후 다시 시도해 주세요.${devtoolsEnabled ? '\n(상세는 DBG에서 확인)' : ''}`;
  };

  const formatKakaoError = (e: unknown): string => {
    const raw = (e as any)?.message ? String((e as any).message) : String(e);

    if (/network error/i.test(raw) || /timeout/i.test(raw)) {
      return (
        '네트워크 문제로 로그인에 실패했습니다.\n' +
        '연결 상태를 확인한 뒤 다시 시도해 주세요.' +
        (devtoolsEnabled ? '\n(상세는 DBG에서 확인)' : '')
      );
    }

    // Native SDK error (Kakao Developers Android key hash mismatch)
    if (/keyhash/i.test(raw)) {
      return (
        '카카오 로그인 설정이 완료되지 않아 로그인에 실패했습니다.\n' +
        '설정 확인 후 다시 시도해 주세요.' +
        (devtoolsEnabled ? '\n(상세는 DBG에서 확인)' : '')
      );
    }

    if (/kakao/i.test(raw) && /appkey/i.test(raw)) {
      return (
        '카카오 로그인 설정이 완료되지 않아 로그인에 실패했습니다.\n' +
        '설정 확인 후 다시 시도해 주세요.' +
        (devtoolsEnabled ? '\n(상세는 DBG에서 확인)' : '')
      );
    }

    // Never expose raw exception class names/stack-ish messages in UI.
    return `카카오 로그인에 실패했습니다.${devtoolsEnabled ? '\n(상세는 DBG에서 확인)' : ''}`;
  };

  /**
   * ✅ 카카오 SDK 로그인
   */
  const handleKakaoLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      devlog({
        scope: 'KAKAO',
        level: 'info',
        message: 'kakao login: start',
      });
      const kakaoAppKey =
        process.env.EXPO_PUBLIC_KAKAO_APP_KEY || process.env.KAKAO_APP_KEY;
      if (!kakaoAppKey) {
        devlog({
          scope: 'KAKAO',
          level: 'error',
          message: 'kakao login: missing app key (EXPO_PUBLIC_KAKAO_APP_KEY)',
        });
        Alert.alert(
          '설정 오류',
          'EXPO_PUBLIC_KAKAO_APP_KEY가 설정되지 않은 빌드입니다.\n(카카오 로그인 불가)',
        );
        return;
      }

      // ✅ 로그인 정책(내부테스트/구형기기 고려):
      // - 1순위: 카카오톡 앱 로그인(앱 전환)
      // - 폴백: 카카오계정 로그인(Chrome Custom Tab)
      //   (노트8 등 테스트 기기에 카카오톡 계정이 없으면 "앱직통 강제"가 테스트 자체를 막음)
      // NOTE: 이 레포(@react-native-seoul/kakao-login v5.4.x)에서는
      // loginWithKakaoTalk/loginWithKakaoAccount API가 노출되지 않는 빌드가 있어,
      // `login()` 단일 경로로 진행합니다.
      // Kakao SDK 내부에서 가능한 경우 카카오톡 앱을 우선 사용하고, 필요 시 계정 로그인으로 폴백합니다.
      const token = await kakaoNativeLogin();
      const accessToken: string | undefined = (token as any)?.accessToken;
      if (!accessToken) {
        devlog({
          scope: 'KAKAO',
          level: 'error',
          message: 'kakao login: token missing accessToken',
          meta: { tokenKeys: token && typeof token === 'object' ? Object.keys(token as any) : [] },
        });
        throw new Error('카카오 accessToken을 가져올 수 없습니다.');
      }
      devlog({
        scope: 'KAKAO',
        level: 'info',
        message: 'kakao login: got accessToken (len=' + String(accessToken.length) + ')',
      });

      /**
       * token.accessToken ← 이게 핵심
       */
      try {
        await loginWithSocial({
          provider: 'KAKAO',
          accessToken,
        });
        devlog({
          scope: 'KAKAO',
          level: 'info',
          message: 'backend /auth/social: OK',
        });
      } catch (e) {
        devlog({
          scope: 'KAKAO',
          level: 'error',
          message: 'backend /auth/social: FAIL',
          meta: {
            status: (e as any)?.response?.status,
            message: (e as any)?.response?.data?.message || (e as any)?.message,
            detail: formatApiError(e, '소셜 로그인(/auth/social)'),
          },
        });
        Alert.alert('로그인 실패', userFacingFailMessage('로그인'));
        return;
      }

      // 로그인 후: 프로필이 없으면 회원가입 플로우로 유도
      try {
        await apiClient.get('/caregivers/profile');
        devlog({
          scope: 'KAKAO',
          level: 'info',
          message: 'backend /caregivers/profile: OK',
        });
        // IMPORTANT: RootLayout redirects based on zustand auth flags.
        // If we don't set them here, the app can bounce back to onboarding after a successful login.
        setLoggedIn('kakao');
        completeSignup();
        router.replace('/(tabs)');
      } catch {
        devlog({
          scope: 'KAKAO',
          level: 'warn',
          message: 'backend /caregivers/profile: FAIL (route to signup)',
        });
        setLoggedIn('kakao');
        router.replace('/signup/info');
      }
    } catch (e) {
      console.error('Kakao login error', e);
      devlog({
        scope: 'KAKAO',
        level: 'error',
        message: 'kakao login: exception',
        meta: {
          raw: String((e as any)?.message || e),
          name: (e as any)?.name,
          code: (e as any)?.code,
        },
      });
      // Deterministic preflight: tells us whether "Network Error" is global connectivity vs per-endpoint.
      try {
        const health = await pingHealth();
        if (!health.ok) {
          devlog({
            scope: 'KAKAO',
            level: 'error',
            message: 'preflight health: FAIL',
            meta: { ...health, base: getApiBaseUrl() },
          });
          Alert.alert(
            '로그인 실패',
            formatKakaoError(e),
          );
        } else {
          Alert.alert('카카오 로그인 실패', formatKakaoError(e));
        }
      } catch {
        Alert.alert('카카오 로그인 실패', formatKakaoError(e));
      }
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
