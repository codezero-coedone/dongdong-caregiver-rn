import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
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
  /**
   * Nativewind(className)가 적용되지 않는 환경(일부 release 빌드 등)에서도
   * UX가 깨지지 않도록 StyleSheet 기반 fallback을 항상 적용한다.
   * - 필요 시 외부에서 style로 미세 조정 가능
   */
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  textClassName = '',
  icon,
  style,
  textStyle,
}: ButtonProps) => {
  const isDisabled = isLoading || disabled;

  const variantStyle = (() => {
    if (isDisabled) return styles.disabled;
    switch (variant) {
      case 'kakao':
        return styles.kakao;
      case 'apple':
        return styles.apple;
      case 'outline':
        return styles.outline;
      case 'primary':
      default:
        return styles.primary;
    }
  })();

  const variantTextStyle = (() => {
    if (isDisabled) return styles.textDisabled;
    switch (variant) {
      case 'kakao':
      case 'apple':
        return styles.textDark;
      case 'outline':
        return styles.textPrimary;
      case 'primary':
      default:
        return styles.textLight;
    }
  })();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      // keep className for environments where nativewind is enabled,
      // but ALWAYS apply StyleSheet fallback to avoid "텍스트만 떠있는 버튼" UX 깨짐.
      className={`w-full py-4 rounded-xl flex-row justify-center items-center ${className}`}
      style={[styles.base, variantStyle, style]}
      activeOpacity={isDisabled ? 1 : 0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'kakao' ? '#000' : '#fff'} />
      ) : (
        <>
          {icon ? (
            <View className="mr-2" style={styles.iconWrap}>
              {icon}
            </View>
          ) : null}
          <Text
            className={`text-lg font-bold ${textClassName}`}
            style={[styles.textBase, variantTextStyle, textStyle]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 56,
    paddingVertical: 0,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#0066FF',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  apple: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.18)',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0066FF',
  },
  disabled: {
    backgroundColor: 'rgba(55,56,60,0.08)',
  },
  iconWrap: { marginRight: 8 },
  textBase: { fontSize: 18, fontWeight: '800' },
  textLight: { color: '#FFFFFF' },
  textDark: { color: '#111827' },
  textPrimary: { color: '#0066FF' },
  textDisabled: { color: 'rgba(55,56,60,0.55)' },
});
