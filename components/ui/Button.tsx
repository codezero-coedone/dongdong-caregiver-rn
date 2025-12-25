import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

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
  icon,
}: ButtonProps) => {
  const isDisabled = isLoading || disabled;

  let bgClass = 'bg-primary';
  let textClass = 'text-white';
  let borderClass = '';

  if (isDisabled) {
    bgClass = 'bg-gray-300';
    textClass = 'text-gray-500';
  } else {
    switch (variant) {
      case 'kakao':
        bgClass = 'bg-kakao';
        textClass = 'text-black';
        break;
      case 'apple':
        bgClass = 'bg-apple';
        textClass = 'text-white';
        break;
      case 'outline':
        bgClass = 'bg-transparent';
        textClass = 'text-primary';
        borderClass = 'border border-primary';
        break;
      default:
        bgClass = 'bg-primary';
        textClass = 'text-white';
        break;
    }
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`w-full py-4 rounded-xl flex-row justify-center items-center ${bgClass} ${borderClass} ${className}`}
      activeOpacity={isDisabled ? 1 : 0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'kakao' ? '#000' : '#fff'} />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`text-lg font-bold ${textClass} ${textClassName}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
