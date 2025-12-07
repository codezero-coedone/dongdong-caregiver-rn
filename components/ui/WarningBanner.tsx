import React from 'react';
import { Text, View } from 'react-native';

interface WarningBannerProps {
    message: string;
}

export default function WarningBanner({ message }: WarningBannerProps) {
    return (
        <View
            className="bg-pink-50 rounded-lg px-4 py-3 mb-6"
            style={{ borderWidth: 1, borderColor: 'rgba(236, 72, 153, 0.2)' }}
        >
            <Text className="text-blue-600 text-center text-sm font-medium">
                {message}
            </Text>
        </View>
    );
}
