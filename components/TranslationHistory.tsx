'use client';

import { useState } from 'react';
import { Trash2, RotateCcw, Copy, Volume2 } from 'lucide-react';
import { formatDate, copyToClipboard, getLanguageFlag } from '@/lib/utils';
import { deleteTranslation } from '@/lib/cosmic';
import { SpeechSynthesis, getSpeechSupport } from '@/lib/speech';
import { toast } from 'react-hot-toast';
import type { Translation } from '@/types';

interface TranslationHistoryProps {
  translations: Translation[];
  onDelete: (id: string) => void;
  onReuse: (translation: Translation) => void;
}

export default function TranslationHistory({ 
  translations, 
  onDelete, 
  onReuse 
}: TranslationHistoryProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const speechSynthesis = new SpeechSynthesis();
  const speechSupport = getSpeechSupport();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;
    
    setIsDeleting(id);
    try {
      await deleteTranslation(id);
      onDelete(id);
      toast.success('Translation deleted');
    } catch (error) {
      toast.error('Failed to delete translation');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Copied to clipboard');
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleSpeak = async (text: string, language: string) => {
    if (!speechSupport.synthesis) {
      toast.error('Speech synthesis not supported');
      return;
    }

    try {
      await speechSynthesis.speak(text, language);
    } catch (error) {
      toast.error('Failed to speak text');
    }
  };

  if (translations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📚</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No translations yet</h3>
        <p className="text-muted-foreground">Your translation history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground mb-4">Translation History</h2>
      
      <div className="space-y-3">
        {translations.map((translation: Translation) => (
          <div key={translation.id} className="history-item">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>{getLanguageFlag(translation.metadata.source_language)}</span>
                  <span>{translation.metadata.source_language}</span>
                  <span>→</span>
                  <span>{getLanguageFlag(translation.metadata.target_language)}</span>
                  <span>{translation.metadata.target_language}</span>
                </div>
                
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                  {translation.metadata.translation_method}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(translation.metadata.translated_text)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Copy translation"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                {speechSupport.synthesis && (
                  <button
                    onClick={() => handleSpeak(translation.metadata.translated_text, translation.metadata.target_language)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Speak translation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => onReuse(translation)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Reuse translation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(translation.id)}
                  disabled={isDeleting === translation.id}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  title="Delete translation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Original:</p>
                <p className="text-foreground">{translation.metadata.source_text}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Translation:</p>
                <p className="text-foreground font-medium">{translation.metadata.translated_text}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground">
                {formatDate(translation.created_at)}
              </div>
              
              {translation.metadata.confidence_score && translation.metadata.confidence_score > 0 && (
                <div className="text-xs text-muted-foreground">
                  Confidence: {Math.round((translation.metadata.confidence_score ?? 0) * 100)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}