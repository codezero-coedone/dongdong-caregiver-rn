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

  const selectedColor = '#0066FF';
  const unselectedColor = 'rgba(55,56,60,0.55)';

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
              color={isSelected ? selectedColor : unselectedColor}
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 30,
  },

  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  left: {
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },

  right: {},

  activeBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F8FF',
    borderWidth: 1,
    borderColor: '#0066FF',
    zIndex: -1,
  },

  activeLeft: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },

  activeRight: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
});
