import { Link } from 'react-router-dom';
import { Package, QrCode, TrendingUp, Download, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

function LandingPage() {
  const features = [
    {
      icon: <QrCode size={32} className="text-brand-500" />,
      title: 'Lightning Fast Scanning',
      desc: 'Instantly retrieve item details by scanning the generated QR code with your camera.'
    },
    {
      icon: <TrendingUp size={32} className="text-accent-500" />,
      title: 'Smart Stock Tracking',
      desc: 'Monitor your inventory levels, set low stock alerts, and never run out of supplies again.'
    },
    {
      icon: <Download size={32} className="text-blue-500" />,
      title: 'One-Click Export',
      desc: 'Easily export your entire inventory data to a CSV file for backups or reporting.'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-24 py-12">
      
      {/* Hero Section */}
      <section className="max-w-4xl space-y-8 animate-slide-up">
        <div className="flex justify-center mb-8">
          <div className="relative group cursor-default">
            <div className="absolute inset-0 bg-brand-500/20 dark:bg-brand-500/10 blur-xl rounded-full group-hover:bg-brand-500/30 transition-all duration-500" />
            <div className="relative glass-panel rounded-3xl p-6 shadow-xl transform group-hover:scale-110 transition-transform duration-500 border border-brand-200 dark:border-brand-800">
              <Package size={64} className="text-brand-600 dark:text-brand-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 font-medium text-sm mb-4">
            <Zap size={16} className="text-amber-500 fill-amber-500" />
            <span>Inventory management evolved</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Manage your inventory with <span className="text-gradient">absolute precision.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed pt-4">
            The simplest, most efficient way to track your items using QR codes. 
            Designed for speed, built for reliability.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          {localStorage.getItem('token') ? (
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="gradient" size="lg" fullWidth className="group px-12">
                Go to Dashboard
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="gradient" size="lg" fullWidth className="group">
                  Get Started for Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" fullWidth>
                  Sign In to Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>
      
      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {features.map((feature, i) => (
          <div 
            key={i} 
            className="animate-slide-up" 
            style={{ animationDelay: `${(i + 1) * 150}ms` }}
          >
            <Card className="h-full group hover:-translate-y-2 transition-transform duration-500">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </section>
      
    </div>
  );
}

export default LandingPage;