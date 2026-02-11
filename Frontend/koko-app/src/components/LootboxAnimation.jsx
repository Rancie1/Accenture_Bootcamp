import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * LootboxAnimation Component
 * Displays an animation when opening a lootbox and reveals the won item
 * Requirements: 9.11, 9.12, 9.13
 */

// Helper function to render Lucide icon from string name
const renderIcon = (iconName, size = 64) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.Palette;
  return <IconComponent size={size} />;
};

const LootboxAnimation = ({ wonItem, onClose }) => {
  const [stage, setStage] = useState('opening'); // 'opening' | 'revealing'

  useEffect(() => {
    // After 2 seconds, reveal the item
    const timer = setTimeout(() => {
      setStage('revealing');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Get rarity badge color classes
   */
  const getRarityClasses = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-yellow-400 text-gray-900';
      case 'epic':
        return 'bg-purple-400 text-white';
      case 'rare':
        return 'bg-blue-400 text-white';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
      <div className="text-center">
        {stage === 'opening' && (
          <div className="animate-bounce">
            <div className="w-48 h-48 bg-gradient-to-br from-primary to-purple-700 rounded-3xl animate-pulse flex items-center justify-center mx-auto text-white">
              <Package size={96} />
            </div>
            <p className="text-white text-xl font-bold mt-6 animate-pulse">
              Opening...
            </p>
          </div>
        )}

        {stage === 'revealing' && (
          <div className="animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm">
              <div className="text-gray-900 dark:text-white mb-4 flex justify-center">{renderIcon(wonItem.icon, 64)}</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {wonItem.name}
              </h2>
              <span
                className={`inline-block text-sm px-4 py-2 rounded-full mb-6 ${getRarityClasses(
                  wonItem.rarity
                )}`}
              >
                {wonItem.rarity.toUpperCase()}
              </span>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Added to your collection!
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold active:scale-95 transition-transform"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LootboxAnimation;
