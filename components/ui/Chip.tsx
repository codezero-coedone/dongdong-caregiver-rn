import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Typography from './Typography';

interface ChipProps extends ViewProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export default function Chip({
  label,
  variant = 'default',
  style,
  ...props
}: ChipProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  let color: 'primary' | 'secondary' | 'labelAlternative' = 'secondary';
  if (isPrimary) color = 'primary';
  else if (isSecondary) color = 'labelAlternative';

  return (
    <View
      style={[
        styles.container,
        isPrimary
          ? styles.primaryContainer
          : isSecondary
          ? styles.secondaryContainer
          : styles.defaultContainer,
        style,
      ]}
      {...props}
    >
      <Typography
        variant="label2.regular"
        color={color}
        style={[
          isPrimary && styles.primaryText,
          isSecondary && styles.secondaryText,
        ]}
      >
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  defaultContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  primaryContainer: {
    backgroundColor: '#0066FF0D',
    borderColor: '#0066FF6E',
  },
  primaryText: {
    color: '#0066FF',
    fontSize: 12,
    fontWeight: '500',
  },
  secondaryContainer: {
    backgroundColor: '#70737C14',
    borderColor: '#F3F4F6', // Very subtle border or just make it same as bg
    borderWidth: 0, // Solid style based on image
  },
  secondaryText: {
    color: '#37383C9C',
    fontSize: 12,
    fontWeight: '500',
  },
});
