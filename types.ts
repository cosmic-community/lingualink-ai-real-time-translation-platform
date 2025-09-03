// Base Cosmic object interface
interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Language configuration
interface Language extends CosmicObject {
  type: 'languages';
  metadata: {
    code: string;
    native_name: string;
    flag_emoji?: string;
    rtl?: boolean;
    voice_supported?: boolean;
    translation_quality: 'high' | 'medium' | 'low';
    region?: string;
  };
}

// Translation session
interface Translation extends CosmicObject {
  type: 'translations';
  metadata: {
    source_text: string;
    translated_text: string;
    source_language: string;
    target_language: string;
    user_id?: string;
    translation_method: 'text' | 'voice' | 'document';
    confidence_score?: number;
    created_at: string;
    session_id?: string;
  };
}

// User profile
interface UserProfile extends CosmicObject {
  type: 'users';
  metadata: {
    email: string;
    preferred_languages: string[];
    voice_settings: {
      speed: number;
      pitch: number;
      volume: number;
    };
    theme: 'light' | 'dark' | 'system';
    auto_detect: boolean;
    save_history: boolean;
  };
}

// Conversation session
interface ConversationSession extends CosmicObject {
  type: 'conversations';
  metadata: {
    participants: {
      user_1_language: string;
      user_2_language: string;
    };
    messages: {
      id: string;
      text: string;
      translation: string;
      sender: 'user_1' | 'user_2';
      timestamp: string;
    }[];
    session_duration?: number;
    status: 'active' | 'completed';
  };
}

// Document translation
interface DocumentTranslation extends CosmicObject {
  type: 'documents';
  metadata: {
    original_file: {
      url: string;
      name: string;
      type: string;
      size: number;
    };
    translated_file?: {
      url: string;
      name: string;
    };
    source_language: string;
    target_language: string;
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    user_id?: string;
  };
}

// API response types
interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Translation API types
interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  method?: 'text' | 'voice' | 'document';
}

interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  alternatives?: string[];
}

// Voice synthesis types
interface VoiceSettings {
  speed: number;
  pitch: number;
  volume: number;
  voice?: string;
}

// Component props types
interface TranslatorProps {
  languages: Language[];
  initialSourceLang?: string;
  initialTargetLang?: string;
}

interface LanguageSelectorProps {
  languages: Language[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

interface TranslationHistoryProps {
  translations: Translation[];
  onDelete: (id: string) => void;
  onReuse: (translation: Translation) => void;
}

// Type guards
function isLanguage(obj: CosmicObject): obj is Language {
  return obj.type === 'languages';
}

function isTranslation(obj: CosmicObject): obj is Translation {
  return obj.type === 'translations';
}

function isUserProfile(obj: CosmicObject): obj is UserProfile {
  return obj.type === 'users';
}

// Utility types
type SupportedLanguage = string;
type TranslationMethod = 'text' | 'voice' | 'document';
type Theme = 'light' | 'dark' | 'system';

// Export all types for use across the application
export type {
  CosmicObject,
  Language,
  Translation,
  UserProfile,
  ConversationSession,
  DocumentTranslation,
  CosmicResponse,
  TranslationRequest,
  TranslationResponse,
  VoiceSettings,
  TranslatorProps,
  LanguageSelectorProps,
  TranslationHistoryProps,
  SupportedLanguage,
  TranslationMethod,
  Theme
};

export {
  isLanguage,
  isTranslation,
  isUserProfile
};