import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Droplets } from 'lucide-react';
import './WindowFrame.css';

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    const handleMaximized = (maximized: boolean) => {
      setIsMaximized(Boolean(maximized));
    };

    api.on('window:maximized', handleMaximized);

    return () => {
      api.off('window:maximized', handleMaximized);
    };
  }, []);

  const handleMinimize = () => {
    window.electronAPI?.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximize();
  };

  const handleClose = () => {
    window.electronAPI?.close();
  };

  return (
    <div className="window-frame">
      <div className="window-frame__title">
        <Droplets size={18} className="window-frame__logo" />
        <span>Parfumerija O'Sinjel De Or - Informacioni sistem</span>
      </div>
      <div className="window-frame__controls">
        <button
          className="window-frame__btn"
          onClick={handleMinimize}
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          className="window-frame__btn"
          onClick={handleMaximize}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="5" width="8" height="8" rx="1" />
              <path d="M5 5V3.5C5 2.67157 5.67157 2 6.5 2H10.5C11.3284 2 12 2.67157 12 3.5V7.5C12 8.32843 11.3284 9 10.5 9H9" />
            </svg>
          ) : (
            <Square size={12} />
          )}
        </button>
        <button
          className="window-frame__btn window-frame__btn--close"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
