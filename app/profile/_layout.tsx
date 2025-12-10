import { Stack } from 'expo-router';

export default function ProfileLayout() {
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
                name="edit"
                options={{
                    title: '프로필 수정',
                }}
            />
            <Stack.Screen
                name="introduction"
                options={{
                    title: '자기 소개',
                }}
            />
        </Stack>
    );
}
