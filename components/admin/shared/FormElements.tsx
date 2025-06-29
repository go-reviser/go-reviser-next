import React from 'react';

interface TextInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    type?: 'text' | 'email' | 'password';
    className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
    id,
    label,
    value,
    onChange,
    placeholder = '',
    required = false,
    type = 'text',
    className = ''
}) => {
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
        </div>
    );
};

interface TextAreaProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    className?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
    id,
    label,
    value,
    onChange,
    placeholder = '',
    required = false,
    rows = 4,
    className = ''
}) => {
    return (
        <div className={className}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <textarea
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={rows}
                className="p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
        </div>
    );
};

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    type = 'button',
    onClick,
    disabled = false,
    children,
    variant = 'primary',
    className = '',
    fullWidth = false
}) => {
    const baseClasses = 'px-6 py-2 rounded-md disabled:opacity-50';
    const widthClasses = fullWidth ? 'w-full' : 'w-auto';

    let variantClasses = '';
    switch (variant) {
        case 'primary':
            variantClasses = 'bg-indigo-600 text-white hover:bg-indigo-700';
            break;
        case 'secondary':
            variantClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300';
            break;
        case 'danger':
            variantClasses = 'bg-red-600 text-white hover:bg-red-700';
            break;
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${widthClasses} ${variantClasses} ${className}`}
        >
            {children}
        </button>
    );
};

interface CheckboxProps {
    id: string;
    label?: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    id,
    label,
    checked,
    onChange,
    className = ''
}) => {
    return (
        <div className={`flex items-center ${className}`}>
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            {label && (
                <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
                    {label}
                </label>
            )}
        </div>
    );
}; 