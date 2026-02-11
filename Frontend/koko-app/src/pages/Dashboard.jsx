import { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import MascotPreview from '../components/MascotPreview';
import { Settings, Flame } from 'lucide-react';

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
   * Delete history item and subtract XP from weekly score
   * Requirements: 6.13
   */
  const handleDeleteHistory = (itemId) => {
    const updatedHistory = history.filter(item => item.id !== itemId);
    setHistory(updatedHistory);
    setSwipedItemId(null);
  };

  /**
   * Format date for display
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-gray-50 dark:from-primary/20 dark:to-gray-900 pb-24">
      {/* Header with profile and settings */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div 
            className="w-12 h-12 cursor-pointer"
            onClick={handleMascotTap}
          >
            {/* Mascot as profile picture */}
            <MascotPreview 
              equippedItems={equippedItems}
              mascotItems={mascotItems}
              size="small"
            />
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="text-gray-600 dark:text-gray-400 transition-colors hover:text-primary"
          >
            <Settings size={28} />
          </button>
        </div>
        
        {/* Level and stats display */}
        <div className="flex flex-col items-center">
          {userPreferences.name && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {userPreferences.name}
            </h2>
          )}
          <div className="relative mb-4">
            <span className="bg-primary text-white px-4 py-2 rounded-full font-bold text-lg">
              Level {level}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-2">{xp} XP</p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300" 
              style={{width: `${progress}%`}}
            />
          </div>
          
          {/* Streak display */}
          <div className="flex gap-4 mb-4">
            <div className="bg-primary/10 dark:bg-primary/20 px-6 py-3 rounded-full flex items-center gap-2">
              <Flame className="text-primary" size={20} />
              <span className="text-primary font-bold">{streak} day streak</span>
            </div>
          </div>
          
          {/* Weekly XP and total savings */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This week: {weeklyXp} XP</p>
          <p className="text-primary font-semibold text-lg">You've saved ${savings.toFixed(2)}</p>
        </div>
      </div>
      
      {/* History section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">History</h3>
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
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(item.id)}
              >
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-md hover:scale-102 transition-transform">
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
                    onClick={() => handleDeleteHistory(item.id)}
                    className="absolute right-0 top-0 bottom-0 bg-red-500 text-white px-6 flex items-center justify-center rounded-r-xl"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
