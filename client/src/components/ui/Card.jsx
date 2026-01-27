import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 w-full max-w-md ${className}`}>
            {children}
        </div>
    );
};

export default Card;
