import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, AlertTriangle, LogOut, CheckCircle2, UserCircle, Edit3, Save, X } from 'lucide-react';
import { API_BASE } from '../config';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader } from '../components/ui/Card';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetch(`${API_BASE}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
        return r.json();
      })
      .then((data) => {
        setUser(data);
        setForm({ name: data.name, email: data.email });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const result = await res.json();
      const updated = { ...user, name: result.name };
      setUser(updated);
      setForm({ name: updated.name, email: updated.email });
      localStorage.setItem('user', JSON.stringify(updated));
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user?.name ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-3">
          <UserCircle className="text-brand-500" size={32} />
          My Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account details and settings</p>
      </header>

      {/* Identity Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-accent-600 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/20">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl font-black shadow-lg">
              {initials}
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full border-4 border-brand-600 shadow-sm" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold font-display">{user?.name}</h2>
            <p className="text-brand-100 font-medium flex items-center gap-2 mt-1">
              <Mail size={16} /> {user?.email}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold border border-white/20">
              <Shield size={14} /> Active Member
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl flex items-center gap-3 animate-fade-in font-medium">
          <CheckCircle2 size={20} /> Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 p-4 rounded-2xl flex items-center gap-3 animate-fade-in font-medium">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {/* Account Info Card */}
      <Card noPadding>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <CardHeader title="Account Information" className="mb-0" />
          {!editMode && (
            <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
              <Edit3 size={16} /> Edit
            </Button>
          )}
        </div>

        {!editMode ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            <div className="p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="p-3 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl"><User size={24}/></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{user?.name}</p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="p-3 bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 rounded-xl"><Mail size={24}/></div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{user?.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5 bg-slate-50/50 dark:bg-slate-800/20">
            <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required icon={User} />
            <Input label="Email Address" value={form.email} disabled className="opacity-70 cursor-not-allowed" icon={Mail} />
            
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" fullWidth onClick={() => { setEditMode(false); setForm({ name: user.name, email: user.email }); setError(''); }}>
                <X size={18} /> Cancel
              </Button>
              <Button type="submit" variant="gradient" fullWidth isLoading={saving}>
                <Save size={18} /> Save Changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Danger Zone */}
      <Card noPadding className="border-t-4 border-t-rose-500 mt-8">
        <div className="p-6 border-b border-rose-100 dark:border-rose-900/30 flex items-center gap-3">
          <div className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl"><AlertTriangle size={20}/></div>
          <h2 className="text-xl font-bold font-display text-rose-600 dark:text-rose-400">Danger Zone</h2>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Signing out will end your current session. You'll need your credentials to sign back in.
          </p>
          <Button variant="danger" onClick={handleLogout} className="shrink-0 w-full sm:w-auto">
            <LogOut size={18} /> Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Profile;
