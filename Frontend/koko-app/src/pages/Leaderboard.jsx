import { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import { calculateWeeklySpending, calculateSavingsScore } from '../utils/calculations';
import { Trophy, TrendingUp } from 'lucide-react';

/**
 * Leaderboard Component
 * Displays top 100 users ranked by budget remaining percentage with current user highlight
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
const Leaderboard = () => {
  const { userPreferences, history } = useContext(AppContext);

  // Calculate current user's weekly spending and savings score
  const weeklySpending = useMemo(() => calculateWeeklySpending(history), [history]);
  const userBudget = userPreferences.budget || 100;
  const userSavingsScore = useMemo(() => calculateSavingsScore(userBudget, weeklySpending), [userBudget, weeklySpending]);

  // Generate mock leaderboard data (in production, this would come from an API)
  const leaderboardData = useMemo(() => {
    const users = [];
    const currentUserName = userPreferences.name || 'You';
    
    // Generate 100 mock users with varying percentage scores
    for (let i = 0; i < 100; i++) {
      // Generate decreasing percentage scores for realistic leaderboard
      const variation = (i * 7) % 15; // Deterministic variation
      const mockPercentage = Math.max(0, Math.min(100, 95 - (i * 0.8) + variation));
      
      users.push({
        rank: i + 1,
        userName: `User${i + 1}`,
        savingsScore: mockPercentage,
        isCurrentUser: false
      });
    }

    // Sort by savings score (highest first)
    users.sort((a, b) => b.savingsScore - a.savingsScore);

    // Insert current user into leaderboard based on their savings score
    let currentUserRank = users.findIndex(user => user.savingsScore < userSavingsScore);
    if (currentUserRank === -1) {
      currentUserRank = users.length; // User is below top 100
    }

    const currentUser = {
      rank: currentUserRank + 1,
      userName: currentUserName,
      savingsScore: userSavingsScore,
      isCurrentUser: true
    };

    // If user is in top 100, replace that position
    if (currentUserRank < 100) {
      users.splice(currentUserRank, 0, currentUser);
      users.pop(); // Remove last user to keep it at 100
      
      // Update ranks for users after current user
      for (let i = currentUserRank + 1; i < users.length; i++) {
        users[i].rank = i + 1;
      }
    }

    return {
      topUsers: users.slice(0, 100),
      currentUserRank: currentUserRank + 1,
      isInTop100: currentUserRank < 100
    };
  }, [userSavingsScore, userPreferences.name]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-gray-50 dark:from-primary/20 dark:to-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 shadow-sm sticky top-0 z-10 animate-fade-in">
        <div className="flex items-center mb-2 ml-2">
          <Trophy className="text-primary animate-bounce-slow" size={28} />
          <h1 className="text-2xl font-bold text-primary">Budget Challenge</h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Top budgeters this week • The higher per cent saved, the higher you climb the ranks.
        </p>
      </div>

      {/* Current User Stats Card */}
      <div className="mx-4 mt-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-primary/30 shadow-lg animate-fade-in">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Your Weekly Performance</p>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - userSavingsScore / 100)}`}
                className="text-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-primary">{userSavingsScore.toFixed(1)}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-4 space-y-2">
        {leaderboardData.topUsers.map((user, index) => (
          <div
            key={`${user.rank}-${user.userName}`}
            style={{ animationDelay: `${index * 0.05}s` }}
            className={`rounded-xl p-4 flex items-center gap-4 animate-fade-in ${
              user.isCurrentUser
                ? 'bg-primary/20 dark:bg-primary/30 border-2 border-primary shadow-lg scale-105'
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-102 transition-transform'
            }`}
          >
            {/* Rank Badge */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                user.rank <= 3
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {user.rank}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {user.userName}
              </p>
              <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${user.savingsScore}%` }}
                />
              </div>
            </div>

            {/* Score Display */}
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1">
                <TrendingUp size={16} className="text-primary" />
                <p className="font-bold text-primary text-xl">{user.savingsScore.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Current User Position (if not in top 100) */}
      {!leaderboardData.isInTop100 && (
        <div className="fixed bottom-20 left-4 right-4 bg-primary/20 dark:bg-primary/30 border-2 border-primary rounded-xl p-4 shadow-lg backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shrink-0">
              {leaderboardData.currentUserRank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {userPreferences.name || 'You'}
              </p>
              <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${userSavingsScore}%` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1">
                <TrendingUp size={16} className="text-primary" />
                <p className="font-bold text-primary text-lg">{userSavingsScore.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Leaderboard;
