import { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BottomNavigation from '../components/BottomNavigation';
import AddItemModal from '../components/AddItemModal';
import useSwipeGesture from '../hooks/useSwipeGesture';
import MascotPreview from '../components/MascotPreview';
import { ChevronDown, Grid3x3, MessageSquare, Mic, Send, X, ArrowLeft } from 'lucide-react';
import { sendMessageToN8nWithFallback } from '../utils/api';
import * as LucideIcons from 'lucide-react';

/**
 * Shop Component
 * Mascot-centered AI shopping assistant experience with ChatGPT-style voice mode
 * Requirements: 2.1, 2.2, 2.5, 2.8, 2.11
 */

// Helper function to render Lucide icon from string name
const renderIcon = (iconName, size = 32) => {
  const IconComponent = LucideIcons[iconName] || LucideIcons.ShoppingBag;
  return <IconComponent size={size} />;
};

const Shop = () => {
  const navigate = useNavigate();
  const { defaultItems, setDefaultItems, shoppingList, setShoppingList, mascotItems, equippedItems, userPreferences, history } = useContext(AppContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showManualMode, setShowManualMode] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);
  const { swipedItemId, handleTouchStart, handleTouchMove, handleTouchEnd, resetSwipe } = useSwipeGesture();
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sample history for demo (remove when real history exists)
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
      timestamp: Date.now() - 86400000 // 1 day ago
    },
    {
      id: 'sample2',
      items: [
        { id: 'cheese', name: 'Cheese', icon: 'Pizza', quantity: 1 },
        { id: 'butter', name: 'Butter', icon: 'Cookie', quantity: 1 },
        { id: 'chicken', name: 'Chicken', icon: 'Drumstick', quantity: 2 },
        { id: 'rice', name: 'Rice', icon: 'UtensilsCrossed', quantity: 1 }
      ],
      results: {
        totalPrice: 28.75,
        savingsPercentage: 18.3,
        savingsAmount: 6.45
      },
      xpEarned: 183,
      timestamp: Date.now() - 172800000 // 2 days ago
    },
    {
      id: 'sample3',
      items: [
        { id: 'pasta', name: 'Pasta', icon: 'Soup', quantity: 2 },
        { id: 'milk', name: 'Milk', icon: 'Milk', quantity: 1 }
      ],
      results: {
        totalPrice: 8.99,
        savingsPercentage: 8.5,
        savingsAmount: 0.85
      },
      xpEarned: 85,
      timestamp: Date.now() - 259200000 // 3 days ago
    }
  ];

  // Use real history if available, otherwise use sample data
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
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputText(prev => prev + finalTranscript);
        } else if (interimTranscript) {
          setInputText(prev => {
            const lastFinalIndex = prev.lastIndexOf(' ');
            const basePrev = lastFinalIndex > 0 ? prev.substring(0, lastFinalIndex + 1) : prev;
            return basePrev + interimTranscript;
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /**
   * Check if item is in shopping list
   */
  const isItemInList = (itemId) => {
    return shoppingList.some(i => i.id === itemId);
  };

  /**
   * Add item to shopping list
   */
  const handleAddToList = (item) => {
    if (swipedItemId === item.id) {
      return;
    }

    const existingItem = shoppingList.find(i => i.id === item.id);
    
    if (existingItem) {
      setShoppingList(shoppingList.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setShoppingList([...shoppingList, { ...item, quantity: 1 }]);
    }
  };

  /**
   * Delete item from default items
   */
  const handleDeleteItem = (itemId) => {
    if (window.confirm('Remove this item from your default list?')) {
      setDefaultItems(defaultItems.filter(item => item.id !== itemId));
      resetSwipe();
    }
  };

  /**
   * Add custom item to default items
   */
  const handleAddCustomItem = (newItem) => {
    setDefaultItems([...defaultItems, newItem]);
  };

  /**
   * Start AI conversation mode - transition to chat view
   */
  const handleStartAIMode = () => {
    setIsChatMode(true);
    // Add welcome message
    setMessages([{
      id: 'welcome',
      text: 'Hi! Tell me what items you need, and I\'ll help you build your shopping list.',
      isUser: false
    }]);
  };

  /**
   * Exit chat mode
   */
  const handleExitChatMode = () => {
    setIsChatMode(false);
    setMessages([]);
    setInputText('');
    // Navigate to results if there are items
    if (shoppingList.length > 0) {
      navigate('/results');
    }
  };

  /**
   * Toggle manual mode view
   */
  const handleToggleManualMode = () => {
    setShowManualMode(!showManualMode);
    setShowModeDropdown(false);
  };

  /**
   * Handle sending text message
   */
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

  /**
   * Handle Enter key
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Start/stop voice recording
   */
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsRecording(true);
      }
    }
  };

  /**
   * Handle viewing a historical shopping list
   */
  const handleViewHistory = (entry) => {
    setSelectedHistoryEntry(entry);
    setShowHistoryModal(true);
  };

  /**
   * Format date for display
   */
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
          <div className="bg-white dark:bg-gray-800 p-6 shadow-sm sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary">Manual Selection</h1>
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
              onClick={handleStartAIMode}
              className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg active:scale-95 transition-transform mt-6"
            >
              {shoppingList.length > 0 ? 'Continue with AI Assistant' : 'Start with AI Assistant'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Fits within viewport */}
      <div className={`flex-1 flex flex-col overflow-hidden min-h-0 ${isChatMode ? 'pb-4' : 'pb-16'}`}>
        
        {/* Mascot - Transitions from center to top */}
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
            
            {/* Speech bubble - fades out in chat mode */}
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

        {/* Welcome View - Fades out when chat mode starts */}
        <div className={`flex-1 flex flex-col transition-all duration-500 min-h-0 ${
          isChatMode ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'
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

          {/* Spacer to push button to bottom */}
          <div className="flex-1 min-h-0"></div>

          {/* Historical Shopping Lists */}
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
            <div className="relative">
              <div className="flex gap-2">
                <button
                  onClick={handleStartAIMode}
                  className="flex-1 py-3.5 bg-primary text-white rounded-xl font-semibold text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <MessageSquare size={22} />
                  Start your list
                </button>
                <button
                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                  className="py-3.5 px-3.5 bg-primary text-white rounded-xl shadow-lg active:scale-95 transition-transform"
                >
                  <ChevronDown size={22} className={`transition-transform ${showModeDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showModeDropdown && (
                <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden z-10 min-w-[200px]">
                  <button
                    onClick={handleToggleManualMode}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-900 dark:text-white"
                  >
                    <Grid3x3 size={20} />
                    <span>Manual Mode</span>
                  </button>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Chat with me to build your list, or use manual mode
            </p>
          </div>
        </div>

        {/* Chat View - Fades in when chat mode starts */}
        {isChatMode && (
          <div className="flex-1 flex flex-col transition-all duration-500 animate-fade-in px-4 overflow-hidden min-h-0">
            {/* Exit button */}
            <div className="flex justify-end py-1.5 shrink-0">
              <button
                onClick={handleExitChatMode}
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors p-1.5"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            {/* Messages - Scrollable area */}
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

            {/* Input Area - Fixed at bottom */}
            <div className="pb-3 shrink-0">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-2xl p-1.5 flex items-center gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me what you need..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm"
                />
                <button 
                  onClick={toggleRecording}
                  disabled={isLoading}
                  className={`p-2.5 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
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
      </div>

      {/* Bottom Navigation - Hidden in chat mode */}
      {!showManualMode && !isChatMode && (
        <div className="shrink-0">
          <BottomNavigation />
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCustomItem}
      />

      {/* History Modal */}
      {showHistoryModal && selectedHistoryEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Shopping List</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {formatDate(selectedHistoryEntry.timestamp)}
              </p>
              {selectedHistoryEntry.results && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${selectedHistoryEntry.results.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Savings</span>
                    <span className="font-semibold text-primary">
                      {selectedHistoryEntry.results.savingsPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">XP Earned</span>
                    <span className="font-semibold text-primary">
                      +{selectedHistoryEntry.xpEarned} XP
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Items ({selectedHistoryEntry.items.length})</h4>
              {selectedHistoryEntry.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-700 dark:text-gray-300">
                      {renderIcon(item.icon, 24)}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </span>
                  </div>
                  {item.quantity > 1 && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ×{item.quantity}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg active:scale-95 transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
