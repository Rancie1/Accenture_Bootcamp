import { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import MascotPreview from '../components/MascotPreview';
import { Settings, Flame, Share2, Trash2 } from 'lucide-react';

/**
 * Dashboard Component
 * Displays user profile, mascot, stats, streak, and shopping history
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.8, 6.9, 6.10, 6.11, 6.12, 6.13, 6.14, 14.1, 14.2
 */
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
    const shareText = `Check out my Koko savings profile! 🎉\n\nLevel ${level} | ${xp} XP\n💰 Lifetime Savings: $${savings.toFixed(2)}\n🔥 ${streak} day streak\n\nJoin me in saving smarter!`;
    
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
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-gray-50 dark:from-primary/20 dark:to-gray-900 pb-24">
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
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-md transition-transform duration-300 ease-out ${
                    swipedItemId === item.id ? '-translate-x-20' : 'translate-x-0'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(item.timestamp)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
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
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
