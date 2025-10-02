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

  useEffect(() => {
    // Get quote based on day of year to ensure same quote per day
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % businessQuotes.length;
    setQuote(businessQuotes[quoteIndex]);
  }, []);

  const getNewQuote = () => {
    setFadeClass('opacity-0');
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * businessQuotes.length);
      setQuote(businessQuotes[randomIndex]);
      setFadeClass('opacity-100');
    }, 300);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="text-lg font-semibold text-gray-800">Daily Inspiration</h3>
          </div>
          <button
            onClick={getNewQuote}
            className="text-teal-600 hover:text-teal-700 transition-colors duration-200 p-1 rounded-lg hover:bg-teal-50"
            title="Get new quote"
          >
            🔄
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Daily motivation 🚀
        </div>
      </div>
      
      <div className={`transition-opacity duration-300 ${fadeClass} mt-4`}>
        <div className="flex items-center justify-between">
          <blockquote className="text-gray-700 italic text-sm leading-relaxed flex-1 pr-4">
            "{quote.quote}"
          </blockquote>
          <div className="text-right">
            <cite className="text-xs text-gray-500 font-medium whitespace-nowrap">— {quote.author}</cite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuoteWidget;