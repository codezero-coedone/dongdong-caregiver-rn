import { create } from 'zustand';

type LoginType = 'kakao' | 'apple' | null;

interface SignupInfo {
    name: string;
    rrnFront: string;
    rrnBack: string;
    phone: string;
    isDomestic: boolean;
}

interface AuthState {
    isLoggedIn: boolean;
    isSignupComplete: boolean;
    loginType: LoginType;
    error: string | null;
    signupInfo: SignupInfo | null;
    login: (type: LoginType) => void;
    completeSignup: () => void;
    logout: () => void;
    setError: (error: string | null) => void;
    setSignupInfo: (info: SignupInfo) => void;
    clearSignupInfo: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    isSignupComplete: false,
    loginType: null,
    error: null,
    signupInfo: null,
    login: (type) => set({ isLoggedIn: true, isSignupComplete: false, loginType: type, error: null }),
    completeSignup: () => set({ isSignupComplete: true }),
    logout: () => set({ isLoggedIn: false, isSignupComplete: false, loginType: null, error: null, signupInfo: null }),
    setError: (error) => set({ error }),
    setSignupInfo: (info) => set({ signupInfo: info }),
    clearSignupInfo: () => set({ signupInfo: null }),
}));

export type { SignupInfo };
