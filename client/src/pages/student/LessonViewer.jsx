import React from 'react';
import Card from '../../components/ui/Card';

const LessonViewer = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Lesson View</h1>
            <Card className="!max-w-full">
                <p>Watch lessons, take quizzes, and view task status here.</p>
            </Card>
        </div>
    );
};
export default LessonViewer;
