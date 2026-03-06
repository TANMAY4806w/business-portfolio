import StarRating from './StarRating';

const ReviewCard = ({ review }) => {
    return (
        <div className="glass-card p-5 animate-fade-in-up">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {review.clientId?.name?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div>
                        <p className="font-semibold text-dark-100">
                            {review.clientId?.name || 'Client'}
                        </p>
                        <p className="text-xs text-dark-400">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
                <StarRating rating={review.rating} readOnly size="sm" />
            </div>
            <p className="text-dark-300 text-sm leading-relaxed">{review.reviewText}</p>
        </div>
    );
};

export default ReviewCard;
