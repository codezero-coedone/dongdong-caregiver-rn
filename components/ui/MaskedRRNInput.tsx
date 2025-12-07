import React, { useRef } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

interface MaskedRRNInputProps {
    value: string;
    onChangeText: (text: string) => void;
    maxLength?: number;
}

const MaskedRRNInput = ({ value, onChangeText, maxLength = 7 }: MaskedRRNInputProps) => {
    const inputRef = useRef<TextInput>(null);

    const handlePress = () => {
        inputRef.current?.focus();
    };

    const renderDigits = () => {
        const digits = [];
        for (let i = 0; i < maxLength; i++) {
            const char = value[i];
            const isFirstDigit = i === 0;
            const hasValue = char !== undefined;

            digits.push(
                <View
                    key={i}
                    style={{
                        width: isFirstDigit ? 14 : 14,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {isFirstDigit ? (
                        // First digit: show actual number or placeholder
                        <Text style={{
                            fontSize: 16,
                            color: hasValue ? '#1F2937' : '#9CA3AF',
                            fontWeight: '500',
                            letterSpacing: 0.091,
                        }}>
                            {hasValue ? char : '0'}
                        </Text>
                    ) : (
                        // Other digits: show filled circle if has value, empty circle if not
                        <View
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: hasValue ? '#1F2937' : '#D1D5DB',
                            }}
                        />
                    )}
                </View>
            );
        }
        return digits;
    };

    return (
        <View>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.8}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 12,
                    height: 54,
                    paddingHorizontal: 16,
                    transform: [{ translateY: -6 }],
                }}
            >
                {renderDigits()}
            </TouchableOpacity>
            {/* Hidden TextInput for keyboard */}
            <TextInput
                ref={inputRef}
                style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
                keyboardType="number-pad"
                maxLength={maxLength}
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
};

export default MaskedRRNInput;
