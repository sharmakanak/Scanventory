import { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

function Contact() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: '',
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
            const res = await fetch(`${API_BASE}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to send message');
            }

            setSuccess(data.message);
            setForm({ name: '', email: '', message: '' });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-3xl p-4 shadow-2xl mb-6">
                        <span className="text-6xl">📧</span>
                    </div>
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                        Contact Us
                    </h1>
                    <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                        Have questions or feedback? We'd love to hear from you!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-slate-200/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3 shadow-lg">
                                <span className="text-2xl">💬</span>
                            </div>
                            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Send a Message
                            </h2>
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

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400"
                                    placeholder="Enter your name"
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
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-slate-400 resize-none"
                                    placeholder="Tell us what's on your mind..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-4 text-sm font-bold text-white shadow-xl hover:shadow-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? '⏳ Sending...' : '📤 Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        {/* Info Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-slate-200/50">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 shadow-lg">
                                    <span className="text-2xl">ℹ️</span>
                                </div>
                                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Get in Touch
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">📍</span>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Location</h3>
                                        <p className="text-sm text-slate-600">
                                            Remote-first team serving globally
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">⏰</span>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Response Time</h3>
                                        <p className="text-sm text-slate-600">
                                            We typically respond within 24-48 hours
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">💼</span>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-1">Business Hours</h3>
                                        <p className="text-sm text-slate-600">
                                            Monday - Friday, 9:00 AM - 6:00 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200">
                            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <span className="text-2xl">❓</span>
                                Quick Questions?
                            </h3>
                            <p className="text-sm text-blue-800 mb-4">
                                Before reaching out, you might find answers in our documentation or FAQ section.
                            </p>
                            <a
                                href="/about"
                                className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                            >
                                Learn More About Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
