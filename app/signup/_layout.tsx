import { Stack, useNavigation } from 'expo-router';

export default function SignupLayout() {
  const navigation = useNavigation();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleAlign: 'left',
        headerBackTitle: '',
        headerBackButtonDisplayMode: 'minimal',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 17,
        },
      }}
    >
      <Stack.Screen
        name="info"
        options={{
          title: '회원가입',
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: '권한 동의',
        }}
      />
      <Stack.Screen
        name="caregiver-info"
        options={{
          title: '기본 정보 입력',
        }}
      />
      <Stack.Screen
        name="postcode-search"
        options={{
          title: '주소 검색',
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="career"
        options={{
          title: '자격증 및 경력 등록',
        }}
      />
    </Stack>
  );
}
