import { Link } from 'react-router-dom';

const ServiceCard = ({ service, showHire = false, hasHired = false, onHire }) => {
    const businessName = service.businessId?.name || 'Business';

    return (
        <div className="glass-card p-6 flex flex-col justify-between animate-fade-in-up">
            {/* Header */}
            <div>
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-dark-100 line-clamp-2">{service.title}</h3>
                    <span className="ml-2 shrink-0 px-3 py-1 gradient-bg text-white text-sm font-bold rounded-full">
                        ${service.price}
                    </span>
                </div>
                <p className="text-dark-300 text-sm leading-relaxed line-clamp-3 mb-4">
                    {service.description}
                </p>
            </div>

            {/* Footer */}
            <div>
                <div className="flex items-center justify-between text-xs text-dark-400 mb-4">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {service.deliveryTime}
                    </div>
                    <Link to={`/business/${service.businessId?._id || service.businessId}`}
                        className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
                        {businessName}
                    </Link>
                </div>

                <div className="flex gap-2">
                    <Link to={`/business/${service.businessId?._id || service.businessId}`}
                        className="flex-1 btn-secondary !py-2 text-sm text-center">
                        View Profile
                    </Link>
                    {showHire && (
                        <button onClick={() => !hasHired && onHire?.(service._id)}
                            disabled={hasHired}
                            className={`flex-1 !py-2 text-sm ${hasHired ? 'bg-dark-600 text-dark-300 cursor-not-allowed rounded-xl font-medium border border-dark-500' : 'btn-primary'}`}>
                            {hasHired ? 'Requested ✓' : 'Hire Now'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
