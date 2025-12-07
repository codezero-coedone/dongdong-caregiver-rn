import React from 'react';
import { Text, View, ViewProps } from 'react-native';

interface HeaderProps extends ViewProps {
    title: string;
    rightElement?: React.ReactNode;
}

export default function Header({ title, rightElement, className, ...props }: HeaderProps) {
    return (
        <View className={`flex-row justify-between items-center py-4 mb-6 ${className}`} {...props}>
            {/* Spacer to balance the right element if needed, or absolute positioning */}
            <View className="w-10" />

            <Text className="text-lg font-bold text-center absolute left-0 right-0">{title}</Text>

            <View className="w-10 items-end">
                {rightElement}
            </View>
        </View>
    );
}
