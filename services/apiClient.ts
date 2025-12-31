import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isTokenExpired,
  saveTokens,
} from './tokenService';

// Default follows backend SSOT DEV base + prefix.
// Override by setting EXPO_PUBLIC_API_URL (e.g. http://api.dongdong.io:3000/api/v1)
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://api.dongdong.io:3000/api/v1';

export const API_HEALTH_PATH = '/health';

export function getApiBaseUrl(): string {
    return API_BASE_URL;
}

export type HealthCheckResult =
    | { ok: true; status: 'ok' }
    | { ok: false; reason: 'NETWORK'; message: string }
    | { ok: false; reason: 'HTTP'; status: number; message: string };

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Deterministic connectivity check.
 * - If this passes, "Network Error" is NOT a general connectivity issue; it's usually
 *   cleartext(HTTP) blocked, wrong baseURL, or server-side error on a specific endpoint.
 */
export async function pingHealth(): Promise<HealthCheckResult> {
    try {
        const res = await axios.get(`${API_BASE_URL}${API_HEALTH_PATH}`, {
            timeout: 6000,
            headers: { 'Content-Type': 'application/json' },
        });
        if (res?.data?.status === 'ok') return { ok: true, status: 'ok' };
        return { ok: false, reason: 'HTTP', status: res.status, message: 'unexpected health response' };
    } catch (e: any) {
        const ax = e as AxiosError;
        const status = (ax as any)?.response?.status;
        if (typeof status === 'number') {
            return { ok: false, reason: 'HTTP', status, message: `health status=${status}` };
        }
        const msg =
            (ax as any)?.message ? String((ax as any).message) : String(e);
        return { ok: false, reason: 'NETWORK', message: msg };
    }
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Add subscriber to be notified when token refresh completes
 */
function subscribeToTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers that token has been refreshed
 */
function onTokenRefreshed(newToken: string) {
    refreshSubscribers.forEach(callback => callback(newToken));
    refreshSubscribers = [];
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
        return null;
    }

    try {
        // Make refresh request directly with axios to avoid interceptor loop
        // Backend contract: POST /auth/refresh { refresh_token } -> { status, message, data: { access_token, refresh_token } }
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
        });

        const data = response.data?.data;
        const access_token: string | undefined = data?.access_token;
        const refresh_token: string | undefined = data?.refresh_token;

        if (!access_token) {
            throw new Error('Refresh response missing data.access_token');
        }

        await saveTokens({
            accessToken: access_token,
            refreshToken: refresh_token || refreshToken,
        });

        return access_token;
    } catch (error) {
        console.error('[API] Token refresh failed:', error);
        await clearTokens();
        return null;
    }
}

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Check if token needs refresh before making request
        const expired = await isTokenExpired();

        if (expired && !isRefreshing) {
            isRefreshing = true;
            const newToken = await refreshAccessToken();
            isRefreshing = false;

            if (newToken) {
                onTokenRefreshed(newToken);
                config.headers.Authorization = `Bearer ${newToken}`;
                return config;
            }
        }

        // Get current token
        const token = await getAccessToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle common errors and token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Token expired during request, try to refresh

            if (isRefreshing) {
                // Wait for ongoing refresh to complete
                return new Promise((resolve) => {
                    subscribeToTokenRefresh((newToken: string) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(apiClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const newToken = await refreshAccessToken();
            isRefreshing = false;

            if (newToken) {
                onTokenRefreshed(newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            }

            // Refresh failed - clear auth state
            console.log('[API] Unauthorized - session expired, redirecting to login');

            // Import dynamically to avoid circular dependency
            const { useAuthStore } = await import('@/store/authStore');
            useAuthStore.getState().logout();

            return Promise.reject(error);
        }

        if (error.response) {
            const status = error.response.status;

            if (status === 403) {
                console.log('[API] Forbidden - insufficient permissions');
            } else if (status >= 500) {
                console.log('[API] Server error:', status);
            }
        } else if (error.request) {
            console.log('[API] Network error - no response received');
        } else {
            console.log('[API] Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;

