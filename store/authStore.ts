import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type LoginType = 'kakao' | 'apple' | null;

interface SignupInfo {
    phone: string;
    isDomestic: boolean;
    // 내국인 전용 필드
    name?: string;
    rrnFront?: string;
    rrnBack?: string;
    // 외국인 전용 필드
    koreanName?: string;
    englishName?: string;
    foreignRegFront?: string;
    foreignRegBack?: string;
    visaType?: string;
    visaExpiryDate?: string;
}

interface CaregiverInfo {
    name: string;
    rrnFront: string;
    rrnBack: string;
    phone: string;
    address: string;
    addressDetail: string;
    criminalRecordFile?: { uri: string; name: string; mimeType?: string } | null;
}

interface CareerInfo {
    hasExperience: boolean;  // true: 경력, false: 신입
    certificates: string[];  // ['요양보호사', '간호조무사', ...]
}

interface AuthState {
    /**
     * Zustand persist hydration flag.
     * - RootLayout redirects must wait until persisted state is loaded,
     *   otherwise the app can "bounce" back to onboarding after a successful login.
     */
    hydrated: boolean;
    isLoggedIn: boolean;
    isSignupComplete: boolean;
    loginType: LoginType;
    error: string | null;
    signupInfo: SignupInfo | null;
    caregiverInfo: CaregiverInfo | null;
    careerInfo: CareerInfo | null;
    login: (type: LoginType) => void;
    completeSignup: () => void;
    logout: () => void;
    setError: (error: string | null) => void;
    setSignupInfo: (info: SignupInfo) => void;
    clearSignupInfo: () => void;
    setCaregiverInfo: (info: CaregiverInfo) => void;
    clearCaregiverInfo: () => void;
    setCareerInfo: (info: CareerInfo) => void;
    clearCareerInfo: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            hydrated: false,
            isLoggedIn: false,
            isSignupComplete: false,
            loginType: null,
            error: null,
            signupInfo: null,
            caregiverInfo: null,
            careerInfo: null,
            login: (type) => set({ isLoggedIn: true, isSignupComplete: false, loginType: type, error: null }),
            completeSignup: () => set({ isSignupComplete: true }),
            logout: () => set({ isLoggedIn: false, isSignupComplete: false, loginType: null, error: null, signupInfo: null, caregiverInfo: null, careerInfo: null }),
            setError: (error) => set({ error }),
            setSignupInfo: (info) => set({ signupInfo: info }),
            clearSignupInfo: () => set({ signupInfo: null }),
            setCaregiverInfo: (info) => set({ caregiverInfo: info }),
            clearCaregiverInfo: () => set({ caregiverInfo: null }),
            setCareerInfo: (info) => set({ careerInfo: info }),
            clearCareerInfo: () => set({ careerInfo: null }),
        }),
        {
            name: 'dongdong-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                // Mark hydration completion (even if state is undefined on failure).
                // This prevents RootLayout from redirecting based on default false flags.
                try {
                    state?.setState?.({ hydrated: true } as any);
                } catch {
                    // ignore
                }
            },
            partialize: (state) => ({
                signupInfo: state.signupInfo,
                caregiverInfo: state.caregiverInfo,
                careerInfo: state.careerInfo,
                isLoggedIn: state.isLoggedIn,
                isSignupComplete: state.isSignupComplete,
                loginType: state.loginType,
            }),
        }
    )
);

export type { CareerInfo, CaregiverInfo, SignupInfo };

