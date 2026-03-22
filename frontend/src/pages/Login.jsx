import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '../components/Toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const user = await googleLogin(credentialResponse.credential);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'business' ? '/dashboard' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google login failed. If you are new, please register first.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'business' ? '/dashboard' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4
                        animate-pulse-glow">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h1>
                    <p className="text-dark-400">Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5 animate-fade-in-up"
                    style={{ animationDelay: '0.1s' }}>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            required autoComplete="email" placeholder="you@example.com" className="input-dark" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            required autoComplete="current-password" placeholder="••••••••" className="input-dark" />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dark-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-dark-800 text-dark-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error('Google Login Failed')}
                            theme="filled_black"
                            shape="rectangular"
                            text="signin_with"
                        />
                    </div>
                </form>

                <p className="text-center text-dark-400 text-sm mt-6 animate-fade-in-up"
                    style={{ animationDelay: '0.2s' }}>
                    Don't have an account?{' '}
                    <Link to="/register" className="text-accent-400 hover:text-accent-300 font-medium">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
