import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { sendMessageToN8nWithFallback } from '../utils/api';

/**
 * EditList Component - Chat interface for editing shopping lists
 * Requirements: 3.1, 3.3, 3.4, 3.7, 3.8
 */
const EditList = () => {
  const navigate = useNavigate();
  const { shoppingList, setShoppingList } = useContext(AppContext);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: 'Hi! Tell me what items you need, and I\'ll help you build your shopping list.',
      isUser: false
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      
      // Add bot response
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isUser: false
      };
      setMessages(prev => [...prev, botMessage]);

      // Update shopping list with parsed items
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
   * Handle Enter key down
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Start voice recording
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  /**
   * Stop voice recording
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * Handle voice message transcription and processing
   */
  const handleVoiceMessage = async (audioBlob) => {
    setIsLoading(true);

    try {
      // Convert audio to base64 for sending to n8n
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;

        const userMessage = {
          id: Date.now().toString(),
          text: '🎤 Voice message',
          isUser: true
        };
        setMessages(prev => [...prev, userMessage]);

        const response = await sendMessageToN8nWithFallback(shoppingList, '', base64Audio);
        
        // Add bot response
        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: response.reply,
          isUser: false
        };
        setMessages(prev => [...prev, botMessage]);

        // Update shopping list with parsed items
        if (response.updatedList) {
          setShoppingList(response.updatedList);
        }

        setIsLoading(false);
      };
    } catch {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I couldn\'t process your voice message. Please try again.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  /**
   * Handle checkmark button - navigate to results
   */
  const handleComplete = () => {
    if (shoppingList.length === 0) {
      const errorMessage = {
        id: Date.now().toString(),
        text: 'Please add some items to your shopping list first.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    navigate('/results');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.isUser 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-4 py-3 shadow-sm">
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

      {/* Input container */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your items..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`p-3 rounded-full active:scale-95 transition-transform ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-primary text-white'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            🎤
          </button>
          <button 
            onClick={handleComplete}
            disabled={isLoading}
            className="p-3 bg-primary text-white rounded-full active:scale-95 transition-transform"
            aria-label="Complete list"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditList;
