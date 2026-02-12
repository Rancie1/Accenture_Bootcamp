import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import BottomNavigation from "../components/BottomNavigation";
import AddItemModal from "../components/AddItemModal";
import MascotPreview from "../components/MascotPreview";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  Mic,
  Send,
  X,
  ArrowLeft,
  Share2,
  TrendingUp,
  ShoppingCart,
  Footprints,
  Bus,
  Car,
  Trophy,
  Plus,
  Minus,
  Trash2,
  Receipt
} from "lucide-react";
import { sendMessageToN8nWithFallback } from "../utils/api";
import * as LucideIcons from "lucide-react";

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

// Sample product catalog data
const sampleProducts = [
  {
    id: "p1",
    name: "Milk 2L",
    price: 3.5,
    stock: 15,
    isOnSale: true,
    originalPrice: 4.2,
    priceHistory: [
      { date: "2024-10-12", price: 4.2 },
      { date: "2024-10-19", price: 4.1 },
      { date: "2024-10-26", price: 3.95 },
      { date: "2024-11-02", price: 3.9 },
      { date: "2024-11-09", price: 3.8 },
      { date: "2024-11-16", price: 3.7 },
      { date: "2024-11-23", price: 3.6 },
      { date: "2024-11-30", price: 3.55 },
      { date: "2024-12-07", price: 3.5 }
    ]
  },
  {
    id: "p2",
    name: "Bread Loaf",
    price: 2.8,
    stock: 8,
    isOnSale: false,
    priceHistory: [
      { date: "2024-10-12", price: 2.9 },
      { date: "2024-10-19", price: 2.85 },
      { date: "2024-10-26", price: 2.8 },
      { date: "2024-11-02", price: 2.8 },
      { date: "2024-11-09", price: 2.8 },
      { date: "2024-11-16", price: 2.85 },
      { date: "2024-11-23", price: 2.8 },
      { date: "2024-11-30", price: 2.8 },
      { date: "2024-12-07", price: 2.8 }
    ]
  },
  {
    id: "p3",
    name: "Eggs (12 pack)",
    price: 5.99,
    stock: 0,
    isOnSale: false,
    priceHistory: [
      { date: "2024-10-12", price: 5.5 },
      { date: "2024-10-19", price: 5.6 },
      { date: "2024-10-26", price: 5.7 },
      { date: "2024-11-02", price: 5.75 },
      { date: "2024-11-09", price: 5.8 },
      { date: "2024-11-16", price: 5.85 },
      { date: "2024-11-23", price: 5.9 },
      { date: "2024-11-30", price: 5.95 },
      { date: "2024-12-07", price: 5.99 }
    ]
  },
  {
    id: "p4",
    name: "Cheese 500g",
    price: 6.5,
    stock: 12,
    isOnSale: true,
    originalPrice: 8.0,
    priceHistory: [
      { date: "2024-10-12", price: 8.0 },
      { date: "2024-10-19", price: 7.9 },
      { date: "2024-10-26", price: 7.7 },
      { date: "2024-11-02", price: 7.5 },
      { date: "2024-11-09", price: 7.2 },
      { date: "2024-11-16", price: 7.0 },
      { date: "2024-11-23", price: 6.8 },
      { date: "2024-11-30", price: 6.65 },
      { date: "2024-12-07", price: 6.5 }
    ]
  },
  {
    id: "p5",
    name: "Chicken Breast 1kg",
    price: 12.99,
    stock: 5,
    isOnSale: false,
    priceHistory: [
      { date: "2024-10-12", price: 13.5 },
      { date: "2024-10-19", price: 13.4 },
      { date: "2024-10-26", price: 13.3 },
      { date: "2024-11-02", price: 13.2 },
      { date: "2024-11-09", price: 13.1 },
      { date: "2024-11-16", price: 13.05 },
      { date: "2024-11-23", price: 13.0 },
      { date: "2024-11-30", price: 12.99 },
      { date: "2024-12-07", price: 12.99 }
    ]
  },
  {
    id: "p6",
    name: "Rice 5kg",
    price: 15.0,
    stock: 20,
    isOnSale: true,
    originalPrice: 18.5,
    priceHistory: [
      { date: "2024-10-12", price: 18.5 },
      { date: "2024-10-19", price: 18.0 },
      { date: "2024-10-26", price: 17.5 },
      { date: "2024-11-02", price: 17.0 },
      { date: "2024-11-09", price: 16.5 },
      { date: "2024-11-16", price: 16.0 },
      { date: "2024-11-23", price: 15.5 },
      { date: "2024-11-30", price: 15.25 },
      { date: "2024-12-07", price: 15.0 }
    ]
  }
];

/**
 * Leaderboard Calculation Logic
 *
 * Anti-Gaming Measures:
 * 1. Minimum Budget Threshold: $20/week to prevent gaming with tiny budgets
 * 2. Savings Rate: (weeklyBudget - weeklySpend) / weeklyBudget
 * 3. Consistency Factor: Rewards staying under budget consistently (0-1 scale)
 * 4. Final Score: (Savings Rate × 70%) + (Consistency Factor × 30%)
 *
 * This ensures users can't game the system by:
 * - Setting unrealistically low budgets
 * - Having one good week but inconsistent behavior
 */

const MINIMUM_BUDGET_THRESHOLD = 20; // Minimum weekly budget in dollars

// Sample leaderboard data with realistic user profiles

const Shop = () => {
  const navigate = useNavigate();
  const { defaultItems, setDefaultItems, shoppingList, setShoppingList, mascotItems, equippedItems, userPreferences, history, xp, setXp } = useContext(AppContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManualMode, setShowManualMode] = useState(false);
  const [isChatMode, setIsChatMode] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [priceHistoryProduct, setPriceHistoryProduct] = useState(null);
  const [productQuantities, setProductQuantities] = useState({});
  const [showTransportModal, setShowTransportModal] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTransportLoading, setIsTransportLoading] = useState(false);
  const [showListEditor, setShowListEditor] = useState(false);
  const [goodChoiceToast, setGoodChoiceToast] = useState(null); // { productName, xpBonus }
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Helper: is this product's price trending down? (good time to buy)
  const isGoodTimeToBuy = (product) => {
    if (!product.priceHistory || product.priceHistory.length < 2) return false;
    const prevPrice = product.priceHistory[product.priceHistory.length - 2].price;
    return product.price < prevPrice;
  };

  const GOOD_CHOICE_XP_BONUS = 10;

  // Check if the agent flagged any newly added items as a good buy
  const checkForGoodBuys = (updatedList) => {
    const goodBuyItems = updatedList.filter(item => item.isGoodBuy);
    if (goodBuyItems.length > 0) {
      const names = goodBuyItems.map(item => item.name).join(', ');
      setXp(prev => prev + GOOD_CHOICE_XP_BONUS * goodBuyItems.length);
      setGoodChoiceToast({
        productName: names,
        xpBonus: GOOD_CHOICE_XP_BONUS * goodBuyItems.length
      });
      setTimeout(() => setGoodChoiceToast(null), 3500);
    }
  };

  const isRecordingRef = useRef(false);
  const lastTranscriptRef = useRef("");

  // Sample history for demo (remove when real history exists)
  const sampleHistory = [
    {
      id: "sample1",
      items: [
        { id: "milk", name: "Milk", icon: "Milk", quantity: 2 },
        { id: "bread", name: "Bread", icon: "Croissant", quantity: 1 },
        { id: "eggs", name: "Eggs", icon: "Egg", quantity: 1 }
      ],
      results: {
        totalPrice: 15.5,
        savingsPercentage: 12.5,
        savingsAmount: 2.2
      },
      xpEarned: 125,
      timestamp: Date.now() - 86400000 // 1 day ago
    },
    {
      id: "sample2",
      items: [
        { id: "cheese", name: "Cheese", icon: "Pizza", quantity: 1 },
        { id: "butter", name: "Butter", icon: "Cookie", quantity: 1 },
        { id: "chicken", name: "Chicken", icon: "Drumstick", quantity: 2 },
        { id: "rice", name: "Rice", icon: "UtensilsCrossed", quantity: 1 }
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
      id: "sample3",
      items: [
        { id: "pasta", name: "Pasta", icon: "Soup", quantity: 2 },
        { id: "milk", name: "Milk", icon: "Milk", quantity: 1 }
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        lastTranscriptRef.current = "";
      };

      recognition.onresult = (event) => {
        // Collect all final results during this session (don't update UI yet)
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            lastTranscriptRef.current += transcript + " ";
            console.log("Captured transcript:", transcript);
            console.log("Total transcript so far:", lastTranscriptRef.current);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        if (event.error === "not-allowed") {
          isRecordingRef.current = false;
          setIsRecording(false);
          alert(
            "Microphone access denied. Please enable microphone permissions."
          );
        } else if (event.error === "no-speech") {
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
          // eslint-disable-next-line no-unused-vars
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

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
    setMessages([
      {
        id: "welcome",
        text: "Hi! Tell me what items you need, and I'll help you build your shopping list.",
        isUser: false
      }
    ]);
  };

  /**
   * Handle share button click
   */
  const handleShareClick = (product) => {
    setSelectedProduct(product);
    setShowSharePopup(true);
  };

  /**
   * Handle price history button click
   */
  const handlePriceHistoryClick = (product) => {
    setPriceHistoryProduct(product);
    setShowPriceHistory(true);
  };

  /**
   * Toggle manual mode view
   */
  const handleToggleManualMode = () => {
    setShowManualMode(!showManualMode);
  };

  /**
   * Handle sending text message
   */
  const handleSendMessage = async () => {
    // If recording, stop it first and get the transcript
    if (isRecording) {
      isRecordingRef.current = false;
      recognitionRef.current.stop();
      setIsRecording(false);

      // Add the transcript to input
      if (lastTranscriptRef.current.trim()) {
        const transcript = lastTranscriptRef.current;
        lastTranscriptRef.current = "";

        // Send the transcript immediately
        const userMessage = {
          id: Date.now().toString(),
          text: transcript.trim(),
          isUser: true
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
          const response = await sendMessageToN8nWithFallback(
            shoppingList,
            transcript.trim(),
            null,
            sessionId,
            userPreferences.address
          );

          if (response.sessionId) setSessionId(response.sessionId);

          const botMessage = {
            id: (Date.now() + 1).toString(),
            text: response.reply,
            isUser: false
          };
          setMessages((prev) => [...prev, botMessage]);

          if (response.updatedList) {
            setShoppingList(response.updatedList);
            checkForGoodBuys(response.updatedList);
          }
        } catch (error) {
          console.error("Error sending message:", error);
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I had trouble processing that. Please try again.",
            isUser: false
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }
      return;
    }

    // Normal text send
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendMessageToN8nWithFallback(
        shoppingList,
        inputText,
        null,
        sessionId,
        userPreferences.address
      );

      if (response.sessionId) setSessionId(response.sessionId);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isUser: false
      };
      setMessages((prev) => [...prev, botMessage]);

      if (response.updatedList) {
        setShoppingList(response.updatedList);
        checkForGoodBuys(response.updatedList);
      }
    } catch {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process that. Please try again.",
        isUser: false
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Enter key
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Start/stop voice recording
   */
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isRecording) {
      console.log("Stopping recording...");
      isRecordingRef.current = false;
      recognitionRef.current.stop();

      // Wait a bit for final results to come through before updating UI
      setTimeout(() => {
        console.log("Processing transcript:", lastTranscriptRef.current);

        // Update input text with the final transcript when stopping
        if (lastTranscriptRef.current.trim()) {
          console.log("Setting input text to:", lastTranscriptRef.current);
          setInputText(lastTranscriptRef.current);
          lastTranscriptRef.current = "";
        } else {
          console.log("No transcript to add (empty or whitespace)");
        }

        setIsRecording(false);
      }, 100);
    } else {
      console.log("Starting recording...");
      try {
        lastTranscriptRef.current = "";
        isRecordingRef.current = true;
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        isRecordingRef.current = false;
        setIsRecording(false);
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

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  /**
   * Handle transport mode selection — asks the agent for directions/cost,
   * enriches shopping list with price predictions, then navigates to Results.
   */
  const handleTransportSelect = async (mode) => {
    setIsTransportLoading(true);

    const modeLabel =
      mode === "walking"
        ? "walk"
        : mode === "public_transport"
          ? "take public transport (bus)"
          : "drive";

    const address = userPreferences.address || "my home address";
    const transportPrompt = `I'll ${modeLabel} to the nearest Coles store. Using the store location and fuel prices you already found earlier in our conversation (do NOT look them up again), just get directions from ${address} to that store for ${modeLabel === "drive" ? "driving" : modeLabel === "take public transport (bus)" ? "TRANSIT" : "WALKING"} mode and tell me the travel time, distance, and estimated transport cost (fuel cost if driving, fare if bus, $0 if walking).`;

    // Add the user message to chat history
    const userMsg = {
      id: Date.now().toString(),
      text: transportPrompt,
      isUser: true
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      // 1. Get transport info from agent
      const response = await sendMessageToN8nWithFallback(
        shoppingList,
        transportPrompt,
        null,
        sessionId,
        userPreferences.address
      );

      if (response.sessionId) setSessionId(response.sessionId);
      if (response.updatedList) {
        setShoppingList(response.updatedList);
        checkForGoodBuys(response.updatedList);
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isUser: false
      };
      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // 2. Use the shopping list returned by the Strands agent (already has prices + isGoodBuy)
      const enrichedList = response.updatedList || shoppingList;
      if (enrichedList.length > 0) {
        setShoppingList(enrichedList);
      }

      // 3. Navigate to results with enriched data
      setShowTransportModal(false);
      navigate("/results", {
        state: { transportMode: mode, chatMessages: finalMessages }
      });
    } catch (error) {
      console.error("Transport query error:", error);
      // Navigate anyway with what we have
      setShowTransportModal(false);
      navigate("/results", {
        state: { transportMode: mode, chatMessages: updatedMessages }
      });
    } finally {
      setIsTransportLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-purple-100 to-gray-50 dark:from-purple-900/40 dark:to-gray-900 relative overflow-hidden flex flex-col">
      {/* Watch List Overlay */}
      {showManualMode && (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 z-40 flex flex-col animate-slide-in-right">
          <div className="bg-white dark:bg-gray-800 p-6 shadow-sm shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={24} className="text-primary" />
                <h1 className="text-2xl font-bold text-primary">Watch List</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
                >
                  <Trophy size={20} />
                  <span className="hidden sm:inline">Leaderboard</span>
                </button>
                <button
                  onClick={() => setShowManualMode(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            {shoppingList.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {shoppingList.length}{" "}
                {shoppingList.length === 1 ? "item" : "items"} selected
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 pb-32">
              <div className="grid grid-cols-1 gap-4">
                {sampleProducts.map((product) => {
                  const inList = shoppingList.some(
                    (i) => i.name === product.name
                  );
                  const quantity = productQuantities[product.id] || 1;
                  return (
                    <div key={product.id} className="relative">
                      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                              {product.name}
                            </h3>

                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-3xl font-extrabold text-primary">
                                ${product.price.toFixed(2)}
                              </span>
                              {product.isOnSale && product.originalPrice && (
                                <span className="text-sm line-through text-gray-400">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {product.isOnSale && product.originalPrice && (
                              <div className="inline-flex items-center text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg mb-3">
                                💰 Save ${(product.originalPrice - product.price).toFixed(2)}
                              </div>
                            )}

                            <div className="flex items-center gap-2 flex-wrap mb-3">
                              {product.isOnSale && (
                                <span className="inline-flex items-center text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full shadow-md">
                                  🔥 On Sale!
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full ${
                                  product.stock > 0
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                }`}
                              >
                                {product.stock > 0
                                  ? `✓ In Stock (${product.stock})`
                                  : "✗ Out of Stock"}
                              </span>
                              {isGoodTimeToBuy(product) && (
                                <span className="inline-flex items-center text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full shadow-md animate-pulse">
                                  📉 Good time to buy! +{GOOD_CHOICE_XP_BONUS} XP
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              if (!inList) {
                                setShoppingList([...shoppingList, {
                                  id: product.id,
                                  name: product.name,
                                  icon: 'ShoppingBag',
                                  quantity: quantity,
                                  price: product.price
                                }]);
                                // Reset quantity after adding
                                setProductQuantities({
                                  ...productQuantities,
                                  [product.id]: 1
                                });
                                // Award bonus XP if the price is trending down
                                if (isGoodTimeToBuy(product)) {
                                  setXp(prev => prev + GOOD_CHOICE_XP_BONUS);
                                  setGoodChoiceToast({ productName: product.name, xpBonus: GOOD_CHOICE_XP_BONUS });
                                  setTimeout(() => setGoodChoiceToast(null), 3000);
                                }
                              } else {
                                // Remove from list if already added
                                setShoppingList(shoppingList.filter(i => i.id !== product.id));
                              }
                            }}
                            disabled={product.stock === 0}
                            className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                              inList
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400'
                                : product.stock === 0
                                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                  : 'bg-primary/10 hover:bg-primary text-primary hover:text-white'
                            }`}
                          >
                            {inList ? 'In Cart ✓' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                          <button
                            onClick={() => handlePriceHistoryClick(product)}
                            className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                            aria-label={`View price history for ${product.name}`}
                          >
                            <TrendingUp size={20} />
                          </button>
                          <button
                            onClick={() => handleShareClick(product)}
                            className="p-2.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                            aria-label={`Share ${product.name}`}
                          >
                            <Share2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Message */}
              <div className="mt-6 mb-4 text-center bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-2xl p-5 border border-primary/20 shadow-md">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">📈</span>
                  <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                    Predicted price trends coming soon...{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-red-600">
                      unlock for $1.99
                    </span>
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get AI-powered insights on the best time to buy
                </p>
              </div>

              <button
                onClick={() => {
                  setShowManualMode(false);
                  handleStartAIMode();
                }}
                className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-lg active:scale-95 transition-transform mt-6 flex items-center justify-center gap-2"
              >
                <MessageSquare size={22} />
                {shoppingList.length > 0
                  ? "Continue editing your list"
                  : "Start your list"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Fits within viewport */}
      <div
        className={`flex-1 flex flex-col overflow-hidden min-h-0 ${isChatMode ? "pb-4" : "pb-16"}`}
      >
        {/* Mascot - Transitions from center to top */}
        <div
          className={`flex justify-center items-center transition-all duration-700 ease-in-out relative ${
            isChatMode ? "pt-1 pb-0 shrink-0" : "pt-6 pb-4 shrink-0"
          }`}
        >
          {/* Back arrow - only visible in chat mode, positioned at top left */}
          {isChatMode && (
            <button
              onClick={() => {
                setIsChatMode(false);
                setMessages([]);
                setInputText("");
                setSessionId(null);
              }}
              className="absolute left-4 top-2 text-gray-900 dark:text-white hover:text-primary transition-colors p-1.5 bg-white/50 dark:bg-gray-800/50 rounded-full z-10"
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <div className="relative">
            <div
              className={`transition-all duration-700 ease-in-out ${
                isChatMode ? "scale-75" : "scale-100"
              }`}
            >
              <MascotPreview
                equippedItems={equippedItems}
                mascotItems={mascotItems}
                size="large"
              />
            </div>

            {/* Speech bubble - fades out in chat mode */}
            {!isChatMode && (
              <div className="absolute bottom-0 right-0 transform translate-x-30 translate-y-2">
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl px-5 py-2.5 shadow-lg animate-bounce-slow transition-opacity duration-500">
                  <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    Ready to shop?
                  </p>
                  {/* iMessage-style curved tail - thicker and curves upward */}
                  <svg
                    className="absolute -left-3 -top-2 w-8 h-8 text-white dark:text-gray-800"
                    viewBox="0 0 32 32"
                  >
                    <path
                      fill="currentColor"
                      d="M 32 12 Q 20 8, 8 0 Q 12 10, 18 16 Q 24 20, 32 20 Z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Welcome View - Fades out when chat mode starts */}
        <div
          className={`flex-1 flex flex-col transition-all duration-500 min-h-0 ${
            isChatMode
              ? "opacity-0 pointer-events-none absolute"
              : "opacity-100"
          }`}
        >
          <div className="text-center px-6 mb-2 shrink-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Hi, {userPreferences.name || "there"}!
            </h1>
            <p className="text-gray-600 dark:text-white text-sm">
              I'm here to help you shop smarter
            </p>
          </div>

          {shoppingList.length > 0 && (
            <div className="mx-6 mb-2 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md shrink-0">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Your List So Far
              </h3>
              <div className="flex flex-wrap gap-2">
                {shoppingList.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    <span>{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="font-bold">×{item.quantity}</span>
                    )}
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
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 px-2 mb-1">
                  Recent Lists
                </h3>
                {displayHistory
                  .slice(-3)
                  .reverse()
                  .map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => handleViewHistory(entry)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/60 dark:hover:bg-gray-700/60 transition-colors text-left"
                    >
                      <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg shrink-0">
                        <Receipt size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {entry.results?.storeName || "Store"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(entry.timestamp)} • {entry.items.length}{" "}
                          {entry.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                      <ChevronDown
                        size={16}
                        className="text-gray-400 -rotate-90 shrink-0"
                      />
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="px-6 pb-16 shrink-0">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleStartAIMode}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <MessageSquare size={22} />
                {shoppingList.length > 0
                  ? "Continue editing your list"
                  : "Start your list"}
              </button>
              <button
                onClick={handleToggleManualMode}
                className="w-full py-3.5 bg-white dark:bg-gray-800 text-primary dark:text-primary border-2 border-primary rounded-xl font-semibold text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Eye size={22} />
                Watch List
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Chat with me to build your list, or browse products
            </p>
          </div>
        </div>

        {/* Chat View - Fades in when chat mode starts */}
        {isChatMode && (
          <div className="flex-1 flex flex-col transition-all duration-500 animate-fade-in overflow-hidden min-h-0">
            {/* Messages - Scrollable area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 mb-2 px-4 min-h-0">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-3xl px-5 py-3 shadow-lg backdrop-blur-sm whitespace-pre-wrap ${
                      msg.isUser
                        ? "bg-primary text-white"
                        : "bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white"
                    }`}
                  >
                    {msg.isUser ? msg.text : (msg.text || '').replace(/\*\*/g, '')}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white rounded-3xl px-5 py-3 shadow-lg backdrop-blur-sm">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      >
                        ●
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      >
                        ●
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Collapsible Shopping List Editor */}
            {shoppingList.length > 0 && (
              <div className="shrink-0 px-4 mb-2">
                <button
                  onClick={() => setShowListEditor(!showListEditor)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-primary" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      My List ({shoppingList.length}{" "}
                      {shoppingList.length === 1 ? "item" : "items"})
                    </span>
                    {(() => {
                      const total = shoppingList.reduce(
                        (s, i) => s + (i.price || 0) * (i.quantity || 1),
                        0
                      );
                      return total > 0 ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          — ${total.toFixed(2)}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  {showListEditor ? (
                    <ChevronDown size={16} className="text-gray-500" />
                  ) : (
                    <ChevronUp size={16} className="text-gray-500" />
                  )}
                </button>

                {showListEditor && (
                  <div className="mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200 dark:border-gray-700 max-h-52 overflow-y-auto">
                    {shoppingList.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        {/* Item name + price */}
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          {item.price > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ${item.price.toFixed(2)} ea
                            </p>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1.5 mr-2">
                          <button
                            onClick={() => {
                              if ((item.quantity || 1) <= 1) return;
                              setShoppingList(
                                shoppingList.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        quantity: (it.quantity || 1) - 1
                                      }
                                    : it
                                )
                              );
                            }}
                            disabled={(item.quantity || 1) <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => {
                              setShoppingList(
                                shoppingList.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        quantity: (it.quantity || 1) + 1
                                      }
                                    : it
                                )
                              );
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => {
                            setShoppingList(
                              shoppingList.filter((_, i) => i !== idx)
                            );
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Calculate Savings Button — only visible once the list has items */}
            {shoppingList.length > 0 && (
              <div className="pb-2 pt-1 shrink-0 px-4">
                {!userPreferences.address && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 text-center mb-1">
                    ⚠️ Set your home address in{" "}
                    <button
                      onClick={() => navigate("/settings")}
                      className="underline font-semibold"
                    >
                      Settings
                    </button>{" "}
                    for accurate directions &amp; costs
                  </p>
                )}
                <button
                  onClick={() => {
                    if (!userPreferences.address) {
                      navigate("/settings");
                      return;
                    }
                    setShowTransportModal(true);
                  }}
                  className="w-full py-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl font-semibold hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors active:scale-95 shadow-md"
                >
                  Calculate my savings
                </button>
              </div>
            )}

            {/* Input Area - Fixed at bottom */}
            <div className="pb-3 shrink-0 px-4">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-2xl p-1.5 flex items-center gap-2">
                {isRecording ? (
                  /* Waveform animation while recording */
                  <div className="flex-1 px-4 py-2.5 flex items-center justify-center gap-1">
                    <div
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{ height: "12px", animationDuration: "0.6s" }}
                    ></div>
                    <div
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: "20px",
                        animationDuration: "0.5s",
                        animationDelay: "0.1s"
                      }}
                    ></div>
                    <div
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: "16px",
                        animationDuration: "0.7s",
                        animationDelay: "0.2s"
                      }}
                    ></div>
                    <div
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: "24px",
                        animationDuration: "0.6s",
                        animationDelay: "0.3s"
                      }}
                    ></div>
                    <div
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: "18px",
                        animationDuration: "0.5s",
                        animationDelay: "0.4s"
                      }}
                    ></div>
                    <div
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: "22px",
                        animationDuration: "0.7s",
                        animationDelay: "0.5s"
                      }}
                    ></div>
                    <div
                      className="w-1 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: "14px",
                        animationDuration: "0.6s",
                        animationDelay: "0.6s"
                      }}
                    ></div>
                    <span className="ml-2 text-red-500 text-sm font-medium">
                      Recording...
                    </span>
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
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <Mic size={18} />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputText.trim() && !isRecording)}
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Shopping List
              </h3>
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
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Spent
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${selectedHistoryEntry.results.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Savings
                    </span>
                    <span className="font-semibold text-primary">
                      {selectedHistoryEntry.results.savingsPercentage.toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      XP Earned
                    </span>
                    <span className="font-semibold text-primary">
                      +{selectedHistoryEntry.xpEarned} XP
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Items ({selectedHistoryEntry.items.length})
              </h4>
              {selectedHistoryEntry.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-700 dark:text-gray-300">
                      {renderIcon(item.icon, 24)}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Add this specific item to shopping list if not already there
                      if (
                        !shoppingList.some(
                          (listItem) => listItem.name === item.name
                        )
                      ) {
                        setShoppingList([...shoppingList, item]);
                      }
                    }}
                    disabled={shoppingList.some(
                      (listItem) => listItem.name === item.name
                    )}
                    className={`p-2 rounded-lg transition-all ${
                      shoppingList.some(
                        (listItem) => listItem.name === item.name
                      )
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default"
                        : "bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary hover:text-white"
                    }`}
                    aria-label={`Add ${item.name} to cart`}
                  >
                    <ShoppingCart size={16} />
                  </button>
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

      {/* Share Popup Modal */}
      {showSharePopup && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl transform animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Share2 size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Share Your Savings!
                </h3>
              </div>
              <button
                onClick={() => setShowSharePopup(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-4 mb-4 border border-primary/20">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  You found a great deal on{" "}
                  <span className="font-bold text-primary">
                    {selectedProduct.name}
                  </span>
                  !
                </p>
                {selectedProduct.isOnSale && selectedProduct.originalPrice && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      💰 $
                      {(
                        selectedProduct.originalPrice - selectedProduct.price
                      ).toFixed(2)}{" "}
                      savings
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      (
                      {Math.round(
                        (1 -
                          selectedProduct.price /
                            selectedProduct.originalPrice) *
                          100
                      )}
                      % off)
                    </span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Share your money-saving tips with friends and help them save
                too! Every tip shared helps build a community of smart shoppers.
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-2xl">💡</span>{" "}
                  <span className="font-semibold">Pro Tip:</span> Share how you
                  found this deal, when to buy, or alternative products to
                  consider!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSharePopup(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  alert("Share functionality would open here!");
                  setShowSharePopup(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Share Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {showPriceHistory && priceHistoryProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl transform animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <TrendingUp
                    size={24}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Price History
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {priceHistoryProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPriceHistory(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Price Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">
                  Current Price
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${priceHistoryProduct.price.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">
                  Lowest (2mo)
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  $
                  {Math.min(
                    ...priceHistoryProduct.priceHistory.map((h) => h.price)
                  ).toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                <p className="text-xs text-orange-700 dark:text-orange-400 font-medium mb-1">
                  Highest (2mo)
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  $
                  {Math.max(
                    ...priceHistoryProduct.priceHistory.map((h) => h.price)
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Simple Line Graph */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                2-Month Price Trend
              </h4>
              <div className="relative h-64">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2">
                  <span>
                    $
                    {Math.max(
                      ...priceHistoryProduct.priceHistory.map((h) => h.price)
                    ).toFixed(2)}
                  </span>
                  <span>
                    $
                    {(
                      (Math.max(
                        ...priceHistoryProduct.priceHistory.map((h) => h.price)
                      ) +
                        Math.min(
                          ...priceHistoryProduct.priceHistory.map(
                            (h) => h.price
                          )
                        )) /
                      2
                    ).toFixed(2)}
                  </span>
                  <span>
                    $
                    {Math.min(
                      ...priceHistoryProduct.priceHistory.map((h) => h.price)
                    ).toFixed(2)}
                  </span>
                </div>

                {/* Graph area */}
                <div className="ml-12 h-full relative">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 240"
                    preserveAspectRatio="none"
                  >
                    {/* Grid lines */}
                    <line
                      x1="0"
                      y1="0"
                      x2="800"
                      y2="0"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-gray-300 dark:text-gray-600"
                    />
                    <line
                      x1="0"
                      y1="120"
                      x2="800"
                      y2="120"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-gray-300 dark:text-gray-600"
                      strokeDasharray="4"
                    />
                    <line
                      x1="0"
                      y1="240"
                      x2="800"
                      y2="240"
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-gray-300 dark:text-gray-600"
                    />

                    {/* Price line */}
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-primary"
                      points={priceHistoryProduct.priceHistory
                        .map((point, index) => {
                          const x =
                            (index /
                              (priceHistoryProduct.priceHistory.length - 1)) *
                            800;
                          const minPrice = Math.min(
                            ...priceHistoryProduct.priceHistory.map(
                              (h) => h.price
                            )
                          );
                          const maxPrice = Math.max(
                            ...priceHistoryProduct.priceHistory.map(
                              (h) => h.price
                            )
                          );
                          const priceRange = maxPrice - minPrice || 1;
                          const y =
                            240 - ((point.price - minPrice) / priceRange) * 240;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />

                    {/* Data points */}
                    {priceHistoryProduct.priceHistory.map((point, index) => {
                      const x =
                        (index /
                          (priceHistoryProduct.priceHistory.length - 1)) *
                        800;
                      const minPrice = Math.min(
                        ...priceHistoryProduct.priceHistory.map((h) => h.price)
                      );
                      const maxPrice = Math.max(
                        ...priceHistoryProduct.priceHistory.map((h) => h.price)
                      );
                      const priceRange = maxPrice - minPrice || 1;
                      const y =
                        240 - ((point.price - minPrice) / priceRange) * 240;
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="currentColor"
                          className="text-primary"
                        />
                      );
                    })}
                  </svg>

                  {/* X-axis labels */}
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>
                      {new Date(
                        priceHistoryProduct.priceHistory[0].date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                    <span>
                      {new Date(
                        priceHistoryProduct.priceHistory[
                          Math.floor(
                            priceHistoryProduct.priceHistory.length / 2
                          )
                        ].date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                    <span>
                      {new Date(
                        priceHistoryProduct.priceHistory[
                          priceHistoryProduct.priceHistory.length - 1
                        ].date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="text-2xl">📊</span>{" "}
                <span className="font-semibold">Insight:</span>{" "}
                {priceHistoryProduct.price <
                priceHistoryProduct.priceHistory[
                  priceHistoryProduct.priceHistory.length - 2
                ].price
                  ? "Price is trending down! This might be a good time to buy."
                  : priceHistoryProduct.price >
                      priceHistoryProduct.priceHistory[
                        priceHistoryProduct.priceHistory.length - 2
                      ].price
                    ? "Price is trending up. Consider waiting for a better deal."
                    : "Price has been stable recently."}
              </p>
            </div>

            <button
              onClick={() => setShowPriceHistory(false)}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Good Choice Toast */}
      {goodChoiceToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-bounce-slow">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3">
            <span className="text-2xl">🌟</span>
            <div>
              <p className="font-bold text-sm">Good choice! +{goodChoiceToast.xpBonus} XP</p>
              <p className="text-xs text-white/80">{goodChoiceToast.productName} is at a great price right now!</p>
            </div>
          </div>
        </div>
      )}

      {/* Transport Mode Selection Modal */}
      {showTransportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6">
            {isTransportLoading ? (
              /* Loading state while agent calculates directions */
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Calculating your route...
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Koko is working out directions and transport costs
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Select Transport Mode
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    How will you get to the store?
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Walking Option */}
                  <button
                    onClick={() => handleTransportSelect("walking")}
                    className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700 rounded-xl hover:shadow-lg active:scale-95 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-200 dark:bg-green-700 rounded-full">
                        <Footprints
                          size={28}
                          className="text-green-700 dark:text-green-200"
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                          Walking
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Free — no transport cost
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Public Transport Option */}
                  <button
                    onClick={() => handleTransportSelect("public_transport")}
                    className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl hover:shadow-lg active:scale-95 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-200 dark:bg-blue-700 rounded-full">
                        <Bus
                          size={28}
                          className="text-blue-700 dark:text-blue-200"
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          Public Transport
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Bus / train fare applies
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Driving Option */}
                  <button
                    onClick={() => handleTransportSelect("driving")}
                    className="w-full p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl hover:shadow-lg active:scale-95 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-200 dark:bg-purple-700 rounded-full">
                        <Car
                          size={28}
                          className="text-purple-700 dark:text-purple-200"
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          Driving
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Fuel cost will be estimated
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowTransportModal(false)}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
