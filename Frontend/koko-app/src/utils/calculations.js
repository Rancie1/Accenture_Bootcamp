/**
 * Utility functions for XP, level, savings, and weekly calculations
 * Requirements: 12.1, 12.3, 4.5, 4.8, 6.6, 6.7
 */

/**
 * XP requirements for each level (cumulative)
 * Level 1: 0 XP
 * Level 2: 100 XP
 * Level 3: 250 XP
 * Level 4: 450 XP
 * Level 5: 700 XP
 * Level 6: 1000 XP
 * Level 7: 1350 XP
 * Level 8: 1750 XP
 * Level 9: 2200 XP
 * Level 10: 2700 XP
 */
const LEVEL_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  450,  // Level 4
  700,  // Level 5
  1000, // Level 6
  1350, // Level 7
  1750, // Level 8
  2200, // Level 9
  2700  // Level 10
];

/**
 * Calculate user level from total XP
 * @param {number} xp - Total experience points
 * @returns {number} User level (1-10)
 */
export const calculateLevel = (xp) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

/**
 * Calculate progress toward next level
 * @param {number} xp - Total experience points
 * @returns {number} Progress (0-99 for levels 1-9, 0-100 for level 10)
 */
export const calculateProgress = (xp) => {
  const currentLevel = calculateLevel(xp);
  
  // Max level reached
  if (currentLevel >= 10) {
    return 100;
  }
  
  const currentLevelXp = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextLevelXp = LEVEL_THRESHOLDS[currentLevel];
  const xpIntoLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  
  return Math.floor((xpIntoLevel / xpNeededForLevel) * 100);
};

/**
 * Get XP required for next level
 * @param {number} xp - Total experience points
 * @returns {number} XP needed to reach next level
 */
export const getXpForNextLevel = (xp) => {
  const currentLevel = calculateLevel(xp);
  
  if (currentLevel >= 10) {
    return 0; // Max level
  }
  
  const nextLevelXp = LEVEL_THRESHOLDS[currentLevel];
  return nextLevelXp - xp;
};

/**
 * Calculate savings percentage
 * Savings % = ((baselinePrice - optimalPrice) / baselinePrice) * 100
 * @param {number} baselinePrice - Average/baseline price
 * @param {number} optimalPrice - Best price found
 * @returns {number} Savings percentage
 */
export const calculateSavingsPercentage = (baselinePrice, optimalPrice) => {
  if (baselinePrice <= 0) return 0;
  return ((baselinePrice - optimalPrice) / baselinePrice) * 100;
};

/**
 * Calculate XP earned from savings percentage
 * XP = savings percentage (10% savings = 10 XP)
 * @param {number} savingsPercentage - Savings percentage
 * @returns {number} XP earned
 */
export const calculateXpEarned = (savingsPercentage) => {
  return savingsPercentage;
};

/**
 * Get the start of the current week (Monday at midnight)
 * @returns {number} Timestamp of Monday 00:00:00
 */
export const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  // Calculate days to subtract to get to Monday (day 1)
  // If Sunday (0), go back 6 days; otherwise go back (day - 1) days
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
};

/**
 * Calculate weekly XP from history entries
 * Only counts entries from current week (Monday onwards)
 * @param {Array} history - Array of history entries with timestamp and xpEarned
 * @returns {number} Total XP earned this week
 */
export const calculateWeeklyXp = (history) => {
  const weekStart = getWeekStart();
  return history
    .filter(item => item.timestamp >= weekStart)
    .reduce((sum, item) => sum + item.xpEarned, 0);
};

/**
 * Calculate weekly spending from history entries
 * Only counts entries from current week (Monday onwards)
 * @param {Array} history - Array of history entries with timestamp and totalSpent
 * @returns {number} Total spending this week
 */
export const calculateWeeklySpending = (history) => {
  const weekStart = getWeekStart();
  return history
    .filter(item => item.timestamp >= weekStart)
    .reduce((sum, item) => sum + (item.totalSpent || 0), 0);
};

/**
 * Calculate budget savings score for leaderboard as percentage
 * Score = ((budget - totalSpending) / budget) * 100 (percentage of budget remaining)
 * @param {number} budget - Weekly budget
 * @param {number} totalSpending - Total spending for the week
 * @returns {number} Budget remaining percentage (0-100)
 */
export const calculateSavingsScore = (budget, totalSpending) => {
  if (budget <= 0) return 0;
  const remaining = Math.max(0, budget - totalSpending);
  return (remaining / budget) * 100;
};
