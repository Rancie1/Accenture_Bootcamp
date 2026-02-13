import kokoImage from '../assets/koko-1024.PNG';
import kokoChef from '../assets/dlc/koko-chef.PNG';
import kokoSunglasses from '../assets/dlc/koko-sunglasses.PNG';
import kokoScuba from '../assets/dlc/koko-scuba.PNG';
import kokoSunglassesChef from '../assets/dlc/koko-sunglasses-chef.PNG';
import kokoScubaChef from '../assets/dlc/koko-scuba-chef.PNG';
import kokoCrown from '../assets/dlc/koko-crown.png';
import kokoSunglassesCrown from '../assets/dlc/koko-sunglasses-crown.PNG';
import kokoScubaCrown from '../assets/dlc/koko-scuba-crown.PNG';

/**
 * MascotPreview Component
 * Renders the Koko mascot with equipped customization items
 * Uses PNG replacement for costumes - entire image changes
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
      container: 'w-24 h-24'
    },
    medium: {
      container: 'w-48 h-48'
    },
    large: {
      container: 'w-56 h-56'
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Determine which image to display
  const getKokoImage = () => {
    const costumeId = equippedItems.costume;
    
    if (costumeId) {
      // Map costume IDs to their images
      const costumeImages = {
        'premium_chef': kokoChef,
        'chef': kokoChef,
        'premium_sunglasses': kokoSunglasses,
        'sunglasses': kokoSunglasses,
        'premium_scuba': kokoScuba,
        'scuba': kokoScuba,
        'premium_sunglasses_chef': kokoSunglassesChef,
        'sunglasses_chef': kokoSunglassesChef,
        'premium_scuba_chef': kokoScubaChef,
        'scuba_chef': kokoScubaChef,
        'premium_crown': kokoCrown,
        'crown': kokoCrown,
        'premium_sunglasses_crown': kokoSunglassesCrown,
        'sunglasses_crown': kokoSunglassesCrown,
        'premium_scuba_crown': kokoScubaCrown,
        'scuba_crown': kokoScubaCrown
      };
      return costumeImages[costumeId] || kokoImage;
    }
    return kokoImage;
  };

  return (
    <div className="relative inline-block">
      {/* Main mascot container */}
      <div 
        className={`${config.container} rounded-full flex items-center justify-center relative`}
        style={{ backgroundColor: '#845EEE' }}
      >
        {/* Koko image - changes based on equipped costume */}
        <img 
          src={getKokoImage()} 
          alt="Koko mascot" 
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default MascotPreview;
