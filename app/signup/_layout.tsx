import { Stack } from 'expo-router';

export default function SignupLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="info"
                options={{
                    title: '회원가입',
                    headerTitleAlign: 'center',
                }}
            />
        </Stack>
    );
}
