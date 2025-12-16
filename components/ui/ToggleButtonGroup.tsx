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
    const typographyVariant = variant === 'headline' ? 'headline2.medium' : 'label1.medium';

    return (
        <View style={styles.container}>
            {options.map((option, index) => {
                const isSelected = selectedValue === option.value;
                const isLeft = index === 0;

                return (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.button,
                            isLeft ? styles.buttonLeft : styles.buttonRight,
                            isSelected && styles.buttonActive,
                        ]}
                        onPress={() => onSelect(option.value)}
                        activeOpacity={0.7}
                    >
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
        marginBottom: 24,
        overflow: 'hidden',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    buttonLeft: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },
    buttonRight: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    buttonActive: {
        backgroundColor: 'rgba(0, 102, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(0, 102, 255, 0.43)',
    },
});
