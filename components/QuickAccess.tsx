'use client';

import { getPopularLanguagePairs, getLanguageFlag } from '@/lib/utils';

interface QuickAccessProps {
  onLanguagePairSelect: (source: string, target: string) => void;
}

export default function QuickAccess({ onLanguagePairSelect }: QuickAccessProps) {
  const popularPairs = getPopularLanguagePairs();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-foreground mb-3">Quick Access</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {popularPairs.map((pair) => (
          <button
            key={`${pair.source}-${pair.target}`}
            onClick={() => onLanguagePairSelect(pair.source, pair.target)}
            className="quick-access-button flex items-center justify-center gap-2"
          >
            <span>{getLanguageFlag(pair.source)}</span>
            <span>→</span>
            <span>{getLanguageFlag(pair.target)}</span>
            <span className="text-xs">{pair.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}