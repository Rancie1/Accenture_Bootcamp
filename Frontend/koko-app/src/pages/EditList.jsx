import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { sendMessageToN8nWithFallback } from '../utils/api';
import { Mic, Check } from 'lucide-react';
import MascotPreview from '../components/MascotPreview';

/**
 * EditList Component - Chat interface for editing shopping lists
 * Requirements: 3.1, 3.3, 3.4, 3.7, 3.8
 */
const EditList = () => {
  const navigate = useNavigate();
  const { shoppingList, setShoppingList, mascotItems, equippedItems } = useContext(AppContext);
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
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    // Check if browser supports Web Speech API
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

        // Update input text with transcription
        if (finalTranscript) {
          setInputText(prev => prev + finalTranscript);
        } else if (interimTranscript) {
          // Show interim results in real-time
          setInputText(prev => {
            // Remove previous interim results and add new ones
            const lastFinalIndex = prev.lastIndexOf(' ');
            const basePrev = lastFinalIndex > 0 ? prev.substring(0, lastFinalIndex + 1) : prev;
            return basePrev + interimTranscript;
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please enable microphone permissions.');
        } else if (event.error === 'no-speech') {
          // Silently handle no speech detected
        } else {
          alert('Speech recognition error: ' + event.error);
        }
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
   * Start voice recording using Web Speech API
   */
  const startRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      // If already started, just set recording state
      setIsRecording(true);
    }
  };

  /**
   * Stop voice recording
   */
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
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
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} gap-2`}
          >
            {/* AI Mascot Avatar */}
            {!msg.isUser && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-mascot flex items-center justify-center overflow-hidden">
                <MascotPreview 
                  equippedItems={equippedItems}
                  mascotItems={mascotItems}
                  size="small"
                />
              </div>
            )}
            
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
          <div className="flex justify-start gap-2">
            {/* AI Mascot Avatar for loading state */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-mascot flex items-center justify-center overflow-hidden">
              <MascotPreview 
                equippedItems={equippedItems}
                mascotItems={mascotItems}
                size="small"
              />
            </div>
            
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
            <Mic size={20} />
          </button>
          <button 
            onClick={handleComplete}
            disabled={isLoading}
            className="p-3 bg-primary text-white rounded-full active:scale-95 transition-transform"
            aria-label="Complete list"
          >
            <Check size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditList;
