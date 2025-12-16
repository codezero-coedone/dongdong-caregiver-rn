import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css'; // Import global CSS for NativeWind

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QueryProvider } from '@/services/QueryProvider';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, isSignupComplete } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    const inAuthGroup = segments[0] === 'onboarding';
    const inSignupGroup = segments[0] === 'signup';

    if (!isLoggedIn && !inAuthGroup) {
      // Redirect to onboarding if not logged in and not already in onboarding
      setTimeout(() => router.replace('/onboarding'), 0);
    } else if (isLoggedIn && !isSignupComplete && !inSignupGroup) {
      // Redirect to signup info if logged in but signup not complete
      setTimeout(() => router.replace('/signup/info'), 0);
    } else if (isLoggedIn && isSignupComplete && (inAuthGroup || inSignupGroup)) {
      // Redirect to home if logged in and signup complete, but still in auth screens
      setTimeout(() => router.replace('/'), 0);
    }
  }, [isLoggedIn, isSignupComplete, segments, rootNavigationState?.key]);

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
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="permission" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryProvider>
  );
}

