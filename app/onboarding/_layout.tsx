import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '로그인',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="step2"
        options={{
          title: '로그인',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="step3"
        options={{
          title: '로그인',
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}
