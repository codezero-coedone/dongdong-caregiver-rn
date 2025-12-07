import { create } from 'zustand';

type LoginType = 'kakao' | 'apple' | null;

interface AuthState {
    isLoggedIn: boolean;
    isSignupComplete: boolean;
    loginType: LoginType;
    error: string | null;
    login: (type: LoginType) => void;
    completeSignup: () => void;
    logout: () => void;
    setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    isSignupComplete: false,
    loginType: null,
    error: null,
    login: (type) => set({ isLoggedIn: true, isSignupComplete: false, loginType: type, error: null }),
    completeSignup: () => set({ isSignupComplete: true }),
    logout: () => set({ isLoggedIn: false, isSignupComplete: false, loginType: null, error: null }),
    setError: (error) => set({ error }),
}));

