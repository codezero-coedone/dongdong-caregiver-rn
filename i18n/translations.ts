import { LanguageCode } from '../store/languageStore';

// Translation type definitions
export type TranslationKey = keyof typeof translations.ko;

const translations = {
    ko: {
        // Common
        next: '다음',
        login: '로그인',
        signup: '회원가입',
        cancel: '취소',
        confirm: '확인',
        close: '닫기',

        // Onboarding
        onboarding1_title: '안심되는 돌봄 시작',
        onboarding1_desc: '간병 매칭부터 관리까지 한 곳에서 해결\n보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공',

        onboarding2_title: '실시간 확인으로 안심',
        onboarding2_desc: '현재 돌봄 상황을 언제든 확인하세요.\n간병 진행 현황, 간병일지, 주요 알림까지 실시간으로 공유되어 멀리 있어도 안심할 수 있어요.',

        onboarding3_title: '맞춤 돌봄 서비스 이용',
        onboarding3_desc: '간병 매칭부터 관리까지 한 곳에서 해결\n보호자·환자 모두에게 편리한 통합 돌봄 서비스 제공',

        // Login buttons
        kakao_login: '카카오 시작하기',
        apple_login: '애플 시작하기',

        // Error messages
        kakao_login_failed: '카카오 로그인에 실패했습니다.',
        apple_login_failed: '애플 로그인에 실패했습니다.',
        login_failed: '로그인에 실패했습니다.',
    },
    en: {
        // Common
        next: 'Next',
        login: 'Login',
        signup: 'Sign Up',
        cancel: 'Cancel',
        confirm: 'Confirm',
        close: 'Close',

        // Onboarding
        onboarding1_title: 'Start Safe Care',
        onboarding1_desc: 'Handle everything from caregiver matching to management in one place\nProviding convenient integrated care services for both guardians and patients',

        onboarding2_title: 'Peace of Mind with Real-time Updates',
        onboarding2_desc: 'Check the current care status anytime.\nCare progress, journals, and important notifications are shared in real-time, so you can feel at ease even from afar.',

        onboarding3_title: 'Use Customized Care Services',
        onboarding3_desc: 'Handle everything from caregiver matching to management in one place\nProviding convenient integrated care services for both guardians and patients',

        // Login buttons
        kakao_login: 'Continue with Kakao',
        apple_login: 'Continue with Apple',

        // Error messages
        kakao_login_failed: 'Kakao login failed.',
        apple_login_failed: 'Apple login failed.',
        login_failed: 'Login failed.',
    },
} as const;

export const getTranslation = (language: LanguageCode, key: TranslationKey): string => {
    return translations[language][key] || translations.ko[key] || key;
};

export const t = getTranslation;

export default translations;
