import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import LootboxAnimation from '../components/LootboxAnimation';
import MascotPreview from '../components/MascotPreview';
import * as LucideIcons from 'lucide-react';
import lootboxLocked from '../assets/lootbox-locked.png';
import lootboxUnlocked from '../assets/lootbox-unlocked.png';

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
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Premium items available from lootbox
  const premiumItems = [
    { id: "sunglasses", name: "Cool Sunglasses", type: "costume", rarity: "rare", icon: "Glasses", emoji: "😎", isPremium: true, image: "koko-sunglasses.PNG" },
    { id: "scuba", name: "Scuba Gear", type: "costume", rarity: "rare", icon: "Waves", emoji: "🤿", isPremium: true, image: "koko-scuba.PNG" },
    { id: "chef", name: "Chef Hat", type: "costume", rarity: "rare", icon: "ChefHat", emoji: "👨‍🍳", isPremium: true, image: "koko-chef.PNG" },
    { id: "crown", name: "Royal Crown", type: "costume", rarity: "legendary", icon: "Crown", emoji: "👑", isPremium: true, image: "koko-crown.png" }
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
      id: "chef", 
      name: "Chef Hat", 
      type: "costume", 
      rarity: "rare", 
      cost: 150, 
      icon: "ChefHat",
      emoji: "👨‍🍳",
      image: "koko-chef.PNG"
    },
    { 
      id: "sunglasses", 
      name: "Cool Sunglasses", 
      type: "costume", 
      rarity: "rare", 
      cost: 150, 
      icon: "Glasses",
      emoji: "😎",
      image: "koko-sunglasses.PNG"
    },
    { 
      id: "scuba", 
      name: "Scuba Gear", 
      type: "costume", 
      rarity: "rare", 
      cost: 150, 
      icon: "Waves",
      emoji: "🤿",
      image: "koko-scuba.PNG"
    },
    { 
      id: "crown", 
      name: "Royal Crown", 
      type: "costume", 
      rarity: "legendary", 
      cost: 500, 
      icon: "Crown",
      emoji: "👑",
      image: "koko-crown.png"
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
    // Get items that are not yet owned
    const unownedItems = premiumItems.filter(item => !isItemOwned(item.id));
    
    if (unownedItems.length === 0) {
      return; // No items left to win
    }
    
    // Select a random item from unowned items
    const randomItem = unownedItems[Math.floor(Math.random() * unownedItems.length)];
    
    // Add to mascot items
    setMascotItems([...mascotItems, randomItem]);
    
    setWonItem(randomItem);
    setShowLootboxAnimation(true);
  };

  /**
   * Check if all lootbox items are owned
   */
  const isLootboxOutOfStock = () => {
    return premiumItems.every(item => isItemOwned(item.id));
  };

  /**
   * Handle lootbox purchase (simulated IAP)
   * Requirements: 9.12
   */
  const handlePurchaseLootbox = () => {
    setShowPurchaseModal(true);
  };

  /**
   * Confirm lootbox purchase
   */
  const confirmPurchase = () => {
    setShowPurchaseModal(false);
    openLootbox();
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
  const handleEquipItem = (item, category) => {
    setEquippedItems(prev => {
      const newEquipped = { ...prev };
      
      // Toggle the item in its category
      if (newEquipped[category] === item.id) {
        newEquipped[category] = null;
      } else {
        newEquipped[category] = item.id;
      }
      
      // Determine the combined costume based on equipped items
      const eyewear = newEquipped.eyewear;
      const headwear = newEquipped.headwear;
      
      // Map combinations to costume IDs
      if (eyewear && headwear) {
        // Both equipped - use combination
        if (eyewear === 'sunglasses' && headwear === 'chef') {
          newEquipped.costume = 'sunglasses_chef';
        } else if (eyewear === 'scuba' && headwear === 'chef') {
          newEquipped.costume = 'scuba_chef';
        } else if (eyewear === 'sunglasses' && headwear === 'crown') {
          newEquipped.costume = 'sunglasses_crown';
        } else if (eyewear === 'scuba' && headwear === 'crown') {
          newEquipped.costume = 'scuba_crown';
        }
      } else if (eyewear && !headwear) {
        // Only eyewear
        newEquipped.costume = eyewear;
      } else if (!eyewear && headwear) {
        // Only headwear
        newEquipped.costume = headwear;
      } else {
        // Nothing equipped
        newEquipped.costume = null;
      }
      
      return newEquipped;
    });
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-nav-safe">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 shadow-sm">
        {/* XP Balance and Streak */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">XP Balance</p>
            <p className="text-xl font-bold text-primary">{xp} XP</p>
          </div>
          <div className="bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-full flex items-center gap-1">
            <LucideIcons.Flame className="text-primary" size={20} />
            <span className="text-primary font-medium">{streak}</span>
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
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('customize')}
            className={`flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2 rounded-lg ${
              activeTab === 'customize'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <LucideIcons.Palette size={16} />
            <span>Customise</span>
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2 rounded-lg ${
              activeTab === 'shop'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <LucideIcons.ShoppingCart size={16} />
            <span>Shop</span>
          </button>
          <button
            onClick={() => setActiveTab('lootbox')}
            className={`flex-1 py-3 px-4 font-medium transition-all flex items-center justify-center gap-2 rounded-lg ${
              activeTab === 'lootbox'
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <LucideIcons.Gift size={16} />
            <span>Lootbox</span>
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
              <div className="space-y-6">
                {/* Eyewear Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <LucideIcons.Glasses size={20} className="text-primary" />
                    Eyewear
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {mascotItems
                      .filter(item => ['sunglasses', 'scuba'].includes(item.id))
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleEquipItem(item, 'eyewear')}
                          className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center transition-all hover:scale-102 ${
                            equippedItems.eyewear === item.id
                              ? 'ring-2 ring-primary shadow-lg'
                              : ''
                          }`}
                        >
                          <div className="flex justify-center items-center text-gray-900 dark:text-white mb-2">
                            {renderIcon(item.icon, 32)}
                          </div>
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
                    {mascotItems.filter(item => ['sunglasses', 'scuba'].includes(item.id)).length === 0 && (
                      <div className="col-span-3 text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                        No eyewear items yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Headwear Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <LucideIcons.ChefHat size={20} className="text-primary" />
                    Headwear
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {mascotItems
                      .filter(item => ['chef', 'crown'].includes(item.id))
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleEquipItem(item, 'headwear')}
                          className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center transition-all hover:scale-102 ${
                            equippedItems.headwear === item.id
                              ? 'ring-2 ring-primary shadow-lg'
                              : ''
                          }`}
                        >
                          <div className="flex justify-center items-center text-gray-900 dark:text-white mb-2">
                            {renderIcon(item.icon, 32)}
                          </div>
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
                    {mascotItems.filter(item => ['chef', 'crown'].includes(item.id)).length === 0 && (
                      <div className="col-span-3 text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                        No headwear items yet
                      </div>
                    )}
                  </div>
                </div>
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
          <div className="max-w-md mx-auto">
            {/* Main Lootbox Card */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden mb-4">
              {/* Lootbox Image Section */}
              <div className="bg-gradient-to-br from-primary/80 to-purple-500/5 p-8 flex justify-center">
                <div className="w-40 h-40">
                  <img 
                    src={isLootboxOutOfStock() ? lootboxUnlocked : lootboxLocked} 
                    alt={isLootboxOutOfStock() ? "Unlocked Lootbox" : "Locked Lootbox"}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                {/* Title and Description */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Mystery Lootbox
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get a random premium item!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Win exclusive costumes for Koko!
                  </p>
                </div>

                {/* Drop Rates Card */}
                <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl p-4 border border-primary/20">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Available Items:
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cool Sunglasses</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Rare</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Scuba Gear</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Rare</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Chef Hat</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Rare</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Royal Crown</span>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">Legendary</span>
                    </div>
                  </div>
                </div>

                {/* Items Remaining */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {premiumItems.length - mascotItems.filter(item => item.isPremium).length} / {premiumItems.length} items remaining
                  </p>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={handlePurchaseLootbox}
                  disabled={isLootboxOutOfStock()}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                    isLootboxOutOfStock()
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-purple-600 text-white active:scale-95 hover:shadow-xl'
                  }`}
                >
                  {isLootboxOutOfStock() ? 'All items Unlocked' : 'Purchase for $0.99'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Lootbox Animation Modal */}
      {showLootboxAnimation && wonItem && (
        <LootboxAnimation wonItem={wonItem} onClose={closeLootboxAnimation} />
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl transform animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <img 
                  src={lootboxLocked} 
                  alt="Lootbox"
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Purchase Lootbox?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get a random premium item for your mascot!
              </p>
              <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-4 mb-4 border border-primary/20">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-semibold">Potentially contains:</span>
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Chef Koko Costume</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">Epic</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Scuba Koko Costume</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Rare</span>
                  </div>
                  <div className="text-center pt-1">
                    <span className="text-gray-500 dark:text-gray-400 italic">...and more!</span>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3 mb-4">
                <p className="text-3xl font-bold text-primary">$0.99</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mascot;
