import { useCallback } from 'react';

export const useAuthUtils = () => {
    const checkAndGetToken = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/signin';
            return null;
        }
        return token;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
    }, []);

    return {
        checkAndGetToken,
        logout
    };
}; 