/**
 * Token Service
 * 
 * Secure storage and management of JWT tokens using expo-secure-store.
 * Handles access token, refresh token, and automatic token refresh.
 */

import * as SecureStore from 'expo-secure-store';

// Storage keys
const TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export interface TokenPayload {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number; // seconds until expiry
}

function normalizeBase64(b64: string): string {
    const s = String(b64 || '').replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4;
    return pad ? s + '='.repeat(4 - pad) : s;
}

function getExpiryFromJwtMs(token: string): number | null {
    try {
        const payload = decodeJwtPayload(token);
        const exp = (payload as any)?.exp;
        const n = typeof exp === 'string' ? Number(exp) : exp;
        if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) return null;
        return Math.floor(n * 1000);
    } catch {
        return null;
    }
}

/**
 * Save tokens to secure storage
 */
export async function saveTokens(payload: TokenPayload): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, payload.accessToken);

    if (payload.refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, payload.refreshToken);
    }

    // Store expiry time as timestamp
    // - Prefer backend expiresIn
    // - Fallback to JWT exp claim (seconds since epoch)
    const expiryTime =
        typeof payload.expiresIn === 'number' && Number.isFinite(payload.expiresIn) && payload.expiresIn > 0
            ? Date.now() + payload.expiresIn * 1000
            : getExpiryFromJwtMs(payload.accessToken);

    if (typeof expiryTime === 'number' && Number.isFinite(expiryTime) && expiryTime > 0) {
        await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, String(Math.floor(expiryTime)));
    } else {
        // Avoid keeping a stale expiry from an older session.
        await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
    }
}

/**
 * Get access token from secure storage
 */
export async function getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Get refresh token from secure storage
 */
export async function getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * Check if access token is expired or about to expire (within 1 minute)
 */
export async function isTokenExpired(): Promise<boolean> {
    const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);

    const bufferTime = 60 * 1000; // 1 minute buffer

    if (expiryStr) {
        const expiryTime = parseInt(expiryStr, 10);
        if (Number.isFinite(expiryTime) && expiryTime > 0) {
            return Date.now() >= expiryTime - bufferTime;
        }
    }

    // Fallback: derive expiry from JWT exp if available.
    const token = await getAccessToken();
    if (!token) return false;
    const expMs = getExpiryFromJwtMs(token);
    if (typeof expMs !== 'number') return false;

    // Cache derived expiry for determinism across the session.
    await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, String(expMs));
    return Date.now() >= expMs - bufferTime;
}

/**
 * Clear all tokens from secure storage (for logout)
 */
export async function clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
}

/**
 * Check if user has valid tokens stored
 */
export async function hasValidTokens(): Promise<boolean> {
    const token = await getAccessToken();
    if (!token) return false;

    const expired = await isTokenExpired();
    if (expired) {
        // Check if we have a refresh token to potentially refresh
        const refreshToken = await getRefreshToken();
        return !!refreshToken;
    }

    return true;
}

/**
 * Decode JWT payload (without verification)
 * Note: This does NOT verify the signature, only decodes the payload
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const decoded = atob(normalizeBase64(payload));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/**
 * Get user ID from stored token
 */
export async function getUserIdFromToken(): Promise<string | null> {
    const token = await getAccessToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    // Common JWT claims for user ID
    return (payload.sub || payload.userId || payload.user_id) as string | null;
}
