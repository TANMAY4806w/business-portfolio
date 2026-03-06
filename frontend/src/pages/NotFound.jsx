import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
            <div className="text-center animate-fade-in-up">
                {/* Animated 404 */}
                <div className="relative mb-8">
                    <h1 className="text-[10rem] font-extrabold gradient-text leading-none opacity-20 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 gradient-bg rounded-3xl flex items-center justify-center
                          animate-pulse-glow">
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-dark-100 mb-3">Page Not Found</h2>
                <p className="text-dark-400 mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>

                <div className="flex justify-center gap-4">
                    <Link to="/" className="btn-primary">
                        Go to Marketplace
                    </Link>
                    <Link to="/login" className="btn-secondary">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
