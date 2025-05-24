import { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'cosmos' | 'matrix';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Load saved preference
    const saved = localStorage.getItem('heynow-view-mode');
    return (saved === 'matrix' || saved === 'cosmos') ? saved : 'cosmos';
  });

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('heynow-view-mode', mode);
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode: updateViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}