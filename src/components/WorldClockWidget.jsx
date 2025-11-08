import React, { useState, useEffect } from 'react';

const WorldClockWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userTimezone, setUserTimezone] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detect user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimezone(timezone);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  const timeZones = [
    { name: 'Your Location', timezone: userTimezone, text: 'YOU' },
    { name: 'New York', timezone: 'America/New_York', text: 'USA' },
    { name: 'London', timezone: 'Europe/London', text: 'UK' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo', text: 'JP' }
  ];

  const getTimeForTimezone = (timezone) => {
    if (!timezone) return new Date();
    return new Date(currentTime.toLocaleString("en-US", { timeZone: timezone }));
  };

  const AnalogClock = ({ time, label, text, isUserLocation = false }) => {
    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    const hourAngle = (hours * 30) + (minutes * 0.5);
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    const isBusinessHours = time.getHours() >= 9 && time.getHours() < 17;

    return (
      <div className="text-center flex-1">
        <div className="flex items-center justify-center mb-2">
          <span className={`text-sm font-bold ${isUserLocation ? 'text-blue-600' : (isDarkMode ? 'text-teal-400' : 'text-gray-700')}`}>
            {text}
          </span>
        </div>
        <div className="flex items-center justify-center mb-3">
          <span className={`text-sm font-medium ${isUserLocation ? 'text-blue-600' : (isDarkMode ? 'text-teal-400' : 'text-gray-700')}`}>
            {label}
          </span>
        </div>
        
        <div className={`relative mx-auto w-28 h-28 ${isDarkMode ? 'bg-gray-800 border-2 border-gray-600' : 'bg-white border-2 border-gray-300'} rounded-full shadow-lg mb-4`}>
          {/* Clock face numbers - All 12 numbers positioned uniformly around the edge */}
          <div className={`absolute top-1 left-1/2 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>12</div>
          <div className={`absolute top-2 right-6 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>1</div>
          <div className={`absolute top-6 right-2 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>2</div>
          <div className={`absolute right-1 top-1/2 transform -translate-y-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>3</div>
          <div className={`absolute bottom-6 right-2 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>4</div>
          <div className={`absolute bottom-2 right-6 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>5</div>
          <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>6</div>
          <div className={`absolute bottom-2 left-6 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>7</div>
          <div className={`absolute bottom-6 left-2 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>8</div>
          <div className={`absolute left-1 top-1/2 transform -translate-y-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>9</div>
          <div className={`absolute top-6 left-2 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>10</div>
          <div className={`absolute top-2 left-6 transform -translate-x-1/2 text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-gray-700'}`}>11</div>
          
          {/* Hour markers */}
          <div className="absolute top-0.5 left-1/2 w-0.5 h-3 bg-gray-400 transform -translate-x-1/2"></div>
          <div className="absolute bottom-0.5 left-1/2 w-0.5 h-3 bg-gray-400 transform -translate-x-1/2"></div>
          <div className="absolute left-0.5 top-1/2 w-3 h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
          <div className="absolute right-0.5 top-1/2 w-3 h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
          
          {/* Hour hand */}
          <div 
            className={`absolute left-1/2 top-1/2 origin-bottom rounded-full ${isDarkMode ? 'bg-teal-400' : 'bg-gray-800'}`}
            style={{
              width: '3px',
              height: '28px',
              transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
              transformOrigin: '50% 100%'
            }}
          ></div>
          
          {/* Minute hand */}
          <div 
            className={`absolute left-1/2 top-1/2 origin-bottom rounded-full ${isDarkMode ? 'bg-teal-400' : 'bg-gray-600'}`}
            style={{
              width: '2px',
              height: '38px',
              transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
              transformOrigin: '50% 100%'
            }}
          ></div>
          
          {/* Second hand */}
          <div 
            className="absolute left-1/2 top-1/2 origin-bottom bg-red-500 rounded-full"
            style={{
              width: '1px',
              height: '42px',
              transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
              transformOrigin: '50% 100%'
            }}
          ></div>
          
          {/* Center dot */}
          <div className={`absolute left-1/2 top-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${isDarkMode ? 'bg-teal-400' : 'bg-gray-800'}`}></div>
        </div>
        
        <div className="text-center">
          <div className={`text-sm font-mono font-semibold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'}`}>
            {time.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
          <div className={`text-xs mt-1 ${isBusinessHours ? 'text-green-600' : (isDarkMode ? 'text-gray-400' : 'text-gray-400')}`}>
            {isBusinessHours ? '💼 Business' : '🌙 After Hours'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white'} rounded-xl shadow-lg p-6`}>
      <div className="flex justify-between items-start gap-6 mb-6">
        {timeZones.map((zone, index) => (
          <AnalogClock
            key={index}
            time={getTimeForTimezone(zone.timezone)}
            label={zone.name}
            text={zone.text}
            isUserLocation={index === 0}
          />
        ))}
      </div>
      
      <div className={`flex items-center justify-between ${isDarkMode ? 'border-t border-gray-600' : 'border-t border-gray-100'} pt-4`}>
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-gray-800'} flex items-center gap-2`}>
          <span className="text-2xl">🌍</span>
          Global Business Clock
        </h3>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {userTimezone ? `Your timezone: ${userTimezone.split('/').pop().replace('_', ' ')}` : 'Detecting location...'} • Perfect timing for global outreach! 🚀
        </div>
      </div>
    </div>
  );
};

export default WorldClockWidget;