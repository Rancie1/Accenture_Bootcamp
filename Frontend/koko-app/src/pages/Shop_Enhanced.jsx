import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import AddItemModal from '../components/AddItemModal';
import useSwipeGesture from '../hooks/useSwipeGesture';
import MascotPreview from '../components/MascotPreview';
import { MessageSquare, Mic, Send, X, ArrowLeft, PenLine, ChevronDown, Share2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { sendMessageToN8nWithFallback } from '../utils/api';
import * as LucideIcons from 'lucide-react';

/**
 * Shop Component - Enhanced Version
 * Advanced product catalog with price history, smart alerts, user reviews, and gamification
 * Requirements: 2.1, 2.2, 2.5, 2.8, 2.11, 14.1-14.8, 15.1-15.7, 16.1-16.10, 17.1-17.6
 */

// Sample product catalog data with enhanced features
const sampleProducts = [
  { 
    id: 'p1', 
    name: 'Milk 2L', 
    price: 3.50, 
    stock: 15, 
    isOnSale: true, 
    originalPrice: 4.20,
    priceHistory: [4.20, 3.90, 3.70, 3.50],
    priceAlert: 'stable',
    bestTimeToBuy: 'Good price - buy now!',
    relatedProducts: ['Bread Loaf', 'Eggs (12 pack)'],
    reviews: [
      { user: 'Sarah M.', rating: 5, badge: 'Gold', text: 'Great deal! Saved $2 this week', points: 150, upvotes: 12 },
      { user: 'Mike T.', rating: 4, badge: 'Silver', text: 'Fresh and affordable', points: 80, upvotes: 8 }
    ],
    lowStockAlert: false
  },
  { 
    id: 'p2', 
    name: 'Bread Loaf', 
    price: 2.80, 
    stock: 8, 
    isOnSale: false,
    priceHistory: [2.80, 2.80, 2.90, 2.80],
    priceAlert: 'stable',
    bestTimeToBuy: 'Stable price',
    relatedProducts: ['Milk 2L', 'Cheese 500g'],
    reviews: [
      { user: 'Emma L.', rating: 5, badge: 'Platinum', text: 'Always fresh!', points: 250, upvotes: 15 }
    ],
    lowStockAlert: true
  },
  { 
    id: 'p3', 
    name: 'Eggs (12 pack)', 
    price: 5.99, 
    stock: 0, 
    isOnSale: false,
    priceHistory: [5.50, 5.75, 5.99, 5.99],
    priceAlert: 'rising',
    bestTimeToBuy: 'Price rising - wait if possible',
    relatedProducts: ['Milk 2L', 'Bread Loaf'],
    reviews: [],
    lowStockAlert: false
  },
  { 
    id: 'p4', 
    name: 'Cheese 500g', 
    price: 6.50, 
    stock: 12, 
    isOnSale: true, 
    originalPrice: 8.00,
    priceHistory: [8.00, 7.50, 7.00, 6.50],
    priceAlert: 'dropping',
    bestTimeToBuy: 'Price drop detected! Buy now',
    relatedProducts: ['Bread Loaf', 'Milk 2L'],
    reviews: [
      { user: 'John D.', rating: 5, badge: 'Gold', text: 'Best price I\'ve seen!', points: 120, upvotes: 20 },
      { user: 'Lisa K.', rating: 5, badge: 'Silver', text: 'Excellent quality', points: 90, upvotes: 10 }
    ],
    lowStockAlert: false
  },
  { 
    id: 'p5', 
    name: 'Chicken Breast 1kg', 
    price: 12.99, 
    stock: 5, 
    isOnSale: false,
    priceHistory: [13.50, 13.20, 12.99, 12.99],
    priceAlert: 'dropping',
    bestTimeToBuy: 'Price trending down',
    relatedProducts: ['Rice 5kg'],
    reviews: [
      { user: 'Tom R.', rating: 4, badge: 'Bronze', text: 'Good quality meat', points: 50, upvotes: 5 }
    ],
    lowStockAlert: true
  },
  { 
    id: 'p6', 
    name: 'Rice 5kg', 
    price: 15.00, 
    stock: 20, 
    isOnSale: true, 
    originalPrice: 18.50,
    priceHistory: [18.50, 17.00, 16.00, 15.00],
    priceAlert: 'dropping',
    bestTimeToBuy: 'Great deal! Lowest price in 30 days',
    relatedProducts: ['Chicken Breast 1kg'],
    reviews: [
      { user: 'Anna P.', rating: 5, badge: 'Platinum', text: 'Bulk buy savings!', points: 300, upvotes: 25 },
      { user: 'Chris W.', rating: 5, badge: 'Gold', text: 'Saved $10 on this!', points: 180, upvotes: 18 }
    ],
    lowStockAlert: false
  },
];

// Top savers leaderboard data
const topSavers = [
  { rank: 1, name: 'Anna P.', points: 300, badge: 'Platinum', savings: '$45.20' },
  { rank: 2, name: 'Emma L.', points: 250, badge: 'Platinum', savings: '$38.50' },
  { rank: 3, name: 'John D.', points: 180, badge: 'Gold', savings: '$32.10' },
  { rank: 4, name: 'Sarah M.', points: 150, badge: 'Gold', savings: '$28.75' },
  { rank: 5, name: 'Mike T.', points: 120, badge: 'Silver', savings: '$22.40' },
];

// Helper function to get badge color
const getBadgeColor = (badge) => {
  switch (badge) {
    case 'Platinum': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    case 'Gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    case 'Silver': return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
    case 'Bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    default: return 'bg-gray-200 text-gray-800';
  }
};

// Helper function to render price trend icon
const renderPriceTrendIcon = (alert) => {
  if (alert === 'dropping') return <TrendingDown size={16} className="text-green-500" />;
  if (alert === 'rising') return <TrendingUp size={16} className="text-red-500" />;
  return <Minus size={16} className="text-gray-400" />;
};

// Helper function to render Lucide icon from string name
const renderIcon = (iconName, size = 32) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.ShoppingBag;
  return <IconComponent size={size} />;
};

const Shop = () => {
  const navigate = useNavigate();
  const { defaultItems, setDefaultItems, shoppingList, setShoppingList, mascotItems, equippedItems, userPreferences, history } = useContext(AppContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManualMode, setShowManualMode] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductCatalog, setShowProductCatalog] = useState(true);
  const { swipedItemId, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe } = useSwipeGesture();
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const lastTranscriptRef = useRef('');

  // Sample history for demo
  const sampleHistory = [
    {
      id: 'sample1',
      items: [
        { id: 'milk', name: 'Milk', icon: 'Milk', quantity: 2 },
        { id: 'bread', name: 'Bread', icon: 'Croissant', quantity: 1 },
        { id: 'eggs', name: 'Eggs', icon: 'Egg', quantity: 1 }
      ],
      results: {
        totalPrice: 15.50,
        savingsPercentage: 12.5,
        savingsAmount: 2.20
      },
      xpEarned: 125,
      timestamp: Date.now() - 86400000
    },
  ];

  const displayHistory = history.length > 0 ? history : sampleHistory;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        lastTranscriptRef.current = '';
      };

      recognition.onresult = (event) => {
        // Collect all final results during this session (don't update UI yet)
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            lastTranscriptRef.current += event.results[i][0].transcript + ' ';
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'not-allowed') {
          isRecordingRef.current = false;
          setIsRecording(false);
          alert('Microphone access denied. Please enable microphone permissions.');
        } else if (event.error === 'no-speech') {
          // Ignore no-speech errors
        } else {
          isRecordingRef.current = false;
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        isRecordingRef.current = false;
        setIsRecording(false);
        // Don't update inputText here - let toggleRecording handle it
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const isItemInList = (itemId) => {
    return shoppingList.some(i => i.id === itemId);
  };

  const handleAddToList = (item) => {
    if (swipedItemId === item.id) return;
    const existingItem = shoppingList.find(i => i.id === item.id);
    if (existingItem) {
      setShoppingList(shoppingList.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setShoppingList([...shoppingList, { ...item, quantity: 1 }]);
    }
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Remove this item from your default list?')) {
      setDefaultItems(defaultItems.filter(item => item.id !== itemId));
      resetSwipe();
    }
  };

  const handleAddCustomItem = (newItem) => {
    setDefaultItems([...defaultItems, newItem]);
  };

  const handleStartAIMode = () => {
    setIsChatMode(true);
    setMessages([{
      id: 'welcome',
      text: 'Hi! Tell me what items you need, and I\'ll help you build your shopping list.',
      isUser: false
    }]);
  };

  const handleShareClick = (product) => {
    setSelectedProduct(product);
    setShowSharePopup(true);
  };

  const handleToggleManualMode = () => {
    setShowManualMode(!showManualMode);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendMessageToN8nWithFallback(shoppingList, inputText);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isUser: false
      };
      setMessages(prev => [...prev, botMessage]);

      if (response.updatedList) {
        setShoppingList(response.updatedList);
      }
    } catch {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I couldn\'t process that. Please try again.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      isRecordingRef.current = false;
      recognitionRef.current.stop();
      setIsRecording(false);
      
      // Update input text with the final transcript when stopping
      if (lastTranscriptRef.current.trim()) {
        setInputText(prev => prev + lastTranscriptRef.current);
      }
      lastTranscriptRef.current = '';
    } else {
      try {
        isRecordingRef.current = true;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    }
  };

  const handleViewHistory = (entry) => {
    setSelectedHistoryEntry(entry);
    setShowHistoryModal(true);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen bg-linear-to-b from-primary/10 to-gray-50 dark:from-primary/20 dark:to-gray-900 relative overflow-hidden flex flex-col">

      {/* Manual Mode Overlay */}
      {showManualMode && (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-40 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 p-4 md:p-6 shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-primary">Manual Selection</h1>
              <button
                onClick={() => setShowManualMode(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                <X size={24} />
              </button>
            </div>
            {shoppingList.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {shoppingList.length} {shoppingList.length === 1 ? 'item' : 'items'} selected
              </p>
            )}
          </div>

          <div className="p-4 pb-24">
            <div className="grid grid-cols-2 gap-4">
              {defaultItems.map(item => {
                const inList = isItemInList(item.id);
                return (
                  <div key={item.id} className="relative">
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

              <div
                onClick={() => setShowAddModal(true)}
                className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4 border-2 border-dashed border-primary flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                <span className="text-primary font-medium">+ New Item</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowManualMode(false);
                handleStartAIMode();
              }}
              className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg active:scale-95 transition-transform mt-6"
            >
              {shoppingList.length > 0 ? 'Continue with AI Assistant' : 'Start with AI Assistant'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden min-h-0 ${isChatMode ? 'pb-4' : 'pb-16'}`}>
        
        {/* Mascot - Only show when NOT in product catalog view */}
        {!showManualMode && !showProductCatalog && (
          <div className={`flex justify-center items-center transition-all duration-700 ease-in-out ${
            isChatMode 
              ? 'pt-3 pb-1 shrink-0' 
              : 'pt-6 pb-4 shrink-0'
          }`}>
            <div className="relative">
              <div className={`transition-all duration-700 ease-in-out ${
                isChatMode ? 'scale-75' : 'scale-100'
              }`}>
                <MascotPreview 
                  equippedItems={equippedItems}
                  mascotItems={mascotItems}
                  size="large"
                />
              </div>
              
              {!isChatMode && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl px-5 py-2.5 shadow-lg animate-bounce-slow transition-opacity duration-500">
                  <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    Ready to build your list?
                  </p>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-800 rotate-45"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Welcome View */}
        <div className={`flex-1 flex flex-col transition-all duration-500 min-h-0 ${
          isChatMode || showProductCatalog ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'
        }`}>
          <div className="text-center px-6 mb-2 shrink-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Hi, {userPreferences.name || 'there'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              I'm here to help you shop smarter
            </p>
          </div>

          {shoppingList.length > 0 && (
            <div className="mx-6 mb-2 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md shrink-0">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Your List So Far</h3>
              <div className="flex flex-wrap gap-2">
                {shoppingList.slice(0, 5).map(item => (
                  <div key={item.id} className="bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <span>{item.name}</span>
                    {item.quantity > 1 && <span className="font-bold">×{item.quantity}</span>}
                  </div>
                ))}
                {shoppingList.length > 5 && (
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                    +{shoppingList.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0"></div>

          {displayHistory.length > 0 && (
            <div className="px-6 mb-2 shrink-0">
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-2 space-y-1">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 mb-1">Recent Lists</h3>
                {displayHistory.slice(-3).reverse().map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleViewHistory(entry)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {entry.items.slice(0, 3).map(item => item.name).join(', ')}
                        {entry.items.length > 3 && ` +${entry.items.length - 3}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                    <ChevronDown size={16} className="text-gray-400 -rotate-90 ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 pb-2 shrink-0">
            <div className="flex gap-2">
              <button
                onClick={handleStartAIMode}
                className="flex-1 py-3.5 bg-primary text-white rounded-xl font-semibold text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <MessageSquare size={22} />
                Start your list
              </button>
              <button
                onClick={handleToggleManualMode}
                className="py-3.5 px-4 bg-primary text-white rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center"
              >
                <PenLine size={22} />
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Chat with me to build your list, or use manual mode
            </p>
          </div>
        </div>

        {/* Chat View */}
        {isChatMode && (
          <div className="flex-1 flex flex-col transition-all duration-500 animate-fade-in px-4 overflow-hidden min-h-0">
            <div className="flex justify-start py-1.5 shrink-0">
              <button
                onClick={() => {
                  setIsChatMode(false);
                  setMessages([]);
                  setInputText('');
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors p-1.5"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 mb-2 px-2 min-h-0">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-3xl px-5 py-3 shadow-lg backdrop-blur-sm ${
                      msg.isUser 
                        ? 'bg-primary text-white' 
                        : 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white rounded-3xl px-5 py-3 shadow-lg backdrop-blur-sm">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="pb-2 shrink-0">
              <button
                onClick={() => navigate('/results')}
                className="w-full py-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl font-semibold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors active:scale-95 shadow-md"
              >
                Calculate my savings
              </button>
            </div>

            <div className="pb-3 shrink-0">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-2xl p-1.5 flex items-center gap-2">
                {isRecording ? (
                  /* Waveform animation while recording */
                  <div className="flex-1 px-4 py-2.5 flex items-center justify-center gap-1">
                    <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '12px', animationDuration: '0.6s' }}></div>
                    <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '20px', animationDuration: '0.5s', animationDelay: '0.1s' }}></div>
                    <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '16px', animationDuration: '0.7s', animationDelay: '0.2s' }}></div>
                    <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '24px', animationDuration: '0.6s', animationDelay: '0.3s' }}></div>
                    <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '18px', animationDuration: '0.5s', animationDelay: '0.4s' }}></div>
                    <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '22px', animationDuration: '0.7s', animationDelay: '0.5s' }}></div>
                    <div className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '14px', animationDuration: '0.6s', animationDelay: '0.6s' }}></div>
                    <span className="ml-2 text-red-500 text-sm font-medium">Recording...</span>
                  </div>
                ) : (
                  /* Normal input field */
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tell me what you need..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm"
                  />
                )}
                <button 
                  onClick={toggleRecording}
                  disabled={isLoading}
                  className={`p-2.5 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Mic size={18} />
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
