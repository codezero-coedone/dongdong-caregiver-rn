import React from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'kakao' | 'apple' | 'outline';
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    textClassName?: string;
    icon?: React.ReactNode;
}

const Button = ({
    title,
    onPress,
    variant = 'primary',
    isLoading = false,
    disabled = false,
    className = '',
    textClassName = '',
    icon
}: ButtonProps) => {

        const isDisabled = isLoading || disabled;

        const variantStyle =
                variant === 'kakao'
                        ? styles.kakao
                        : variant === 'apple'
                        ? styles.apple
                        : variant === 'outline'
                        ? styles.outline
                        : styles.primary;

        const textStyle = isDisabled
                ? styles.textDisabled
                : variant === 'kakao'
                ? styles.textBlack
                : variant === 'outline'
                ? styles.textPrimary
                : styles.textPrimaryWhite;

        return (
                <TouchableOpacity
                        onPress={onPress}
                        disabled={isDisabled}
                        style={[
                                styles.baseButton,
                                variantStyle,
                                isDisabled && styles.disabled,
                        ]}
                        activeOpacity={isDisabled ? 1 : 0.8}
                >
                        {isLoading ? (
                                <ActivityIndicator color={variant === 'kakao' ? '#000' : '#fff'} />
                        ) : (
                                <>
                                        {icon && <View style={styles.icon}>{icon}</View>}
                                        <Text style={[styles.text, textStyle]}>{title}</Text>
                                </>
                        )}
                </TouchableOpacity>
        );
};

export default Button;

const styles = StyleSheet.create({
    baseButton: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primary: {
        backgroundColor: '#0066FF',
    },
    kakao: {
        backgroundColor: '#FEE500',
    },
    apple: {
        backgroundColor: '#000',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#0066FF',
    },
    disabled: {
        backgroundColor: '#E5E7EB',
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
    },
    textPrimaryWhite: {
        color: '#FFFFFF',
    },
    textPrimary: {
        color: '#0066FF',
    },
    textBlack: {
        color: '#000000',
    },
    textDisabled: {
        color: '#9CA3AF',
    },
    icon: {
        marginRight: 8,
    },
});
