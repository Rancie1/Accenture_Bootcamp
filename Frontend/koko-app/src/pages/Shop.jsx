import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import AddItemModal from '../components/AddItemModal';
import useSwipeGesture from '../hooks/useSwipeGesture';
import * as LucideIcons from 'lucide-react';

/**
 * Shop Component
 * Displays customizable grocery items and allows users to build shopping lists
 * Requirements: 2.1, 2.2, 2.5, 2.8, 2.11
 */

// Helper function to render Lucide icon from string name
const renderIcon = (iconName, size = 32) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.ShoppingBag;
  return <IconComponent size={size} />;
};

const Shop = () => {
  const navigate = useNavigate();
  const { defaultItems, setDefaultItems, shoppingList, setShoppingList } = useContext(AppContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const { swipedItemId, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe } = useSwipeGesture();

  /**
   * Check if item is in shopping list
   */
  const isItemInList = (itemId) => {
    return shoppingList.some(i => i.id === itemId);
  };

  /**
   * Add item to shopping list
   * Requirement 2.2: When user clicks a grocery card, add item to shopping list
   */
  const handleAddToList = (item) => {
    // Don't add to list if in swipe mode
    if (swipedItemId === item.id) {
      return;
    }

    const existingItem = shoppingList.find(i => i.id === item.id);
    
    if (existingItem) {
      // Increment quantity if item already in list
      setShoppingList(shoppingList.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      // Add new item with quantity 1
      setShoppingList([...shoppingList, { ...item, quantity: 1 }]);
    }
  };

  /**
   * Delete item from default items
   * Requirement 2.3, 2.4: Swipe left to delete default item
   */
  const handleDeleteItem = (itemId) => {
    if (window.confirm('Remove this item from your default list?')) {
      setDefaultItems(defaultItems.filter(item => item.id !== itemId));
      resetSwipe();
    }
  };

  /**
   * Add custom item to default items
   * Requirement 2.6, 2.7: Add custom default item with name and icon
   */
  const handleAddCustomItem = (newItem) => {
    setDefaultItems([...defaultItems, newItem]);
  };

  /**
   * Navigate to edit list page
   * Requirement 2.8: Display button to continue or start list
   */
  const handleContinueToList = () => {
    navigate('/edit-list');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header with Level Display */}
      <div className="bg-white dark:bg-gray-800 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-primary text-center">Shop</h1>
        {shoppingList.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
            {shoppingList.length} {shoppingList.length === 1 ? 'item' : 'items'} in list
          </p>
        )}
      </div>

      {/* Grocery Items Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {defaultItems.map(item => {
            const inList = isItemInList(item.id);
            return (
              <div
                key={item.id}
                className="relative"
              >
                <div
                  onClick={() => handleAddToList(item)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(item.id)}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md active:scale-95 transition-all cursor-pointer ${
                    inList ? 'ring-2 ring-primary shadow-primary/50 shadow-lg' : ''
                  }`}
                >
                  <div className="text-gray-900 dark:text-white mb-2">{renderIcon(item.icon, 32)}</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                  {inList && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      ✓
                    </div>
                  )}
                </div>
                
                {/* Delete button shown on swipe */}
                {swipedItemId === item.id && (
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="absolute top-0 right-0 bottom-0 bg-red-500 text-white px-4 rounded-r-xl font-medium flex items-center justify-center"
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}

          {/* Add New Item Card */}
          <div
            onClick={() => setShowAddModal(true)}
            className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4 border-2 border-dashed border-primary flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-primary font-medium">+ New Item</span>
          </div>
        </div>

        {/* Continue/Start List Button */}
        <button
          onClick={handleContinueToList}
          className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg active:scale-95 transition-transform mt-6"
        >
          {shoppingList.length > 0 ? 'Continue editing your list' : 'Start a new list'}
        </button>
      </div>

      <BottomNavigation />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCustomItem}
      />
    </div>
  );
};

export default Shop;
