'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowRightLeft, Volume2, Mic, MicOff, Copy, Star, RotateCcw } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { translateText, detectLanguage } from '@/lib/translation';
import { saveTranslation } from '@/lib/cosmic';
import { SpeechRecognition, SpeechSynthesis, getSpeechSupport } from '@/lib/speech';
import { validateTranslationInput, copyToClipboard, debounce } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import type { Language } from '@/types';

interface TranslationInterfaceProps {
  languages: Language[];
  initialSourceLang?: string;
  initialTargetLang?: string;
}

export default function TranslationInterface({ 
  languages, 
  initialSourceLang = 'English',
  initialTargetLang = 'Spanish'
}: TranslationInterfaceProps) {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState(initialSourceLang);
  const [targetLang, setTargetLang] = useState(initialTargetLang);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [autoDetect, setAutoDetect] = useState(false);

  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const sourceTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const translatedTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const speechSupport = getSpeechSupport();

  useEffect(() => {
    if (speechSupport.recognition) {
      speechRecognition.current = new SpeechRecognition();
    }
    if (speechSupport.synthesis) {
      speechSynthesis.current = new SpeechSynthesis();
    }
  }, [speechSupport]);

  // Debounced translation function
  const debouncedTranslate = useCallback(
    debounce(async (text: string, source: string, target: string) => {
      if (!text.trim()) return;

      const validation = validateTranslationInput(text);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid input');
        return;
      }

      setIsTranslating(true);
      try {
        // Auto-detect language if enabled
        let actualSourceLang = source;
        if (autoDetect && text.length > 10) {
          const detectedLang = await detectLanguage(text);
          if (detectedLang && detectedLang !== 'Unknown') {
            actualSourceLang = detectedLang;
            setSourceLang(detectedLang);
          }
        }

        const result = await translateText(text, actualSourceLang, target);
        setTranslatedText(result.translatedText);
        setConfidence(result.confidence);
        setAlternatives(result.alternatives || []);

        // Save translation to history
        await saveTranslation({
          sourceText: text,
          translatedText: result.translatedText,
          sourceLanguage: actualSourceLang,
          targetLanguage: target,
          method: 'text',
          confidence: result.confidence
        });

        toast.success('Translation completed');
      } catch (error) {
        console.error('Translation error:', error);
        toast.error('Translation failed. Please try again.');
      } finally {
        setIsTranslating(false);
      }
    }, 1000),
    [autoDetect]
  );

  const handleSourceTextChange = (text: string) => {
    setSourceText(text);
    if (text.trim()) {
      debouncedTranslate(text, sourceLang, targetLang);
    } else {
      setTranslatedText('');
      setAlternatives([]);
      setConfidence(0);
    }
  };

  const swapLanguages = () => {
    const newSourceLang = targetLang;
    const newTargetLang = sourceLang;
    const newSourceText = translatedText;
    
    setSourceLang(newSourceLang);
    setTargetLang(newTargetLang);
    setSourceText(newSourceText);
    setTranslatedText(sourceText);
    
    if (newSourceText.trim()) {
      debouncedTranslate(newSourceText, newSourceLang, newTargetLang);
    }
  };

  const startListening = () => {
    if (!speechRecognition.current || !speechSupport.recognition) {
      toast.error('Speech recognition not supported');
      return;
    }

    setIsListening(true);
    speechRecognition.current.startListening(
      sourceLang,
      (transcript, isFinal) => {
        setSourceText(transcript);
        if (isFinal) {
          setIsListening(false);
          handleSourceTextChange(transcript);
        }
      },
      (error) => {
        setIsListening(false);
        toast.error(`Speech recognition error: ${error}`);
      }
    );
  };

  const stopListening = () => {
    if (speechRecognition.current) {
      speechRecognition.current.stopListening();
      setIsListening(false);
    }
  };

  const speakText = async (text: string, language: string) => {
    if (!speechSynthesis.current || !speechSupport.synthesis || !text.trim()) {
      toast.error('Speech synthesis not supported or no text to speak');
      return;
    }

    try {
      await speechSynthesis.current.speak(text, language);
    } catch (error) {
      toast.error('Failed to speak text');
    }
  };

  const copyTranslation = async () => {
    if (!translatedText.trim()) {
      toast.error('No translation to copy');
      return;
    }

    const success = await copyToClipboard(translatedText);
    if (success) {
      toast.success('Translation copied to clipboard');
    } else {
      toast.error('Failed to copy translation');
    }
  };

  const clearText = () => {
    setSourceText('');
    setTranslatedText('');
    setAlternatives([]);
    setConfidence(0);
    if (sourceTextAreaRef.current) {
      sourceTextAreaRef.current.focus();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Auto-detect toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Translate</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoDetect}
            onChange={(e) => setAutoDetect(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring focus:ring-2"
          />
          <span className="text-sm text-foreground">Auto-detect language</span>
        </label>
      </div>

      {/* Language selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <LanguageSelector
          languages={languages}
          value={sourceLang}
          onChange={setSourceLang}
          label="From"
        />
        
        <div className="flex justify-center">
          <button
            onClick={swapLanguages}
            disabled={isTranslating}
            className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50"
            title="Swap languages"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>
        
        <LanguageSelector
          languages={languages}
          value={targetLang}
          onChange={setTargetLang}
          label="To"
        />
      </div>

      {/* Translation interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source text */}
        <div className="translation-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Source Text</span>
            <div className="flex items-center gap-2">
              {speechSupport.recognition && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isTranslating}
                  className={`voice-button ${isListening ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              {speechSupport.synthesis && sourceText && (
                <button
                  onClick={() => speakText(sourceText, sourceLang)}
                  disabled={isTranslating}
                  className="voice-button"
                  title="Speak source text"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={clearText}
                disabled={isTranslating}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Clear text"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <textarea
            ref={sourceTextAreaRef}
            value={sourceText}
            onChange={(e) => handleSourceTextChange(e.target.value)}
            placeholder="Enter text to translate..."
            disabled={isTranslating || isListening}
            className="translation-input min-h-[120px]"
            maxLength={5000}
          />
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{sourceText.length}/5000 characters</span>
            {isListening && (
              <span className="text-primary animate-pulse">Listening...</span>
            )}
          </div>
        </div>

        {/* Translated text */}
        <div className="translation-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Translation</span>
            <div className="flex items-center gap-2">
              {speechSupport.synthesis && translatedText && (
                <button
                  onClick={() => speakText(translatedText, targetLang)}
                  disabled={isTranslating}
                  className="voice-button"
                  title="Speak translation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
              {translatedText && (
                <button
                  onClick={copyTranslation}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Copy translation"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="translation-result">
            {isTranslating ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Translating...</span>
              </div>
            ) : translatedText ? (
              <div className="space-y-3">
                <p className="text-foreground leading-relaxed">{translatedText}</p>
                
                {confidence > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3 h-3" />
                    <span>Confidence: {Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Translation will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {/* Alternative translations */}
      {alternatives.length > 0 && (
        <div className="translation-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Alternative translations:</h3>
          <div className="space-y-2">
            {alternatives.map((alt: string, index: number) => (
              <button
                key={index}
                onClick={() => setTranslatedText(alt)}
                className="w-full text-left p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
              >
                {alt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}