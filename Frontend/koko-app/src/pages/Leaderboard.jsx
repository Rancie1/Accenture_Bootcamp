import { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';

/**
 * Leaderboard Component
 * Displays top 100 users ranked by XP with current user highlight
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
const Leaderboard = () => {
  const { xp, level, userPreferences } = useContext(AppContext);

  // Generate mock leaderboard data (in production, this would come from an API)
  const leaderboardData = useMemo(() => {
    const users = [];
    const currentUserName = userPreferences.name || 'You';
    
    // Generate 100 mock users with varying XP
    // Use deterministic values to avoid impure function calls during render
    for (let i = 0; i < 100; i++) {
      // Generate decreasing XP values for realistic leaderboard
      // Use deterministic calculation based on index
      const variation = (i * 7) % 50; // Deterministic variation
      const mockXp = Math.max(0, 5000 - (i * 45) + variation);
      const mockLevel = Math.floor(mockXp / 100) + 1;
      
      users.push({
        rank: i + 1,
        userName: `User${i + 1}`,
        level: mockLevel,
        xp: mockXp,
        isCurrentUser: false
      });
    }

    // Insert current user into leaderboard based on their XP
    let currentUserRank = users.findIndex(user => user.xp < xp);
    if (currentUserRank === -1) {
      currentUserRank = users.length; // User is below top 100
    }

    const currentUser = {
      rank: currentUserRank + 1,
      userName: currentUserName,
      level: level,
      xp: xp,
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
  }, [xp, level, userPreferences.name]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Leaderboard</h1>
      </div>

      {/* Leaderboard List */}
      <div className="p-4 space-y-2">
        {leaderboardData.topUsers.map((user) => (
          <div
            key={`${user.rank}-${user.userName}`}
            className={`rounded-xl p-4 flex items-center gap-4 ${
              user.isCurrentUser
                ? 'bg-primary/20 dark:bg-primary/30 border-2 border-primary'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            {/* Rank Badge */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                user.rank <= 3
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {user.rank}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {user.userName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Level {user.level}
              </p>
            </div>

            {/* XP Display */}
            <div className="text-right">
              <p className="font-bold text-primary">{user.xp} XP</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current User Position (if not in top 100) */}
      {!leaderboardData.isInTop100 && (
        <div className="fixed bottom-20 left-4 right-4 bg-primary/20 dark:bg-primary/30 border-2 border-primary rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {leaderboardData.currentUserRank}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {userPreferences.name || 'You'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Level {level}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{xp} XP</p>
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
