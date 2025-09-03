'use client';

import { ChevronDown } from 'lucide-react';
import { getLanguageFlag } from '@/lib/utils';
import type { Language } from '@/types';

interface LanguageSelectorProps {
  languages: Language[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export default function LanguageSelector({ languages, value, onChange, label }: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="language-selector appearance-none pr-10"
        >
          {languages.map((language) => (
            <option key={language.id} value={language.title}>
              {getLanguageFlag(language.title)} {language.title}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}