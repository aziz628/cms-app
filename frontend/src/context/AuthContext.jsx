import { createContext, useState,useContext,useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);


export const AUTH_STATES = {
    AUTHENTICATED: 1,
    UNAUTHENTICATED: 0,
    LOADING: -1
};

export const AuthProvider = ({ children }) => {
    // default authState to loading
    const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
    const [user, setUser] = useState(null);

    //session verification (happens once on mount )
    const verifySession = async () => {

        // Check localStorage for existing user session
        const storedUser = localStorage.getItem("user");
        
        // if no user then it's unauthenticated
        if (!storedUser) {
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
            return;
        }
        // if user exists, verify with backend
        try {
            // Call /me endpoint to ensure session is valid
            const response = await authService.verifySession();

            // Update username silently if changed in backend
            const currentUser = {
                username: response.username 
            };
            
            // Update state and localStorage with latest username
            setUser(currentUser);
            localStorage.setItem("user", JSON.stringify(currentUser));

            // Set auth state to authenticated
            setAuthState(AUTH_STATES.AUTHENTICATED);

        } catch (err) {
            console.log("Session verification failed:", err);
            // Clear invalid session
            setUser(null);
            localStorage.removeItem("user");
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
        }
    };
    // Call verifySession on component mount
    useState(() => {
        verifySession();
    }, []);

    // Login function to authenticate user and store in localStorage
    const login = (userData) => {
        setUser(userData);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        // add user item 
        localStorage.setItem("user", JSON.stringify(userData));
    }

    // Logout function to unauthenticate user and clear localStorage
    const logout = () => {
        setUser(null);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        // delete user item
        localStorage.removeItem("user");
    }

     // Cross-tab logout handler 
    const logoutLocally = () => {
        setUser(null);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
    };

     // Cross-tab storage listener for auth state and user info update
    useEffect(() => {

        // Listen for storage events to handle cross-tab logout
        const handleStorageChange = (e) => {
            // if 'user' key changes
            if (e.key === 'user') {

                // if user was logged out in another tab
                if (e.newValue === null) {
                    logoutLocally();
                }
                // User was logged in or updated in another tab
                else{
                    // check previous user object for login (prevent unnecessary re-render)
                    if(user===null){
                        setAuthState(AUTH_STATES.AUTHENTICATED);
                    }

                    // Update local user state (low render impact)
                    const newUser = JSON.parse(e.newValue);
                    setUser(newUser);
                }
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        // Cleanup listener on unmount (prevent stacking listeners on re-mount)
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);


    return (
        <AuthContext.Provider value={{ user, authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);