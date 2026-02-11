import { createContext, useState, useEffect, useMemo } from 'react';
import { calculateLevel, calculateProgress, calculateWeeklyXp } from '../utils/calculations';
import { saveState, loadState } from '../utils/storage';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

/**
 * Initial default items for the shop
 */
const initialDefaultItems = [
  { id: "milk", name: "Milk", icon: "Milk" },
  { id: "eggs", name: "Eggs", icon: "Egg" },
  { id: "bread", name: "Bread", icon: "Croissant" },
  { id: "butter", name: "Butter", icon: "Cookie" },
  { id: "cheese", name: "Cheese", icon: "Pizza" },
  { id: "chicken", name: "Chicken", icon: "Drumstick" },
  { id: "rice", name: "Rice", icon: "UtensilsCrossed" },
  { id: "pasta", name: "Pasta", icon: "Soup" }
];

/**
 * AppContext Provider Component
 * Manages global app state and provides it to all child components
 * Requirements: 12.1, 12.3, 6.5, 6.6, 6.7
 */
export const AppProvider = ({ children }) => {
  // Core state variables
  const [xp, setXp] = useState(0);
  const [savings, setSavings] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakSavers, setStreakSavers] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  // User preferences
  const [userPreferences, setUserPreferences] = useState({
    name: '',
    budget: 0,
    transportPreference: '' // "public" | "driving"
  });

  // Shopping and lists
  const [defaultItems, setDefaultItems] = useState(initialDefaultItems);
  const [shoppingList, setShoppingList] = useState([]);
  const [savedLists, setSavedLists] = useState([]);
  const [history, setHistory] = useState([]);

  // Mascot customization
  const [mascotItems, setMascotItems] = useState([]);
  const [equippedItems, setEquippedItems] = useState({
    hat: null,
    accessory: null,
    background: null,
    outfit: null
  });

  // Calculate derived values using useMemo for performance
  const level = useMemo(() => calculateLevel(xp), [xp]);
  const progress = useMemo(() => calculateProgress(xp), [xp]);
  const weeklyXp = useMemo(() => calculateWeeklyXp(history), [history]);

  // Load state from localStorage on mount
  useEffect(() => {
    const loadedState = loadState();
    if (loadedState) {
      // Batch state updates to avoid cascading renders
      Promise.resolve().then(() => {
        setXp(loadedState.xp || 0);
        setSavings(loadedState.savings || 0);
        setStreak(loadedState.streak || 0);
        setStreakSavers(loadedState.streakSavers || 0);
        setDarkMode(loadedState.darkMode || false);
        setUserPreferences(loadedState.userPreferences || {
          name: '',
          budget: 0,
          transportPreference: ''
        });
        setDefaultItems(loadedState.defaultItems || initialDefaultItems);
        setShoppingList(loadedState.shoppingList || []);
        setSavedLists(loadedState.savedLists || []);
        setHistory(loadedState.history || []);
        setMascotItems(loadedState.mascotItems || []);
        setEquippedItems(loadedState.equippedItems || {
          hat: null,
          accessory: null,
          background: null,
          outfit: null
        });
      });
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      xp,
      savings,
      streak,
      streakSavers,
      darkMode,
      userPreferences,
      defaultItems,
      shoppingList,
      savedLists,
      history,
      mascotItems,
      equippedItems
    };
    saveState(state);
  }, [
    xp,
    savings,
    streak,
    streakSavers,
    darkMode,
    userPreferences,
    defaultItems,
    shoppingList,
    savedLists,
    history,
    mascotItems,
    equippedItems
  ]);

  const value = {
    // Core state
    xp,
    setXp,
    savings,
    setSavings,
    streak,
    setStreak,
    streakSavers,
    setStreakSavers,
    darkMode,
    setDarkMode,

    // Derived values
    level,
    progress,
    weeklyXp,

    // User preferences
    userPreferences,
    setUserPreferences,

    // Shopping and lists
    defaultItems,
    setDefaultItems,
    shoppingList,
    setShoppingList,
    savedLists,
    setSavedLists,
    history,
    setHistory,

    // Mascot customization
    mascotItems,
    setMascotItems,
    equippedItems,
    setEquippedItems
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
