import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    isValid?: boolean;
    containerClassName?: string;
}

const ErrorIcon = () => (
    <View
        style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <View
            style={{
                width: 18,
                height: 18,
                backgroundColor: '#EF4444',
                borderRadius: 9,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>!</Text>
        </View>
    </View>
);

const SuccessIcon = () => (
    <View
        style={{
            width: 22,
            height: 22,
            backgroundColor: '#3B82F6',
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
    </View>
);

const Input = ({ label, error, isValid, containerClassName = '', className = '', ...props }: InputProps) => {
    const showSuccessIcon = isValid && !error;
    const showErrorIcon = !!error;

    return (
        <View className={`mb-4 ${containerClassName}`}>
            {label && <Text className="text-sm font-bold mb-2 text-gray-800">{label}</Text>}
            <View className="relative">
                <TextInput
                    className={`w-full px-4 pr-12 border rounded-xl text-base ${error
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-white'
                        } ${className}`}
                    style={{ height: 56, textAlignVertical: 'center' }}
                    placeholderTextColor="#9CA3AF"
                    {...props}
                />
                {(showErrorIcon || showSuccessIcon) && (
                    <View
                        style={{
                            position: 'absolute',
                            right: 12,
                            top: 0,
                            bottom: 0,
                            justifyContent: 'center'
                        }}
                    >
                        {showErrorIcon ? <ErrorIcon /> : <SuccessIcon />}
                    </View>
                )}
            </View>
            {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
        </View>
    );
};

export default Input;
