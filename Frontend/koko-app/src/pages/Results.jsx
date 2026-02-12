import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { calculateSavingsPercentage, calculateXpEarned } from '../utils/calculations';
import { RefreshCw, DollarSign, Clock, Car } from 'lucide-react';

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

  // Mock results data - multiple options based on different criteria
  const [allResults] = useState([
    {
      id: 'cheapest',
      type: 'cheapest',
      icon: DollarSign,
      label: 'Cheapest',
      storeName: 'Budget Mart',
      location: '456 Savings Ave, City',
      totalPrice: 42.50,
      baselinePrice: 52.00,
      travelTime: 25
    },
    {
      id: 'fastest',
      type: 'fastest',
      icon: Clock,
      label: 'Fastest',
      storeName: 'QuickStop',
      location: '789 Speed Blvd, City',
      totalPrice: 48.00,
      baselinePrice: 52.00,
      travelTime: 8
    },
    // Only show if user preference is driving
    ...(userPreferences.transportation === 'driving' ? [{
      id: 'no-petrol',
      type: 'no-petrol',
      icon: Car,
      label: 'No Petrol Stop',
      storeName: 'SuperMart',
      location: '123 Main St, City',
      totalPrice: 45.50,
      baselinePrice: 52.00,
      travelTime: 15
    }] : [])
  ]);

  const [selectedResult, setSelectedResult] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [customCost, setCustomCost] = useState(0);
  const [customCostInput, setCustomCostInput] = useState('');
  const [customStoreName, setCustomStoreName] = useState('');
  const [showStreakSaverModal, setShowStreakSaverModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [hasAdjusted, setHasAdjusted] = useState(false);

  // Calculate savings and XP for selected result
  // Find the cheapest and most expensive options
  const cheapestPrice = Math.min(...allResults.map(r => r.totalPrice));
  const mostExpensivePrice = Math.max(...allResults.map(r => r.totalPrice));
  
  // Calculate savings relative to most expensive option
  const savingsPercentage = selectedResult ? calculateSavingsPercentage(mostExpensivePrice, customCost) : 0;
  const savingsAmount = selectedResult ? mostExpensivePrice - customCost : 0;
  
  // Determine if over cheapest option (spending more than the best deal)
  const isOverCheapest = customCost > cheapestPrice;
  const excessAmount = customCost - cheapestPrice;
  
  // XP is earned based on savings percentage, but 0 if over the cheapest option
  const xpEarned = selectedResult && !isOverCheapest ? Math.round(calculateXpEarned(savingsPercentage)) : 0;

  const handleSelectResult = (result) => {
    setSelectedResult(result);
    setCustomCost(result.totalPrice);
    setCustomCostInput(result.totalPrice.toFixed(2));
    setCustomStoreName(result.storeName);
    setHasAdjusted(false);
  };

  const handleAdjustCost = () => {
    setShowAdjustModal(true);
  };

  const handleSaveAdjustedCost = () => {
    setShowAdjustModal(false);
    setHasAdjusted(true);
  };

  const handleCostInputChange = (value) => {
    setCustomCostInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setCustomCost(numValue);
    } else if (value === '' || value === '.') {
      setCustomCost(0);
    }
  };

  const handleTryAgain = () => {
    navigate('/shop');
  };

  const handleSaveForLater = () => {
    if (!selectedResult) return;
    
    // Add to saved lists
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    const savedList = {
      id: timestamp.toString(),
      items: shoppingList,
      results: {
        ...selectedResult,
        totalPrice: customCost,
        savingsPercentage,
        xpEarned,
        savingsAmount
      },
      timestamp
    };
    setSavedLists([...savedLists, savedList]);
    setShowSavedModal(true);
  };

  const handleSubmit = () => {
    if (!selectedResult) return;
    
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
    if (!selectedResult) return;
    
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
        ...selectedResult,
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

    // Show success modal
    setShowSubmittedModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pb-24">
      {/* Header with Title and Refresh Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Select your shopping list</h1>
        <button 
          onClick={handleTryAgain}
          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          aria-label="Refresh results"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      {/* Results Options */}
      <div className="space-y-4 mb-6">
        {allResults.map((result) => {
          const isSelected = selectedResult?.id === result.id;
          const resultSavings = calculateSavingsPercentage(mostExpensivePrice, result.totalPrice);
          const resultXp = Math.round(calculateXpEarned(resultSavings));
          const IconComponent = result.icon;

          return (
            <button
              key={result.id}
              onClick={() => handleSelectResult(result)}
              className={`w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-left transition-all ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-xl' 
                  : 'hover:shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? 'bg-primary text-white' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{result.storeName}</h2>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isSelected 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {result.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.location}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="text-primary text-2xl">✓</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Price</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">${result.totalPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Travel Time</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{result.travelTime} min</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Savings</p>
                  <p className="text-2xl font-bold text-primary">{resultSavings.toFixed(1)}%</p>
                </div>
                <div className="bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-full">
                  <span className="text-primary font-bold">+{resultXp} XP</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Buttons - Only show when a result is selected */}
      {selectedResult && (
        <div className="space-y-3">
          {/* Adjusted Cost Preview Card */}
          {hasAdjusted && (
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 rounded-2xl p-6 border-2 border-primary/30 shadow-lg animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Adjusted Cost</h3>
                </div>
                {customStoreName && customStoreName !== selectedResult.storeName && (
                  <span className="text-sm font-medium text-primary">{customStoreName}</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Cost</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${customCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Most Expensive</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${mostExpensivePrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-primary/20">
                {!isOverCheapest ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Savings</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {savingsPercentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ${savingsAmount.toFixed(2)} vs most expensive
                      </p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                      <span className="text-green-600 dark:text-green-400 font-bold">+{xpEarned} XP</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Over Cheapest</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                        ${excessAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Could have saved more
                      </p>
                    </div>
                    <div className="bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-full">
                      <span className="text-red-600 dark:text-red-400 font-bold">0 XP</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={handleAdjustCost}
            className="w-full py-3 text-primary border-2 border-primary rounded-lg font-medium hover:bg-primary/5 transition-colors"
          >
            {hasAdjusted ? 'Update Cost' : 'Adjust Cost'}
          </button>
          
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
        </div>
      )}

      {/* Adjust Cost Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Adjust Cost</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store/Place Name
              </label>
              <input
                type="text"
                value={customStoreName}
                onChange={(e) => setCustomStoreName(e.target.value)}
                placeholder="Enter store name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Actual Cost ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={customCostInput}
                onChange={(e) => handleCostInputChange(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-semibold"
                autoFocus
              />
            </div>
            
            {/* Live Preview in Modal */}
            <div className={`p-4 rounded-lg mb-4 ${
              !isOverCheapest
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {!isOverCheapest ? 'Savings' : 'Over Cheapest'}
                </span>
                <span className={`text-lg font-bold ${
                  !isOverCheapest
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {!isOverCheapest
                    ? `${savingsPercentage.toFixed(1)}%` 
                    : `$${excessAmount.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Most expensive: ${mostExpensivePrice.toFixed(2)} • Cheapest: ${cheapestPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">XP Earned</span>
                <span className={`font-bold ${
                  !isOverCheapest
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {xpEarned} XP
                </span>
              </div>
            </div>
            
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

      {/* Saved Confirmation Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl transform animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Saved!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your shopping list has been saved for later.
              </p>
              <button
                onClick={() => {
                  setShowSavedModal(false);
                  navigate('/shop');
                }}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Continue
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
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Submitted!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Your shopping trip has been recorded successfully.
              </p>
              {xpEarned > 0 && (
                <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 mb-6">
                  <p className="text-primary font-bold text-lg">+{xpEarned} XP earned!</p>
                </div>
              )}
              <button
                onClick={() => {
                  setShowSubmittedModal(false);
                  navigate('/shop');
                }}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
