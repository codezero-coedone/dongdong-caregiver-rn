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
    criminalRecordFile?: { uri: string; name: string; mimeType?: string } | null;
}

interface CareerInfo {
    hasExperience: boolean;  // true: 경력, false: 신입
    certificates: string[];  // ['요양보호사', '간호조무사', ...]
}

interface AuthState {
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
            isLoggedIn: false,
            isSignupComplete: false,
            loginType: null,
            error: null,
            signupInfo: null,
            // TODO: 테스트용 초기값 - 배포 전 null로 변경 필요
            caregiverInfo: {
                name: '홍길동',
                rrnFront: '800101',
                rrnBack: '1234567',
                phone: '01012345678',
                address: '서울특별시 강남구 테헤란로 123',
                addressDetail: '456호',
                criminalRecordFile: null,
            },
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
            partialize: (state) => ({
                signupInfo: state.signupInfo,
                caregiverInfo: state.caregiverInfo,
                careerInfo: state.careerInfo,
                isLoggedIn: state.isLoggedIn,
                loginType: state.loginType,
            }),
        }
    )
);

export type { CareerInfo, CaregiverInfo, SignupInfo };

