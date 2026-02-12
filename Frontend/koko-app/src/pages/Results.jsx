import { useContext, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { calculateXpEarned } from '../utils/calculations';
import { ArrowLeft, ShoppingCart, MessageSquare, DollarSign, ChevronDown, ChevronUp, Footprints, Bus, Car, MapPin } from 'lucide-react';

/**
 * Results Component
 * Displays real shopping trip data from the Strands agent chat:
 *   - Shopping list with prices
 *   - Total cost
 *   - Chat conversation summary
 *   - Gamification: adjust cost, XP, streaks, submit
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 4.9, 4.10, 4.11, 4.17, 4.18
 */
const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    shoppingList,
    setShoppingList,
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

  // Chat messages passed from Shop.jsx via navigation state
  const chatMessages = location.state?.chatMessages || [];
  const transportMode = location.state?.transportMode || 'walking';

  // ── Transport config ────────────────────────────────────────────────
  // Static class names so Tailwind can detect them at build time
  const transportConfig = {
    walking: {
      label: 'Walking',
      icon: Footprints,
      defaultCost: 0,
      borderClass: 'border-green-500',
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      iconClass: 'text-green-600 dark:text-green-400',
      costClass: 'text-green-600 dark:text-green-400',
    },
    public_transport: {
      label: 'Public Transport',
      icon: Bus,
      defaultCost: 4.80,
      borderClass: 'border-blue-500',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      iconClass: 'text-blue-600 dark:text-blue-400',
      costClass: 'text-blue-600 dark:text-blue-400',
    },
    driving: {
      label: 'Driving',
      icon: Car,
      defaultCost: 5.00,
      borderClass: 'border-purple-500',
      bgClass: 'bg-purple-100 dark:bg-purple-900/30',
      iconClass: 'text-purple-600 dark:text-purple-400',
      costClass: 'text-purple-600 dark:text-purple-400',
    },
  };
  const transport = transportConfig[transportMode] || transportConfig.walking;
  const TransportIcon = transport.icon;

  // ── Derived values from real shopping list ──────────────────────────
  const groceryTotal = useMemo(() => {
    return shoppingList.reduce((sum, item) => {
      const price = item.price || 0;
      const qty = item.quantity || 1;
      return sum + price * qty;
    }, 0);
  }, [shoppingList]);

  const itemsWithPrice = shoppingList.filter(item => item.price && item.price > 0);
  const itemsWithoutPrice = shoppingList.filter(item => !item.price || item.price <= 0);

  // ── Extract transport cost from agent's last message ────────────────
  // The last bot message before navigation is the transport response.
  // Try to parse the actual cost the agent calculated.
  const parsedTransportCost = useMemo(() => {
    // Look at bot messages from newest to oldest
    const botMessages = [...chatMessages].reverse().filter(m => !m.isUser);
    for (const msg of botMessages) {
      // Strip markdown bold markers so **transport cost**: parses cleanly
      const text = (msg.text || '').replace(/\*{1,2}/g, '');

      // 1. "approximately $2.09" — the agent's preferred phrasing for calculated costs
      const approxMatch = text.match(/approximately\s*\$(\d+\.?\d*)/i);
      if (approxMatch) return parseFloat(approxMatch[1]);

      // 2. "transport cost is $X.XX" / "transport cost: $X.XX"
      const transportIsMatch = text.match(/transport cost\s*(?:is|:|=)\s*\$(\d+\.?\d*)/i);
      if (transportIsMatch) return parseFloat(transportIsMatch[1]);

      // 3. "fuel cost is $X.XX" / "fuel cost will be … $X.XX"
      const fuelCostMatch = text.match(/fuel cost\s*(?:is|will be|:|=)[^$]*\$(\d+\.?\d*)/i);
      if (fuelCostMatch) return parseFloat(fuelCostMatch[1]);

      // 4. Grab the LAST "$X.XX" in any message that mentions "transport cost"
      if (/transport cost/i.test(text)) {
        const allDollars = [...text.matchAll(/\$(\d+\.?\d*)/g)];
        if (allDollars.length > 0) {
          return parseFloat(allDollars[allDollars.length - 1][1]);
        }
      }

      // 5. Match "fare" patterns — "fare.*$X.XX" or "$X.XX fare"
      const fareMatch = text.match(/fare[^$]*\$(\d+\.?\d*)/i) || text.match(/\$(\d+\.?\d*)\s*(?:fare|ticket)/i);
      if (fareMatch) return parseFloat(fareMatch[1]);

      // 6. For walking, look for "$0" or "free" mentions
      if (transportMode === 'walking' && /free|no (?:transport )?cost|\$0(?:\.00)?/i.test(text)) {
        return 0;
      }
    }
    return null; // Not found — will fall back to default
  }, [chatMessages, transportMode]);

  const initialTransportCost = parsedTransportCost !== null ? parsedTransportCost : transport.defaultCost;

  // ── Transport cost state ───────────────────────────────────────────
  const [transportCost, setTransportCost] = useState(initialTransportCost);
  const [transportCostInput, setTransportCostInput] = useState(
    initialTransportCost.toFixed(2)
  );
  const [showTransportEdit, setShowTransportEdit] = useState(false);

  // Total = groceries + transport
  const estimatedTotal = groceryTotal + transportCost;

  // ── Adjust cost state ──────────────────────────────────────────────
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [customCost, setCustomCost] = useState(estimatedTotal);
  const [customCostInput, setCustomCostInput] = useState(estimatedTotal > 0 ? estimatedTotal.toFixed(2) : '');
  const [retailerName, setRetailerName] = useState('Coles');
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const [showChatSummary, setShowChatSummary] = useState(false);

  // ── Modals ─────────────────────────────────────────────────────────
  const [showStreakSaverModal, setShowStreakSaverModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);

  // ── Budget-based gamification ──────────────────────────────────────
  const budget = userPreferences.budget || 0;
  const finalCost = hasAdjusted ? customCost : estimatedTotal;
  const isUnderBudget = budget > 0 && finalCost <= budget;
  const budgetDiff = budget > 0 ? budget - finalCost : 0;
  const savingsPercentage = budget > 0 ? Math.max(0, (budgetDiff / budget) * 100) : 0;
  const xpEarned = isUnderBudget ? Math.round(calculateXpEarned(savingsPercentage)) : 0;

  // ── Handlers ───────────────────────────────────────────────────────
  const handleTransportCostChange = (value) => {
    setTransportCostInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setTransportCost(numValue);
    } else if (value === '' || value === '.') {
      setTransportCost(0);
    }
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

  const handleSaveAdjustedCost = () => {
    setShowAdjustModal(false);
    setHasAdjusted(true);
  };

  const handleSaveForLater = () => {
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    const savedList = {
      id: timestamp.toString(),
      items: shoppingList,
      results: {
        totalPrice: finalCost,
        savingsPercentage,
        xpEarned,
        savingsAmount: budgetDiff,
        transportMode,
        storeName: hasAdjusted ? retailerName : 'Coles' // Use adjusted retailer if edited
      },
      timestamp
    };
    setSavedLists([...savedLists, savedList]);
    setShowSavedModal(true);
  };

  const handleSubmit = () => {
    if (budget > 0 && finalCost > budget) {
      if (streakSavers > 0) {
        setShowStreakSaverModal(true);
      } else {
        setStreak(0);
        completeSubmission();
      }
    } else {
      completeSubmission();
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
    setXp(xp + xpEarned);
    setSavings(savings + Math.max(0, budgetDiff));

    // Always increment streak when submitting a shop
    setStreak(streak + 1);

    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    const historyEntry = {
      id: timestamp.toString(),
      items: shoppingList,
      results: {
        totalPrice: finalCost,
        savingsPercentage,
        xpEarned,
        savingsAmount: budgetDiff,
        transportMode,
        storeName: hasAdjusted ? retailerName : 'Coles', // Use adjusted retailer if edited
        timestamp
      },
      xpEarned,
      totalSpent: finalCost,
      timestamp
    };
    setHistory([...history, historyEntry]);
    
    // Clear the shopping list after submission
    setShoppingList([]);
    
    setShowSubmittedModal(true);
  };

  // Filter chat messages to only show bot responses (the agent summaries)
  const agentMessages = chatMessages.filter(m => !m.isUser && m.id !== 'welcome');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/shop')}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Shopping Trip</h1>
      </div>

      {/* ── Shopping List Card ────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Shopping List ({shoppingList.length} {shoppingList.length === 1 ? 'item' : 'items'})
          </h2>
        </div>

        {shoppingList.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            No items yet. Go back and chat with Koko to build your list!
          </p>
        ) : (
          <div className="space-y-3">
            {shoppingList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity || 1}
                  </p>
                </div>
                <div className="text-right ml-3">
                  {item.price && item.price > 0 ? (
                    <>
                      <p className="text-sm font-bold text-primary">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </p>
                      {(item.quantity || 1) > 1 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ${item.price.toFixed(2)} ea
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No price</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grocery subtotal row */}
        {shoppingList.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <p className="text-base font-bold text-gray-900 dark:text-white">Grocery Subtotal</p>
            <p className="text-xl font-extrabold text-primary">
              {groceryTotal > 0 ? `$${groceryTotal.toFixed(2)}` : 'N/A'}
            </p>
          </div>
        )}

        {itemsWithoutPrice.length > 0 && itemsWithPrice.length > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            * {itemsWithoutPrice.length} {itemsWithoutPrice.length === 1 ? 'item has' : 'items have'} no price — total may be higher.
          </p>
        )}
      </div>

      {/* ── Transport Card ──────────────────────────────────────────── */}
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-4 border-l-4 ${transport.borderClass}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 ${transport.bgClass} rounded-full`}>
              <TransportIcon size={20} className={transport.iconClass} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">{transport.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {transportMode === 'walking' ? 'No transport cost' : 'Estimated fare / fuel'}
              </p>
            </div>
          </div>
          <div className="text-right">
            {showTransportEdit ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={transportCostInput}
                  onChange={(e) => handleTransportCostChange(e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-right text-sm font-semibold focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                  onBlur={() => setShowTransportEdit(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setShowTransportEdit(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowTransportEdit(true)}
                className="text-right group"
              >
                <p className={`text-lg font-bold ${transport.costClass}`}>
                  {transportCost === 0 ? 'Free' : `$${transportCost.toFixed(2)}`}
                </p>
                <p className="text-xs text-gray-400 group-hover:text-primary transition-colors">tap to edit</p>
              </button>
            )}
          </div>
        </div>

        {/* Trip total summary */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Groceries</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              ${groceryTotal.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Transport</p>
            <p className={`text-sm font-bold ${transport.costClass}`}>
              {transportCost === 0 ? '$0.00' : `$${transportCost.toFixed(2)}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Trip Total</p>
            <p className="text-sm font-bold text-primary">
              ${estimatedTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Budget Comparison Card ───────────────────────────────────── */}
      {budget > 0 && (
        <div className={`rounded-2xl shadow-lg p-5 mb-4 border-2 ${
          isUnderBudget
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className={isUnderBudget ? 'text-green-600' : 'text-red-600'} />
              <h3 className="font-bold text-gray-900 dark:text-white">
                {isUnderBudget ? 'Under Budget!' : 'Over Budget'}
              </h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              isUnderBudget
                ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300'
            }`}>
              {isUnderBudget ? `+${xpEarned} XP` : '0 XP'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Budget</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">${budget.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{hasAdjusted ? 'Actual' : 'Estimated'}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">${finalCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{isUnderBudget ? 'Saved' : 'Over by'}</p>
              <p className={`text-lg font-bold ${isUnderBudget ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(budgetDiff).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Budget progress bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  isUnderBudget ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, (finalCost / budget) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Adjusted Cost Card ───────────────────────────────────────── */}
      {hasAdjusted && (
        <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 rounded-2xl p-5 mb-4 border-2 border-primary/30 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <h3 className="font-bold text-gray-900 dark:text-white">Adjusted Cost</h3>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">What you actually spent</p>
            <p className="text-2xl font-extrabold text-primary">${customCost.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* ── Chat Summary (collapsible) ───────────────────────────────── */}
      {agentMessages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-4 overflow-hidden">
          <button
            onClick={() => setShowChatSummary(!showChatSummary)}
            className="w-full flex items-center justify-between p-5"
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Koko's Summary</h2>
            </div>
            {showChatSummary ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
          </button>

          {showChatSummary && (
            <div className="px-5 pb-5 space-y-3 max-h-80 overflow-y-auto">
              {agentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                >
                  {msg.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Action Buttons ───────────────────────────────────────────── */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAdjustModal(true)}
          className="w-full py-3 text-primary border-2 border-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors"
        >
          {hasAdjusted ? 'Update Trip Details' : 'Edit Trip Details'}
        </button>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/shop')}
            className="py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleSaveForLater}
            className="py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Save Later
          </button>
          <button
            onClick={handleSubmit}
            className="py-3 bg-primary text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
          >
            Submit
          </button>
        </div>
      </div>

      {/* ── Adjust Cost Modal ────────────────────────────────────────── */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Trip Details
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retailer Name
              </label>
              <input
                type="text"
                value={retailerName}
                onChange={(e) => setRetailerName(e.target.value)}
                placeholder="e.g., Coles, Woolworths, Aldi"
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
              />
            </div>

            {/* Live preview */}
            {budget > 0 && (
              <div className={`p-4 rounded-lg mb-4 ${
                customCost <= budget
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {customCost <= budget ? 'Under budget' : 'Over budget'}
                  </span>
                  <span className={`text-lg font-bold ${
                    customCost <= budget ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(budget - customCost).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Budget: ${budget.toFixed(2)}</span>
                  <span className={`text-sm font-bold ${
                    customCost <= budget ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {customCost <= budget
                      ? `+${Math.round(calculateXpEarned(Math.max(0, ((budget - customCost) / budget) * 100)))} XP`
                      : '0 XP'}
                  </span>
                </div>
              </div>
            )}

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

      {/* ── Streak Saver Modal ───────────────────────────────────────── */}
      {showStreakSaverModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Over Budget!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You spent ${finalCost.toFixed(2)}, which is over your budget of ${budget.toFixed(2)}.
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

      {/* ── Saved Confirmation Modal ─────────────────────────────────── */}
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

      {/* ── Submitted Confirmation Modal ─────────────────────────────── */}
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
