import kokoImage from '../assets/koko-1024.PNG';

/**
 * MascotPreview Component
 * Renders the Koko mascot with equipped customization items
 * Requirements: 6.2, 9.1
 * 
 * @param {Object} props - Component props
 * @param {Object} props.equippedItems - Object containing equipped item IDs by type
 * @param {Array} props.mascotItems - Array of all owned mascot items
 * @param {string} props.size - Size variant: 'small' | 'medium' | 'large'
 */
const MascotPreview = ({ equippedItems = {}, mascotItems = [], size = 'medium' }) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-24 h-24',
      mascot: 'text-5xl',
      item: 'text-2xl'
    },
    medium: {
      container: 'w-48 h-48',
      mascot: 'text-8xl',
      item: 'text-4xl'
    },
    large: {
      container: 'w-56 h-56',
      mascot: 'text-9xl',
      item: 'text-5xl'
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Get equipped item by type
  const getEquippedItem = (type) => {
    const itemId = equippedItems[type];
    if (!itemId) return null;
    return mascotItems.find(item => item.id === itemId);
  };

  const equippedBackground = getEquippedItem('background');
  const equippedOutfit = getEquippedItem('outfit');
  const equippedHat = getEquippedItem('hat');
  const equippedAccessory = getEquippedItem('accessory');

  return (
    <div className="relative inline-block">
      {/* Background layer */}
      {equippedBackground && (
        <div className={`absolute inset-0 flex items-center justify-center ${config.item} opacity-30`}>
          {equippedBackground.emoji || equippedBackground.icon}
        </div>
      )}

      {/* Main mascot container */}
      <div 
        className={`${config.container} rounded-full flex items-center justify-center relative`}
        style={{ backgroundColor: 'rgb(180, 122, 217)' }}
      >
        {/* Outfit layer (behind mascot) */}
        {equippedOutfit && (
          <div className={`absolute inset-0 flex items-center justify-center ${config.item}`}>
            {equippedOutfit.emoji || equippedOutfit.icon}
          </div>
        )}

        {/* Base mascot - Koko */}
        <img 
          src={kokoImage} 
          alt="Koko mascot" 
          className="w-full h-full object-contain relative z-10"
        />

        {/* Hat layer (above mascot) */}
        {equippedHat && (
          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 ${config.item} z-20`}>
            {equippedHat.emoji || equippedHat.icon}
          </div>
        )}

        {/* Accessory layer (on mascot) */}
        {equippedAccessory && (
          <div className={`absolute bottom-1/4 right-1/4 ${config.item} z-20`}>
            {equippedAccessory.emoji || equippedAccessory.icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MascotPreview;
