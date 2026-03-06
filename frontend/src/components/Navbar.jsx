import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass sticky top-0 z-50 border-b border-dark-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 gradient-bg rounded-lg flex items-center justify-center
                          group-hover:animate-pulse-glow transition-all">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold gradient-text hidden sm:block">Business Portfolio</span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to="/" className="px-3 py-2 text-sm font-medium text-dark-200 hover:text-white
                                   rounded-lg hover:bg-dark-700/50 transition-all">
                            Marketplace
                        </Link>

                        {user ? (
                            <>
                                {user.role === 'business' && (
                                    <Link to="/dashboard" className="px-3 py-2 text-sm font-medium text-dark-200
                                                   hover:text-white rounded-lg hover:bg-dark-700/50 transition-all">
                                        Dashboard
                                    </Link>
                                )}
                                <Link to="/hire-requests" className="px-3 py-2 text-sm font-medium text-dark-200
                                                     hover:text-white rounded-lg hover:bg-dark-700/50 transition-all">
                                    Requests
                                </Link>

                                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-dark-600">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-sm font-medium text-dark-100">{user.name}</span>
                                        <span className="text-xs text-accent-400 capitalize">{user.role}</span>
                                    </div>
                                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <button onClick={handleLogout}
                                        className="p-2 text-dark-300 hover:text-red-400 rounded-lg
                                   hover:bg-dark-700/50 transition-all"
                                        title="Logout">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="btn-secondary !py-2 !px-4 text-sm">Login</Link>
                                <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
