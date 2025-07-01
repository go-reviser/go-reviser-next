import { useCallback } from 'react';
import { useAuthUtils } from './useAuth';

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown>;
}

export const useApi = () => {
    const { checkAndGetToken } = useAuthUtils();

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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `API error: ${response.status}`);
            }

            return data as T;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        }
    }, [checkAndGetToken]);

    return { fetchApi };
}; 