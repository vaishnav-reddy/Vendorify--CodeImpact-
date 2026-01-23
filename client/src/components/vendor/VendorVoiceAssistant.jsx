import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Mic, Volume2, Settings, MessageCircle, Package, TrendingUp, CheckCircle, X } from 'lucide-react';
import VoiceRecorder from '../common/VoiceRecorder';
import { useAppData } from '../../context/AppDataContext';

const STORAGE_KEY = 'vendor_voice_messages';
const LANGUAGES = {
  en: { name: 'English', code: 'en' },
  hi: { name: 'हिंदी', code: 'hi' },
  te: { name: 'తెలుగు', code: 'te' }
};

const VendorVoiceAssistant = memo(() => {
  const { getOrdersForVendor } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const vendorId = 1;
  const orders = getOrdersForVendor(vendorId);

  const responses = {
    en: {
      welcome: "Hello! I'm your vendor assistant. How can I help you today?",
      orderHelp: "You have 3 new orders. Would you like to see them?",
      earnings: "Today's earnings: ₹1,240. You have 4 active orders.",
      status: "Your shop is online. You can receive new orders.",
      error: "Sorry, I didn't understand. Please try again.",
      orderComplete: "Order completed successfully! Ready for next order.",
      voiceCommand: "Voice command received. Processing...",
      commands: {
        showOrders: "Show orders",
        earnings: "Check earnings", 
        shopStatus: "Shop status",
        markComplete: "Mark complete",
        help: "Help"
      }
    },
    hi: {
      welcome: "नमस्ते! मैं आपका वेंडर सहायक हूँ। आज कैसे मदिल सकते हैं?",
      orderHelp: "आपके 3 नए ऑर्डर हैं। क्या आप उन्हें देखना चाहते हैं?",
      earnings: "आज की कमाई: ₹1,240। आपके 4 एक्टिव ऑर्डर हैं।",
      status: "आपकी दुकान ऑनलाइन है। आप नए ऑर्डर प्राप्त कर सकते हैं।",
      error: "क्षमा करें, मैं समझ नहीं पाया। कृपया फिर से कोशिश करें।",
      orderComplete: "ऑर्डर सफल हो गया! अगला ऑर्डर के लिए तैयारी है।",
      voiceCommand: "वॉयस कमांड मिला। प्रोसेसिं हो रहा है...",
      commands: {
        showOrders: "ऑर्डर दिखाएं",
        earnings: "कमाई देखें", 
        shopStatus: "दुकान स्थिति",
        markComplete: "पूर्ण करें",
        help: "मददत"
      }
    },
    te: {
      welcome: "హాయ్! నేను వెండర్ సహాయకి. మీరు సహాయగాడం?",
      orderHelp: "మీకు 3 కొత్త ఆర్డర్లు ఉన్నాయి. వీటిండ్గాడం?",
      earnings: "ఈరోజు ఆదాయం: ₹1,240. మీకు 4 యాక్టింగా ఆర్డర్లు ఉన్నాయి.",
      status: "మీ దుకాన ఆన్లైన్ది. మీరు కొత్త ఆర్డర్లు స్వీంది.",
      error: "క్షమాపడం, నేను అర్థమాలేదు. దయచుకోండి ప్రయత్ని.",
      orderComplete: "ఆర్డర్ పూర్తి! తదువ ఆర్డర్ కోసిండ్గాడం.",
      voiceCommand: "వాయిస్ ఆదేశం. ప్రక్రెస్ జరుగుచును...",
      commands: {
        showOrders: "ఆర్డర్లు చూపడండి",
        earnings: "ఆదాయం చూడడండి", 
        shopStatus: "దుకాన స్థితి",
        markComplete: "పూర్తి చేయండి",
        help: "సహాయం"
      }
    }
  };

  const currentResponses = responses[selectedLanguage];

  const readMessages = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const writeMessages = useCallback((messages) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, []);

  useEffect(() => {
    const savedMessages = readMessages();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, [readMessages, writeMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceCommand = useCallback(async (transcript) => {
    setIsProcessing(true);
    
    try {
      // Call backend voice command API
      const response = await fetch('/api/vendors/voice/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vendorify_token')}`
        },
        body: JSON.stringify({ 
          command: transcript, 
          language: selectedLanguage 
        })
      });

      let aiResponseText = currentResponses.error;
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          aiResponseText = data.response;
        }
      } else {
        // Fallback to local processing
        const lowerTranscript = transcript.toLowerCase();
        
        if (lowerTranscript.includes('show orders') || lowerTranscript.includes('orders')) {
          const newOrders = orders.filter(o => o.status === 'NEW');
          aiResponseText = `${currentResponses.orderHelp} You have ${newOrders.length} new orders.`;
        } else if (lowerTranscript.includes('earnings') || lowerTranscript.includes('income')) {
          const completedOrders = orders.filter(o => o.status === 'COMPLETED');
          const totalEarnings = completedOrders.reduce((sum, o) => sum + o.total, 0);
          aiResponseText = `${currentResponses.earnings} Total earnings: ₹${totalEarnings}`;
        } else if (lowerTranscript.includes('shop status') || lowerTranscript.includes('online')) {
          aiResponseText = currentResponses.status;
        } else if (lowerTranscript.includes('mark complete') || lowerTranscript.includes('order done')) {
          aiResponseText = currentResponses.orderComplete;
        } else if (lowerTranscript.includes('help')) {
          const commands = currentResponses.commands;
          aiResponseText = `${currentResponses.welcome}\n\nVoice Commands:\n• "${commands.showOrders}" - View new orders\n• "${commands.earnings}" - Check today's income\n• "${commands.shopStatus}" - Check if online\n• "${commands.markComplete}" - Complete order\n• "${commands.help}" - Show this menu`;
        }
      }

      const newMessage = {
        id: Date.now(),
        text: transcript,
        sender: 'vendor',
        timestamp: new Date().toISOString(),
        isVoice: true
      };

      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        isVoice: false
      };

      setMessages(prev => [...prev, newMessage, aiResponse]);
      writeMessages([...messages, newMessage, aiResponse]);
    } catch (error) {
      console.error('Voice command error:', error);
      
      // Fallback response
      const errorMessage = {
        id: Date.now() + 1,
        text: currentResponses.error,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        isVoice: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [currentResponses, orders, messages, writeMessages, selectedLanguage]);

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    localStorage.setItem('vendor_voice_language', langCode);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('vendor_voice_language') || 'en';
    setSelectedLanguage(savedLanguage);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/20"
        >
          <Mic size={28} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Volume2 size={20} className="text-indigo-600" />
                <h3 className="font-bold text-gray-800">Voice Assistant</h3>
                {isListening && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600">Listening...</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-spin"></div>
                    <span className="text-sm text-yellow-600">Processing...</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-gray-400" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <option key={code} value={code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <VoiceRecorder
                onTranscript={handleVoiceCommand}
                isListening={isListening}
                setIsListening={setIsListening}
                placeholder="Speak a command..."
                language={selectedLanguage}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.sender === 'vendor' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      message.sender === 'vendor' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.isVoice && <Mic size={14} />}
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp && new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleVoiceCommand('show orders')}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                >
                  <Package size={16} className="text-indigo-600" />
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => handleVoiceCommand('earnings')}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                >
                  <TrendingUp size={16} className="text-green-600" />
                  <span>Earnings</span>
                </button>
                <button
                  onClick={() => handleVoiceCommand('shop status')}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                >
                  <CheckCircle size={16} className="text-blue-600" />
                  <span>Status</span>
                </button>
                <button
                  onClick={() => handleVoiceCommand('help')}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm"
                >
                  <MessageCircle size={16} className="text-purple-600" />
                  <span>Help</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

VendorVoiceAssistant.displayName = 'VendorVoiceAssistant';

export default VendorVoiceAssistant;
