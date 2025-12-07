import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type LoginType = 'kakao' | 'apple' | null;

interface SignupInfo {
    name: string;
    rrnFront: string;
    rrnBack: string;
    phone: string;
    isDomestic: boolean;
}

interface CaregiverInfo {
    name: string;
    rrnFront: string;
    rrnBack: string;
    phone: string;
    address: string;
    addressDetail: string;
    criminalRecordFile?: { uri: string; name: string } | null;
}

interface AuthState {
    isLoggedIn: boolean;
    isSignupComplete: boolean;
    loginType: LoginType;
    error: string | null;
    signupInfo: SignupInfo | null;
    caregiverInfo: CaregiverInfo | null;
    login: (type: LoginType) => void;
    completeSignup: () => void;
    logout: () => void;
    setError: (error: string | null) => void;
    setSignupInfo: (info: SignupInfo) => void;
    clearSignupInfo: () => void;
    setCaregiverInfo: (info: CaregiverInfo) => void;
    clearCaregiverInfo: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            isSignupComplete: false,
            loginType: null,
            error: null,
            signupInfo: null,
            caregiverInfo: null,
            login: (type) => set({ isLoggedIn: true, isSignupComplete: false, loginType: type, error: null }),
            completeSignup: () => set({ isSignupComplete: true }),
            logout: () => set({ isLoggedIn: false, isSignupComplete: false, loginType: null, error: null, signupInfo: null, caregiverInfo: null }),
            setError: (error) => set({ error }),
            setSignupInfo: (info) => set({ signupInfo: info }),
            clearSignupInfo: () => set({ signupInfo: null }),
            setCaregiverInfo: (info) => set({ caregiverInfo: info }),
            clearCaregiverInfo: () => set({ caregiverInfo: null }),
        }),
        {
            name: 'dongdong-auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                signupInfo: state.signupInfo,
                caregiverInfo: state.caregiverInfo,
                isLoggedIn: state.isLoggedIn,
                loginType: state.loginType,
            }),
        }
    )
);

export type { CaregiverInfo, SignupInfo };

