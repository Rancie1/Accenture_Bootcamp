import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import useSwipeGesture from '../hooks/useSwipeGesture';
import { X, Trash2, Receipt, Plus, Send } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * Saved Component
 * Displays saved shopping lists with swipe-to-delete functionality
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

// Helper function to render Lucide icon from string name
const renderIcon = (iconName, size = 24) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.ShoppingBag;
  return <IconComponent size={size} />;
};
const Saved = () => {
  const navigate = useNavigate();
  const { 
    savedLists, 
    setSavedLists,
    xp,
    setXp,
    savings,
    setSavings,
    streak,
    setStreak,
    streakSavers,
    setStreakSavers,
    history,
    setHistory,
    userPreferences
  } = useContext(AppContext);
  const { swipedItemId, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe } = useSwipeGesture();
  const [selectedList, setSelectedList] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [showStreakSaverModal, setShowStreakSaverModal] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [listToSubmit, setListToSubmit] = useState(null);

  // Prefill some example saved lists when none exist so the UI isn't empty
  useEffect(() => {
    if (savedLists.length === 0) {
      const now = Date.now();
      const sample = [
        {
          id: 'saved-1',
          timestamp: now - 1000 * 60 * 60 * 24, // 1 day ago
          items: [
            { id: 'i1', name: 'Bananas', icon: 'ShoppingCart', quantity: 2, price: 0.49 },
            { id: 'i2', name: 'Milk', icon: 'Coffee', quantity: 1, price: 2.99 },
            { id: 'i3', name: 'Bread', icon: 'Package', quantity: 1, price: 1.99 },
          ],
          results: {
            totalPrice: 5.96,
            savingsPercentage: 12.5,
            storeName: 'Coles',
            location: '123 Market St',
            label: 'Best Value',
            travelTime: 8,
            xpEarned: 15,
          },
        },
        {
          id: 'saved-2',
          timestamp: now - 1000 * 60 * 60 * 48, // 2 days ago
          items: [
            { id: 'i4', name: 'Eggs (Dozen)', icon: 'Zap', quantity: 1, price: 3.49 },
            { id: 'i5', name: 'Chicken Breast', icon: 'Feather', quantity: 1, price: 8.99 },
          ],
          results: {
            totalPrice: 12.48,
            savingsPercentage: 8.2,
            storeName: 'Coles',
            location: '456 Greenway Ave',
            label: 'Nearby',
            travelTime: 5,
            xpEarned: 10,
          },
        },
      ];

      setSavedLists(sample);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
   * Handle tap on saved list - show details modal
   */
  const handleListTap = (list) => {
    setSelectedList(list);
  };

  /**
   * Handle long press start
   */
  const handleLongPressStart = (listId) => {
    const timer = setTimeout(() => {
      setListToDelete(listId);
      setShowDeleteModal(true);
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  /**
   * Handle long press end
   */
  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  /**
   * Handle delete button click (from swipe)
   */
  const handleDeleteClick = (listId) => {
    setListToDelete(listId);
    setShowDeleteModal(true);
  };

  /**
   * Confirm delete
   */
  const confirmDelete = () => {
    if (listToDelete) {
      setSavedLists(savedLists.filter(list => list.id !== listToDelete));
      resetSwipe();
      setShowDeleteModal(false);
      setListToDelete(null);
      if (selectedList?.id === listToDelete) {
        setSelectedList(null);
      }
    }
  };

  /**
   * Cancel delete
   */
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setListToDelete(null);
    resetSwipe();
  };

  /**
   * Handle submit button click
   */
  const handleSubmitClick = (list) => {
    const budget = userPreferences.budget || 0;
    const finalCost = list.results.totalPrice;
    
    if (budget > 0 && finalCost > budget) {
      if (streakSavers > 0) {
        setListToSubmit(list);
        setShowStreakSaverModal(true);
      } else {
        setStreak(0);
        completeSubmission(list);
      }
    } else {
      completeSubmission(list);
    }
  };

  /**
   * Use streak saver and submit
   */
  const handleUseStreakSaver = () => {
    setStreakSavers(streakSavers - 1);
    setShowStreakSaverModal(false);
    if (listToSubmit) {
      completeSubmission(listToSubmit);
    }
  };

  /**
   * Break streak and submit
   */
  const handleBreakStreak = () => {
    setStreak(0);
    setShowStreakSaverModal(false);
    if (listToSubmit) {
      completeSubmission(listToSubmit);
    }
  };

  /**
   * Complete submission - add to history, update stats, remove from saved
   */
  const completeSubmission = (list) => {
    const xpEarned = list.results.xpEarned || 0;
    const budget = userPreferences.budget || 0;
    const budgetDiff = budget > 0 ? budget - list.results.totalPrice : 0;

    // Update XP and savings
    setXp(xp + xpEarned);
    setSavings(savings + Math.max(0, budgetDiff));
    setStreak(streak + 1);

    // Add to history
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    const historyEntry = {
      id: timestamp.toString(),
      items: list.items,
      results: {
        ...list.results,
        timestamp
      },
      xpEarned,
      totalSpent: list.results.totalPrice,
      timestamp
    };
    setHistory([...history, historyEntry]);

    // Remove from saved lists
    setSavedLists(savedLists.filter(l => l.id !== list.id));

    // Close detail modal if open
    if (selectedList?.id === list.id) {
      setSelectedList(null);
    }

    // Reset submit state
    setListToSubmit(null);

    // Show success modal
    setShowSubmittedModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-nav-safe">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Your Saved Lists</h1>
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
              onTouchStart={(e) => {
                handleTouchStart(e);
                handleLongPressStart(list.id);
              }}
              onTouchMove={(e) => {
                handleTouchMove(e);
                handleLongPressEnd();
              }}
              onTouchEnd={() => {
                handleTouchEnd(list.id);
                handleLongPressEnd();
              }}
              onMouseDown={() => handleLongPressStart(list.id)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
            >
              {/* Main Card */}
              <div
                onClick={() => handleListTap(list)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                      <Receipt size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {list.results?.storeName || 'Store'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(list.timestamp)}
                      </p>
                    </div>
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
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              {/* Delete Button (shown on swipe) */}
              {swipedItemId === list.id && (
                <button
                  onClick={() => handleDeleteClick(list.id)}
                  className="absolute right-0 top-0 bottom-0 bg-red-500 text-white px-6 rounded-r-xl font-medium flex items-center gap-2"
                >
                  <Trash2 size={20} />
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedList && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 pb-24 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping List</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(selectedList.timestamp)}</p>
              </div>
              <button
                onClick={() => setSelectedList(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Store Info */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 rounded-2xl p-5 mb-6 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedList.results.storeName || 'Store'}
                  </h4>
                  {selectedList.results.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedList.results.location}</p>
                  )}
                </div>
                {selectedList.results.label && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary text-white">
                    {selectedList.results.label}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${selectedList.results.totalPrice.toFixed(2)}
                  </p>
                </div>
                {selectedList.results.travelTime && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Travel Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedList.results.travelTime} min
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-primary/20">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Savings</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {selectedList.results.savingsPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    +{selectedList.results.xpEarned || 0} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Items ({selectedList.items.length})
              </h4>
              <div className="space-y-2">
                {selectedList.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-700 dark:text-gray-300">
                        {renderIcon(item.icon, 24)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                        )}
                      </div>
                    </div>
                    {item.price && (
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setListToDelete(selectedList.id);
                  setShowDeleteModal(true);
                }}
                className="py-3 px-4 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={() => handleSubmitClick(selectedList)}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl transform animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trash2 size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete List?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This action cannot be undone. Are you sure you want to delete this shopping list?
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Streak Saver Modal */}
      {showStreakSaverModal && listToSubmit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl transform animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Over Budget!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You spent ${listToSubmit.results.totalPrice.toFixed(2)}, which is over your budget of $
              {userPreferences.budget.toFixed(2)}. Use a Streak Saver to protect your {streak}{" "}
              saving streak?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleBreakStreak}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
              >
                Break Streak
              </button>
              <button
                onClick={handleUseStreakSaver}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Use Streak Saver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Confirmation Modal */}
      {showSubmittedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl transform animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Submitted!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Your shopping trip has been recorded successfully.
              </p>
              <button
                onClick={() => setShowSubmittedModal(false)}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all mt-4"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New List FAB */}
      <button
        onClick={() => navigate('/shop')}
        className="fixed bottom-30 right-6 bg-primary text-white rounded-full px-6 py-4 font-bold shadow-lg hover:shadow-xl active:scale-90 transition-all flex items-center gap-1 z-40"
      >
        <Plus size={20} />
        List
      </button>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Saved;
