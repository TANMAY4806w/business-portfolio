import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, getMyServices, getMyHireRequests } from '../services/api';
import Sidebar from '../components/Sidebar';

const BusinessDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState({ services: 0, hires: 0, pending: 0, rating: 0, earnings: 0 });
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const isOverview = location.pathname === '/dashboard';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, servicesRes, hiresRes] = await Promise.allSettled([
                    getMyProfile(),
                    getMyServices(),
                    getMyHireRequests(),
                ]);

                if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);

                const services = servicesRes.status === 'fulfilled' ? servicesRes.value.data : [];
                const hires = hiresRes.status === 'fulfilled' ? hiresRes.value.data : [];

                setStats({
                    services: services.length,
                    hires: hires.length,
                    pending: hires.filter((h) => h.status === 'pending').length,
                    rating: profileRes.status === 'fulfilled' && profileRes.value.data.averageRating ? profileRes.value.data.averageRating : 0,
                    earnings: profileRes.status === 'fulfilled' && profileRes.value.data.totalEarnings ? profileRes.value.data.totalEarnings : 0,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location.pathname]);

    const statCards = [
        {
            label: 'Total Earnings', value: `$${stats.earnings.toFixed(2)}`, color: 'from-green-600 to-emerald-400',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        },
        {
            label: 'Services', value: stats.services, color: 'from-blue-500 to-cyan-500',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        },
        {
            label: 'Total Hires', value: stats.hires, color: 'from-indigo-500 to-purple-500',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        },
        {
            label: 'Pending', value: stats.pending, color: 'from-yellow-500 to-orange-500',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        },
        {
            label: 'Avg Rating', value: stats.rating ? stats.rating.toFixed(1) : '—', color: 'from-purple-500 to-pink-500',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        },
    ];

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                {isOverview ? (
                    <div className="animate-fade-in-up">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-dark-100 mb-2">
                                Welcome back, {user?.name} 👋
                            </h1>
                            <p className="text-dark-400">
                                {profile ? `${profile.companyName} • ${profile.industry}` : 'Set up your business profile to get started'}
                            </p>
                        </div>

                        {/* Stats */}
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                                {statCards.map((card, i) => (
                                    <div key={card.label} className="glass-card p-5"
                                        style={{ animationDelay: `${i * 0.1}s` }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color}
                                     flex items-center justify-center`}>
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    {card.icon}
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-dark-100">{card.value}</p>
                                        <p className="text-sm text-dark-400">{card.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!profile && (
                            <div className="glass-card p-8 text-center">
                                <svg className="w-12 h-12 text-accent-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <h3 className="text-lg font-semibold text-dark-100 mb-2">Set Up Your Profile</h3>
                                <p className="text-dark-400 mb-4">Create your business profile to start receiving hire requests.</p>
                                <a href="/dashboard/profile" className="btn-primary inline-block">Create Profile</a>
                            </div>
                        )}
                    </div>
                ) : (
                    <Outlet />
                )}
            </main>
        </div>
    );
};

export default BusinessDashboard;
