import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

const Input = ({ label, error, containerClassName = '', className = '', ...props }: InputProps) => {
    return (
        <View className={`mb-4 ${containerClassName}`}>
            {label && <Text className="text-sm font-bold mb-2 text-gray-800">{label}</Text>}
            <TextInput
                className={`w-full p-4 bg-white border rounded-xl text-base ${error ? 'border-red-500' : 'border-gray-200'
                    } ${className}`}
                placeholderTextColor="#9CA3AF"
                {...props}
            />
            {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
        </View>
    );
};

export default Input;
