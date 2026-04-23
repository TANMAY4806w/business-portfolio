import { Link } from 'react-router-dom';

const PaymentCancel = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-dark-100 mb-2">Payment Cancelled</h1>
                <p className="text-dark-300 mb-8">
                    Your payment was cancelled and no charges were made. You can try again from your dashboard when you are ready.
                </p>
                <Link to="/hire-requests" className="btn-primary w-full block">
                    Return to Hire Requests
                </Link>
            </div>
        </div>
    );
};

export default PaymentCancel;
