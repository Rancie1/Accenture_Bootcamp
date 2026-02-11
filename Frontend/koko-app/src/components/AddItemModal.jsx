import { useState } from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * AddItemModal Component
 * Modal for adding custom default items to the shop
 * Requirements: 2.6, 2.7
 */

// Helper function to render Lucide icon from string name
const renderIcon = (iconName, size = 24) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.ShoppingBag;
  return <IconComponent size={size} />;
};

const AddItemModal = ({ isOpen, onClose, onAdd }) => {
  const [itemName, setItemName] = useState('');
  const [itemIcon, setItemIcon] = useState('');

  // Common Lucide icon names for grocery items
  const commonIcons = [
    'Apple', 'Banana', 'Carrot', 'Salad', 'Cherry', 'Beef', 'Fish', 'Egg',
    'Cookie', 'Pizza', 'Croissant', 'Soup', 'Coffee', 'Wine', 'Milk', 'IceCream',
    'Cake', 'Candy', 'Sandwich', 'Drumstick', 'UtensilsCrossed', 'ChefHat', 'CookingPot', 'Wheat'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      alert('Please enter an item name');
      return;
    }

    if (!itemIcon.trim()) {
      alert('Please select an icon');
      return;
    }

    // Generate unique ID
    const newItem = {
      id: `custom-${Date.now()}`,
      name: itemName.trim(),
      icon: itemIcon,
      isCustom: true
    };

    onAdd(newItem);
    
    // Reset form
    setItemName('');
    setItemIcon('');
    onClose();
  };

  const handleCancel = () => {
    setItemName('');
    setItemIcon('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Add Custom Item
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Item Name Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Item Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Tomatoes"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Icon Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {commonIcons.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setItemIcon(iconName)}
                  className={`p-3 rounded-lg transition-all flex items-center justify-center ${
                    itemIcon === iconName
                      ? 'bg-primary/20 ring-2 ring-primary text-primary'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {renderIcon(iconName, 24)}
                </button>
              ))}
            </div>
            
            {/* Selected icon display */}
            {itemIcon && (
              <div className="text-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected:</p>
                <div className="flex justify-center text-primary">
                  {renderIcon(itemIcon, 32)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{itemIcon}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium active:scale-95 transition-transform"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary text-white rounded-lg font-medium shadow-lg active:scale-95 transition-transform"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
