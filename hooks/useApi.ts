import { useCallback } from 'react';
import { useAuthUtils } from './useAuth';
import { useAuth } from '@/lib/contexts/AuthContext';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
}

export const useApi = () => {
    const { checkAndGetToken } = useAuthUtils();
    const { signOut } = useAuth();

    const handleUnauthorized = useCallback(() => {
        signOut();
    }, [signOut]);

    const fetchApi = useCallback(async <T>(url: string, options: ApiOptions = {}): Promise<T | null> => {
        const token = checkAndGetToken();
        if (!token) return null;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const { method = 'GET', body } = options;

        try {
            const response = await fetch(url, {
                method,
                headers,
                ...(body ? { body: JSON.stringify(body) } : {})
            });

            if (response.status === 401) {
                handleUnauthorized();
                return null;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `API error: ${response.status}`);
            }

            return data as T;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        }
    }, [checkAndGetToken, handleUnauthorized]);

    return { fetchApi };
}; 