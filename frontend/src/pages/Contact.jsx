import { useState } from 'react';
import { Mail, MessageSquare, Send, MapPin, Clock, Briefcase, HelpCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { API_BASE } from '../config';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader } from '../components/ui/Card';
import { Link } from 'react-router-dom';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send message');

      setSuccess(data.message);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 shadow-2xl shadow-emerald-500/20 animate-slide-up">
          <Mail size={48} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white animate-slide-up" style={{ animationDelay: '100ms' }}>
          Contact Us
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '200ms' }}>
          Have questions or feedback? We'd love to hear from you!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact Form */}
        <Card className="lg:col-span-3">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 p-3 rounded-2xl">
              <MessageSquare size={24} />
            </div>
            <CardHeader title="Send a Message" className="mb-0" />
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/40 p-4 text-sm font-medium text-rose-700 dark:text-rose-400 flex items-center gap-3 animate-fade-in">
              <AlertTriangle size={20} className="shrink-0" /> {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/40 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 size={20} className="shrink-0" /> {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input label="Your Name" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
            <Input label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            
            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 px-4 py-3 text-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white resize-none"
                placeholder="Tell us what's on your mind..."
                required
              />
            </div>

            <Button type="submit" variant="gradient" fullWidth size="lg" isLoading={loading} className="mt-2">
              <Send size={18} /> Send Message
            </Button>
          </form>
        </Card>

        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Get in Touch" subtitle="We're here to help" />
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl"><MapPin size={20}/></div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Location</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Remote-first team serving globally</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl"><Clock size={20}/></div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Response Time</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">We typically respond within 24-48 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl"><Briefcase size={20}/></div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Business Hours</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Monday - Friday, 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-gradient-to-br from-brand-50 to-accent-50 dark:from-brand-900/20 dark:to-accent-900/20 rounded-3xl p-8 border border-brand-100 dark:border-brand-800/30">
            <h3 className="text-xl font-bold text-brand-900 dark:text-brand-100 mb-3 flex items-center gap-2">
              <HelpCircle size={24} className="text-brand-500" /> Quick Questions?
            </h3>
            <p className="text-sm text-brand-800/80 dark:text-brand-200/80 mb-6 leading-relaxed">
              Before reaching out, you might find answers in our about section which details our features and technology stack.
            </p>
            <Link to="/about">
              <Button variant="primary" fullWidth className="bg-brand-600 hover:bg-brand-700 text-white">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
