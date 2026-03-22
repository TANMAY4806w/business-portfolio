import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, googleAuth } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('bp_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
                setToken(parsed.token);
            } catch {
                localStorage.removeItem('bp_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await loginUser({ email, password });
        setUser(data);
        setToken(data.token);
        localStorage.setItem('bp_user', JSON.stringify(data));
        return data;
    };

    const register = async (name, email, password, role) => {
        const { data } = await registerUser({ name, email, password, role });
        setUser(data);
        setToken(data.token);
        localStorage.setItem('bp_user', JSON.stringify(data));
        return data;
    };

    const googleLogin = async (token, role) => {
        const { data } = await googleAuth({ token, role });
        setUser(data);
        setToken(data.token);
        localStorage.setItem('bp_user', JSON.stringify(data));
        return data;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('bp_user');
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, googleLogin, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
