// src/components/chat/FloatingChatButton.jsx
import React, { useState } from 'react';

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        <span className="text-2xl">💬</span>
      </button>
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
          <div className="text-center text-gray-500 text-sm">
            Chat feature coming soon
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatButton;
