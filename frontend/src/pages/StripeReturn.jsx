import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StripeReturn = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Automatically redirect back to profile after a short delay
        const timer = setTimeout(() => {
            navigate('/dashboard/profile');
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full p-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-dark-100 mb-2">Bank Setup Complete!</h1>
                <p className="text-dark-400 mb-6">
                    Your Stripe payment routing is now configured. You can now automatically receive payouts from your clients.
                </p>
                <p className="text-sm text-dark-500 animate-pulse">
                    Redirecting back to dashboard...
                </p>
                <button onClick={() => navigate('/dashboard/profile')} className="btn-secondary w-full mt-6">
                    Return to Profile Now
                </button>
            </div>
        </div>
    );
};

export default StripeReturn;
