import { createContext, useCallback, useMemo, useState } from "react";

export const AuthContext = createContext();
const STORAGE_KEY = "taskManagementUser";

const AuthContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEY);
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            return null;
        }
    });

    const login = useCallback((nextUser) => {
        setUser(nextUser);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        } catch (error) {
            // Ignore storage errors (e.g., private mode).
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            // Ignore storage errors.
        }
    }, []);

    const scrollUp = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, []);

    const value = useMemo(() => ({
        backendUrl,
        scrollUp,
        user,
        login,
        logout,
        isAuthenticated: Boolean(user)
    }), [backendUrl, login, logout, scrollUp, user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};

export default AuthContextProvider;
