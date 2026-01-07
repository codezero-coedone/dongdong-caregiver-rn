import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import Constants from 'expo-constants';
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css'; // Import global CSS for NativeWind

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QueryProvider } from '@/services/QueryProvider';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DevOverlay from '@/components/dev/DevOverlay';

function parseSemver(v: string): [number, number, number] {
  const parts = String(v || '')
    .trim()
    .split('.')
    .map((p) => Number(String(p).replace(/[^\d]/g, '')));
  const a = typeof parts[0] === 'number' && !isNaN(parts[0]) ? parts[0] : 0;
  const b = typeof parts[1] === 'number' && !isNaN(parts[1]) ? parts[1] : 0;
  const c = typeof parts[2] === 'number' && !isNaN(parts[2]) ? parts[2] : 0;
  return [a, b, c];
}

function compareSemver(a: string, b: string): number {
  const [a0, a1, a2] = parseSemver(a);
  const [b0, b1, b2] = parseSemver(b);
  if (a0 !== b0) return a0 - b0;
  if (a1 !== b1) return a1 - b1;
  return a2 - b2;
}

function getAppVersion(): string {
  const v =
    (Constants as any)?.expoConfig?.version ||
    (Constants as any)?.manifest?.version ||
    '0.0.0';
  return String(v);
}

function getUpdateUrl(): string | null {
  const platformUrl =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_IOS_UPDATE_URL
      : process.env.EXPO_PUBLIC_ANDROID_UPDATE_URL;
  const url = platformUrl || process.env.EXPO_PUBLIC_UPDATE_URL;
  return url && String(url).trim() ? String(url).trim() : null;
}

function ForceUpdateScreen({
  appVersion,
  minVersion,
  updateUrl,
}: {
  appVersion: string;
  minVersion: string;
  updateUrl: string | null;
}) {
  return (
    <View style={styles.forceContainer}>
      <View style={styles.forceCard}>
        <Text style={styles.forceTitle}>업데이트가 필요합니다</Text>
        <Text style={styles.forceDesc}>
          안정적인 서비스 이용을 위해 앱 업데이트가 필요합니다.
        </Text>
        <View style={{ height: 12 }} />
        <View style={styles.forceMetaRow}>
          <Text style={styles.forceMetaLabel}>현재 버전</Text>
          <Text style={styles.forceMetaValue}>{appVersion}</Text>
        </View>
        <View style={styles.forceMetaRow}>
          <Text style={styles.forceMetaLabel}>최소 버전</Text>
          <Text style={styles.forceMetaValue}>{minVersion}</Text>
        </View>
        <View style={{ height: 16 }} />
        <Pressable
          disabled={!updateUrl}
          onPress={() => {
            if (!updateUrl) return;
            Linking.openURL(updateUrl).catch(() => {});
          }}
          style={[
            styles.forceButton,
            !updateUrl && styles.forceButtonDisabled,
          ]}
        >
          <Text style={styles.forceButtonText}>
            {updateUrl ? '업데이트' : '업데이트 링크 필요'}
          </Text>
        </Pressable>
        {!updateUrl && (
          <Text style={styles.forceHint}>
            스토어/다운로드 링크가 설정되지 않았습니다.
          </Text>
        )}
      </View>
    </View>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, isSignupComplete } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const rootNavigationState = useRootNavigationState();
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Persist hydration gate:
  // - Redirect logic must wait until persisted auth state is loaded,
  //   otherwise the app can bounce back to onboarding after a successful login.
  useEffect(() => {
    const p = (useAuthStore as any).persist;
    try {
      if (p?.hasHydrated?.()) setHydrated(true);
      const unsub = p?.onFinishHydration?.(() => setHydrated(true));
      return () => {
        if (typeof unsub === 'function') unsub();
      };
    } catch {
      // If persist helpers are unavailable, fail open (avoid redirect loops).
      setHydrated(true);
      return;
    }
  }, []);

  const appVersion = getAppVersion();
  const minVersion = process.env.EXPO_PUBLIC_MIN_APP_VERSION || '1.0.0';
  const updateUrl = getUpdateUrl();
  const needsUpdate = compareSemver(appVersion, minVersion) < 0;

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    if (!hydrated) return;
    const inAuthGroup = segments[0] === 'onboarding' || segments[0] === 'permission';
    const inSignupGroup = segments[0] === 'signup';

    if (!isLoggedIn && !inAuthGroup) {
      // Redirect to onboarding if not logged in and not already in onboarding
      setTimeout(() => router.replace('/onboarding'), 0);
    } else if (isLoggedIn && !isSignupComplete && !inSignupGroup) {
      // Redirect to signup info if logged in but signup not complete
      setTimeout(() => router.replace('/signup/info'), 0);
    } else if (
      isLoggedIn &&
      isSignupComplete &&
      (inAuthGroup || inSignupGroup)
    ) {
      // Redirect to home if logged in and signup complete, but still in auth screens
      setTimeout(() => router.replace('/'), 0);
    }
  }, [hydrated, isLoggedIn, isSignupComplete, segments, rootNavigationState?.key]);

  if (needsUpdate) {
    return (
      <ForceUpdateScreen
        appVersion={appVersion}
        minVersion={minVersion}
        updateUrl={updateUrl}
      />
    );
  }

  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerBackTitle: '',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="care-history" options={{ headerShown: false }} />
          <Stack.Screen name="job" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
          <Stack.Screen name="permission" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
        <DevOverlay />
      </ThemeProvider>
    </QueryProvider>
  );
}

const styles = StyleSheet.create({
  forceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  forceCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#fff',
  },
  forceTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  forceDesc: { marginTop: 8, color: '#6B7280', lineHeight: 18 },
  forceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  forceMetaLabel: { color: '#6B7280' },
  forceMetaValue: { color: '#111827', fontWeight: '700' },
  forceButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  forceButtonDisabled: { backgroundColor: '#93C5FD' },
  forceButtonText: { color: '#fff', fontWeight: '800' },
  forceHint: {
    marginTop: 10,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
  },
});
