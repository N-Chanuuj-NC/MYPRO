import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student', // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <Card>
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-600 mt-2">Join us today</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">I am a...</label>
                        <div className="flex gap-4">
                            <label className={`
                flex-1 flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all
                ${formData.role === 'student'
                                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                                    : 'border-gray-200 hover:bg-gray-50'}
              `}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={formData.role === 'student'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="sr-only"
                                />
                                <span className="font-medium">Student</span>
                            </label>
                            <label className={`
                flex-1 flex items-center justify-center px-4 py-3 border rounded-lg cursor-pointer transition-all
                ${formData.role === 'trainer'
                                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                                    : 'border-gray-200 hover:bg-gray-50'}
              `}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="trainer"
                                    checked={formData.role === 'trainer'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="sr-only"
                                />
                                <span className="font-medium">Trainer</span>
                            </label>
                        </div>
                    </div>

                    <Input
                        id="name"
                        type="text"
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        id="email"
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};

export default Register;
