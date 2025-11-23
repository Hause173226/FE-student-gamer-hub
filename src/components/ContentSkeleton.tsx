import React from 'react';

interface SkeletonProps {
  type?: 'card' | 'list' | 'grid' | 'stats';
  count?: number;
}

/**
 * ContentSkeleton - Skeleton loader với animation mượt mà
 */
export const ContentSkeleton: React.FC<SkeletonProps> = ({ 
  type = 'card', 
  count = 1 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(count || 5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-xl p-6 skeleton-item"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        );

      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count || 6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg p-6 skeleton-item"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse"></div>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            {[...Array(count || 5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 rounded-lg p-4 skeleton-item"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="h-5 bg-gray-700 rounded w-2/3 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        );

      case 'card':
      default:
        return (
          <div className="bg-gray-800 rounded-xl p-6 skeleton-item">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse"></div>
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

