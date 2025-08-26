import { useState, useEffect } from 'react';

export function useWidgetState(widgetId: string, defaultState = false) {
  const [isMinimized, setIsMinimized] = useState(defaultState);

  const storageKey = `widget-minimized-${widgetId}`;

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState !== null) {
        setIsMinimized(JSON.parse(savedState));
      }
    } catch (error) {
      console.error(`Error reading ${storageKey} from localStorage`, error);
      setIsMinimized(defaultState);
    }
  }, [widgetId, storageKey, defaultState]);

  const toggleMinimized = () => {
    setIsMinimized((prev) => {
      const newState = !prev;
      try {
        localStorage.setItem(storageKey, JSON.stringify(newState));
      } catch (error) {
        console.error(`Error saving ${storageKey} to localStorage`, error);
      }
      return newState;
    });
  };

  return { isMinimized, toggleMinimized };
}
