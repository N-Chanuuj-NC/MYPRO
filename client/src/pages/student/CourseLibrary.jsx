import React from 'react';
import Card from '../../components/ui/Card';

const CourseLibrary = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-primary-900 mb-8">Course Library</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Example Course Cards */}
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <Card key={item} className="!max-w-full hover:shadow-2xl transition-shadow cursor-pointer">
                            <div className="h-40 bg-primary-100 rounded-lg mb-4 flex items-center justify-center">
                                <span className="text-primary-500 font-medium">Course Thumbnail</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Introduction to React</h3>
                            <p className="text-gray-600 mt-2 text-sm">Learn the basics of React development...</p>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-1 rounded-full">Beginner</span>
                                <button className="text-primary-600 font-medium text-sm hover:underline">View Details →</button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseLibrary;
