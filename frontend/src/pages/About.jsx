import { Link } from 'react-router-dom';
import { Package, Target, Sparkles, QrCode, Search, RefreshCw, AlertTriangle, Filter, MapPin, Code2, Shield, Database, LayoutTemplate, Server } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';

function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center bg-gradient-to-br from-brand-600 to-accent-600 rounded-3xl p-5 shadow-2xl shadow-brand-500/20 mb-4 animate-slide-up">
          <Package size={48} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
          About <span className="text-gradient">Scanventory</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">
          A modern, QR code-based inventory management system designed to streamline your stock tracking
        </p>
      </div>

      <div className="space-y-8">
        {/* Purpose */}
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 p-3 rounded-2xl">
              <Target size={28} />
            </div>
            <CardHeader title="Our Purpose" className="mb-0" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg px-2">
            Scanventory was created to solve the common challenges of inventory management. By leveraging QR code technology, we make it incredibly easy to track, update, and manage your inventory in real-time. Whether you're managing a warehouse, retail store, or personal collection, Scanventory provides a simple yet powerful solution.
          </p>
        </Card>

        {/* Features */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl">
              <Sparkles size={28} />
            </div>
            <CardHeader title="Key Features" className="mb-0" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
            {[
              { icon: QrCode, title: 'QR Code Generation', desc: 'Automatically generate unique QR codes for every item' },
              { icon: Search, title: 'Quick Scanning', desc: 'Instantly access item details by scanning QR codes' },
              { icon: RefreshCw, title: 'Real-Time Updates', desc: 'Update stock quantities and track changes instantly' },
              { icon: AlertTriangle, title: 'Low Stock Alerts', desc: 'Get notified when items are running low on stock' },
              { icon: Filter, title: 'Advanced Search', desc: 'Filter by location, category, and stock levels' },
              { icon: MapPin, title: 'Location Tracking', desc: 'Organize items by location for easy retrieval' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="text-brand-500 mt-1"><Icon size={24} /></div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Tech Stack */}
        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-accent-50 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400 p-3 rounded-2xl">
              <Code2 size={28} />
            </div>
            <CardHeader title="Technologies Used" className="mb-0" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
            <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-4"><LayoutTemplate size={18}/> Frontend</h3>
              <ul className="space-y-3 text-sm text-indigo-800 dark:text-indigo-200">
                <li className="flex items-center gap-2">• React 19</li>
                <li className="flex items-center gap-2">• Tailwind CSS</li>
                <li className="flex items-center gap-2">• Vite</li>
                <li className="flex items-center gap-2">• Lucide Icons</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-4"><Server size={18}/> Backend</h3>
              <ul className="space-y-3 text-sm text-emerald-800 dark:text-emerald-200">
                <li className="flex items-center gap-2">• Node.js</li>
                <li className="flex items-center gap-2">• Express.js</li>
                <li className="flex items-center gap-2">• QRCode Library</li>
                <li className="flex items-center gap-2">• JWT Auth</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30">
              <h3 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2 mb-4"><Database size={18}/> Database</h3>
              <ul className="space-y-3 text-sm text-rose-800 dark:text-rose-200">
                <li className="flex items-center gap-2">• MongoDB</li>
                <li className="flex items-center gap-2">• Mongoose ODM</li>
                <li className="flex items-center gap-2">• Cloud Ready</li>
                <li className="flex items-center gap-2"><Shield size={14}/> Secure Bcrypt</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="bg-gradient-to-r from-brand-600 via-accent-600 to-brand-600 bg-[length:200%_auto] animate-gradient rounded-3xl p-10 shadow-2xl text-center">
          <h2 className="text-3xl font-extrabold font-display text-white mb-3">Ready to Get Started?</h2>
          <p className="text-brand-100 mb-8 text-lg">Create an account today and start managing your inventory efficiently</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup">
              <Button size="lg" className="bg-white !text-brand-600 hover:bg-slate-50 shadow-xl border-none font-bold">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="ghost" className="text-white border-2 border-white/30 hover:bg-white/10 hover:border-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
