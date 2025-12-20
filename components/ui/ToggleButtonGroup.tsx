import Typography from '@/components/ui/Typography';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export interface ToggleOption<T extends string = string> {
  label: string;
  value: T;
}

interface ToggleButtonGroupProps<T extends string = string> {
  options: [ToggleOption<T>, ToggleOption<T>];
  selectedValue: T;
  onSelect: (value: T) => void;
  variant?: 'headline' | 'label';
}

export default function ToggleButtonGroup<T extends string = string>({
  options,
  selectedValue,
  onSelect,
  variant = 'headline',
}: ToggleButtonGroupProps<T>) {
  const typographyVariant =
    variant === 'headline' ? 'headline2.medium' : 'label1.medium';

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = selectedValue === option.value;
        const isLeft = index === 0;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.tab, isLeft ? styles.left : styles.right]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.8}
          >
            {isSelected && (
              <View
                style={[
                  styles.activeBg,
                  isLeft ? styles.activeLeft : styles.activeRight,
                ]}
              />
            )}

            <Typography
              variant={typographyVariant}
              color={isSelected ? 'primary' : 'gray'}
            >
              {option.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(112,115,124,0.22)',
    overflow: 'hidden',
    marginBottom: 24,
  },

  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  left: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(112,115,124,0.22)',
  },

  right: {},

  activeBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,102,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,102,255,0.43)',
    zIndex: -1,
  },

  activeLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  activeRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});
