function About() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-4 shadow-2xl mb-6">
                        <span className="text-6xl">📦</span>
                    </div>
                    <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        About Scanventory
                    </h1>
                    <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                        A modern, QR code-based inventory management system designed to streamline your stock tracking
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Purpose Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-slate-200/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3 shadow-lg">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Our Purpose
                            </h2>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-lg">
                            Scanventory was created to solve the common challenges of inventory management.
                            By leveraging QR code technology, we make it incredibly easy to track, update, and
                            manage your inventory in real-time. Whether you're managing a warehouse, retail store,
                            or personal collection, Scanventory provides a simple yet powerful solution.
                        </p>
                    </div>

                    {/* Features Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-slate-200/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3 shadow-lg">
                                <span className="text-3xl">✨</span>
                            </div>
                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Key Features
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📱</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">QR Code Generation</h3>
                                    <p className="text-sm text-slate-600">
                                        Automatically generate unique QR codes for every inventory item
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🔍</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Quick Scanning</h3>
                                    <p className="text-sm text-slate-600">
                                        Instantly access item details by scanning QR codes
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📊</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Real-Time Updates</h3>
                                    <p className="text-sm text-slate-600">
                                        Update stock quantities and track changes in real-time
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Low Stock Alerts</h3>
                                    <p className="text-sm text-slate-600">
                                        Get notified when items are running low on stock
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🔎</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Advanced Search</h3>
                                    <p className="text-sm text-slate-600">
                                        Filter by location, category, and stock levels
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📍</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Location Tracking</h3>
                                    <p className="text-sm text-slate-600">
                                        Organize items by location for easy retrieval
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technologies Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-slate-200/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-3 shadow-lg">
                                <span className="text-3xl">⚙️</span>
                            </div>
                            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Technologies Used
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                                <h3 className="font-bold text-blue-900 mb-3 text-lg">Frontend</h3>
                                <ul className="space-y-2 text-sm text-blue-800">
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">⚛️</span> React 19
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">🎨</span> Tailwind CSS
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">🚀</span> Vite
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">🔀</span> React Router
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                                <h3 className="font-bold text-green-900 mb-3 text-lg">Backend</h3>
                                <ul className="space-y-2 text-sm text-green-800">
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">🟢</span> Node.js
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">🚂</span> Express.js
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">🔐</span> Bcrypt
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">📦</span> QRCode Library
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
                                <h3 className="font-bold text-purple-900 mb-3 text-lg">Database</h3>
                                <ul className="space-y-2 text-sm text-purple-800">
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">🍃</span> MongoDB
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">📊</span> Mongoose ODM
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-lg">☁️</span> Cloud Ready
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl text-center">
                        <h2 className="text-3xl font-extrabold text-white mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-blue-100 mb-6 text-lg">
                            Create an account today and start managing your inventory efficiently
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <a
                                href="/signup"
                                className="inline-block rounded-xl bg-white px-8 py-4 text-sm font-bold text-indigo-600 shadow-xl hover:shadow-2xl hover:bg-slate-50 transition-all duration-300 transform hover:scale-105"
                            >
                                Sign Up Now
                            </a>
                            <a
                                href="/contact"
                                className="inline-block rounded-xl bg-transparent border-2 border-white px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;
