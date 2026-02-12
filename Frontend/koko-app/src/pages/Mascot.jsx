import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import LootboxAnimation from '../components/LootboxAnimation';
import MascotPreview from '../components/MascotPreview';
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
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Premium items available from lootbox
  const premiumItems = [
    // Rare items (60% chance - basic costumes)
    { id: "premium_chef", name: "Chef Hat", type: "costume", rarity: "rare", icon: "ChefHat", emoji: "👨‍🍳", isPremium: true, image: "koko-chef.PNG" },
    { id: "premium_sunglasses", name: "Cool Sunglasses", type: "costume", rarity: "rare", icon: "Glasses", emoji: "😎", isPremium: true, image: "koko-sunglasses.PNG" },
    { id: "premium_scuba", name: "Scuba Gear", type: "costume", rarity: "rare", icon: "Waves", emoji: "🤿", isPremium: true, image: "koko-scuba.PNG" },
    
    // Legendary items (40% chance - combo costumes)
    { id: "premium_sunglasses_chef", name: "Chef with Sunglasses", type: "costume", rarity: "legendary", icon: "Sparkles", emoji: "😎👨‍🍳", isPremium: true, image: "koko-sunglasses-chef.PNG" },
    { id: "premium_scuba_chef", name: "Scuba Chef", type: "costume", rarity: "legendary", icon: "Crown", emoji: "🤿👨‍🍳", isPremium: true, image: "koko-scuba-chef.PNG" }
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
      id: "sunglasses_chef", 
      name: "Chef with Sunglasses", 
      type: "costume", 
      rarity: "legendary", 
      cost: 350, 
      icon: "Sparkles",
      emoji: "😎👨‍🍳",
      image: "koko-sunglasses-chef.PNG"
    },
    { 
      id: "scuba_chef", 
      name: "Scuba Chef", 
      type: "costume", 
      rarity: "legendary", 
      cost: 350, 
      icon: "Crown",
      emoji: "🤿👨‍🍳",
      image: "koko-scuba-chef.PNG"
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
    
    // Rarity-based selection: 60% rare, 40% legendary
    const roll = Math.random();
    let targetRarity;
    
    if (roll < 0.60) {
      targetRarity = "rare";
    } else {
      targetRarity = "legendary";
    }
    
    // Filter unowned items by target rarity
    const unownedOfRarity = unownedItems.filter(item => item.rarity === targetRarity);
    
    // If no items of target rarity available, pick from any unowned
    const itemPool = unownedOfRarity.length > 0 ? unownedOfRarity : unownedItems;
    
    // Select a random item from the pool
    const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
    
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
  const handleEquipItem = (item) => {
    // For costume type, only one can be equipped at a time (replaces entire image)
    if (item.type === 'costume') {
      if (equippedItems.costume === item.id) {
        // Unequip if already equipped
        setEquippedItems({ costume: null });
      } else {
        // Equip the costume (replaces all other items)
        setEquippedItems({ costume: item.id });
      }
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
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-gray-50 dark:from-primary/20 dark:to-gray-900 pb-24-safe">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-6 shadow-sm">
        {/* XP Balance and Streak */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">XP Balance</p>
            <p className="text-xl font-bold text-primary">{xp} XP</p>
          </div>
          <div className="bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-full flex items-center gap-2">
            <LucideIcons.Flame className="text-primary" size={20} />
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
            className={`flex-1 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'customize'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <LucideIcons.Palette size={16} />
            <span>Customise</span>
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'shop'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <LucideIcons.ShoppingCart size={16} />
            <span>Shop</span>
          </button>
          <button
            onClick={() => setActiveTab('lootbox')}
            className={`flex-1 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'lootbox'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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
              <div className="grid grid-cols-3 gap-4">
                {mascotItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleEquipItem(item)}
                    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center transition-all hover:scale-102 ${
                      equippedItems.costume === item.id
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
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
              Win exclusive costumes for Koko!
            </p>
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl p-3 mb-4 border border-primary/20">
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                <span className="font-semibold">Drop Rates:</span>
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rare Items</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Legendary Combos</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">40%</span>
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-6">
              {premiumItems.length - mascotItems.filter(item => item.isPremium).length} / {premiumItems.length} items remaining
            </p>
            <button
              onClick={handlePurchaseLootbox}
              disabled={isLootboxOutOfStock()}
              className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-transform ${
                isLootboxOutOfStock()
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white active:scale-95 hover:bg-primary/90'
              }`}
            >
              {isLootboxOutOfStock() ? 'Out of Stock' : 'Purchase for $0.99'}
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

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl transform animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <span className="text-6xl">📦</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Purchase Lootbox?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get a random premium item for your mascot!
              </p>
              <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-4 mb-4 border border-primary/20">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-semibold">Contains:</span>
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Chef Koko Costume</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">Epic</span>
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
