import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

function Navigation() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/about', label: 'About', icon: 'ℹ️' },
        { path: '/contact', label: 'Contact', icon: '📧' },
        { path: '/login', label: 'Login', icon: '🔐' },
        { path: '/signup', label: 'Sign Up', icon: '👤' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white/90 backdrop-blur-md shadow-xl border-b-2 border-slate-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <span className="text-2xl">📦</span>
                        </div>
                        <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                            Scanventory
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(link.path)
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                                    }`}
                            >
                                <span>{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive(link.path)
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                                        }`}
                                >
                                    <span className="text-xl">{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navigation;
