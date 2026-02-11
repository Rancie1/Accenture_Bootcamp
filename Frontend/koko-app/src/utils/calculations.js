/**
 * Utility functions for XP, level, savings, and weekly calculations
 * Requirements: 12.1, 12.3, 4.5, 4.8, 6.6, 6.7
 */

/**
 * Calculate user level from total XP
 * Level = Math.floor(xp / 100) + 1
 * @param {number} xp - Total experience points
 * @returns {number} User level
 */
export const calculateLevel = (xp) => {
  return Math.floor(xp / 100) + 1;
};

/**
 * Calculate progress toward next level
 * Progress = xp % 100
 * @param {number} xp - Total experience points
 * @returns {number} Progress (0-99)
 */
export const calculateProgress = (xp) => {
  return xp % 100;
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
