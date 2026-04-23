import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'client' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleGoogleSuccess = async () => {
        setLoading(true);
        try {
            const user = await googleLogin(form.role);
            toast.success('Account accessed successfully!');
            navigate(user.role === 'business' ? '/dashboard' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear error on change
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!form.password) {
            newErrors.password = 'Password is required';
        } else if (form.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Password strength
    const getPasswordStrength = () => {
        const p = form.password;
        if (!p) return { level: 0, label: '', color: '' };
        let score = 0;
        if (p.length >= 6) score++;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;

        if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
        if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
        if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
        return { level: 4, label: 'Strong', color: 'bg-green-500' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const user = await register(form.name, form.email, form.password, form.role);
            toast.success('Account created successfully!');
            navigate(user.role === 'business' ? '/dashboard' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const strength = getPasswordStrength();

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4
                        animate-pulse-glow">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
                    <p className="text-dark-400">Join the Business Portfolio platform</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5 animate-fade-in-up"
                    style={{ animationDelay: '0.1s' }}>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange}
                            autoComplete="name" placeholder="John Doe"
                            className={`input-dark ${errors.name ? '!border-red-500 focus:!ring-red-500' : ''}`} />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange}
                            autoComplete="email" placeholder="you@example.com"
                            className={`input-dark ${errors.email ? '!border-red-500 focus:!ring-red-500' : ''}`} />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange}
                            autoComplete="new-password" placeholder="Minimum 6 characters"
                            className={`input-dark ${errors.password ? '!border-red-500 focus:!ring-red-500' : ''}`} />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        {/* Strength Bar */}
                        {form.password && (
                            <div className="mt-2">
                                <div className="flex gap-1 mb-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300
                           ${i <= strength.level ? strength.color : 'bg-dark-600'}`} />
                                    ))}
                                </div>
                                <p className={`text-xs ${strength.color.replace('bg-', 'text-')}`}>
                                    {strength.label}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Confirm Password</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword}
                            onChange={handleChange} autoComplete="new-password" placeholder="Re-enter password"
                            className={`input-dark ${errors.confirmPassword ? '!border-red-500 focus:!ring-red-500' : ''}`} />
                        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {/* Role Selector */}
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-3">I am a</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setForm({ ...form, role: 'client' })}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center
                        ${form.role === 'client'
                                        ? 'border-accent-500 bg-accent-500/10 text-accent-300'
                                        : 'border-dark-600 bg-dark-800 text-dark-300 hover:border-dark-500'
                                    }`}>
                                <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-semibold text-sm">Client</span>
                                <p className="text-xs mt-1 opacity-70">I want to hire</p>
                            </button>
                            <button type="button" onClick={() => setForm({ ...form, role: 'business' })}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center
                        ${form.role === 'business'
                                        ? 'border-accent-500 bg-accent-500/10 text-accent-300'
                                        : 'border-dark-600 bg-dark-800 text-dark-300 hover:border-dark-500'
                                    }`}>
                                <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-semibold text-sm">Business</span>
                                <p className="text-xs mt-1 opacity-70">I offer services</p>
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating account...
                            </span>
                        ) : 'Create Account'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dark-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-dark-800 text-dark-400">Or signup with</span>
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
                            Sign up with Google
                        </button>
                    </div>
                </form>

                <p className="text-center text-dark-400 text-sm mt-6 animate-fade-in-up"
                    style={{ animationDelay: '0.2s' }}>
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
