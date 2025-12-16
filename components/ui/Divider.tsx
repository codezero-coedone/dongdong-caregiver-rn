import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

interface DividerProps extends ViewProps {
    height?: number;
    color?: string;
}

export default function Divider({
    height = 1,
    color = '#E5E7EB',
    style,
    ...props
}: DividerProps) {
    return (
        <View
            style={[
                styles.divider,
                {
                    height,
                    backgroundColor: color,
                },
                style,
            ]}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    divider: {
        width: '100%',
    },
});
