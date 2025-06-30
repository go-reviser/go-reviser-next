import React, { ReactNode } from 'react';

interface CardProps {
    title?: string;
    children: ReactNode;
    className?: string;
    actions?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
    title,
    children,
    className = '',
    actions
}) => {
    return (
        <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
            {(title || actions) && (
                <div className="flex justify-between items-center mb-4">
                    {title && <h2 className="text-xl font-semibold">{title}</h2>}
                    {actions && <div>{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
}; 