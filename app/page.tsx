'use client';

import { useState, useEffect } from 'react';
import { Globe, MessageSquare, Clock, Mic, FileText, Users } from 'lucide-react';
import TranslationInterface from '@/components/TranslationInterface';
import TranslationHistory from '@/components/TranslationHistory';
import ConversationMode from '@/components/ConversationMode';
import QuickAccess from '@/components/QuickAccess';
import { getLanguages, getTranslationHistory } from '@/lib/cosmic';
import { getSpeechSupport } from '@/lib/speech';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'translate' | 'conversation' | 'history'>('translate');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isLoading, setIsLoading] = useState(true);

  const speechSupport = getSpeechSupport();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Load languages (with fallback if none exist in CMS)
        const fetchedLanguages = await getLanguages();
        const defaultLanguages: Language[] = fetchedLanguages.length > 0 ? fetchedLanguages : [
          {
            id: '1',
            slug: 'english',
            title: 'English',
            type: 'languages',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
            metadata: {
              code: 'en',
              native_name: 'English',
              flag_emoji: '🇺🇸',
              voice_supported: true,
              translation_quality: 'high'
            }
          },
          {
            id: '2',
            slug: 'spanish',
            title: 'Spanish',
            type: 'languages',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
            metadata: {
              code: 'es',
              native_name: 'Español',
              flag_emoji: '🇪🇸',
              voice_supported: true,
              translation_quality: 'high'
            }
          },
          {
            id: '3',
            slug: 'french',
            title: 'French',
            type: 'languages',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
            metadata: {
              code: 'fr',
              native_name: 'Français',
              flag_emoji: '🇫🇷',
              voice_supported: true,
              translation_quality: 'high'
            }
          },
          {
            id: '4',
            slug: 'german',
            title: 'German',
            type: 'languages',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
            metadata: {
              code: 'de',
              native_name: 'Deutsch',
              flag_emoji: '🇩🇪',
              voice_supported: true,
              translation_quality: 'high'
            }
          },
          {
            id: '5',
            slug: 'chinese',
            title: 'Chinese',
            type: 'languages',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
            metadata: {
              code: 'zh',
              native_name: '中文',
              flag_emoji: '🇨🇳',
              voice_supported: true,
              translation_quality: 'high'
            }
          },
          {
            id: '6',
            slug: 'japanese',
            title: 'Japanese',
            type: 'languages',
            created_at: new Date().toISOString(),
            modified_at: new Date().toISOString(),
            metadata: {
              code: 'ja',
              native_name: '日本語',
              flag_emoji: '🇯🇵',
              voice_supported: true,
              translation_quality: 'high'
            }
          }
        ];

        setLanguages(defaultLanguages);

        // Load translation history
        const fetchedTranslations = await getTranslationHistory();
        setTranslations(fetchedTranslations);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLanguagePairSelect = (source: string, target: string) => {
    setSourceLang(source);
    setTargetLang(target);
    setActiveTab('translate');
  };

  const handleTranslationDelete = (deletedId: string) => {
    setTranslations(prev => prev.filter(t => t.id !== deletedId));
  };

  const handleTranslationReuse = (translation: Translation) => {
    setSourceLang(translation.metadata.source_language);
    setTargetLang(translation.metadata.target_language);
    setActiveTab('translate');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading translation platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">LinguaLink AI</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Break down language barriers with AI-powered real-time translation
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">Text Translation</h3>
              <p className="text-sm text-muted-foreground">Instant text translation in 100+ languages</p>
            </div>
            
            <div className="text-center">
              <Mic className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">Voice Translation</h3>
              <p className="text-sm text-muted-foreground">Speak naturally and hear translations</p>
            </div>
            
            <div className="text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-foreground">Conversation Mode</h3>
              <p className="text-sm text-muted-foreground">Real-time two-way conversations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <QuickAccess onLanguagePairSelect={handleLanguagePairSelect} />

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="inline-flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab('translate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'translate'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="w-4 h-4" />
            Translate
          </button>
          
          <button
            onClick={() => setActiveTab('conversation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'conversation'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Conversation
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'translate' && (
          <TranslationInterface 
            languages={languages} 
            initialSourceLang={sourceLang}
            initialTargetLang={targetLang}
          />
        )}
        
        {activeTab === 'conversation' && (
          <ConversationMode languages={languages} />
        )}
        
        {activeTab === 'history' && (
          <TranslationHistory 
            translations={translations}
            onDelete={handleTranslationDelete}
            onReuse={handleTranslationReuse}
          />
        )}
      </div>

      {/* Speech Support Notice */}
      {(!speechSupport.recognition || !speechSupport.synthesis) && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-warning rounded-full flex items-center justify-center mt-0.5">
              <span className="text-warning-foreground text-xs">!</span>
            </div>
            <div>
              <h4 className="font-medium text-warning-foreground mb-1">Limited Speech Support</h4>
              <p className="text-sm text-warning-foreground/80">
                {!speechSupport.recognition && !speechSupport.synthesis && 
                  'Voice input and speech output are not supported in this browser. '}
                {!speechSupport.recognition && speechSupport.synthesis && 
                  'Voice input is not supported, but speech output is available. '}
                {speechSupport.recognition && !speechSupport.synthesis && 
                  'Voice input is available, but speech output is not supported. '}
                Try using Chrome, Safari, or Edge for the best experience.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}