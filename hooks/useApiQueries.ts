/**
 * React Query Hooks for API calls
 * 
 * This file contains example hooks demonstrating how to use React Query
 * with the axios client for data fetching and mutations.
 */

import apiClient from '@/services/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================
// Types
// ============================================

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
}

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: User;
}

// ============================================
// Query Keys
// ============================================

export const queryKeys = {
    user: ['user'] as const,
    userById: (id: string) => ['user', id] as const,
    caregivers: ['caregivers'] as const,
    caregiverById: (id: string) => ['caregivers', id] as const,
};

// ============================================
// Example Query Hooks
// ============================================

/**
 * Fetch current user profile
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: queryKeys.user,
        queryFn: async () => {
            const response = await apiClient.get<User>('/user/me');
            return response.data;
        },
        // Don't fetch if no auth token (you'd check this in a real app)
        enabled: true,
    });
}

/**
 * Fetch user by ID
 */
export function useUser(userId: string) {
    return useQuery({
        queryKey: queryKeys.userById(userId),
        queryFn: async () => {
            const response = await apiClient.get<User>(`/users/${userId}`);
            return response.data;
        },
        enabled: !!userId,
    });
}

// ============================================
// Example Mutation Hooks
// ============================================

/**
 * Login mutation
 */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
            return response.data;
        },
        onSuccess: (data) => {
            // Store the token (you'd use SecureStore in a real app)
            console.log('Login successful, token:', data.token);

            // Update the user cache
            queryClient.setQueryData(queryKeys.user, data.user);
        },
        onError: (error) => {
            console.error('Login failed:', error);
        },
    });
}

/**
 * Update user profile mutation
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userData: Partial<User>) => {
            const response = await apiClient.patch<User>('/user/me', userData);
            return response.data;
        },
        onSuccess: (data) => {
            // Update the user cache with new data
            queryClient.setQueryData(queryKeys.user, data);
        },
    });
}

/**
 * Logout mutation
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await apiClient.post('/auth/logout');
        },
        onSuccess: () => {
            // Clear all cached data on logout
            queryClient.clear();
        },
    });
}
