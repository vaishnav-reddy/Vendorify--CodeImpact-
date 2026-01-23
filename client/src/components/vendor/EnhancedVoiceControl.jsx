import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Settings } from 'lucide-react';
import apiClient from '../../utils/api';

const EnhancedVoiceControl = ({ onStatsUpdate }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setResponse('');
      };
      
      recognitionInstance.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        handleVoiceCommand(speechResult);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setResponse('Sorry, I couldn\'t understand. Please try again.');
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const handleVoiceCommand = useCallback(async (command) => {
    setIsProcessing(true);
    const lowerCommand = command.toLowerCase();
    
    try {
      if (lowerCommand.includes('turn off orders') || lowerCommand.includes('stop orders')) {
        const result = await apiClient.post('/vendors/dashboard/toggle-status', { isOnline: false });
        if (result.success) {
          setResponse('Orders turned off. Your shop is now offline.');
          onStatsUpdate?.();
        } else {
          setResponse('Failed to turn off orders. Please try again.');
        }
      } 
      else if (lowerCommand.includes('turn on orders') || lowerCommand.includes('start orders')) {
        const result = await apiClient.post('/vendors/dashboard/toggle-status', { isOnline: true });
        if (result.success) {
          setResponse('Orders turned on. Your shop is now accepting orders.');
          onStatsUpdate?.();
        } else {
          setResponse('Failed to turn on orders. Please try again.');
        }
      }
      else if (lowerCommand.includes('total revenue') || lowerCommand.includes('my total')) {
        const result = await apiClient.get('/vendors/dashboard/stats');
        if (result.success) {
          setResponse(`Your total revenue is ₹${result.stats.totalRevenue}.`);
        } else {
          setResponse('Unable to fetch revenue data. Please try again.');
        }
      }
      else if (lowerCommand.includes('today\'s earnings') || lowerCommand.includes('today earnings')) {
        const result = await apiClient.get('/vendors/dashboard/stats');
        if (result.success) {
          setResponse(`Today's earnings are ₹${result.stats.todayEarnings}.`);
        } else {
          setResponse('Unable to fetch today\'s earnings. Please try again.');
        }
      }
      else if (lowerCommand.includes('active orders') || lowerCommand.includes('pending orders')) {
        const result = await apiClient.get('/vendors/dashboard/stats');
        if (result.success) {
          setResponse(`You have ${result.stats.activeOrders} active orders.`);
        } else {
          setResponse('Unable to fetch order data. Please try again.');
        }
      }
      else if (lowerCommand.includes('shop status') || lowerCommand.includes('am i online')) {
        const result = await apiClient.get('/vendors/dashboard/stats');
        if (result.success) {
          const status = result.stats.isOnline ? 'online and accepting orders' : 'offline';
          setResponse(`Your shop is currently ${status}.`);
        } else {
          setResponse('Unable to check shop status. Please try again.');
        }
      }
      else {
        setResponse('I can help you with: "Turn on/off orders", "What\'s my total revenue?", "Show today\'s earnings", or "What\'s my shop status?"');
      }
    } catch (error) {
      console.error('Voice command error:', error);
      setResponse('Sorry, something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onStatsUpdate]);

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (response) {
      speakResponse(response);
    }
  }, [response]);

  if (!isSupported) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-gray-600 text-sm">
          Voice control is not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">VOICE CONTROL</h3>
            <p className="text-green-100 text-sm">
              Say "Turn off orders" or "What's my total?" to interact with Vendorify AI.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Voice Control Button */}
        <div className="flex justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-green-500 hover:bg-green-600'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isListening ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Status Display */}
        <div className="text-center space-y-2">
          {isListening && (
            <p className="text-green-100 animate-pulse">
              🎤 Listening...
            </p>
          )}
          
          {isProcessing && (
            <p className="text-green-100">
              🤖 Processing command...
            </p>
          )}
          
          {transcript && (
            <div className="bg-green-800 rounded-lg p-3">
              <p className="text-sm text-green-100">You said:</p>
              <p className="font-medium">"{transcript}"</p>
            </div>
          )}
          
          {response && (
            <div className="bg-green-800 rounded-lg p-3">
              <p className="text-sm text-green-100">AI Response:</p>
              <p className="font-medium">{response}</p>
            </div>
          )}
        </div>

        {/* Quick Commands */}
        <div className="border-t border-green-500 pt-4">
          <p className="text-xs text-green-200 mb-2">Try these commands:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-green-800 rounded px-2 py-1">
              "Turn off orders"
            </div>
            <div className="bg-green-800 rounded px-2 py-1">
              "Turn on orders"
            </div>
            <div className="bg-green-800 rounded px-2 py-1">
              "What's my total?"
            </div>
            <div className="bg-green-800 rounded px-2 py-1">
              "Today's earnings"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVoiceControl;