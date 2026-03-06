import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createService } from '../services/api';

const AddService = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        deliveryTime: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await createService({
                ...form,
                price: Number(form.price),
            });
            navigate('/dashboard/services');
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl animate-fade-in-up">
            <h2 className="text-2xl font-bold text-dark-100 mb-6">Add New Service</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Service Title</label>
                    <input type="text" name="title" value={form.title} onChange={handleChange}
                        required className="input-dark" placeholder="e.g. Full Website Design" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange}
                        required rows={4} className="input-dark resize-none"
                        placeholder="Describe what you offer..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Price ($)</label>
                        <input type="number" name="price" value={form.price} onChange={handleChange}
                            required min="0" className="input-dark" placeholder="99" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Delivery Time</label>
                        <input type="text" name="deliveryTime" value={form.deliveryTime} onChange={handleChange}
                            required className="input-dark" placeholder="e.g. 3-5 days" />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creating...' : 'Create Service'}
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard/services')}
                        className="btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddService;
