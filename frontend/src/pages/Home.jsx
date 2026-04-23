import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getServices, createHireRequest, getMyHireRequests } from '../services/api';
import ServiceCard from '../components/ServiceCard';
import SearchFilters from '../components/SearchFilters';
import { useToast } from '../components/Toast';

const Home = () => {
    const { user } = useAuth();
    const toast = useToast();
    const [services, setServices] = useState([]);
    const [hiredIds, setHiredIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const fetchServices = async (filters = {}) => {
        setLoading(true);
        try {
            const { data } = await getServices(filters);
            setServices(data);
        } catch (err) {
            console.error('Failed to fetch services', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
        
        if (user?.role === 'client') {
            getMyHireRequests()
                .then(({ data }) => {
                    const activeRequests = data.filter(r => r.status === 'pending' || r.status === 'accepted');
                    setHiredIds(new Set(activeRequests.map(r => r.serviceId._id || r.serviceId)));
                })
                .catch(err => console.error("Failed to fetch hire requests", err));
        }
    }, [user]);

    const handleHire = async (serviceId) => {
        if (!user) {
            toast.warning('Please login to hire a service');
            return;
        }
        if (user.role !== 'client') {
            toast.warning('Only clients can hire services');
            return;
        }
        try {
            await createHireRequest({ serviceId });
            toast.success('Hire request sent successfully!');
            setHiredIds(prev => new Set([...prev, serviceId]));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send hire request');
            // If the backend says already hired, just update the UI
            if (err.response?.status === 400 && err.response?.data?.message?.includes('already have an active hire request')) {
                setHiredIds(prev => new Set([...prev, serviceId]));
            }
        }
    };

    return (
        <div>
            {/* ─── Hero Section ─────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden border-b border-dark-700/30">
                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-accent-500/5 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]
                        bg-accent-500/5 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left – Copy */}
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-500/10 border border-accent-500/20
                            rounded-full mb-6">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs font-semibold text-accent-300 uppercase tracking-wider">
                                    Open for business
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                                <span className="text-dark-100">Find & Hire</span>
                                <br />
                                <span className="gradient-text">Top Businesses</span>
                                <br />
                                <span className="text-dark-100">Instantly</span>
                            </h1>

                            <p className="text-lg text-dark-400 max-w-lg mb-8 leading-relaxed">
                                Browse verified business portfolios, compare services, and connect with professionals.
                                From design to development — get work done right.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {!user ? (
                                    <>
                                        <Link to="/register" className="btn-primary !py-3.5 !px-8 text-base">
                                            Get Started Free →
                                        </Link>
                                        <Link to="/login" className="btn-secondary !py-3.5 !px-8 text-base">
                                            Sign In
                                        </Link>
                                    </>
                                ) : (
                                    <a href="#services" className="btn-primary !py-3.5 !px-8 text-base">
                                        Browse Services ↓
                                    </a>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-8 mt-10 pt-8 border-t border-dark-700/50">
                                <div>
                                    <p className="text-2xl font-bold text-dark-100">100+</p>
                                    <p className="text-sm text-dark-400">Businesses</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-dark-100">500+</p>
                                    <p className="text-sm text-dark-400">Services</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-dark-100">4.9★</p>
                                    <p className="text-sm text-dark-400">Avg Rating</p>
                                </div>
                            </div>
                        </div>

                        {/* Right – Feature Cards */}
                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            {[
                                { icon: '🔍', title: 'Smart Search', desc: 'Filter by industry, price, and ratings' },
                                { icon: '💬', title: 'Real-Time Chat', desc: 'Communicate directly with businesses' },
                                { icon: '⭐', title: 'Verified Reviews', desc: 'Read honest client feedback' },
                                { icon: '🚀', title: 'Quick Hire', desc: 'Send hire requests in one click' },
                            ].map((feat, i) => (
                                <div key={feat.title}
                                    className="glass-card p-5 animate-fade-in-up"
                                    style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                                    <span className="text-2xl mb-3 block">{feat.icon}</span>
                                    <h3 className="font-semibold text-dark-100 mb-1">{feat.title}</h3>
                                    <p className="text-xs text-dark-400">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Marketplace ──────────────────────────────────────────────────── */}
            <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold gradient-text mb-2">Service Marketplace</h2>
                    <p className="text-dark-400">Browse top business services and get work done.</p>
                </div>

                {/* Filters */}
                <SearchFilters onFilter={fetchServices} />

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in-up">
                        <svg className="w-16 h-16 text-dark-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-dark-300 mb-2">No services found</h3>
                        <p className="text-dark-400">Try adjusting your search filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, i) => (
                            <div key={service._id} style={{ animationDelay: `${i * 0.05}s` }}>
                                <ServiceCard
                                    service={service}
                                    showHire={user?.role === 'client'}
                                    hasHired={hiredIds.has(service._id)}
                                    onHire={handleHire}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
