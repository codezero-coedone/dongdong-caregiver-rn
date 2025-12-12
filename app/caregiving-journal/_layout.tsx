import { Stack } from 'expo-router';
import React from 'react';

export default function CaregivingJournalLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerBackTitle: '뒤로',
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTintColor: '#111827',
                headerTitleStyle: {
                    fontWeight: '600',
                },
            }}
        >
            <Stack.Screen
                name="meal-record"
                options={{
                    title: '식사 기록',
                }}
            />
            <Stack.Screen
                name="medical-record"
                options={{
                    title: '의료 기록',
                }}
            />
            <Stack.Screen
                name="activity-record"
                options={{
                    title: '활동 기록',
                }}
            />
        </Stack>
    );
}
