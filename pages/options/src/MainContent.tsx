import React, { useMemo } from 'react';

interface MainContentProps {
  assistantResponses: any[];
  isLight: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ assistantResponses, isLight }) => {
  const sortedResponses = useMemo(() => {
    return [...assistantResponses].sort((a, b) => b.epochTime - a.epochTime); // Default to descending
  }, [assistantResponses]);

  return (
    <div className={`flex h-screen ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      {/* Main content goes here */}
    </div>
  );
};

export default MainContent;