import React from 'react';
import Card from '../../components/ui/Card';

const StudentFeedback = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Give Feedback</h1>
            <Card className="!max-w-full">
                <p>Provide feedback to the trainer or about the website here.</p>
            </Card>
        </div>
    );
};
export default StudentFeedback;
