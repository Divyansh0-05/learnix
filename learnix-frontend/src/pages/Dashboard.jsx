import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loading from '../components/common/Loading';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const response = await api.get(`/users/${user.id}/stats`);
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600 mt-1">Here is what's happening with your skill exchanges.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Skills Offered</div>
                    <div className="text-3xl font-bold text-primary-600">
                        {stats?.totalOffered || 0}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Skills Wanted</div>
                    <div className="text-3xl font-bold text-primary-600">
                        {stats?.totalWanted || 0}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Active Matches</div>
                    <div className="text-3xl font-bold text-primary-600">
                        {stats?.totalMatches || 0}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-gray-500 text-sm font-medium mb-1">Trust Score</div>
                    <div className="text-3xl font-bold text-green-600">
                        {user?.trustScore || 0}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-left border border-gray-100 group">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-100 transition">
                        <span className="text-primary-600 text-xl">➕</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-primary-600 transition">Add Skills</h3>
                    <p className="text-gray-600 text-sm">
                        List what you can teach and what you want to learn
                    </p>
                </button>

                <button className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-left border border-gray-100 group">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 transition">
                        <span className="text-green-600 text-xl">🔍</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-green-600 transition">Find Matches</h3>
                    <p className="text-gray-600 text-sm">
                        Discover people with complementary skills
                    </p>
                </button>

                <button className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-left border border-gray-100 group">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition">
                        <span className="text-purple-600 text-xl">💬</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-purple-600 transition">View Messages</h3>
                    <p className="text-gray-600 text-sm">
                        Check your conversations and connection requests
                    </p>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
