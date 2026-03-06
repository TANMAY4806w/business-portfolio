import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyHireRequests, updateHireStatus, createReview } from '../services/api';
import StarRating from '../components/StarRating';

const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    accepted: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    completed: 'bg-green-500/10 text-green-400 border-green-500/30',
};

const HireRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [reviewingId, setReviewingId] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });

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

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateHireStatus(id, { status });
            setMessage(`Request ${status}!`);
            fetchRequests();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error updating status');
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
                <div className="space-y-4">
                    {requests.map((req, i) => (
                        <div key={req._id} className="glass-card p-6 animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-dark-100 text-lg">
                                            {req.serviceId?.title || 'Service'}
                                        </h3>
                                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize border
                      ${statusColors[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-dark-400">
                                        {user?.role === 'client' ? (
                                            <span>Business: <Link to={`/business/${req.businessId?._id}`}
                                                className="text-accent-400 hover:text-accent-300">
                                                {req.businessId?.name}
                                            </Link></span>
                                        ) : (
                                            <span>Client: <span className="text-dark-200">{req.clientId?.name}</span></span>
                                        )}
                                        <span>${req.serviceId?.price}</span>
                                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {/* Business actions */}
                                    {user?.role === 'business' && req.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(req._id, 'accepted')}
                                                className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30
                                       rounded-lg text-sm font-medium hover:bg-green-500/20 transition-all">
                                                Accept
                                            </button>
                                            <button onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                                className="btn-danger text-sm">
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {user?.role === 'business' && req.status === 'accepted' && (
                                        <button onClick={() => handleStatusUpdate(req._id, 'completed')}
                                            className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30
                                     rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-all">
                                            Mark Completed
                                        </button>
                                    )}

                                    {/* Chat button – only if hire exists */}
                                    {['accepted', 'completed'].includes(req.status) && (
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HireRequests;
