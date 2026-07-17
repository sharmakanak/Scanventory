import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import Analytics from './pages/Analytics';
import PrintLabels from './pages/PrintLabels';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen font-sans flex flex-col relative overflow-hidden">
          {/* Subtle background ambient gradients */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-500/20 dark:bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-500/20 dark:bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/print-labels" element={<PrintLabels />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
