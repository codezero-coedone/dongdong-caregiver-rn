import { Stack } from 'expo-router';
import React from 'react';

export default function JobLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
