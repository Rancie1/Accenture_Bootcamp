import { useContext, useMemo, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import BottomNavigation from "../components/BottomNavigation";
import {
  Trophy,
  Info,
  X,
  Share2,
  TrendingUp,
  Award,
  Flame,
  Target,
  ChevronUp,
  ChevronDown,
  Minus,
  User
} from "lucide-react";
import kokoSunglassesChef from "../assets/dlc/koko-sunglasses-chef.PNG";
import kokoScubaChef from "../assets/dlc/koko-scuba-chef.PNG";
import kokoChef from "../assets/dlc/koko-chef.PNG";
import { calculateWeeklySpending } from "../utils/calculations";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    username: "Sarah M.",
    weeklyBudget: 150,
    weeklySpend: 112,
    daysUnderBudget: 7,
    totalDays: 7,
    currentStreak: 21,
    rankChange: 2
  },
  {
    username: "Mike T.",
    weeklyBudget: 200,
    weeklySpend: 145,
    daysUnderBudget: 6,
    totalDays: 7,
    currentStreak: 6,
    rankChange: -1
  },
  {
    username: "Emma L.",
    weeklyBudget: 120,
    weeklySpend: 85,
    daysUnderBudget: 7,
    totalDays: 7,
    currentStreak: 14,
    rankChange: 1
  },
  {
    username: "John D.",
    weeklyBudget: 180,
    weeklySpend: 140,
    daysUnderBudget: 5,
    totalDays: 7,
    currentStreak: 5,
    rankChange: 0
  },
  {
    username: "Lisa K.",
    weeklyBudget: 100,
    weeklySpend: 75,
    daysUnderBudget: 6,
    totalDays: 7,
    currentStreak: 12,
    rankChange: 3
  },
  {
    username: "Tom R.",
    weeklyBudget: 250,
    weeklySpend: 210,
    daysUnderBudget: 4,
    totalDays: 7,
    currentStreak: 4,
    rankChange: -2
  },
  {
    username: "Anna P.",
    weeklyBudget: 160,
    weeklySpend: 115,
    daysUnderBudget: 7,
    totalDays: 7,
    currentStreak: 28,
    rankChange: 1
  },
  {
    username: "Chris W.",
    weeklyBudget: 90,
    weeklySpend: 70,
    daysUnderBudget: 5,
    totalDays: 7,
    currentStreak: 5,
    rankChange: -1
  }
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

  const savingsRate = Math.max(
    0,
    (user.weeklyBudget - user.weeklySpend) / user.weeklyBudget
  );
  const consistencyFactor = user.daysUnderBudget / user.totalDays;
  const leaderboardScore = savingsRate * 0.7 + consistencyFactor * 0.3;
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
const getLeaderboard = (users = sampleLeaderboardUsers) => {
  const usersWithScores = users.map(calculateLeaderboardScore);
  const qualifiedUsers = usersWithScores.filter((u) => !u.disqualified);
  const sortedUsers = qualifiedUsers.sort(
    (a, b) => b.leaderboardScore - a.leaderboardScore
  );

  return sortedUsers.map((user, index) => ({
    ...user,
    rank: index + 1
  }));
};

const Leaderboard = () => {
  const { userPreferences, history, streak } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [backendLeaderboard, setBackendLeaderboard] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  // Calculate user's weekly spending and create their leaderboard entry
  const userLeaderboardData = useMemo(() => {
    if (
      !userPreferences.budget ||
      userPreferences.budget < MINIMUM_BUDGET_THRESHOLD
    ) {
      return null;
    }

    const weeklySpend = calculateWeeklySpending(history);

    // Calculate days under budget (simplified - count shopping trips that were under budget)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekHistory = history.filter(
      (item) => item.timestamp >= weekStart.getTime()
    );
    const daysUnderBudget = thisWeekHistory.filter((item) => {
      const dailyBudget = userPreferences.budget / 7;
      return (item.totalSpent || 0) <= dailyBudget;
    }).length;

    return {
      username: userPreferences.name || "You",
      weeklyBudget: userPreferences.budget,
      weeklySpend: weeklySpend,
      daysUnderBudget: Math.min(daysUnderBudget, 7),
      totalDays: 7,
      currentStreak: streak,
      rankChange: 0,
      isCurrentUser: true
    };
  }, [userPreferences, history, streak]);

  // Fetch leaderboard data from backend
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const response = await fetch(`${API_URL}/leaderboard`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform backend data to frontend format
        // Backend returns: { leaderboard: [{ user_id, username, average_score, rank }] }
        const transformedData = data.leaderboard.map((user) => ({
          username: user.username,
          weeklyBudget: 0, // Not provided by backend
          weeklySpend: 0, // Not provided by backend
          daysUnderBudget: 7, // Not provided by backend
          totalDays: 7,
          currentStreak: 0, // Not provided by backend
          rankChange: 0, // Not provided by backend
          leaderboardScore: user.average_score,
          savingsRate: user.average_score,
          consistencyFactor: user.average_score,
          savingsPercentage: Math.round(user.average_score * 100),
          rank: user.rank,
          disqualified: false,
          isCurrentUser: false
        }));

        setBackendLeaderboard(transformedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setFetchError(error.message);
        // Fall back to sample data on error
        setBackendLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const leaderboardData = useMemo(() => {
    // Use backend data if available, otherwise fall back to sample data
    const baseUsers =
      backendLeaderboard.length > 0
        ? backendLeaderboard
        : sampleLeaderboardUsers.map(calculateLeaderboardScore);
    const allUsers = [...baseUsers];

    // Add user to leaderboard if they qualify (only when using sample data or user not already in backend data)
    if (userLeaderboardData && backendLeaderboard.length === 0) {
      allUsers.push(calculateLeaderboardScore(userLeaderboardData));
    }

    // Sort and rank if not already ranked
    if (backendLeaderboard.length === 0) {
      const qualifiedUsers = allUsers.filter((u) => !u.disqualified);
      const sortedUsers = qualifiedUsers.sort(
        (a, b) => b.leaderboardScore - a.leaderboardScore
      );
      return sortedUsers.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    }

    return allUsers;
  }, [userLeaderboardData, backendLeaderboard]);

  const handleShare = (user) => {
    setSelectedUser(user);
    setShowShareModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-nav-safe font-sans relative">
        {/* Blurred background UI */}
        <div className="blur-sm pointer-events-none">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-2xl blur-xl opacity-50"></div>
                <div className="relative p-3 bg-primary rounded-2xl shadow-lg">
                  <Trophy size={32} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  Top Savers Leaderboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                  Live weekly rankings
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            {/* Placeholder cards */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6 h-20"></div>
            <div className="mb-6 space-y-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 h-24"></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 h-24"></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 h-24"></div>
            </div>
          </div>
        </div>

        {/* Loading spinner overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-primary">
              Loading Leaderboard...
            </p>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-nav-safe font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative p-3 bg-primary rounded-2xl shadow-lg">
              <Trophy size={32} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Top Savers Leaderboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              {backendLeaderboard.length > 0
                ? "Live from database"
                : "Demo data"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Error message if backend fetch failed */}
        {fetchError && backendLeaderboard.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 mb-4 border border-yellow-200 dark:border-yellow-800 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg shrink-0">
                <Info
                  size={18}
                  className="text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold mb-1">
                  Could not load live leaderboard
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Showing demo data instead. Check backend connection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ranking Info Tooltip */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-6 border border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg shrink-0">
              <Info size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold mb-1.5 flex items-center gap-2">
                <Target
                  size={16}
                  className="text-blue-600 dark:text-blue-400"
                />
                Fair Ranking System
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                We rank by{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  savings rate + consistency
                </span>
                . Save more and stay under budget daily to climb higher. Min. $
                {MINIMUM_BUDGET_THRESHOLD}/week budget prevents gaming.
              </p>
            </div>
          </div>
        </div>

        {/* User's Rank Card */}
        {userLeaderboardData &&
          leaderboardData.find((u) => u.isCurrentUser) && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                <User size={16} className="text-primary" />
                Your Rank
              </h4>
              {(() => {
                const currentUser = leaderboardData.find(
                  (u) => u.isCurrentUser
                );
                const isTopThree = currentUser.rank <= 3;

                return (
                  <div className="bg-primary/10 dark:bg-primary/20 border-2 border-primary rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-bold text-lg shadow-md">
                        #{currentUser.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {currentUser.username}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isTopThree
                            ? "🎉 You're in the top 3!"
                            : "Keep going to reach the top!"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                          Score
                        </p>
                        <p className="text-2xl font-extrabold text-primary">
                          {(currentUser.leaderboardScore * 100).toFixed(0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Savings
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                          <TrendingUp size={16} />
                          {currentUser.savingsPercentage}%
                        </p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          This Week
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {currentUser.daysUnderBudget}/7
                        </p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Streak
                        </p>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                          <Flame size={16} />
                          {currentUser.currentStreak}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${currentUser.leaderboardScore * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        {/* Message if user doesn't qualify */}
        {userLeaderboardData === null && userPreferences.budget > 0 && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info
                size={20}
                className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Budget Too Low
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Set a weekly budget of at least ${MINIMUM_BUDGET_THRESHOLD} in
                  Settings to join the leaderboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Podium for Top 3 */}
        <div className="mb-6">
          <div className="flex items-end justify-center gap-2 mb-4 max-w-full">
            {leaderboardData.slice(0, 3).map((user, index) => {
              const heights = ["h-44", "h-56", "h-36"];
              const widths = "w-28";
              const displayOrder = index === 0 ? 1 : index === 1 ? 0 : 2;
              const colors = ["bg-primary", "bg-blue-500", "bg-indigo-500"];

              // Assign different mascot images to top 3
              const mascotImages = [
                kokoSunglassesChef,
                kokoScubaChef,
                kokoChef
              ];

              return (
                <div
                  key={user.rank}
                  className={`flex flex-col items-center ${index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3"}`}
                >
                  <div
                    className={`${widths} ${colors[index]} rounded-t-3xl ${heights[displayOrder]} flex flex-col items-center justify-center py-4 shadow-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative text-center z-10">
                      <div className="mb-2 flex justify-center">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center relative"
                          style={{ backgroundColor: "#845EEE" }}
                        >
                          <img
                            src={mascotImages[index]}
                            alt={`${user.username} mascot`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <p className="text-white font-bold text-xs truncate px-2 max-w-full drop-shadow-lg">
                        {user.username}
                      </p>
                      <p className="text-white/90 text-xs font-semibold mt-1">
                        {user.savingsPercentage}%
                      </p>
                    </div>
                  </div>
                  <div
                    className={`${widths} bg-gray-200 dark:bg-gray-700 h-10 rounded-b-2xl flex items-center justify-center shadow-md`}
                  >
                    <span className="text-base font-bold text-gray-700 dark:text-gray-300">
                      #{user.rank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Rankings */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            Full Rankings
          </h4>
          {leaderboardData.map((user, index) => {
            const isTopThree = user.rank <= 3;
            const isCurrentUser = user.isCurrentUser;

            const getMedalIcon = (rank) => {
              if (rank === 1)
                return <Award size={20} className="text-yellow-500" />;
              if (rank === 2)
                return <Award size={20} className="text-gray-400" />;
              if (rank === 3)
                return <Award size={20} className="text-orange-600" />;
              return <span className="text-sm font-bold">#{rank}</span>;
            };

            const getRankChangeIndicator = (change) => {
              if (change > 0)
                return {
                  icon: <ChevronUp size={14} />,
                  color: "text-green-500",
                  bg: "bg-green-100 dark:bg-green-900/30",
                  text: `+${change}`
                };
              if (change < 0)
                return {
                  icon: <ChevronDown size={14} />,
                  color: "text-red-500",
                  bg: "bg-red-100 dark:bg-red-900/30",
                  text: `${change}`
                };
              return {
                icon: <Minus size={14} />,
                color: "text-gray-400",
                bg: "bg-gray-100 dark:bg-gray-700",
                text: "0"
              };
            };

            const rankChange = getRankChangeIndicator(user.rankChange);

            return (
              <div
                key={index}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  isCurrentUser
                    ? "bg-primary/10 dark:bg-primary/20 border-2 border-primary shadow-md"
                    : isTopThree
                      ? "bg-blue-50/80 dark:bg-blue-900/10 border-blue-300/50 dark:border-blue-700/30"
                      : "bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/70"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg ${isCurrentUser ? "bg-primary" : isTopThree ? "bg-primary/30" : "bg-gray-200 dark:bg-gray-700"} ${isCurrentUser || isTopThree ? "text-white" : "text-gray-700 dark:text-gray-300"} font-bold text-sm shrink-0 shadow-md group-hover:scale-110 transition-transform`}
                >
                  {isCurrentUser ? <User size={20} /> : getMedalIcon(user.rank)}
                </div>

                <div
                  className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg ${rankChange.bg} shrink-0`}
                >
                  <span className={`${rankChange.color} leading-none`}>
                    {rankChange.icon}
                  </span>
                  <span
                    className={`${rankChange.color} text-[9px] font-semibold leading-none mt-0.5`}
                  >
                    {rankChange.text}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className={`font-bold truncate text-sm ${isCurrentUser ? "text-primary" : "text-gray-900 dark:text-white"}`}
                    >
                      {user.username}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs">(You)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <div className="flex items-center gap-1">
                      <TrendingUp
                        size={12}
                        className="text-green-600 dark:text-green-400"
                      />
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {user.savingsPercentage}%
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {user.daysUnderBudget}/7 days
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Flame size={12} className="text-orange-500" />
                      {user.currentStreak} streak
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                      Score
                    </p>
                    <p
                      className={`text-base font-extrabold ${isCurrentUser ? "text-primary" : "text-primary"}`}
                    >
                      {(user.leaderboardScore * 100).toFixed(0)}
                    </p>
                    <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${user.leaderboardScore * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(user)}
                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all active:scale-95 self-center"
                    aria-label={`Share ${user.username}'s achievement`}
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Footer */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-primary" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Keep Going!
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Rankings update weekly. Stay consistent to reach the top!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl transform animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Share2
                    size={24}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Share Achievement!
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy size={32} className="text-primary" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedUser.username}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rank #{selectedUser.rank}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Savings
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {selectedUser.savingsPercentage}%
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Streak
                    </p>
                    <p className="text-lg font-bold text-primary flex items-center gap-1">
                      <Flame size={18} className="text-orange-500" />
                      {selectedUser.currentStreak}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Share this amazing achievement and inspire others to save
                smarter!
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <Info
                    size={16}
                    className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
                  />
                  <span>
                    <span className="font-semibold">Tip:</span> Sharing success
                    stories motivates the community to reach their savings
                    goals!
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Share functionality would open here!");
                  setShowShareModal(false);
                }}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Share Now
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default Leaderboard;
