import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getMe, registerUser } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen to Firebase Auth State
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Fetch custom user profile (role, name) from our backend
                    const { data } = await getMe();
                    setUser(data);
                } catch (error) {
                    console.error("Backend profile fetch failed. User might be mid-registration.", error);
                    // Do not log out immediately during registration flow!
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
        const { data } = await getMe();
        setUser(data);
        return data;
    };

    const register = async (name, email, password, role) => {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // 2. We are now logged in to Firebase. The API interceptor will attach the new token.
        // 3. Inform the backend to create the Firestore database profile
        const { data } = await registerUser({ name, email, role, uid: userCredential.user.uid });
        setUser(data);
        return data;
    };

    const googleLogin = async (role) => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        
        // CRITICAL FIX: Firebase race condition. We must wait for auth state to fully initialize 
        // so that auth.currentUser is not null when the API interceptor runs!
        await auth.authStateReady();
        
        try {
            // Check if profile exists, if not, create it
            const { data } = await getMe();
            setUser(data);
            return data;
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // User doesn't exist in backend, register them
                const { data } = await registerUser({
                    name: userCredential.user.displayName,
                    email: userCredential.user.email,
                    role: role || 'client', // Google auth defaults to client if not specified
                    uid: userCredential.user.uid
                });
                setUser(data);
                return data;
            }
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, googleLogin, logout }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};
