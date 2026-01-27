import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const StudentHome = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-bold text-primary-600">LMS Student</h1>
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
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome to your Dashboard</h2>
                        <Button onClick={() => window.location.href = '/student/courses'} className="!w-auto">
                            Browse All Courses
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Button variant="secondary" onClick={() => window.location.href = '/student/course-details'}>Course Details</Button>
                        <Button variant="secondary" onClick={() => window.location.href = '/student/lessons'}>My Lessons</Button>
                        <Button variant="secondary" onClick={() => window.location.href = '/student/feedback'}>Give Feedback</Button>
                        <Button variant="secondary" onClick={() => window.location.href = '/student/profile'}>My Profile</Button>
                    </div>

                    <p className="text-gray-600">
                        This is the protected home page for students. Only users with the 'student' role can see this.
                    </p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 bg-primary-50 rounded-xl border border-primary-100 p-6 flex items-center justify-center">
                                <span className="text-primary-400 font-medium">Course Placeholder {i}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentHome;
