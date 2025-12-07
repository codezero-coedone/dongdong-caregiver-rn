// Color System
// Usage: import { colors } from '@/constants/color';
// Example: colors.primary.normal

export const colors = {
    // Primary Colors
    primary: {
        normal: '#0066FF',
        strong: '#005EEB',
        heavy: '#0054D1',
    },

    // Semantic Colors
    semantic: {
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        info: '#5856D6',
    },

    // Neutral Colors
    neutral: {
        white: '#FFFFFF',
        black: '#000000',
        gray50: '#F9FAFB',
        gray100: '#F3F4F6',
        gray200: '#E5E7EB',
        gray300: '#D1D5DB',
        gray400: '#9CA3AF',
        gray500: '#6B7280',
        gray600: '#4B5563',
        gray700: '#374151',
        gray800: '#1F2937',
        gray900: '#111827',
    },

    // Brand Colors
    brand: {
        kakao: '#FEE500',
        apple: '#000000',
    },
} as const;

// Type helpers for TypeScript autocompletion
export type ColorKey = keyof typeof colors;
export type PrimaryColor = keyof typeof colors.primary;
export type SemanticColor = keyof typeof colors.semantic;
export type NeutralColor = keyof typeof colors.neutral;
export type BrandColor = keyof typeof colors.brand;
