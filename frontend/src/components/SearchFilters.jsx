import { useState } from 'react';

const industries = [
    'All Industries',
    'Technology',
    'Design',
    'Marketing',
    'Finance',
    'Healthcare',
    'Education',
    'Construction',
    'Legal',
    'Consulting',
    'Other',
];

const SearchFilters = ({ onFilter }) => {
    const [keyword, setKeyword] = useState('');
    const [industry, setIndustry] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minRating, setMinRating] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter({
            keyword: keyword.trim(),
            industry: industry === 'All Industries' ? '' : industry,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            minRating: minRating || undefined,
        });
    };

    const handleReset = () => {
        setKeyword('');
        setIndustry('');
        setMinPrice('');
        setMaxPrice('');
        setMinRating('');
        onFilter({});
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Search */}
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Search</label>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Search services..."
                            className="input-dark !pl-10" />
                    </div>
                </div>

                {/* Industry */}
                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Industry</label>
                    <select value={industry} onChange={(e) => setIndustry(e.target.value)}
                        className="input-dark appearance-none cursor-pointer">
                        <option value="">All Industries</option>
                        {industries.slice(1).map((i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Price Range</label>
                    <div className="flex gap-2">
                        <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                            placeholder="Min" min="0" className="input-dark" />
                        <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                            placeholder="Max" min="0" className="input-dark" />
                    </div>
                </div>

                {/* Rating & Actions */}
                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Min Rating</label>
                    <select value={minRating} onChange={(e) => setMinRating(e.target.value)}
                        className="input-dark appearance-none cursor-pointer">
                        <option value="">Any</option>
                        <option value="1">1+ ★</option>
                        <option value="2">2+ ★</option>
                        <option value="3">3+ ★</option>
                        <option value="4">4+ ★</option>
                        <option value="5">5 ★</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button type="submit" className="btn-primary !py-2 text-sm">
                    Apply Filters
                </button>
                <button type="button" onClick={handleReset} className="btn-secondary !py-2 text-sm">
                    Reset
                </button>
            </div>
        </form>
    );
};

export default SearchFilters;
