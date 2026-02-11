import { useState, useRef } from 'react';

/**
 * Custom hook for detecting swipe gestures
 * Requirements: 2.3, 2.4
 * 
 * @returns {Object} Hook state and handlers
 */
const useSwipeGesture = () => {
  const [swipedItemId, setSwipedItemId] = useState(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const SWIPE_THRESHOLD = 100; // Minimum distance for swipe detection

  /**
   * Handle touch start event
   */
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  /**
   * Handle touch move event
   */
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  /**
   * Handle touch end event and detect left swipe
   */
  const handleTouchEnd = (itemId) => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    // Detect left swipe (swipe distance is positive and exceeds threshold)
    if (swipeDistance > SWIPE_THRESHOLD) {
      setSwipedItemId(itemId);
    } else if (swipeDistance < -SWIPE_THRESHOLD) {
      // Right swipe - close delete button
      setSwipedItemId(null);
    }
  };

  /**
   * Reset swipe state
   */
  const resetSwipe = () => {
    setSwipedItemId(null);
  };

  return {
    swipedItemId,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSwipe
  };
};

export default useSwipeGesture;
