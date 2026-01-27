import React from 'react';
import Card from '../../components/ui/Card';

const CourseDetails = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Course Details</h1>
            <Card className="!max-w-full">
                <p>View course description, trainer info, and enroll options here.</p>
            </Card>
        </div>
    );
};
export default CourseDetails;
