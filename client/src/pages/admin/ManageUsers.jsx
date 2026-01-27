import React from 'react';
import Card from '../../components/ui/Card';

const ManageUsers = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
            <Card className="!max-w-full">
                <p>Admin can view students/trainers and activate/deactivate users here.</p>
            </Card>
        </div>
    );
};
export default ManageUsers;
