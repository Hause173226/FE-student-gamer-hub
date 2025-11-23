import React, { useState, useEffect } from 'react';

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  isLoading: boolean;
  itemCount?: number; // Số lượng items để quyết định animation type
  staggerDelay?: number; // Delay giữa mỗi item (ms)
}

/**
 * ProgressiveLoader - Hiển thị content từng phần với animation mượt mà
 * - Nếu ít items (< 5): Fade in tuần tự
 * - Nếu nhiều items (>= 5): Staggered fade in với delay
 */
export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  isLoading,
  itemCount = 0,
  staggerDelay = 50,
}) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setVisibleItems([]);
      setIsInitialLoad(true);
      return;
    }

    // Khi loading xong, bắt đầu hiển thị từng phần
    if (isInitialLoad && itemCount > 0) {
      setIsInitialLoad(false);
      
      // Nếu ít items: hiển thị nhanh hơn
      const delay = itemCount < 5 ? 30 : staggerDelay;
      const maxItems = itemCount;
      
      // Hiển thị từng item với delay
      const timers: NodeJS.Timeout[] = [];
      for (let i = 0; i < maxItems; i++) {
        const timer = setTimeout(() => {
          setVisibleItems(prev => [...prev, i]);
        }, i * delay);
        timers.push(timer);
      }

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    } else if (!isInitialLoad && itemCount === 0) {
      // Nếu không có items, hiển thị ngay
      setVisibleItems([]);
    }
  }, [isLoading, itemCount, staggerDelay, isInitialLoad]);

  // Clone children và thêm animation class
  const renderWithAnimation = (child: React.ReactNode, index: number) => {
    if (React.isValidElement(child)) {
      const isVisible = visibleItems.includes(index) || isLoading;
      return React.cloneElement(child as React.ReactElement, {
        className: `${child.props.className || ''} ${isVisible ? 'progressive-item-visible' : 'progressive-item-hidden'}`,
        style: {
          ...child.props.style,
          animationDelay: `${index * (itemCount < 5 ? 30 : staggerDelay)}ms`,
        },
      });
    }
    return child;
  };

  if (isLoading) {
    return <>{children}</>;
  }

  // Nếu children là array, apply animation cho từng item
  if (Array.isArray(children)) {
    return (
      <>
        {children.map((child, index) => (
          <React.Fragment key={index}>
            {renderWithAnimation(child, index)}
          </React.Fragment>
        ))}
      </>
    );
  }

  // Nếu là single element, wrap và apply animation
  return (
    <div className="progressive-item-visible">
      {children}
    </div>
  );
};

