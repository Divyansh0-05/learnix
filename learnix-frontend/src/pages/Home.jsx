import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Welcome to <span className="text-primary-600">Learnix</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Exchange skills with others. Teach what you know, learn what you don't.
                        No money involved, just knowledge sharing.
                    </p>

                    {!isAuthenticated ? (
                        <div className="space-x-4">
                            <Link to="/register" className="btn-primary inline-block">
                                Get Started
                            </Link>
                            <Link to="/login" className="btn-secondary inline-block">
                                Sign In
                            </Link>
                        </div>
                    ) : (
                        <Link to="/dashboard" className="btn-primary inline-block">
                            Go to Dashboard
                        </Link>
                    )}
                </div>

                {/* Features Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-primary-600 text-4xl mb-4">🔄</div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">Skill Exchange</h3>
                        <p className="text-gray-600">
                            Trade skills directly with others. Teach guitar, learn Spanish - no money needed.
                        </p>
                    </div>

                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-primary-600 text-4xl mb-4">🤝</div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">Smart Matching</h3>
                        <p className="text-gray-600">
                            Our algorithm finds the perfect learning partners based on your skills.
                        </p>
                    </div>

                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-primary-600 text-4xl mb-4">⭐</div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">Trusted Community</h3>
                        <p className="text-gray-600">
                            Build your reputation with reviews and trust scores from real interactions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
