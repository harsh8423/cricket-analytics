import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hi! I can help you analyze your cricket data. What would you like to know?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const { isAuthenticated, loading } = useAuth();

  const handleChatButtonClick = () => {
    if (!isAuthenticated && !loading) {
      setShowAuthModal(true);
    } else {
      setIsOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // setIsOpen(true);
  };

  const handleCloseChat = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      // Add user message
      setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: inputMessage })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        setMessages(prev => [...prev, {
          type: 'bot',
          content: data.response
        }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: "Sorry, I encountered an error. Please try again."
        }]);
      }

      setInputMessage('');
    }
  };

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40">
        {/* Chat Icon Button */}
        <button
          onClick={handleChatButtonClick}
          className={`w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center gap-2 shadow-lg hover:scale-105 hover:bg-indigo-700 transition-all ${
            isOpen ? 'scale-0' : 'scale-100'
          }`}
        >
          <MessageCircle size={20} />
        </button>

        {/* Chat Window */}
        {isOpen && (
          <div className="absolute bottom-0 right-0 w-96 bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-indigo-600 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Bot className="text-white" size={24} />
                <h3 className="text-lg font-semibold text-white">Cricket Analytics Assistant</h3>
              </div>
              <button
                onClick={handleCloseChat}
                className="text-white hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.type === 'bot' ? (
                      <ReactMarkdown 
                        className="prose prose-sm max-w-none"
                        components={{
                          p: ({node, ...props}) => <p className="m-0" {...props} />,
                          a: ({node, ...props}) => <a className="text-indigo-600 hover:underline" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mt-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mt-2" {...props} />,
                          li: ({node, ...props}) => <li className="mt-1" {...props} />,
                          code: ({node, inline, ...props}) => (
                            inline ? 
                              <code className="bg-gray-200 px-1 rounded" {...props} /> :
                              <code className="block bg-gray-200 p-2 rounded mt-2" {...props} />
                          )
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about your cricket analytics..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default ChatAssistant;