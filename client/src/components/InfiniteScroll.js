import React, { useState, useEffect, useRef, useCallback } from 'react';

const InfiniteScroll = ({
  children,
  hasMore = false,
  loadMore,
  threshold = 100,
  loader = <div className="text-center py-4">Loading...</div>,
  endMessage = <div className="text-center py-4 text-gray-500">No more items</div>,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading && !error) {
        setIsLoading(true);
        setError(null);
        
        loadMore()
          .then(() => {
            setIsLoading(false);
          })
          .catch((err) => {
            setError(err);
            setIsLoading(false);
          });
      }
    },
    [hasMore, isLoading, error, loadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: `${threshold}px`
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleObserver, threshold]);

  const retry = () => {
    setError(null);
    setIsLoading(true);
    
    loadMore()
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  };

  return (
    <div className={className}>
      {children}
      
      <div ref={loadingRef}>
        {isLoading && loader}
        
        {error && (
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">Error loading more items</p>
            <button
              onClick={retry}
              className="btn btn-outline btn-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        {!hasMore && !isLoading && !error && endMessage}
      </div>
    </div>
  );
};

export default InfiniteScroll;
