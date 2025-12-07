import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, isTokenExpired, saveTokens } from './tokenService';

// Base API URL - change this to your actual API endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;

        await saveTokens({
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
            expiresIn,
        });

        return accessToken;
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

