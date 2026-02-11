import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import useSwipeGesture from '../hooks/useSwipeGesture';

/**
 * Saved Component
 * Displays saved shopping lists with swipe-to-delete functionality
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */
const Saved = () => {
  const navigate = useNavigate();
  const { savedLists, setSavedLists } = useContext(AppContext);
  const { swipedItemId, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe } = useSwipeGesture();

  /**
   * Format timestamp to readable date
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  /**
   * Handle tap on saved list - navigate to results with saved data
   */
  const handleListTap = (list) => {
    // Navigate to results page with saved list data
    // In a real implementation, you would pass the list data via state or context
    navigate('/results', { state: { savedList: list } });
  };

  /**
   * Handle delete confirmation
   */
  const handleDelete = (listId) => {
    setSavedLists(savedLists.filter(list => list.id !== listId));
    resetSwipe();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Saved Lists</h1>
      </div>

      {/* Saved Lists */}
      <div className="p-4 space-y-3">
        {savedLists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No saved lists yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Save shopping lists from the Results page
            </p>
          </div>
        ) : (
          savedLists.map((list) => (
            <div
              key={list.id}
              className="relative overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(list.id)}
            >
              {/* Main Card */}
              <div
                onClick={() => handleListTap(list)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(list.timestamp)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${list.results.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      {list.results.savingsPercentage.toFixed(1)}% saved
                    </p>
                  </div>
                </div>
              </div>

              {/* Delete Button (shown on swipe) */}
              {swipedItemId === list.id && (
                <button
                  onClick={() => handleDelete(list.id)}
                  className="absolute right-0 top-0 bottom-0 bg-red-500 text-white px-6 rounded-r-xl font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Saved;
