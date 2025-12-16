import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

interface InfoBoxProps extends ViewProps {
    value?: string;
    variant?: 'default' | 'secret';
    secretText?: string;
}

export default function InfoBox({
    value,
    variant = 'default',
    secretText = '매칭 후 공개',
    style,
    ...props
}: InfoBoxProps) {
    const isSecret = variant === 'secret';

    return (
        <View
            style={[
                styles.container,
                isSecret ? styles.secretContainer : styles.defaultContainer,
                style,
            ]}
            {...props}
        >
            <Text
                style={[
                    styles.text,
                    isSecret ? styles.secretText : styles.defaultText,
                ]}
            >
                {isSecret ? secretText : value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
    },
    defaultContainer: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB',
    },
    secretContainer: {
        backgroundColor: '#F9FAFB', // Light gray background
        borderColor: '#E5E7EB', // Subtle border
    },
    text: {
        fontSize: 15,
    },
    defaultText: {
        color: '#111827',
    },
    secretText: {
        color: '#9CA3AF', // Gray text for secret/placeholder
    },
});
