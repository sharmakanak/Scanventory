import { Component } from 'react';

/**
 * ErrorBoundary — catches any uncaught render errors in the component tree
 * and shows a friendly fallback instead of a blank white screen.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught an error:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/40 to-rose-50/30 flex items-center justify-center px-4">
                    <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-2 border-red-200/50 text-center">
                        <div className="bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl p-5 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-800 mb-3">
                            Something went wrong
                        </h1>
                        <p className="text-sm text-slate-500 mb-2">
                            An unexpected error occurred in the application.
                        </p>
                        {this.state.error && (
                            <p className="text-xs font-mono bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 mb-6 text-left overflow-auto max-h-24">
                                {this.state.error.message}
                            </p>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            🏠 Go back to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
