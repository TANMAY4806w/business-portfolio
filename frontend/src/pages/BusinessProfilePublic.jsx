import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    getProfileByUserId,
    getServicesByBusiness,
    getBusinessReviews,
} from '../services/api';
import ServiceCard from '../components/ServiceCard';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { createHireRequest, getMyHireRequests } from '../services/api';

const BusinessProfilePublic = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [services, setServices] = useState([]);
    const [hiredIds, setHiredIds] = useState(new Set());
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('services');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [profileRes, servicesRes, reviewsRes, hireRes] = await Promise.all([
                    getProfileByUserId(userId),
                    getServicesByBusiness(userId),
                    getBusinessReviews(userId),
                    user?.role === 'client' ? getMyHireRequests() : Promise.resolve({ data: [] }),
                ]);
                setProfile(profileRes.data);
                setServices(servicesRes.data);
                setReviews(reviewsRes.data);
                if (user?.role === 'client') {
                    const activeRequests = hireRes.data.filter(r => r.status === 'pending' || r.status === 'accepted');
                    setHiredIds(new Set(activeRequests.map(r => r.serviceId._id || r.serviceId)));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [userId]);

    const handleHire = async (serviceId) => {
        if (!user) { setMessage('Please login to hire'); return; }
        if (user.role !== 'client') { setMessage('Only clients can hire'); return; }
        try {
            await createHireRequest({ serviceId });
            setMessage('Hire request sent!');
            setHiredIds(prev => new Set([...prev, serviceId]));
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed');
            if (err.response?.status === 400 && err.response?.data?.message?.includes('already have an active hire request')) {
                setHiredIds(prev => new Set([...prev, serviceId]));
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-dark-300">Profile not found</h2>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
            {message && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium text-center
          ${message.includes('sent') ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                    {message}
                </div>
            )}

            {/* Profile Header */}
            <div className="glass-card p-8 mb-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Logo */}
                    <div className="w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center text-white
                        text-3xl font-bold shrink-0 overflow-hidden">
                        {profile.logo ? (
                            <img src={profile.logo} alt={profile.companyName} className="w-full h-full object-cover" />
                        ) : (
                            profile.companyName?.charAt(0)
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-dark-100 mb-1">{profile.companyName}</h1>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-accent-500/10 text-accent-400 text-sm font-medium rounded-full">
                                {profile.industry}
                            </span>
                            <StarRating rating={profile.averageRating} readOnly size="md" />
                            <span className="text-sm text-dark-400">({profile.totalReviews} reviews)</span>
                        </div>
                        <p className="text-dark-300 leading-relaxed">{profile.description}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-dark-800 p-1 rounded-xl w-fit">
                {['services', 'portfolio', 'reviews'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize transition-all
                    ${activeTab === tab
                                ? 'gradient-bg text-white shadow-lg'
                                : 'text-dark-400 hover:text-dark-200'}`}>
                        {tab}
                        {tab === 'services' && ` (${services.length})`}
                        {tab === 'reviews' && ` (${reviews.length})`}
                        {tab === 'portfolio' && ` (${profile.portfolioProjects?.length || 0})`}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'services' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {services.length === 0 ? (
                        <p className="text-dark-400 col-span-2 text-center py-10">No services listed yet.</p>
                    ) : (
                        services.map((s) => (
                            <ServiceCard key={s._id} service={s} showHire={user?.role === 'client'} hasHired={hiredIds.has(s._id)} onHire={handleHire} />
                        ))
                    )}
                </div>
            )}

            {activeTab === 'portfolio' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {profile.portfolioProjects?.length === 0 ? (
                        <p className="text-dark-400 col-span-2 text-center py-10">No portfolio projects yet.</p>
                    ) : (
                        profile.portfolioProjects.map((p) => (
                            <div key={p._id} className="glass-card overflow-hidden">
                                {p.imageUrl && (
                                    <img src={p.imageUrl} alt={p.title}
                                        className="w-full h-48 object-cover" />
                                )}
                                <div className="p-5">
                                    <h3 className="font-bold text-dark-100 mb-2">{p.title}</h3>
                                    <p className="text-sm text-dark-400">{p.description}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <p className="text-dark-400 text-center py-10">No reviews yet.</p>
                    ) : (
                        reviews.map((r) => <ReviewCard key={r._id} review={r} />)
                    )}
                </div>
            )}
        </div>
    );
};

export default BusinessProfilePublic;
