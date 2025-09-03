'use client';

import { ArrowRight } from 'lucide-react';
import { getPopularLanguagePairs } from '@/lib/utils';

interface QuickAccessProps {
  onLanguagePairSelect: (source: string, target: string) => void;
}

export default function QuickAccess({ onLanguagePairSelect }: QuickAccessProps) {
  const popularPairs = getPopularLanguagePairs();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Access</h3>
      <div className="flex flex-wrap gap-2">
        {popularPairs.map((pair, index) => (
          <button
            key={index}
            onClick={() => onLanguagePairSelect(pair.source, pair.target)}
            className="quick-access-button flex items-center gap-1"
          >
            <span>{pair.label}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ))}
      </div>
    </div>
  );
}