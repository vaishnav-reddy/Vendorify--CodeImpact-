import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatbotWidget from './ChatbotWidget';

const ConditionalChatbot = () => {
  const { isAuthenticated, user } = useAuth();
  
  // Only show chatbot for authenticated users (vendors or customers)
  if (!isAuthenticated || !user || !user.id) {
    return null;
  }
  
  return <ChatbotWidget />;
};

export default ConditionalChatbot;
