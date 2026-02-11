import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import LootboxAnimation from '../components/LootboxAnimation';
import MascotPreview from '../components/MascotPreview';
import { Flame } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * Mascot Component
 * Displays mascot customization page with three tabs: Customize, Shop, and Lootbox
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.14
 */

// Helper function to render emoji or Lucide icon
const renderIcon = (icon, size = 32) => {
  // If it's already an emoji (single character or emoji), render it directly
  if (typeof icon === 'string' && icon.length <= 4) {
    return <span style={{ fontSize: `${size}px` }}>{icon}</span>;
  }
  // Otherwise, try to render as Lucide icon
  const IconComponent = LucideIcons[icon] || LucideIcons.Palette;
  return <IconComponent size={size} />;
};

const Mascot = () => {
  const { 
    xp, 
    setXp, 
    streak,
    streakSavers, 
    setStreakSavers, 
    mascotItems, 
    setMascotItems, 
    equippedItems, 
    setEquippedItems
  } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('customize'); // 'customize' | 'shop' | 'lootbox'
  const [showLootboxAnimation, setShowLootboxAnimation] = useState(false);
  const [wonItem, setWonItem] = useState(null);

  // Premium items available from lootbox
  const premiumItems = [
    // Rare items (60% chance)
    { id: "premium_hat1", name: "Wizard Hat", type: "hat", rarity: "rare", icon: "Wand2", emoji: "🧙", isPremium: true },
    { id: "premium_hat2", name: "Pirate Hat", type: "hat", rarity: "rare", icon: "Anchor", emoji: "🏴‍☠️", isPremium: true },
    { id: "premium_acc1", name: "Monocle", type: "accessory", rarity: "rare", icon: "Glasses", emoji: "🧐", isPremium: true },
    { id: "premium_acc3", name: "Scarf", type: "accessory", rarity: "rare", icon: "Wind", emoji: "🧣", isPremium: true },
    
    // Epic items (30% chance)
    { id: "premium_hat3", name: "Dragon Helm", type: "hat", rarity: "epic", icon: "Flame", emoji: "🐉", isPremium: true },
    { id: "premium_acc2", name: "Magic Wand", type: "accessory", rarity: "epic", icon: "Sparkles", emoji: "✨", isPremium: true },
    { id: "premium_hat5", name: "Chef Hat", type: "hat", rarity: "epic", icon: "ChefHat", emoji: "👨‍🍳", isPremium: true },
    
    // Legendary items (10% chance)
    { id: "premium_hat4", name: "Cosmic Crown", type: "hat", rarity: "legendary", icon: "Crown", emoji: "👑", isPremium: true },
    { id: "premium_acc4", name: "Laurel Wreath", type: "accessory", rarity: "legendary", icon: "Award", emoji: "🏆", isPremium: true }
  ];

  // Shop items available for purchase
  const shopItems = [
    { 
      id: "streaksaver", 
      name: "Streak Saver", 
      type: "utility", 
      rarity: "special", 
      cost: 50, 
      icon: "Shield",
      description: "Protect your streak once" 
    },
    { 
      id: "hat1", 
      name: "Party Hat", 
      type: "hat", 
      rarity: "common", 
      cost: 50, 
      icon: "PartyPopper",
      emoji: "🎉"
    },
    { 
      id: "hat2", 
      name: "Crown", 
      type: "hat", 
      rarity: "rare", 
      cost: 150, 
      icon: "Crown",
      emoji: "👑"
    },
    { 
      id: "acc1", 
      name: "Sunglasses", 
      type: "accessory", 
      rarity: "common", 
      cost: 75, 
      icon: "Glasses",
      emoji: "😎"
    },
    { 
      id: "acc2", 
      name: "Bow Tie", 
      type: "accessory", 
      rarity: "rare", 
      cost: 100, 
      icon: "Ribbon",
      emoji: "🎀"
    },
    { 
      id: "hat3", 
      name: "Top Hat", 
      type: "hat", 
      rarity: "rare", 
      cost: 200, 
      icon: "Sparkles",
      emoji: "🎩"
    }
  ];

  /**
   * Handle purchasing an item from the shop
   * Requirements: 9.8, 9.9, 9.10
   */
  const handlePurchaseItem = (item) => {
    if (item.type === 'utility' && item.id === 'streaksaver') {
      // Purchase streak saver
      if (xp >= item.cost) {
        setXp(xp - item.cost);
        setStreakSavers(streakSavers + 1);
      }
    } else {
      // Purchase mascot item
      if (xp >= item.cost && !mascotItems.find(i => i.id === item.id)) {
        setXp(xp - item.cost);
        setMascotItems([...mascotItems, { ...item, isPremium: false }]);
      }
    }
  };

  /**
   * Check if an item is already owned
   */
  const isItemOwned = (itemId) => {
    return mascotItems.some(item => item.id === itemId);
  };

  /**
   * Open a lootbox and get a random premium item
   * Requirements: 9.11, 9.12, 9.13
   */
  const openLootbox = () => {
    // Rarity distribution: 60% rare, 30% epic, 10% legendary
    const roll = Math.random();
    let rarity;
    
    if (roll < 0.10) {
      rarity = "legendary";
    } else if (roll < 0.40) {
      rarity = "epic";
    } else {
      rarity = "rare";
    }

    // Get items of the selected rarity
    const itemsOfRarity = premiumItems.filter(item => item.rarity === rarity);
    
    // Select a random item from that rarity
    const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
    
    // Add to mascot items if not already owned
    if (!isItemOwned(randomItem.id)) {
      setMascotItems([...mascotItems, randomItem]);
    }
    
    setWonItem(randomItem);
    setShowLootboxAnimation(true);
  };

  /**
   * Handle lootbox purchase (simulated IAP)
   * Requirements: 9.12
   */
  const handlePurchaseLootbox = () => {
    // In a real app, this would trigger the IAP flow
    // For now, we'll simulate it
    const confirmed = window.confirm('Purchase lootbox for $0.99?');
    if (confirmed) {
      openLootbox();
    }
  };

  /**
   * Close lootbox animation
   */
  const closeLootboxAnimation = () => {
    setShowLootboxAnimation(false);
    setWonItem(null);
  };

  /**
   * Handle equipping/unequipping an item
   * Requirements: 9.6
   */
  const handleEquipItem = (item) => {
    const itemType = item.type;
    const currentlyEquipped = equippedItems[itemType];

    if (currentlyEquipped === item.id) {
      // Unequip if already equipped
      setEquippedItems({
        ...equippedItems,
        [itemType]: null
      });
    } else {
      // Equip the item
      setEquippedItems({
        ...equippedItems,
        [itemType]: item.id
      });
    }
  };

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
        return 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-gray-50 dark:from-primary/20 dark:to-gray-900 pb-24">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 shadow-sm">
        {/* XP Balance and Streak */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">XP Balance</p>
            <p className="text-xl font-bold text-primary">{xp} XP</p>
          </div>
          <div className="bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-full flex items-center gap-2">
            <Flame className="text-primary" size={20} />
            <span className="text-primary font-medium">{streak} day streak</span>
          </div>
        </div>

        {/* Mascot Preview */}
        <div className="flex justify-center mb-6">
          <MascotPreview 
            equippedItems={equippedItems}
            mascotItems={mascotItems}
            size="large"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('customize')}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'customize'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Customize
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'shop'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Shop
          </button>
          <button
            onClick={() => setActiveTab('lootbox')}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === 'lootbox'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Lootbox
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'customize' && (
          <div>
            {mascotItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-2">No items yet!</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Visit the Shop tab to purchase items
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {mascotItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleEquipItem(item)}
                    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center transition-all hover:scale-102 ${
                      equippedItems[item.type] === item.id
                        ? 'ring-2 ring-primary shadow-lg'
                        : ''
                    }`}
                  >
                    <div className="flex justify-center items-center text-gray-900 dark:text-white mb-2">{renderIcon(item.icon, 32)}</div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate mb-1">
                      {item.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getRarityClasses(
                        item.rarity
                      )}`}
                    >
                      {item.rarity}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'shop' && (
          <div className="grid grid-cols-2 gap-4">
            {shopItems.map((item) => {
              const canAfford = xp >= item.cost;
              const owned = item.type !== 'utility' && isItemOwned(item.id);
              const disabled = !canAfford || owned;

              return (
                <div
                  key={item.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-md"
                >
                  <div className="text-center mb-3">
                    <div className="flex justify-center items-center text-gray-900 dark:text-white">{renderIcon(item.icon, 32)}</div>
                    <p className="font-medium text-gray-900 dark:text-white mt-2">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.type !== 'utility' && (
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${getRarityClasses(
                          item.rarity
                        )}`}
                      >
                        {item.rarity}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handlePurchaseItem(item)}
                    disabled={disabled}
                    className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
                      disabled
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 opacity-50 cursor-not-allowed'
                        : 'bg-primary text-white active:scale-95'
                    }`}
                  >
                    {owned ? 'Owned' : `${item.cost} XP`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === 'lootbox' && (
          <div className="flex flex-col items-center py-8">
            <div className="relative mb-6">
              <div className="w-48 h-48 bg-gradient-to-br from-primary to-purple-700 rounded-3xl animate-pulse flex items-center justify-center shadow-2xl">
                <span className="text-9xl">📦</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Mystery Lootbox
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Get a random premium item!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              60% Rare • 30% Epic • 10% Legendary
            </p>
            <button
              onClick={handlePurchaseLootbox}
              className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform hover:bg-primary/90"
            >
              Purchase for $0.99
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Lootbox Animation Modal */}
      {showLootboxAnimation && wonItem && (
        <LootboxAnimation wonItem={wonItem} onClose={closeLootboxAnimation} />
      )}
    </div>
  );
};

export default Mascot;
