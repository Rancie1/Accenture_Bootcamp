import { useLocation, useNavigate } from 'react-router-dom';
import { User, Bookmark, ShoppingCart, Sparkles, Trophy } from 'lucide-react';

/**
 * BottomNavigation Component
 * Five-tab navigation bar displayed at the bottom of main pages
 * Requirements: 10.1, 10.2, 10.5
 */
const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/dashboard', icon: User, label: 'Profile' },
    { path: '/saved', icon: Bookmark, label: 'Saved' },
    { path: '/shop', icon: ShoppingCart, label: 'Shop' },
    { path: '/mascot', icon: Sparkles, label: 'Mascot' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                isActive(tab.path) ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <IconComponent size={24} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
