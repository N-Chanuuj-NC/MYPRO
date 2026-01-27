import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-primary-600 mb-4">403</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You do not have permission to view this page. Please log in with the appropriate account.
                </p>
                <div className="w-48 mx-auto">
                    <Button onClick={() => navigate('/login')}>
                        Back to Login
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
