import React from 'react';
import { Text, TextProps } from 'react-native';

// Typography variant types
type TypographySize =
  | 'headline1'
  | 'headline2'
  | 'headline3'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'label1'
  | 'label2';
type TypographyWeight = 'bold' | 'medium' | 'regular';

interface TypographyProps extends TextProps {
  variant?: `${TypographySize}.${TypographyWeight}`;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

// Font size mapping
const sizeMap: Record<TypographySize, number> = {
  headline1: 22, // Heading 2/Bold
  headline2: 17,
  headline3: 15,
  body1: 16,
  body2: 14,
  caption: 12,
  label1: 17,
  label2: 13,
};

// Line height mapping (as multiplier)
const lineHeightMap: Record<TypographySize, number> = {
  headline1: 1.4, // 140%
  headline2: 1.412,
  headline3: 1.4,
  body1: 1,
  body2: 1.43,
  caption: 1.33,
  label1: 1.412,
  label2: 1.385, // 138.5%
};

// Letter spacing mapping
const letterSpacingMap: Record<TypographySize, number> = {
  headline1: -0.24,
  headline2: 0,
  headline3: 0,
  body1: 0,
  body2: 0.203, // Label 1/Normal
  caption: 0,
  label1: 0.225,
  label2: 0.252,
};

// Font weight mapping
const weightMap: Record<TypographyWeight, '400' | '500' | '600'> = {
  regular: '400',
  medium: '500',
  bold: '600',
};

// Color presets
const colorPresets: Record<string, string> = {
  primary: '#0066FF',
  secondary: '#666666',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#37383C9C',
  label: '#171719', // Label Normal color
  labelSecondary: '#6B7280',
  labelAlternative: 'rgba(55, 56, 60, 0.61)', // Semantic-Label-Alternative
  strong: '#000000', // Semantic-Label-Strong
};

export default function Typography({
  variant = 'body1.regular',
  color = 'black',
  align = 'left',
  style,
  children,
  ...props
}: TypographyProps) {
  const [size, weight] = variant.split('.') as [
    TypographySize,
    TypographyWeight,
  ];

  const fontSize = sizeMap[size] || 16;
  const fixedLineHeightMap: Partial<Record<TypographySize, number>> = {
    label2: 18,
  };
  const lineHeight =
    fixedLineHeightMap[size] ?? fontSize * (lineHeightMap[size] || 1.5);
  const fontWeight = weightMap[weight] || '400';
  const letterSpacing = letterSpacingMap[size] || 0;
  const textColor = colorPresets[color] || color;

  return (
    <Text
      style={[
        {
          fontSize,
          lineHeight,
          fontWeight,
          letterSpacing,
          color: textColor,
          textAlign: align,
          fontFamily: 'System', // Use 'Pretendard JP' if installed
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
// <Typography variant="label2.regular" color="label">Label 2/L style</Typography>
