import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WarningBannerProps {
    message: string;
}

export default function WarningBanner({ message }: WarningBannerProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {message}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginBottom: 24,
    },
    text: {
        color: '#3B82F6',
        textAlign: 'left',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
    },
});
