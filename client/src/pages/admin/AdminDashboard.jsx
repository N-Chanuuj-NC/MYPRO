import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const AdminDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold text-primary-600">LMS Admin</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">Logged in as {user?.role}</span>
                            <Button
                                variant="secondary"
                                onClick={logout}
                                className="!w-auto !py-2 !px-4"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Button onClick={() => window.location.href = '/admin/users'}>Manage Users</Button>
                        <Button onClick={() => window.location.href = '/admin/courses'}>Manage Courses</Button>
                        <Button onClick={() => window.location.href = '/admin/reports'}>View Reports</Button>
                        <Button onClick={() => window.location.href = '/admin/settings'}>Settings</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {['Total Users', 'Active Courses', 'Total Revenue', 'System Status'].map((stat) => (
                            <div key={stat} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <p className="text-sm text-gray-500 font-medium">{stat}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">--</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">User registration #{1000 + i}</span>
                                    <span className="text-primary-600 text-sm">Just now</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
