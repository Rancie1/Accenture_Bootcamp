/**
 * API utility for Strands Agent chat integration
 * Requirements: 3.2, 3.5, 3.6
 */

// FastAPI backend URL - should be configured via environment variable in production
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CHAT_ENDPOINT = `${API_URL}/chat`;

/**
 * Optimize groceries with price predictions
 * @param {string} userId - User ID
 * @param {Array} groceryList - List of item names
 * @returns {Promise<{optimal_cost: number, store_recommendations: Array, item_breakdown: Array}>}
 */
export const optimizeGroceries = async (userId, groceryList) => {
  try {
    const response = await fetch(`${API_URL}/optimise/groceries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userId,
        grocery_list: groceryList
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error optimizing groceries:", error);
    throw error;
  }
};

/**
 * Send message to Strands Agent via FastAPI backend for processing
 * @param {Array} shoppingList - Current shopping list
 * @param {string} message - Text message from user
 * @param {string} audioData - Base64 encoded audio data (optional)
 * @param {string} sessionId - Session ID for conversation continuity (optional)
 * @returns {Promise<{reply: string, updatedList: Array, sessionId: string}>}
 */
export const sendMessageToN8n = async (
  shoppingList,
  message = "",
  audioData = null,
  sessionId = null,
  homeAddress = null
) => {
  try {
    const payload = {
      shoppingList: shoppingList || [],
      message: message.trim(),
      audioData: audioData,
      sessionId: sessionId,
      homeAddress: homeAddress || null
    };

    const response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.reply) {
      throw new Error("Invalid response from server: missing reply field");
    }

    return {
      reply: data.reply,
      updatedList: data.updatedList || shoppingList,
      sessionId: data.sessionId || null
    };
  } catch (error) {
    console.error("Error communicating with backend:", error);

    // Return error response
    throw new Error(
      error.message.includes("fetch")
        ? "Unable to connect. Please check your internet connection."
        : "Something went wrong. Please try again."
    );
  }
};

/**
 * Transcribe audio using backend integration
 * This is a helper function that can be used separately if needed
 * @param {string} audioData - Base64 encoded audio data
 * @returns {Promise<string>} - Transcribed text
 */
export const transcribeAudio = async (audioData) => {
  try {
    const response = await fetch(`${API_URL}/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ audioData })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.transcription || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Unable to transcribe audio. Please try again.");
  }
};

/**
 * Parse natural language items from text
 * This is a mock implementation for development/testing
 * In production, this would be handled by the Strands agent
 * @param {string} text - Natural language description of items
 * @returns {Array} - Parsed shopping list items
 */
export const parseItemsFromText = (text) => {
  // Simple regex-based parsing for common patterns
  const items = [];

  // Pattern: "2 liters of milk" or "a dozen eggs"
  const patterns = [
    /(\d+)\s*(liters?|kg|grams?|pounds?|lbs?|oz|ounces?)\s*(?:of\s+)?([a-z\s]+)/gi,
    /(?:a\s+)?(?:dozen|few|couple|bunch)\s+(?:of\s+)?([a-z\s]+)/gi,
    /(\d+)\s+([a-z\s]+)/gi
  ];

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const quantity = match[1] ? parseInt(match[1]) : 1;
      const name = match[match.length - 1].trim();

      if (name && name.length > 2) {
        items.push({
          id: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          quantity: quantity
        });
      }
    }
  });

  return items;
};

/**
 * Mock response for development/testing
 * This simulates the backend response when no backend is running
 * @param {Array} shoppingList - Current shopping list
 * @param {string} message - User message
 * @returns {Promise<{reply: string, updatedList: Array}>}
 */
export const mockN8nResponse = async (shoppingList, message) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const parsedItems = parseItemsFromText(message);

  if (parsedItems.length === 0) {
    return {
      reply:
        "I couldn't find any items in your message. Try saying something like '2 liters of milk and a dozen eggs'.",
      updatedList: shoppingList
    };
  }

  const updatedList = [...shoppingList];

  parsedItems.forEach((newItem) => {
    // Check if item already exists
    const existingIndex = updatedList.findIndex(
      (item) => item.name.toLowerCase() === newItem.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Update quantity
      updatedList[existingIndex].quantity += newItem.quantity;
    } else {
      // Add new item
      updatedList.push(newItem);
    }
  });

  const itemNames = parsedItems
    .map(
      (item) => `${item.quantity} ${item.name}${item.quantity > 1 ? "s" : ""}`
    )
    .join(", ");

  return {
    reply: `Got it! I've added ${itemNames} to your list.`,
    updatedList: updatedList
  };
};

// For development, use mock responses if backend URL is not configured or unreachable
export const sendMessageToN8nWithFallback = async (
  shoppingList,
  message,
  audioData,
  sessionId = null,
  homeAddress = null
) => {
  // Always try the real backend first; fall back to mock if it fails
  try {
    return await sendMessageToN8n(
      shoppingList,
      message,
      audioData,
      sessionId,
      homeAddress
    );
  } catch (error) {
    console.warn("Backend unavailable, using mock response:", error.message);
    return mockN8nResponse(shoppingList, message);
  }
};
