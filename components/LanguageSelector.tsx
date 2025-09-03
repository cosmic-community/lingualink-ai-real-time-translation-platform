'use client';

import { ChevronDown } from 'lucide-react';
import { getLanguageFlag } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import type { Language } from '@/types';

interface LanguageSelectorProps {
  languages: Language[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export default function LanguageSelector({ 
  languages, 
  value, 
  onChange, 
  label,
  className = ""
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLanguage = languages.find(lang => lang.title === value);
  
  const filteredLanguages = languages.filter((lang: Language) =>
    lang.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleLanguageSelect = (language: Language) => {
    onChange(language.title);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-input rounded-lg bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {selectedLanguage ? getLanguageFlag(selectedLanguage.title) : '🌐'}
          </span>
          <span className="truncate">
            {selectedLanguage ? selectedLanguage.title : 'Select language'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm border border-input rounded bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language: Language) => (
                <button
                  key={language.id}
                  onClick={() => handleLanguageSelect(language)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <span className="text-lg">{getLanguageFlag(language.title)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{language.title}</div>
                    {language.metadata?.native_name && (
                      <div className="text-xs text-muted-foreground truncate">
                        {language.metadata.native_name}
                      </div>
                    )}
                  </div>
                  {language.metadata?.voice_supported && (
                    <div className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      Voice
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}