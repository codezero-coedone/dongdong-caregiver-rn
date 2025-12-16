import { useLanguageStore } from '../store/languageStore';
import { t, TranslationKey } from './translations';

/**
 * Hook to get translated text based on current language setting.
 * Uses Zustand store, so components will re-render when language changes.
 */
export const useTranslation = () => {
    const { language } = useLanguageStore();

    const translate = (key: TranslationKey): string => {
        return t(language, key);
    };

    return {
        t: translate,
        language,
    };
};

export default useTranslation;
