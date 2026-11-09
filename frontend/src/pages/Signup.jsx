import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { API_BASE } from '../config';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader } from '../components/ui/Card';

function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-md animate-scale-in">
        <div className="flex justify-center mb-8">
          <div className="bg-accent-500/10 dark:bg-accent-500/20 p-4 rounded-2xl border border-accent-500/20">
            <UserPlus size={40} className="text-accent-600 dark:text-accent-400" />
          </div>
        </div>

        <Card>
          <CardHeader 
            title="Create an account" 
            subtitle="Start managing your inventory in seconds"
            className="text-center"
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm rounded-xl border border-rose-200 dark:border-rose-500/20 animate-fade-in text-center font-medium">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              variant="gradient" 
              fullWidth 
              size="lg" 
              isLoading={isLoading}
              className="mt-6"
            >
              Sign Up <ArrowRight size={18} />
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-600 dark:text-accent-400 font-bold hover:underline">
              Sign in instead
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default Signup;
