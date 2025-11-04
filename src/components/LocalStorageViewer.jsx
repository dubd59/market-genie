import React, { useState, useEffect } from 'react';

const LocalStorageViewer = () => {
  const [localStorage, setLocalStorage] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadLocalStorage();
  }, [refreshKey]);

  const loadLocalStorage = () => {
    const storage = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      try {
        const value = window.localStorage.getItem(key);
        storage[key] = {
          raw: value,
          parsed: JSON.parse(value),
          size: new Blob([value]).size
        };
      } catch (error) {
        storage[key] = {
          raw: value,
          parsed: 'Invalid JSON',
          size: new Blob([value]).size
        };
      }
    }
    setLocalStorage(storage);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClear = (key) => {
    if (window.confirm(`Are you sure you want to clear "${key}" from localStorage?`)) {
      window.localStorage.removeItem(key);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleExport = (key, data) => {
    const blob = new Blob([JSON.stringify(data.parsed, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${key}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const marketGenieKeys = Object.keys(localStorage).filter(key => 
    key.toLowerCase().includes('marketgenie') || 
    key.toLowerCase().includes('emergency') ||
    key.toLowerCase().includes('lead')
  );

  const otherKeys = Object.keys(localStorage).filter(key => 
    !key.toLowerCase().includes('marketgenie') && 
    !key.toLowerCase().includes('emergency') &&
    !key.toLowerCase().includes('lead')
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          🔍 Local Storage Viewer
        </h2>
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Emergency/Market Genie Keys */}
      {marketGenieKeys.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">🚨 Market Genie / Emergency Storage</h3>
          <div className="space-y-3">
            {marketGenieKeys.map(key => (
              <div key={key} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{key}</h4>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatBytes(localStorage[key].size)}
                    </span>
                    <button
                      onClick={() => handleExport(key, localStorage[key])}
                      className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      📁 Export
                    </button>
                    <button
                      onClick={() => handleClear(key)}
                      className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>
                
                {Array.isArray(localStorage[key].parsed) && (
                  <div className="text-sm text-gray-600 mb-2">
                    Array with {localStorage[key].parsed.length} items
                  </div>
                )}
                
                <div className="bg-white rounded border p-3 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(localStorage[key].parsed, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Keys */}
      {otherKeys.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">📦 Other Local Storage</h3>
          <div className="space-y-2">
            {otherKeys.map(key => (
              <div key={key} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">{key}</h4>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatBytes(localStorage[key].size)}
                    </span>
                    <button
                      onClick={() => handleClear(key)}
                      className="text-sm bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(localStorage).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <div>No data in localStorage</div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">How to Find Emergency Leads</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>1. <strong>Browser DevTools:</strong> Press F12 → Application tab → Local Storage → your domain</p>
          <p>2. <strong>Look for key:</strong> <code className="bg-blue-100 px-1 rounded">marketgenie_emergency_leads</code></p>
          <p>3. <strong>Console:</strong> Type <code className="bg-blue-100 px-1 rounded">localStorage.getItem('marketgenie_emergency_leads')</code></p>
          <p>4. <strong>Count leads:</strong> <code className="bg-blue-100 px-1 rounded">JSON.parse(localStorage.getItem('marketgenie_emergency_leads')).length</code></p>
        </div>
      </div>
    </div>
  );
};

export default LocalStorageViewer;