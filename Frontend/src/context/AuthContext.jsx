import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

    const scrollUp = useCallback(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }, []);

    const value = useMemo(() => ({
        backendUrl,
        scrollUp,
    }), [backendUrl, scrollUp]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};

export default AuthContextProvider;
