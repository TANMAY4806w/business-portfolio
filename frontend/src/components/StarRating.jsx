import { useState } from 'react';

const StarRating = ({ rating = 0, onRate, readOnly = false, size = 'md' }) => {
    const [hover, setHover] = useState(0);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && onRate?.(star)}
                    onMouseEnter={() => !readOnly && setHover(star)}
                    onMouseLeave={() => !readOnly && setHover(0)}
                    className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                     transition-transform duration-150`}
                >
                    <svg
                        className={`${sizeClasses[size]} ${star <= (hover || rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-dark-500 fill-dark-500'
                            } transition-colors`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
            {readOnly && rating > 0 && (
                <span className="ml-1 text-sm text-dark-400 font-medium">
                    {typeof rating === 'number' ? rating.toFixed(1) : rating}
                </span>
            )}
        </div>
    );
};

export default StarRating;
