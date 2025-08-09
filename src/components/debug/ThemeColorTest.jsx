import React from 'react';

const ThemeColorTest = () => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-white p-4 shadow-lg rounded-lg border">
      <h3 className="font-bold mb-2">Theme Color Test</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          ></div>
          <span>Primary: var(--brand-primary)</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: 'var(--brand-secondary)' }}
          ></div>
          <span>Secondary: var(--brand-secondary)</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: 'var(--success-color)' }}
          ></div>
          <span>Success: var(--success-color)</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: 'var(--error-color)' }}
          ></div>
          <span>Error: var(--error-color)</span>
        </div>
        <div className="mt-3 p-2 rounded" style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}>
          Button with Primary Color
        </div>
        <div className="p-2 rounded" style={{ backgroundColor: 'var(--brand-secondary)', color: 'white' }}>
          Button with Secondary Color
        </div>
      </div>
    </div>
  );
};

export default ThemeColorTest;
