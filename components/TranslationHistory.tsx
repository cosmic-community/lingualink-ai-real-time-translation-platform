'use client';

import { useState } from 'react';
import { Trash2, RotateCcw, Copy, Volume2 } from 'lucide-react';
import { deleteTranslation } from '@/lib/cosmic';
import { copyToClipboard, formatDate, getLanguageFlag } from '@/lib/utils';
import { SpeechSynthesis, getSpeechSupport } from '@/lib/speech';
import { toast } from 'react-hot-toast';
import type { Translation } from '@/types';

interface TranslationHistoryProps {
  translations: Translation[];
  onDelete: (id: string) => void;
  onReuse: (translation: Translation) => void;
}

export default function TranslationHistory({ translations, onDelete, onReuse }: TranslationHistoryProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const speechSupport = getSpeechSupport();

  const handleDelete = async (translation: Translation) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;

    setIsDeleting(translation.id);
    try {
      await deleteTranslation(translation.id);
      onDelete(translation.id);
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
      const speech = new SpeechSynthesis();
      await speech.speak(text, language);
    } catch (error) {
      toast.error('Failed to speak text');
    }
  };

  if (translations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No translations yet</h3>
          <p className="text-muted-foreground">
            Your translation history will appear here as you use the translator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Translation History</h2>
        <span className="text-sm text-muted-foreground">
          {translations.length} translation{translations.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {translations.map((translation) => (
          <div key={translation.id} className="history-item">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {getLanguageFlag(translation.metadata.source_language)} {translation.metadata.source_language}
                  →
                  {getLanguageFlag(translation.metadata.target_language)} {translation.metadata.target_language}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(translation.created_at)}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopy(translation.metadata.translated_text)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy translation"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                {speechSupport.synthesis && (
                  <button
                    onClick={() => handleSpeak(translation.metadata.translated_text, translation.metadata.target_language)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Speak translation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => onReuse(translation)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Use this translation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(translation)}
                  disabled={isDeleting === translation.id}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  title="Delete translation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Original</span>
                <p className="text-sm text-foreground mt-1">{translation.metadata.source_text}</p>
              </div>
              
              <div>
                <span className="text-xs text-muted-foreground">Translation</span>
                <p className="text-sm font-medium text-foreground mt-1">{translation.metadata.translated_text}</p>
              </div>
            </div>
            
            {translation.metadata.confidence_score && translation.metadata.confidence_score > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Confidence: {Math.round((translation.metadata.confidence_score || 0) * 100)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}