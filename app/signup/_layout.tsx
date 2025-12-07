import { Stack } from 'expo-router';

export default function SignupLayout() {
    return (
        <Stack
            screenOptions={{
                headerShadowVisible: false,
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 17,
                },
            }}
        >
            <Stack.Screen
                name="info"
                options={{
                    title: '기본 정보 입력',
                }}
            />
            <Stack.Screen
                name="terms"
                options={{
                    title: '권한 동의',
                }}
            />
        </Stack>
    );
}
