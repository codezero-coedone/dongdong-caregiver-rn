import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LanguageCode = 'ko' | 'en';

export interface LanguageOption {
    code: LanguageCode;
    label: string;
    nativeLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
    { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
    { code: 'en', label: 'English', nativeLabel: 'English' },
];

interface LanguageState {
    language: LanguageCode;
    setLanguage: (language: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'ko',
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'dongdong-language-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Helper to get current language option
export const getLanguageOption = (code: LanguageCode): LanguageOption => {
    return LANGUAGE_OPTIONS.find((option) => option.code === code) || LANGUAGE_OPTIONS[0];
};
