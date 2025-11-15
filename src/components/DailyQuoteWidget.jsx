import React, { useState, useEffect } from 'react';

const businessQuotes = [
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs"
  },
  {
    quote: "Your most unhappy customers are your greatest source of learning.",
    author: "Bill Gates"
  },
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The customer is the final judge of value.",
    author: "Peter Drucker"
  },
  {
    quote: "A brand is no longer what we tell the consumer it is – it is what consumers tell each other it is.",
    author: "Scott Cook"
  },
  {
    quote: "Marketing is no longer about the stuff that you make, but about the stories you tell.",
    author: "Seth Godin"
  },
  {
    quote: "The best marketing doesn't feel like marketing.",
    author: "Tom Fishburne"
  },
  {
    quote: "Content is fire, social media is gasoline.",
    author: "Jay Baer"
  },
  {
    quote: "The aim of marketing is to know and understand the customer so well the product or service fits him and sells itself.",
    author: "Peter Drucker"
  }
];

const DailyQuoteWidget = () => {
  const [quote, setQuote] = useState(businessQuotes[0]);
  const [fadeClass, setFadeClass] = useState('opacity-100');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Get quote based on day of year to ensure same quote per day
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % businessQuotes.length;
    setQuote(businessQuotes[quoteIndex]);
  }, []);

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const darkMode = localStorage.getItem('marketGenieDarkMode') === 'true';
      if (darkMode !== isDarkMode) {
        setIsDarkMode(darkMode);
      }
    };

    // Initial check
    checkDarkMode();

    // Poll for changes
    const interval = setInterval(checkDarkMode, 100);

    return () => clearInterval(interval);
  }, [isDarkMode]);

  const getNewQuote = () => {
    setFadeClass('opacity-0');
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * businessQuotes.length);
      setQuote(businessQuotes[randomIndex]);
      setFadeClass('opacity-100');
    }, 300);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl shadow-lg p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'}`}>Daily Inspiration</h3>
          </div>
          <button
            onClick={getNewQuote}
            className={`${isDarkMode ? 'text-teal-400 hover:text-teal-300 hover:bg-gray-600' : 'text-teal-600 hover:text-teal-700 hover:bg-teal-50'} transition-colors duration-200 p-1 rounded-lg`}
            title="Get new quote"
          >
            🔄
          </button>
        </div>
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Daily motivation 🚀
        </div>
      </div>
      
      <div className={`transition-opacity duration-300 ${fadeClass} mt-4`}>
        <div className="flex items-center justify-between">
          <blockquote className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} italic text-sm leading-relaxed flex-1 pr-4`}>
            "{quote.quote}"
          </blockquote>
          <div className="text-right">
            <cite className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium whitespace-nowrap`}>— {quote.author}</cite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuoteWidget;