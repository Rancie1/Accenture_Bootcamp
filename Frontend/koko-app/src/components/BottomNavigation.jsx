import { useLocation, useNavigate } from 'react-router-dom';
import { User, Bookmark, ShoppingCart, Trophy } from 'lucide-react';
import KoalaIcon from './KoalaIcon';

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
    { path: '/mascot', icon: KoalaIcon, label: 'Koko', size: 36 },
    { path: '/shop', icon: ShoppingCart, label: 'Shop' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom">
      <div className="flex justify-evenly items-center px-2 py-2 pb-safe">
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px] transition-colors ${
                isActive(tab.path) ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <IconComponent size={tab.size ?? 22} />
              <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
