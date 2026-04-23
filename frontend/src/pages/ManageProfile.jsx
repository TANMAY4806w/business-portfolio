import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getMyProfile,
    createOrUpdateProfile,
    addPortfolioProject,
    deletePortfolioProject
} from '../services/api';

const industries = [
    'Technology', 'Design', 'Marketing', 'Finance', 'Healthcare',
    'Education', 'Construction', 'Legal', 'Consulting', 'Other',
];

const ManageProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [onboarding, setOnboarding] = useState(false);

    const [form, setForm] = useState({
        companyName: '',
        description: '',
        industry: 'Technology',
        logo: '',
    });

    const [projectForm, setProjectForm] = useState({ title: '', description: '', imageUrl: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await getMyProfile();
                setProfile(data);
                setForm({
                    companyName: data.companyName,
                    description: data.description,
                    industry: data.industry,
                    logo: data.logo || '',
                });
            } catch (err) {
                // No profile yet – that's OK
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await createOrUpdateProfile(form);
            setProfile(data);
            setMessage('Profile saved!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            const { data } = await addPortfolioProject(projectForm);
            setProfile(data);
            setProjectForm({ title: '', description: '', imageUrl: '' });
            setMessage('Project added!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error adding project');
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            const { data } = await deletePortfolioProject(projectId);
            setProfile(data);
        } catch (err) {
            setMessage('Error deleting project');
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
        <div className="max-w-3xl animate-fade-in-up">
            <h2 className="text-2xl font-bold text-dark-100 mb-6">Business Profile</h2>

            {message && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium
          ${message.includes('Error') || message.includes('Failed') ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'bg-green-500/10 border border-green-500/30 text-green-400'}`}>
                    {message}
                </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="glass-card p-6 space-y-4 mb-8">
                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Company Name</label>
                    <input type="text" required value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        className="input-dark" placeholder="Your Company Inc." />
                </div>

                <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
                    <textarea required rows={4} value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="input-dark resize-none" placeholder="Tell clients about your business..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Industry</label>
                        <select value={form.industry}
                            onChange={(e) => setForm({ ...form, industry: e.target.value })}
                            className="input-dark">
                            {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-300 mb-1.5">Logo URL</label>
                        <input type="text" value={form.logo}
                            onChange={(e) => setForm({ ...form, logo: e.target.value })}
                            className="input-dark" placeholder="https://..." />
                    </div>
                </div>

                <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                </button>
            </form>

            {/* Portfolio Projects */}
            {profile && (
                <>
                    <h3 className="text-xl font-bold text-dark-100 mb-4">Portfolio Projects</h3>

                    {/* Add Project */}
                    <form onSubmit={handleAddProject} className="glass-card p-6 space-y-4 mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" required value={projectForm.title}
                                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                                className="input-dark" placeholder="Project title" />
                            <input type="text" value={projectForm.imageUrl}
                                onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                                className="input-dark" placeholder="Image URL (optional)" />
                        </div>
                        <textarea required rows={2} value={projectForm.description}
                            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                            className="input-dark resize-none" placeholder="Brief project description" />
                        <button type="submit" className="btn-secondary text-sm">
                            + Add Project
                        </button>
                    </form>

                    {/* Project List */}
                    <div className="space-y-4">
                        {profile.portfolioProjects?.map((project) => (
                            <div key={project._id} className="glass-card p-5 flex items-start justify-between gap-4">
                                <div className="flex gap-4 flex-1">
                                    {project.imageUrl && (
                                        <img src={project.imageUrl} alt={project.title}
                                            className="w-16 h-16 rounded-lg object-cover shrink-0" />
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-dark-100">{project.title}</h4>
                                        <p className="text-sm text-dark-400 mt-1">{project.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteProject(project._id)} className="btn-danger text-xs">
                                    Delete
                                </button>
                            </div>
                        ))}
                        {profile.portfolioProjects?.length === 0 && (
                            <p className="text-dark-400 text-sm text-center py-4">No projects yet. Add your first one above.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageProfile;
