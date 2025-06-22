import { FC } from 'react';

interface ProgressBarProps {
    completedPercentage: number;
    revisionPercentage?: number;
    height?: number;
    showLegend?: boolean;
    className?: string;
}

const ProgressBar: FC<ProgressBarProps> = ({
    completedPercentage,
    revisionPercentage = 0,
    height = 2.5,
    showLegend = false,
    className = '',
}) => {
    return (
        <div className={className}>
            <div className={`w-full bg-gray-200 rounded-full h-${height} overflow-hidden flex`}>
                {/* Completed and not needing revision (green) */}
                <div
                    className="bg-green-500 h-full transition-all duration-1000 ease-in-out"
                    style={{
                        width: `${completedPercentage}%`
                    }}
                ></div>
                {/* Completed but needs revision (yellow) */}
                <div
                    className="bg-yellow-500 h-full transition-all duration-1000 ease-in-out"
                    style={{
                        width: `${revisionPercentage}%`
                    }}
                ></div>
                {/* Remaining is automatically empty due to the container */}
            </div>

            {showLegend && (
                <div className="flex flex-wrap text-xs mt-1 text-gray-600">
                    <div className="flex items-center mr-4 mb-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span>Completed (Understood)</span>
                    </div>
                    <div className="flex items-center mr-4 mb-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                        <span>Completed (Needs Revision)</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-200 rounded-full mr-1"></div>
                        <span>Not Started</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressBar; 