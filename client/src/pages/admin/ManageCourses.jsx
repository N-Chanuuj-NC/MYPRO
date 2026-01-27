import React from 'react';
import Card from '../../components/ui/Card';

const ManageCourses = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Manage Courses</h1>
            <Card className="!max-w-full">
                <p>Admin can view all courses, approve trainer courses, and delete courses here.</p>
            </Card>
        </div>
    );
};
export default ManageCourses;
