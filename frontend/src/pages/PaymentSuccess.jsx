import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        if (!sessionId) {
            navigate('/hire-requests');
        }
    }, [sessionId, navigate]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-dark-100 mb-2">Payment Successful!</h1>
                <p className="text-dark-300 mb-8">
                    Your payment was processed securely. The business will now begin working on your request.
                </p>
                <Link to="/hire-requests" className="btn-primary w-full block">
                    Return to Hire Requests
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;
