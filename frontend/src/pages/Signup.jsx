import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            setSuccess(data.message);
            setForm({ name: '', email: '', password: '' });

            // Store JWT token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to home page after 1.5 seconds
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-slate-200/50">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-3 shadow-lg">
                            <span className="text-3xl">👤</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Create Account
                            </h1>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                                Join Scanventory today
                            </p>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 rounded-xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3 text-sm text-red-800 shadow-lg flex items-center gap-3">
                            <span className="text-xl">❌</span>
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    {/* Success Alert */}
                    {success && (
                        <div className="mb-6 rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 text-sm text-green-800 shadow-lg flex items-center gap-3">
                            <span className="text-xl">✅</span>
                            <span className="font-semibold">{success}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400"
                                placeholder="Create a strong password"
                                required
                                minLength={6}
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Must be at least 6 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-sm font-bold text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '⏳ Creating Account...' : '✨ Sign Up'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
