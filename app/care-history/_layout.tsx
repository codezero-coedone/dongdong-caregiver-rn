import { Stack } from 'expo-router';

export default function CareHistoryLayout() {
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
                name="index"
                options={{
                    title: '간병내역',
                }}
            />
            <Stack.Screen
                name="detail"
                options={{
                    title: '진행 중인 간병 상세보기',
                }}
            />
        </Stack>
    );
}
