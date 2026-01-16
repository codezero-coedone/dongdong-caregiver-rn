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
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import type { AxiosError } from 'axios';
import { devlog, isDevtoolsEnabled } from '@/services/devlog';
import LoginFailModal from '@/components/auth/LoginFailModal';
import LanguagePickerModal from '@/components/auth/LanguagePickerModal';
import { getAppLocale, setAppLocale, type AppLocale } from '@/services/localeService';

/**
 * ============================================
 * QA SEALED (UI LOCK) — DO NOT CHANGE VISUALS
 * ============================================
 * 온보딩 3페이지(로그인) 디자인은 QA 박제(고정)로 취급한다.
 * - 레이아웃/문구/간격/이미지 등 "시각 요소" 변경 금지
 * - 허용: 기능 수정(로그인 동작/에러 처리/DBG 로그)만 최소 diff로
 */
export default function Step3() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const setLoggedIn = useAuthStore((s) => s.login);
  const completeSignup = useAuthStore((s) => s.completeSignup);

  const devtoolsEnabled = isDevtoolsEnabled();
  const [locale, setLocale] = React.useState<AppLocale>('ko');
  const [langOpen, setLangOpen] = React.useState(false);
  const [failOpen, setFailOpen] = React.useState(false);

  React.useEffect(() => {
    // UX polish: prevent IME/keyboard UI from leaking into onboarding/login screen.
    Keyboard.dismiss();
    void (async () => {
      const v = await getAppLocale();
      setLocale(v);
    })();
  }, []);

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
      // Figma UX: use modal instead of OS alert.
      // (We still keep detailed logs in DBG.)
      void (async () => {
        try {
          const health = await pingHealth();
          devlog({
            scope: 'KAKAO',
            level: health.ok ? 'warn' : 'error',
            message: health.ok ? 'login failed (health ok)' : 'login failed (health fail)',
            meta: { ...(health as any), base: getApiBaseUrl() },
          });
        } catch {
          // ignore
        }
      })();
      setFailOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (() => {
    if (locale === 'en') {
      return {
        header: 'Login',
        title: 'Use personalized care service',
        desc: 'Match, manage and journal care in one place.',
        kakao: 'Start with Kakao',
        apple: 'Start with Apple',
      };
    }
    return {
      header: '로그인',
      title: '맞춤 돌봄 서비스 이용',
      desc: '간병 매칭부터 관리까지 한 곳에서 해결\n보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공',
      kakao: '카카오 시작하기',
      apple: '애플 시작하기',
    };
  })();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.frame}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>{t.header}</Text>
        <TouchableOpacity
          onPress={() => setLangOpen(true)}
          style={styles.langBtn}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="언어 선택"
        >
          <Text style={styles.langText}>A</Text>
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <View style={styles.content}>
        <Text style={styles.title}>{t.title}</Text>

        <Text style={styles.description}>{t.desc}</Text>

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
            title={t.kakao}
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

          {Platform.OS === 'ios' ? (
            <Button
              title={t.apple}
              variant="apple"
              disabled={true}
              icon={
                <Ionicons name="logo-apple" size={22} color="#111827" />
              }
              onPress={() => {}}
            />
          ) : null}
        </View>
      </View>

      <LanguagePickerModal
        visible={langOpen}
        value={locale}
        onClose={() => setLangOpen(false)}
        onSelect={(v) => {
          setLocale(v);
          setLangOpen(false);
          void setAppLocale(v);
        }}
      />

      <LoginFailModal visible={failOpen} onClose={() => setFailOpen(false)} />
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
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 375,
    alignSelf: 'center',
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
  headerSide: {
    width: 24,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  langBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: { fontSize: 14, fontWeight: '900', color: '#111827' },
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
