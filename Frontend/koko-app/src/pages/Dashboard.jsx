import { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import MascotPreview from '../components/MascotPreview';
import { Settings, Flame, Share2, Trash2, ShoppingCart, X, Receipt } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * Dashboard Component
 * Displays user profile, mascot, stats, streak, and shopping history
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 14.1, 14.2
 */

// Helper function to render Lucide icon from string name
const renderIcon = (iconName, size = 24) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.ShoppingBag;
  return <IconComponent size={size} />;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    xp,
    savings,
    streak,
    level,
    progress,
    weeklyXp,
    history,
    setHistory,
    mascotItems,
    equippedItems,
    userPreferences
  } = useContext(AppContext);

  // State for swipe-to-delete functionality
  const [swipedItemId, setSwipedItemId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // State for Easter egg trigger
  const [mascotTapCount, setMascotTapCount] = useState(0);
  const lastTapTime = useRef(0);

  const SWIPE_THRESHOLD = 100;

  /**
   * Handle mascot tap for Easter egg trigger
   * Requirements: 14.1, 14.2
   */
  const handleMascotTap = () => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    
    // Reset if more than 2 seconds between taps
    if (now - lastTapTime.current > 2000) {
      setMascotTapCount(0);
    }
    
    const newCount = mascotTapCount + 1;
    setMascotTapCount(newCount);
    lastTapTime.current = now;
    
    if (newCount === 3) {
      showPasscodePrompt();
      setMascotTapCount(0);
    }
  };

  /**
   * Show passcode prompt for Grimace Easter egg
   * Requirements: 14.2
   */
  const showPasscodePrompt = () => {
    const passcode = prompt("Enter passcode:");
    if (passcode === "grimace") {
      navigate("/grimace");
    }
  };

  /**
   * Handle touch start for swipe gesture
   */
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  /**
   * Handle touch move for swipe gesture
   */
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  /**
   * Handle touch end and detect swipe
   */
  const handleTouchEnd = (itemId) => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (swipeDistance > SWIPE_THRESHOLD) {
      setSwipedItemId(itemId);
    } else if (swipeDistance < -SWIPE_THRESHOLD) {
      setSwipedItemId(null);
    }
  };

  /**
   * Handle long press start
   */
  const handleLongPressStart = (itemId) => {
    const timer = setTimeout(() => {
      setItemToDelete(itemId);
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
  const handleDeleteClick = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteModal(true);
  };

  /**
   * Confirm delete
   */
  const confirmDelete = () => {
    if (itemToDelete) {
      const updatedHistory = history.filter(item => item.id !== itemToDelete);
      setHistory(updatedHistory);
      setSwipedItemId(null);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  /**
   * Cancel delete
   */
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setSwipedItemId(null);
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /**
   * Handle share profile
   */
  const handleShare = async () => {
    const shareText = `Check out my Koko savings profile! 🎉\n\nLevel ${level} | ${xp} XP\n💰 Lifetime Savings: ${savings.toFixed(2)}\n🔥 ${streak} day streak\n\nJoin me in saving smarter!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Koko Profile',
          text: shareText
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare(shareText);
        }
      }
    } else {
      fallbackShare(shareText);
    }
  };

  /**
   * Fallback share method (copy to clipboard)
   */
  const fallbackShare = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Profile info copied to clipboard!');
      }).catch(() => {
        alert('Unable to share. Please try again.');
      });
    } else {
      alert('Sharing is not supported on this device.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-nav-safe">
      {/* Header with grid layout */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 shadow-sm">
        {/* Top row: Profile pic, name/level, and action buttons */}
        <div className="flex items-center gap-8 mb-6">
          {/* Left: Profile Picture */}
          <div 
            className="w-20 h-20 cursor-pointer shrink-0"
            onClick={handleMascotTap}
          >
            <MascotPreview 
              equippedItems={equippedItems}
              mascotItems={mascotItems}
              size="small"
            />
          </div>
          
          {/* Right: Name and Level */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {userPreferences.name && (
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {userPreferences.name}
              </h2>
            )}
            <div className="inline-block bg-primary text-white px-4 py-1.5 rounded-full font-bold text-sm self-start">
              Level {level}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-1 shrink-0 self-start">
            <button 
              onClick={handleShare}
              className="text-gray-600 dark:text-gray-400 transition-colors hover:text-primary p-2"
              aria-label="Share profile"
            >
              <Share2 size={24} />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="text-gray-600 dark:text-gray-400 transition-colors hover:text-primary p-2"
              aria-label="Settings"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{xp} XP</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300" 
              style={{width: `${progress}%`}}
            />
          </div>
        </div>
        
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Streak Card */}
          <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 flex flex-col items-center justify-end min-h-[100px]">
            <Flame className="text-primary mb-2" size={28} />
            <p className="text-xl font-bold text-primary">{streak}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">day streak</p>
          </div>
          
          {/* Weekly XP Card */}
          <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 flex flex-col items-center justify-end min-h-[100px]">
            <p className="text-2xl font-bold text-primary mb-2">XP</p>
            <p className="text-xl font-bold text-primary">{weeklyXp}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">this week</p>
          </div>
          
          {/* Lifetime Savings Card */}
          <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 flex flex-col items-center justify-end min-h-[100px]">
            <p className="text-2xl font-bold text-primary mb-2">$</p>
            <p className="text-xl font-bold text-primary">{savings.toFixed(0)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">saved</p>
          </div>
        </div>
      </div>
      
      {/* Past Shops section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Past Shops</h3>
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No shopping trips yet. Start saving!
          </p>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div 
                key={item.id}
                className="relative overflow-hidden"
                onTouchStart={(e) => {
                  handleTouchStart(e);
                  handleLongPressStart(item.id);
                }}
                onTouchMove={(e) => {
                  handleTouchMove(e);
                  handleLongPressEnd();
                }}
                onTouchEnd={() => {
                  handleTouchEnd(item.id);
                  handleLongPressEnd();
                }}
                onMouseDown={() => handleLongPressStart(item.id)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
              >
                <div 
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-md transition-transform duration-300 ease-out cursor-pointer ${
                    swipedItemId === item.id ? '-translate-x-20' : 'translate-x-0'
                  }`}
                  onClick={() => {
                    if (swipedItemId !== item.id) {
                      setSelectedHistoryEntry(item);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg shrink-0">
                      <Receipt size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.results?.storeName || 'Store'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(item.timestamp)} • {item.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-primary font-bold">+{item.xpEarned} XP</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${item.totalSpent?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Delete button shown on swipe */}
                {swipedItemId === item.id && (
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="absolute right-0 top-0 bottom-0 bg-red-500 text-white px-6 flex items-center justify-center rounded-r-xl transition-opacity duration-300 gap-2"
                  >
                    <Trash2 size={20} />
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl transform animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trash2 size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Shopping Trip?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This action cannot be undone. Are you sure you want to delete this shopping trip from your history?
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

      {/* Expanded History Entry Modal */}
      {selectedHistoryEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Shopping Trip</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(selectedHistoryEntry.timestamp)}</p>
              </div>
              <button
                onClick={() => setSelectedHistoryEntry(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 rounded-2xl p-5 mb-6 border border-primary/20">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${selectedHistoryEntry.totalSpent?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedHistoryEntry.items?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-primary/20">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">XP Earned</p>
                  <p className="text-3xl font-bold text-primary">
                    +{selectedHistoryEntry.xpEarned || 0}
                  </p>
                </div>
                {selectedHistoryEntry.savingsPercentage && (
                  <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      {selectedHistoryEntry.savingsPercentage.toFixed(1)}% saved
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            {selectedHistoryEntry.items && selectedHistoryEntry.items.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Items ({selectedHistoryEntry.items.length})
                </h4>
                <div className="space-y-2">
                  {selectedHistoryEntry.items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-700 dark:text-gray-300">
                          {renderIcon(item.icon || 'ShoppingBag', 24)}
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
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setItemToDelete(selectedHistoryEntry.id);
                  setShowDeleteModal(true);
                }}
                className="flex-1 py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 size={20} />
                Delete
              </button>
              <button
                onClick={() => setSelectedHistoryEntry(null)}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
