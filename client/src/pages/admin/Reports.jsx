import React from 'react';
import Card from '../../components/ui/Card';

const Reports = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">System Reports</h1>
            <Card className="!max-w-full">
                <p>View student performance and course popularity reports here.</p>
            </Card>
        </div>
    );
};
export default Reports;
