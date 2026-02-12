import { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import { calculateWeeklySpending, calculateSavingsScore } from '../utils/calculations';
import { Trophy, TrendingUp, Info, X } from 'lucide-react';

/**
 * Leaderboard Component
 * Displays top savers with fair anti-gaming ranking system
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

/**
 * Leaderboard Calculation Logic
 * 
 * Anti-Gaming Measures:
 * 1. Minimum Budget Threshold: $20/week to prevent gaming with tiny budgets
 * 2. Savings Rate: (weeklyBudget - weeklySpend) / weeklyBudget
 * 3. Consistency Factor: Rewards staying under budget consistently (0-1 scale)
 * 4. Final Score: (Savings Rate × 70%) + (Consistency Factor × 30%)
 * 
 * This ensures users can't game the system by:
 * - Setting unrealistically low budgets
 * - Having one good week but inconsistent behavior
 */

const MINIMUM_BUDGET_THRESHOLD = 20; // Minimum weekly budget in dollars

// Sample leaderboard data with realistic user profiles
const sampleLeaderboardUsers = [
  { 
    username: 'Sarah M.', 
    weeklyBudget: 150, 
    weeklySpend: 112, 
    daysUnderBudget: 7,
    totalDays: 7,
    currentStreak: 21,
    rankChange: 2
  },
  { 
    username: 'Mike T.', 
    weeklyBudget: 200, 
    weeklySpend: 145, 
    daysUnderBudget: 6, 
    totalDays: 7,
    currentStreak: 6,
    rankChange: -1
  },
  { 
    username: 'Emma L.', 
    weeklyBudget: 120, 
    weeklySpend: 85, 
    daysUnderBudget: 7, 
    totalDays: 7,
    currentStreak: 14,
    rankChange: 1
  },
  { 
    username: 'John D.', 
    weeklyBudget: 180, 
    weeklySpend: 140, 
    daysUnderBudget: 5, 
    totalDays: 7,
    currentStreak: 5,
    rankChange: 0
  },
  { 
    username: 'Lisa K.', 
    weeklyBudget: 100, 
    weeklySpend: 75, 
    daysUnderBudget: 6, 
    totalDays: 7,
    currentStreak: 12,
    rankChange: 3
  },
  { 
    username: 'Tom R.', 
    weeklyBudget: 250, 
    weeklySpend: 210, 
    daysUnderBudget: 4, 
    totalDays: 7,
    currentStreak: 4,
    rankChange: -2
  },
  { 
    username: 'Anna P.', 
    weeklyBudget: 160, 
    weeklySpend: 115, 
    daysUnderBudget: 7, 
    totalDays: 7,
    currentStreak: 28,
    rankChange: 1
  },
  { 
    username: 'Chris W.', 
    weeklyBudget: 90, 
    weeklySpend: 70, 
    daysUnderBudget: 5, 
    totalDays: 7,
    currentStreak: 5,
    rankChange: -1
  },
];

/**
 * Calculate leaderboard score for a user
 */
const calculateLeaderboardScore = (user) => {
  if (user.weeklyBudget < MINIMUM_BUDGET_THRESHOLD) {
    return {
      ...user,
      leaderboardScore: 0,
      savingsRate: 0,
      consistencyFactor: 0,
      savingsPercentage: 0,
      disqualified: true
    };
  }

  const savingsRate = Math.max(0, (user.weeklyBudget - user.weeklySpend) / user.weeklyBudget);
  const consistencyFactor = user.daysUnderBudget / user.totalDays;
  const leaderboardScore = (savingsRate * 0.7) + (consistencyFactor * 0.3);
  const savingsPercentage = savingsRate * 100;

  return {
    ...user,
    leaderboardScore,
    savingsRate,
    consistencyFactor,
    savingsPercentage: Math.round(savingsPercentage),
    disqualified: false
  };
};

/**
 * Get sorted leaderboard with calculated scores
 */
const getLeaderboard = () => {
  const usersWithScores = sampleLeaderboardUsers.map(calculateLeaderboardScore);
  const qualifiedUsers = usersWithScores.filter(u => !u.disqualified);
  const sortedUsers = qualifiedUsers.sort((a, b) => b.leaderboardScore - a.leaderboardScore);
  
  return sortedUsers.map((user, index) => ({
    ...user,
    rank: index + 1
  }));
};

const Leaderboard = () => {
  const { userPreferences, history } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);

  const leaderboardData = useMemo(() => getLeaderboard(), []);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-gradient-to-r from-purple-400 to-pink-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
              <Trophy size={40} className="text-white animate-pulse" />
            </div>
          </div>
          <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            Loading Leaderboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 pb-24 font-sans">
      
      {/* Header with animated trophy */}
      <div className="bg-purple-50/80 dark:bg-gray-800/80 backdrop-blur-md p-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative p-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl shadow-lg">
              <Trophy size={32} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Top Savers Leaderboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Live weekly rankings
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Ranking Info Tooltip */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 mb-6 border border-purple-200 dark:border-purple-800 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <Info size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold mb-1.5">🎯 Fair Ranking System</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                We rank by <span className="font-semibold text-purple-600 dark:text-purple-400">savings rate + consistency</span>. 
                Save more and stay under budget daily to climb higher. Min. ${MINIMUM_BUDGET_THRESHOLD}/week budget prevents gaming.
              </p>
            </div>
          </div>
        </div>

        {/* Podium for Top 3 */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {leaderboardData.slice(0, 3).map((user, index) => {
              const heights = ['h-32', 'h-40', 'h-28'];
              const positions = [1, 0, 2];
              const actualIndex = positions.indexOf(index);
              const medals = ['🥈', '🥇', '🥉'];
              const gradients = [
                'from-purple-300 to-purple-500',
                'from-purple-400 to-pink-500',
                'from-pink-400 to-pink-600'
              ];
              
              return (
                <div key={user.rank} className={`flex flex-col items-center ${index === 1 ? 'order-2' : index === 0 ? 'order-1' : 'order-3'}`}>
                  <div className={`w-full bg-gradient-to-t ${gradients[actualIndex]} rounded-t-2xl ${heights[actualIndex]} flex flex-col items-center justify-end pb-4 shadow-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative text-center">
                      <div className="text-4xl mb-2 animate-bounce">{medals[actualIndex]}</div>
                      <p className="text-white font-bold text-sm truncate px-2 max-w-full">{user.username}</p>
                      <p className="text-white/90 text-xs font-semibold">{user.savingsPercentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 h-8 rounded-b-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">#{user.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Rankings */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full"></span>
            Full Rankings
          </h4>
          {leaderboardData.map((user, index) => {
            const badge = user.rank <= 3 
              ? { bg: 'bg-gradient-to-r from-purple-400 to-pink-500', text: 'text-white', icon: ['🥇', '🥈', '🥉'][user.rank - 1] }
              : { bg: 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: `#${user.rank}` };
            
            const streakText = user.daysUnderBudget === 7 ? '🔥 Perfect!' : `${user.daysUnderBudget}/7 days`;
            const isTopThree = user.rank <= 3;

            const getStreakBadge = (streak) => {
              if (streak >= 28) return { text: 'Legendary', color: 'from-purple-500 to-pink-500', icon: '👑' };
              if (streak >= 21) return { text: 'Master', color: 'from-blue-500 to-indigo-500', icon: '⭐' };
              if (streak >= 14) return { text: 'Pro', color: 'from-green-500 to-emerald-500', icon: '💎' };
              if (streak >= 7) return { text: 'Rising', color: 'from-yellow-500 to-orange-500', icon: '🔥' };
              return null;
            };

            const streakBadge = getStreakBadge(user.currentStreak);

            const getRankChangeIndicator = (change) => {
              if (change > 0) return { icon: '↑', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', text: `+${change}` };
              if (change < 0) return { icon: '↓', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', text: `${change}` };
              return { icon: '−', color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700', text: '0' };
            };

            const rankChange = getRankChangeIndicator(user.rankChange);

            return (
              <div
                key={index}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  isTopThree
                    ? 'bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-300/50 dark:border-purple-700/30'
                    : 'bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${badge.bg} ${badge.text} font-bold text-sm flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                  {badge.icon}
                </div>

                <div className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg ${rankChange.bg} flex-shrink-0`}>
                  <span className={`${rankChange.color} text-xs font-bold leading-none`}>{rankChange.icon}</span>
                  <span className={`${rankChange.color} text-[9px] font-semibold leading-none mt-0.5`}>{rankChange.text}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-bold text-gray-900 dark:text-white truncate text-sm">{user.username}</p>
                    
                    {streakBadge && (
                      <span className={`inline-flex items-center text-[10px] font-bold bg-gradient-to-r ${streakBadge.color} text-white px-2 py-0.5 rounded-full shadow-sm`}>
                        {streakBadge.icon} {streakBadge.text}
                      </span>
                    )}
                    
                    {user.daysUnderBudget === 7 && (
                      <span className="inline-flex items-center text-[10px] font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        PERFECT
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {user.savingsPercentage}%
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {streakText}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {user.currentStreak} day streak
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Score</p>
                  <p className="text-base font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {(user.leaderboardScore * 100).toFixed(0)}
                  </p>
                  <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                      style={{ width: `${user.leaderboardScore * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Footer */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💪</span>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Keep Going!</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Rankings update weekly. Stay consistent to reach the top!
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Leaderboard;
