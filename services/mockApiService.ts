/**
 * Mock API Service
 * 
 * Simulates backend API responses for development and testing.
 * Replace with real API calls when backend is ready.
 */

import { clearTokens, saveTokens } from './tokenService';

// Mock user database
const mockUsers: Record<string, { password: string; name: string; phone: string }> = {
    'test@test.com': { password: '1234', name: '테스트 사용자', phone: '01012345678' },
    'caregiver@test.com': { password: '1234', name: '김간병', phone: '01087654321' },
};

// Mock token generator (simulates JWT)
function generateMockToken(userId: string, expiresIn: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresIn,
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock Login
 */
export async function mockLogin(email: string, password: string): Promise<{
    success: boolean;
    message: string;
    data?: { accessToken: string; refreshToken: string; expiresIn: number; user: { id: string; name: string; email: string } };
}> {
    await delay(800); // Simulate network latency

    const user = mockUsers[email];

    if (!user || user.password !== password) {
        return {
            success: false,
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        };
    }

    const accessToken = generateMockToken(email, 3600); // 1 hour
    const refreshToken = generateMockToken(email + '-refresh', 604800); // 7 days

    // Save tokens to secure storage
    await saveTokens({
        accessToken,
        refreshToken,
        expiresIn: 3600,
    });

    return {
        success: true,
        message: '로그인 성공',
        data: {
            accessToken,
            refreshToken,
            expiresIn: 3600,
            user: {
                id: email,
                name: user.name,
                email,
            },
        },
    };
}

/**
 * Mock Token Refresh
 */
export async function mockRefreshToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
}> {
    await delay(300);

    // In real app, validate the refresh token
    // For mock, just generate new tokens
    try {
        const parts = refreshToken.split('.');
        if (parts.length !== 3) throw new Error('Invalid token');

        const payload = JSON.parse(atob(parts[1]));
        const userId = payload.sub?.replace('-refresh', '') || 'unknown';

        const newAccessToken = generateMockToken(userId, 3600);
        const newRefreshToken = generateMockToken(userId + '-refresh', 604800);

        await saveTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600,
        });

        return {
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600,
        };
    } catch {
        return { success: false };
    }
}

/**
 * Mock Logout
 */
export async function mockLogout(): Promise<{ success: boolean }> {
    await delay(200);
    await clearTokens();
    return { success: true };
}

/**
 * Mock Get Current User
 */
export async function mockGetCurrentUser(): Promise<{
    success: boolean;
    data?: { id: string; name: string; email: string; phone: string };
}> {
    await delay(500);

    // In real app, decode token and fetch user data
    // For mock, return first user
    return {
        success: true,
        data: {
            id: 'test@test.com',
            name: '테스트 사용자',
            email: 'test@test.com',
            phone: '01012345678',
        },
    };
}

/**
 * Mock Social Login (Kakao/Apple)
 */
export async function mockSocialLogin(provider: 'kakao' | 'apple', socialToken: string): Promise<{
    success: boolean;
    message: string;
    isNewUser: boolean;
    data?: { accessToken: string; refreshToken: string; expiresIn: number; user: { id: string; name: string; email: string } };
}> {
    await delay(1000);

    const mockEmail = `${provider}_user@${provider}.com`;
    const accessToken = generateMockToken(mockEmail, 3600);
    const refreshToken = generateMockToken(mockEmail + '-refresh', 604800);

    await saveTokens({
        accessToken,
        refreshToken,
        expiresIn: 3600,
    });

    return {
        success: true,
        message: `${provider} 로그인 성공`,
        isNewUser: false, // Set to true if user needs to complete signup
        data: {
            accessToken,
            refreshToken,
            expiresIn: 3600,
            user: {
                id: mockEmail,
                name: provider === 'kakao' ? '카카오 사용자' : '애플 사용자',
                email: mockEmail,
            },
        },
    };
}
