import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleGoogleSuccess = async () => {
        setLoading(true);
        try {
            const user = await googleLogin();
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
                        <button type="button" onClick={handleGoogleSuccess} className="w-full flex items-center justify-center gap-2 border border-dark-600 bg-dark-800 hover:bg-dark-700 py-3 rounded-xl text-white font-medium transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Sign in with Google
                        </button>
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
