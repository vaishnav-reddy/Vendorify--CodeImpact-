import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const VoiceRecorder = ({ 
  onTranscript, 
  disabled = false, 
  className = '',
  language = 'en-US',
  isListening,
  setIsListening,
  placeholder = "Speak now..."
}) => {
  const [internalIsRecording, setInternalIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const isRecording = isListening !== undefined ? isListening : internalIsRecording;

  const startRecording = useCallback(async () => {
    setError(null);
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => {
      if (setIsListening) setIsListening(true);
      else setInternalIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (onTranscript) {
        onTranscript(transcript);
      }
      // Stop after one result since we are simulating single-shot but with better stability
      recognition.stop();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      let errorMsg = `Speech recognition error: ${event.error}`;
      
      if (event.error === 'network') {
        errorMsg = 'Network error: Speech recognition requires an internet connection or is being blocked. Try again or use a different browser.';
      } else if (event.error === 'not-allowed') {
        errorMsg = 'Microphone access denied. Please enable microphone permissions.';
      } else if (event.error === 'no-speech') {
        return; // Ignore "no-speech" as it often fires prematurely
      }
      
      setError(errorMsg);
      if (setIsListening) setIsListening(false);
      else setInternalIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      if (setIsListening) setIsListening(false);
      else setInternalIsRecording(false);
      setIsProcessing(false);
    };

    try {
      await recognition.start();
      setIsProcessing(true);
    } catch (err) {
      console.error('Failed to start speech recognition', err);
      setError('Failed to start speech recognition. Please check microphone permissions.');
      setIsProcessing(false);
    }
  }, [onTranscript, language, setIsListening]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (setIsListening) setIsListening(false);
    else setInternalIsRecording(false);
    setIsProcessing(false);
  }, [setIsListening]);

  const handleClick = () => {
    if (disabled || isProcessing) return;
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`p-2 rounded-full transition-colors ${
          isRecording
            ? 'bg-red-500 text-white animate-pulse'
            : disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
        }`}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isProcessing && !isRecording ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isRecording ? (
          <MicOff size={18} />
        ) : (
          <Mic size={18} />
        )}
      </button>
      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-xs rounded whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
