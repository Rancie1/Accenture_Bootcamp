import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { calculateSavingsPercentage, calculateXpEarned } from '../utils/calculations';

/**
 * Results Component
 * Displays shopping trip results with store info, savings, XP earned, and action buttons
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 4.9, 4.10, 4.11, 4.17, 4.18
 */
const Results = () => {
  const navigate = useNavigate();
  const {
    shoppingList,
    userPreferences,
    xp,
    setXp,
    savings,
    setSavings,
    streak,
    setStreak,
    streakSavers,
    setStreakSavers,
    savedLists,
    setSavedLists,
    history,
    setHistory
  } = useContext(AppContext);

  // Mock results data (in real app, this would come from API)
  const [results] = useState({
    storeName: 'SuperMart',
    location: '123 Main St, City',
    totalPrice: 45.50,
    baselinePrice: 52.00,
    travelTime: 15
  });

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [customCost, setCustomCost] = useState(results.totalPrice);
  const [showStreakSaverModal, setShowStreakSaverModal] = useState(false);

  // Calculate savings and XP
  const savingsPercentage = calculateSavingsPercentage(results.baselinePrice, customCost);
  const xpEarned = Math.round(calculateXpEarned(savingsPercentage));
  const savingsAmount = results.baselinePrice - customCost;

  const handleAdjustCost = () => {
    setShowAdjustModal(true);
  };

  const handleSaveAdjustedCost = () => {
    setShowAdjustModal(false);
  };

  const handleTryAgain = () => {
    navigate('/shop');
  };

  const handleSaveForLater = () => {
    // Add to saved lists
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    const savedList = {
      id: timestamp.toString(),
      items: shoppingList,
      results: {
        ...results,
        totalPrice: customCost,
        savingsPercentage,
        xpEarned,
        savingsAmount
      },
      timestamp
    };
    setSavedLists([...savedLists, savedList]);
    navigate('/shop');
  };

  const handleSubmit = () => {
    // Check if within budget
    const totalSpent = customCost;
    const budget = userPreferences.budget;

    if (totalSpent <= budget) {
      // Within budget - increment streak
      completeSubmission();
    } else {
      // Over budget - check for streak savers
      if (streakSavers > 0) {
        setShowStreakSaverModal(true);
      } else {
        // No streak savers - break streak
        setStreak(0);
        completeSubmission();
      }
    }
  };

  const handleUseStreakSaver = () => {
    setStreakSavers(streakSavers - 1);
    setShowStreakSaverModal(false);
    completeSubmission();
  };

  const handleBreakStreak = () => {
    setStreak(0);
    setShowStreakSaverModal(false);
    completeSubmission();
  };

  const completeSubmission = () => {
    // Update XP and savings
    setXp(xp + xpEarned);
    setSavings(savings + savingsAmount);

    // Increment streak if within budget
    if (customCost <= userPreferences.budget) {
      setStreak(streak + 1);
    }

    // Add to history
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    const historyEntry = {
      id: timestamp.toString(),
      items: shoppingList,
      results: {
        ...results,
        totalPrice: customCost,
        savingsPercentage,
        xpEarned,
        savingsAmount
      },
      xpEarned,
      totalSpent: customCost,
      timestamp
    };
    setHistory([...history, historyEntry]);

    navigate('/shop');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Results Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{results.storeName}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{results.location}</p>
          </div>
          <button className="text-primary text-2xl">🔄</button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Price</span>
            <span className="font-semibold text-gray-900 dark:text-white">${customCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Travel Time</span>
            <span className="font-semibold text-gray-900 dark:text-white">{results.travelTime} min</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-6xl font-bold text-primary mb-2">{savingsPercentage.toFixed(1)}%</div>
          <p className="text-gray-600 dark:text-gray-400">Savings</p>
          <div className="mt-4 inline-block bg-primary/10 dark:bg-primary/20 px-6 py-3 rounded-full">
            <span className="text-primary font-bold text-xl">+{xpEarned} XP</span>
          </div>
        </div>

        <button
          onClick={handleAdjustCost}
          className="w-full mt-4 py-2 text-primary border border-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
        >
          Adjust Cost
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleTryAgain}
          className="py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={handleSaveForLater}
          className="py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Save for Later
        </button>
        <button
          onClick={handleSubmit}
          className="py-3 bg-primary text-white rounded-lg font-medium shadow-lg active:scale-95 transition-transform"
        >
          Submit
        </button>
      </div>

      {/* Adjust Cost Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Adjust Cost</h3>
            <input
              type="number"
              value={customCost}
              onChange={(e) => setCustomCost(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
              step="0.01"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdjustedCost}
                className="flex-1 py-3 bg-primary text-white rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Streak Saver Modal */}
      {showStreakSaverModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Over Budget!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You spent ${customCost.toFixed(2)}, which is over your budget of ${userPreferences.budget.toFixed(2)}. 
              Use a Streak Saver to protect your {streak} day streak?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleBreakStreak}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Break Streak
              </button>
              <button
                onClick={handleUseStreakSaver}
                className="flex-1 py-3 bg-primary text-white rounded-lg font-medium"
              >
                Use Streak Saver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
