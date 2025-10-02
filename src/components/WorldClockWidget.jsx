import React, { useState, useEffect } from 'react';

const timeZones = [
  {
    name: 'New York',
    timezone: 'America/New_York',
    flag: '🇺🇸',
    businessHours: [9, 17] // 9 AM to 5 PM
  },
  {
    name: 'London',
    timezone: 'Europe/London', 
    flag: '🇬🇧',
    businessHours: [9, 17]
  },
  {
    name: 'Tokyo',
    timezone: 'Asia/Tokyo',
    flag: '🇯🇵',
    businessHours: [9, 17]
  },
  {
    name: 'Sydney',
    timezone: 'Australia/Sydney',
    flag: '🇦🇺',
    businessHours: [9, 17]
  }
];

const WorldClockWidget = () => {
  const [times, setTimes] = useState({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      timeZones.forEach(zone => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: zone.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: zone.timezone,
          hour: 'numeric',
          hour12: false
        });
        
        const currentHour = parseInt(timeFormatter.format(now));
        const isBusinessHours = currentHour >= zone.businessHours[0] && currentHour < zone.businessHours[1];
        
        newTimes[zone.name] = {
          time: formatter.format(now),
          isBusinessHours,
          hour: currentHour
        };
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (isBusinessHours) => {
    return isBusinessHours ? 'text-green-600' : 'text-gray-500';
  };

  const getStatusIcon = (isBusinessHours) => {
    return isBusinessHours ? '🟢' : '🔴';
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-2xl">🌍</span>
        World Clock
      </h3>
      
      <div className="space-y-3">
        {timeZones.map(zone => (
          <div key={zone.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{zone.flag}</span>
              <div>
                <div className="font-medium text-gray-800">{zone.name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  {getStatusIcon(times[zone.name]?.isBusinessHours)}
                  <span className={getStatusColor(times[zone.name]?.isBusinessHours)}>
                    {times[zone.name]?.isBusinessHours ? 'Business Hours' : 'After Hours'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-semibold text-gray-900">
                {times[zone.name]?.time || '--:--:--'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Perfect timing for global outreach! 🚀
        </div>
      </div>
    </div>
  );
};

export default WorldClockWidget;