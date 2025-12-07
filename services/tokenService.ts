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

/**
 * Save tokens to secure storage
 */
export async function saveTokens(payload: TokenPayload): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, payload.accessToken);

    if (payload.refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, payload.refreshToken);
    }

    if (payload.expiresIn) {
        // Store expiry time as timestamp
        const expiryTime = Date.now() + payload.expiresIn * 1000;
        await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryTime.toString());
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

    if (!expiryStr) {
        // No expiry stored, assume not expired
        return false;
    }

    const expiryTime = parseInt(expiryStr, 10);
    const bufferTime = 60 * 1000; // 1 minute buffer

    return Date.now() >= expiryTime - bufferTime;
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
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
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
