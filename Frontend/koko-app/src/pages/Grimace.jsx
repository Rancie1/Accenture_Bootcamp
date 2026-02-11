import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

/**
 * Grimace Easter Egg Component
 * Requirements: 14.3, 14.4, 14.5, 14.6
 * 
 * Hidden page accessible by tapping mascot 3 times on Dashboard
 * and entering passcode "grimace"
 */
const Grimace = () => {
  const navigate = useNavigate();
  const { mascotItems, setMascotItems } = useContext(AppContext);
  const [itemAwarded, setItemAwarded] = useState(() => {
    // Check on mount if item already exists
    return mascotItems.some(item => item.id === 'grimace-hat');
  });

  // Award special Grimace item on first visit
  useEffect(() => {
    if (!itemAwarded) {
      // Award special Grimace-themed hat on first visit
      const grimaceHat = {
        id: 'grimace-hat',
        name: 'Grimace Hat',
        type: 'hat',
        rarity: 'legendary',
        isPremium: true,
        imageUrl: '/mascot-items/hats/grimace-hat.png'
      };
      
      // Use functional update to avoid cascading renders
      setMascotItems(prevItems => {
        // Double-check item doesn't exist before adding
        if (prevItems.some(item => item.id === 'grimace-hat')) {
          return prevItems;
        }
        setItemAwarded(true);
        return [...prevItems, grimaceHat];
      });
    }
  }, [itemAwarded, setMascotItems]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex flex-col items-center justify-center p-6 relative">
      {/* Back button */}
      <button 
        onClick={handleBack}
        className="absolute top-6 left-6 text-white text-3xl hover:scale-110 transition-transform active:scale-95"
        aria-label="Back to Dashboard"
      >
        ←
      </button>
      
      {/* Grimace character with bounce animation */}
      <div className="animate-bounce mb-8">
        <div className="text-9xl" role="img" aria-label="Grimace character">
          🟣
        </div>
      </div>
      
      {/* Title with pulse animation */}
      <h1 className="text-4xl font-bold text-white mb-4 text-center animate-pulse">
        You found Grimace!
      </h1>
      
      {/* Subtitle */}
      <p className="text-white text-lg text-center mb-8 max-w-md">
        Special purple friend unlocked!
      </p>
      
      {/* Award notification card with backdrop blur */}
      {itemAwarded && (
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center shadow-2xl animate-fade-in">
          <p className="text-white font-medium text-lg mb-2">
            🎉 Grimace Hat added to your collection!
          </p>
          <p className="text-white/80 text-sm">
            Check your Mascot customization page
          </p>
        </div>
      )}
      
      {/* Fun fact or additional content */}
      <div className="mt-8 text-center">
        <p className="text-white/70 text-sm italic">
          "I'm Grimace, and I love purple just like Koko!"
        </p>
      </div>
    </div>
  );
};

export default Grimace;
