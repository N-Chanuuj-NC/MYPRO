import React from 'react';
import Card from '../../components/ui/Card';

const ProfileSettings = () => {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">User Customization</h1>
            <Card className="!max-w-full">
                <p>Edit profile, change password, upload photo, and language settings.</p>
            </Card>
        </div>
    );
};
export default ProfileSettings;
