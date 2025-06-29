import React from 'react';

interface AlertMessageProps {
    type: 'success' | 'error';
    message: string | null;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message }) => {
    if (!message) return null;

    const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
    const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
    const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';

    return (
        <div className={`${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded mb-4`}>
            {message}
        </div>
    );
};

export default AlertMessage; 