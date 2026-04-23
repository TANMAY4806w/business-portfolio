import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyHireRequests, updateHireStatus, createReview, processMockPayment } from '../services/api';
import StarRating from '../components/StarRating';
import { auth } from '../config/firebase';

const statusColors = {
    pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', accent: 'border-l-yellow-500' },
    accepted: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', accent: 'border-l-blue-500' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', accent: 'border-l-red-500' },
    completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', accent: 'border-l-green-500' },
};

const HireRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
    const [acceptingId, setAcceptingId] = useState(null);
    const [customSowText, setCustomSowText] = useState('');
    const [agreedToSow, setAgreedToSow] = useState({});

    // Fake Payment Gateway States
    const [paymentModal, setPaymentModal] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await getMyHireRequests();
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status, extraData = {}) => {
        try {
            await updateHireStatus(id, { status, ...extraData });
            setMessage(`Request ${status}!`);
            setAcceptingId(null);
            fetchRequests();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error updating status');
        }
    };

    const handlePaymentClick = (req) => {
        setPaymentModal(req);
        setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
        setPaymentSuccess(false);
    };

    const processPaymentSubmit = async (e) => {
        e.preventDefault();
        setIsProcessingPayment(true);
        
        try {
            // Simulate network delay for realism
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Call the real backend to update DB and send Invoice emails
            await processMockPayment({ hireRequestId: paymentModal._id });
            
            setPaymentSuccess(true);
            setIsProcessingPayment(false);
            
            // Wait a moment to show success animation, then close and refresh
            setTimeout(() => {
                setPaymentModal(null);
                fetchRequests();
                setMessage('Payment successful! Invoice sent to your email.');
                setTimeout(() => setMessage(''), 4000);
            }, 1500);
            
        } catch (err) {
            setIsProcessingPayment(false);
            setMessage(err.response?.data?.message || 'Payment failed');
        }
    };

    const handleReview = async (hireRequestId) => {
        try {
            await createReview({
                hireRequestId,
                rating: reviewForm.rating,
                reviewText: reviewForm.reviewText,
            });
            setMessage('Review submitted!');
            setReviewingId(null);
            setReviewForm({ rating: 5, reviewText: '' });
            fetchRequests();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error submitting review');
        }
    };

    const handleDownload = async (hireRequestId, type) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            // Open securely in new tab bypassing standard axios JSON return types
            window.open(`${apiUrl}/hire/${hireRequestId}/${type}?token=${token}`, '_blank');
        } catch (err) {
            setMessage('Failed to download document');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold gradient-text mb-8 animate-fade-in-up">Hire Requests</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium text-center
          ${message.includes('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-green-500/10 border border-green-500/30 text-green-400'}`}>
                    {message}
                </div>
            )}

            {requests.length === 0 ? (
                <div className="text-center py-20 animate-fade-in-up">
                    <svg className="w-16 h-16 text-dark-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-xl font-semibold text-dark-300">No hire requests yet</h3>
                </div>
            ) : (
                <div className="space-y-6">
                    {requests.map((req, i) => (
                        <div key={req._id} 
                            className={`glass-card p-6 border-l-4 ${statusColors[req.status].accent} 
                                        hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 
                                        transition-all duration-300 animate-fade-in-up overflow-hidden relative`}
                            style={{ animationDelay: `${i * 0.05}s` }}>
                            
                            {/* Decorative background glow based on status */}
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full pointer-events-none ${statusColors[req.status].bg.replace('/10', '')}`} />

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="font-bold text-white text-xl tracking-tight">
                                            {req.serviceId?.title || 'Service'}
                                        </h3>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize border shadow-sm
                                            ${statusColors[req.status].bg} ${statusColors[req.status].text} ${statusColors[req.status].border}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        {user?.role === 'client' ? (
                                            <div className="flex items-center gap-2 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-dark-700">
                                                <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-[10px] font-bold text-white">
                                                    {req.businessId?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-dark-400">Business:</span> 
                                                <Link to={`/business/${req.businessId?._id}`} className="text-white hover:text-accent-400 font-medium transition-colors">
                                                    {req.businessId?.name}
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-dark-700">
                                                <div className="w-6 h-6 rounded-full bg-dark-600 flex items-center justify-center text-[10px] font-bold text-dark-200">
                                                    {req.clientId?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-dark-400">Client:</span> 
                                                <span className="text-white font-medium">{req.clientId?.name}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-2 text-dark-300 bg-dark-800/50 px-3 py-1.5 rounded-lg border border-dark-700">
                                            <svg className="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-bold text-white">${req.serviceId?.price}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-dark-400">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {/* Business actions */}
                                    {user?.role === 'business' && req.status === 'pending' && (
                                        <>
                                            <button onClick={() => { setAcceptingId(req._id); setCustomSowText(''); }}
                                                className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30
                                       rounded-lg text-sm font-medium hover:bg-green-500/20 transition-all">
                                                Accept & Draft SOW
                                            </button>
                                            <button onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                                className="btn-danger text-sm">
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {/* Business marked completed */}
                                    {user?.role === 'business' && req.status === 'accepted' && req.paymentStatus === 'paid' && (
                                        <button onClick={() => handleStatusUpdate(req._id, 'completed')}
                                            className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30
                                     rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-all">
                                            Mark Completed
                                        </button>
                                    )}

                                    {/* Client Pay Now */}
                                    {user?.role === 'client' && req.status === 'accepted' && req.paymentStatus === 'pending' && (
                                        <div className="flex flex-col gap-2 items-end">
                                            <label className="flex items-center gap-2 text-sm text-dark-300 select-none cursor-pointer">
                                                <input type="checkbox" checked={agreedToSow[req._id] || false}
                                                    onChange={(e) => setAgreedToSow(prev => ({ ...prev, [req._id]: e.target.checked }))}
                                                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-accent-500 focus:ring-accent-500/50" />
                                                I agree to the SOW terms
                                            </label>
                                            <button onClick={() => handlePaymentClick(req)}
                                                disabled={!agreedToSow[req._id]}
                                                className={`px-4 py-2 bg-accent-500 text-dark-900 border border-accent-600
                                                    rounded-lg text-sm font-bold shadow-lg transition-all
                                                    ${!agreedToSow[req._id] ? 'opacity-50 cursor-not-allowed' : 'shadow-accent-500/20 hover:bg-accent-400'}`}>
                                                Pay Now
                                            </button>
                                        </div>
                                    )}

                                    {/* Download SOW */}
                                    {['accepted', 'completed'].includes(req.status) && (
                                        <button onClick={() => handleDownload(req._id, 'sow')}
                                            className="px-4 py-2 bg-dark-700 text-dark-200 border border-dark-600
                                     rounded-lg text-sm font-medium hover:bg-dark-600 transition-all flex items-center gap-2">
                                            📄 SOW
                                        </button>
                                    )}

                                    {/* Payment indicator & Invoice */}
                                    {req.paymentStatus === 'paid' && (
                                        <>
                                            <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Paid
                                            </span>
                                            <button onClick={() => handleDownload(req._id, 'invoice')}
                                                className="px-4 py-2 bg-dark-700 text-dark-200 border border-dark-600
                                         rounded-lg text-sm font-medium hover:bg-dark-600 transition-all flex items-center gap-2">
                                                🧾 Invoice
                                            </button>
                                        </>
                                    )}

                                    {/* Chat button – only if hire exists */}
                                    {['accepted', 'completed'].includes(req.status) && req.paymentStatus === 'paid' && (
                                        <Link to={`/chat/${req._id}`}
                                            className="px-4 py-2 bg-accent-500/10 text-accent-400 border border-accent-500/30
                                   rounded-lg text-sm font-medium hover:bg-accent-500/20 transition-all">
                                            Chat
                                        </Link>
                                    )}

                                    {/* Client review action */}
                                    {user?.role === 'client' && req.status === 'completed' && (
                                        <button onClick={() => setReviewingId(reviewingId === req._id ? null : req._id)}
                                            className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30
                                     rounded-lg text-sm font-medium hover:bg-purple-500/20 transition-all">
                                            {reviewingId === req._id ? 'Cancel' : 'Review'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Inline Review Form */}
                            {reviewingId === req._id && (
                                <div className="mt-4 pt-4 border-t border-dark-700 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-dark-300">Rating:</span>
                                        <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                                    </div>
                                    <textarea rows={3} value={reviewForm.reviewText}
                                        onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                                        className="input-dark resize-none" placeholder="Write your review..." />
                                    <button onClick={() => handleReview(req._id)}
                                        disabled={!reviewForm.reviewText.trim()}
                                        className="btn-primary text-sm">
                                        Submit Review
                                    </button>
                                </div>
                            )}

                            {/* Inline SOW Drafting Form (Business Only) */}
                            {acceptingId === req._id && (
                                <div className="mt-4 pt-4 border-t border-dark-700 space-y-3">
                                    <label className="block text-sm font-medium text-dark-300">Draft Custom Statement of Work (Optional)</label>
                                    <textarea rows={4} value={customSowText}
                                        onChange={(e) => setCustomSowText(e.target.value)}
                                        className="input-dark resize-none" placeholder="Add specific milestones, deliverables, or terms..." />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStatusUpdate(req._id, 'accepted', { customSowText })}
                                            className="btn-primary text-sm">
                                            Confirm Accept & Send SOW
                                        </button>
                                        <button onClick={() => setAcceptingId(null)}
                                            className="btn-secondary text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Realistic Simulated Payment Modal */}
            {paymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card max-w-md w-full p-8 relative overflow-hidden">
                        {/* Close button */}
                        {!isProcessingPayment && !paymentSuccess && (
                            <button onClick={() => setPaymentModal(null)} className="absolute top-4 right-4 text-dark-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-1">Secure Checkout</h2>
                            <p className="text-dark-300 text-sm flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                SSL Encrypted Payment
                            </p>
                        </div>

                        {paymentSuccess ? (
                            <div className="text-center py-8 animate-fade-in-up">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
                                <p className="text-dark-300 mt-2">Generating your invoice...</p>
                            </div>
                        ) : (
                            <form onSubmit={processPaymentSubmit} className="space-y-4">
                                <div className="p-4 bg-dark-800 rounded-xl border border-dark-700 mb-6 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-dark-400">Total Amount to Pay</p>
                                        <p className="text-xl font-bold text-white">${paymentModal.serviceId?.price}.00</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-5 bg-dark-600 rounded flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
                                        <div className="w-8 h-5 bg-dark-600 rounded flex items-center justify-center text-[8px] font-bold text-white">MC</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-dark-300 mb-1">Cardholder Name</label>
                                    <input type="text" required value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})}
                                        className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent-500 transition-colors"
                                        placeholder="John Doe" />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-dark-300 mb-1">Card Number</label>
                                    <input type="text" required maxLength="19" value={cardDetails.number} onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                            setCardDetails({...cardDetails, number: formatted});
                                        }}
                                        className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2.5 text-white tracking-widest focus:outline-none focus:border-accent-500 transition-colors"
                                        placeholder="0000 0000 0000 0000" />
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-dark-300 mb-1">Expiry Date</label>
                                        <input type="text" required maxLength="5" value={cardDetails.expiry} onChange={e => {
                                                let val = e.target.value.replace(/\D/g, '');
                                                if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                                                setCardDetails({...cardDetails, expiry: val});
                                            }}
                                            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent-500 transition-colors"
                                            placeholder="MM/YY" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-dark-300 mb-1">CVC</label>
                                        <input type="text" required maxLength="3" value={cardDetails.cvc} onChange={e => setCardDetails({...cardDetails, cvc: e.target.value.replace(/\D/g, '')})}
                                            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent-500 transition-colors"
                                            placeholder="123" />
                                    </div>
                                </div>

                                <button type="submit" disabled={isProcessingPayment}
                                    className={`w-full mt-6 py-3 rounded-lg font-bold text-dark-900 transition-all shadow-lg flex justify-center items-center gap-2
                                        ${isProcessingPayment ? 'bg-accent-600 cursor-not-allowed' : 'bg-accent-500 hover:bg-accent-400 shadow-accent-500/20'}`}>
                                    {isProcessingPayment ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Pay $${paymentModal.serviceId?.price}.00`
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-dark-400 mt-3">This is a simulated secure payment gateway for demonstration purposes. No real charges are made.</p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HireRequests;
