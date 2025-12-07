import React from 'react';
import { Text, TextProps } from 'react-native';

// Typography variant types
type TypographySize = 'headline1' | 'headline2' | 'headline3' | 'body1' | 'body2' | 'caption';
type TypographyWeight = 'bold' | 'medium' | 'regular';

interface TypographyProps extends TextProps {
    variant?: `${TypographySize}.${TypographyWeight}`;
    color?: string;
    align?: 'left' | 'center' | 'right';
    children: React.ReactNode;
}

// Font size mapping
const sizeMap: Record<TypographySize, number> = {
    headline1: 24,
    headline2: 17,
    headline3: 15,
    body1: 16,
    body2: 14,
    caption: 12,
};

// Line height mapping (as multiplier)
const lineHeightMap: Record<TypographySize, number> = {
    headline1: 1.33,
    headline2: 1.412,
    headline3: 1.4,
    body1: 1.5,
    body2: 1.43,
    caption: 1.33,
};

// Font weight mapping
const weightMap: Record<TypographyWeight, '400' | '500' | '700'> = {
    regular: '400',
    medium: '500',
    bold: '700',
};

// Color presets
const colorPresets: Record<string, string> = {
    primary: '#0066FF',
    secondary: '#666666',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#999999',
};

export default function Typography({
    variant = 'body1.regular',
    color = 'black',
    align = 'left',
    style,
    children,
    ...props
}: TypographyProps) {
    const [size, weight] = variant.split('.') as [TypographySize, TypographyWeight];

    const fontSize = sizeMap[size] || 16;
    const lineHeight = fontSize * (lineHeightMap[size] || 1.5);
    const fontWeight = weightMap[weight] || '400';
    const textColor = colorPresets[color] || color;

    return (
        <Text
            style={[
                {
                    fontSize,
                    lineHeight,
                    fontWeight,
                    color: textColor,
                    textAlign: align,
                    fontFamily: 'System', // Use 'Pretendard' if installed
                },
                style,
            ]}
            numberOfLines={props.numberOfLines}
            ellipsizeMode="tail"
            {...props}
        >
            {children}
        </Text>
    );
}

// Usage examples:
// <Typography variant="headline2.medium" color="primary" align="center">Hello</Typography>
// <Typography variant="body1.regular">Normal text</Typography>
// <Typography variant="caption.bold" color="#FF0000">Custom color</Typography>
