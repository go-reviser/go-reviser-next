import React, { ReactNode } from 'react';

interface Column<T> {
    header: ReactNode;
    accessor: keyof T | ((item: T) => ReactNode);
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    className?: string;
}

export function Table<T>({
    columns,
    data,
    keyExtractor,
    emptyMessage = 'No data available',
    className = ''
}: TableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-4">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                scope="col"
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map(item => (
                        <tr key={keyExtractor(item)} className="hover:bg-gray-50">
                            {columns.map((column, index) => (
                                <td key={index} className="px-6 py-4 whitespace-nowrap">
                                    {typeof column.accessor === 'function'
                                        ? column.accessor(item)
                                        : item[column.accessor] as ReactNode}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 