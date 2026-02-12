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
    { path: '/mascot', icon: KoalaIcon, label: 'Koko', size: 32 },
    { path: '/shop', icon: ShoppingCart, label: 'Shop' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-center pb-safe z-50 pointer-events-none">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-full shadow-2xl mx-4 mb-4 pointer-events-auto border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-around px-3 py-2 gap-1">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2.5 rounded-full transition-all duration-300 ${
                  active 
                    ? 'bg-primary text-white shadow-lg scale-105' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:scale-105'
                }`}
              >
                <IconComponent size={tab.size ?? 22} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[9px] font-semibold leading-tight ${active ? 'opacity-100' : 'opacity-70'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
