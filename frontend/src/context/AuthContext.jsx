import { createContext, useState,useContext } from "react";
const AuthContext = createContext(null);
// useffect to load user from localStorage on mount

export const AuthProvider = ({ children }) => {
    // Load user from localStorage if available
    const [user, setUser] = useState( () =>
        { 
            try {
                if (typeof window == "undefined" || !window.localStorage) return null;
                const storedUser = localStorage.getItem("user");
                return storedUser ? JSON.parse(storedUser) : null;
            } catch (error) {
            console.error("Error loading user from localStorage:", error);
            return null;
            }
        }
    );

    // Login function to set user and store in localStorage
    const login = (userData) => {

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    }
    
    // Logout function to clear user and remove from localStorage
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    }
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);