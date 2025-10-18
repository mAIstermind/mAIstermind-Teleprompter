
// FIX: Changed React import to the default import style to resolve widespread JSX typing errors.
import React from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed top-10 left-1/2 -translate-x-1/2 bg-gray-800/90 text-white px-6 py-3 rounded-full shadow-lg z-50 transition-all duration-300 animate-fade-in-out"
    >
      {message}
    </div>
  );
};

// You may need to add this keyframe animation to your global CSS or a style tag if you don't have it.
// For Tailwind, you can add it to your tailwind.config.js
/*
@keyframes fade-in-out {
  0% { opacity: 0; transform: translateY(-20px) translateX(-50%); }
  10%, 90% { opacity: 1; transform: translateY(0) translateX(-50%); }
  100% { opacity: 0; transform: translateY(-20px) translateX(-50%); }
}
.animate-fade-in-out {
  animation: fade-in-out 2s ease-in-out forwards;
}
*/

export default Toast;
