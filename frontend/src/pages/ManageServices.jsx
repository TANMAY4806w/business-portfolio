import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyServices, deleteService } from '../services/api';

const ManageServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const fetchServices = async () => {
        try {
            const { data } = await getMyServices();
            setServices(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await deleteService(id);
            setMessage('Service deleted');
            fetchServices();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error deleting service');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-dark-100">My Services</h2>
                <Link to="/dashboard/add-service" className="btn-primary text-sm">
                    + Add Service
                </Link>
            </div>

            {message && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                    {message}
                </div>
            )}

            {services.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-12 h-12 text-dark-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <h3 className="text-lg font-semibold text-dark-300 mb-2">No services yet</h3>
                    <p className="text-dark-400 mb-4">Create your first service to start getting hired.</p>
                    <Link to="/dashboard/add-service" className="btn-primary inline-block text-sm">
                        Create Service
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {services.map((service) => (
                        <div key={service._id} className="glass-card p-5 flex flex-col sm:flex-row
                                              items-start sm:items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-dark-100 text-lg">{service.title}</h3>
                                <p className="text-sm text-dark-400 line-clamp-2 mt-1">{service.description}</p>
                                <div className="flex gap-4 mt-2 text-xs text-dark-400">
                                    <span className="font-semibold text-accent-400">${service.price}</span>
                                    <span>Delivery: {service.deliveryTime}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => handleDelete(service._id)} className="btn-danger text-sm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageServices;
