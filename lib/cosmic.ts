import { createBucketClient } from '@cosmicjs/sdk'

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

// Simple error helper for Cosmic SDK
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Get all supported languages
export async function getLanguages(): Promise<Language[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'languages' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects as Language[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch languages');
  }
}

// Get translation history for a user
export async function getTranslationHistory(userId?: string): Promise<Translation[]> {
  try {
    const query: any = { type: 'translations' };
    if (userId) {
      query['metadata.user_id'] = userId;
    }

    const response = await cosmic.objects
      .find(query)
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .depth(1);
    
    const translations = response.objects as Translation[];
    
    // Sort by creation date (newest first)
    return translations.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch translation history');
  }
}

// Save a translation
export async function saveTranslation(data: {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  method: TranslationMethod;
  userId?: string;
  sessionId?: string;
  confidence?: number;
}): Promise<Translation> {
  try {
    const response = await cosmic.objects.insertOne({
      title: `${data.sourceLanguage} → ${data.targetLanguage} Translation`,
      type: 'translations',
      metadata: {
        source_text: data.sourceText,
        translated_text: data.translatedText,
        source_language: data.sourceLanguage,
        target_language: data.targetLanguage,
        translation_method: data.method,
        user_id: data.userId || '',
        session_id: data.sessionId || '',
        confidence_score: data.confidence || 0,
        created_at: new Date().toISOString()
      }
    });
    
    return response.object as Translation;
  } catch (error) {
    console.error('Error saving translation:', error);
    throw new Error('Failed to save translation');
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'users',
      slug: userId
    }).depth(1);
    
    return response.object as UserProfile;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch user profile');
  }
}

// Create or update user profile
export async function saveUserProfile(data: {
  userId: string;
  email: string;
  preferredLanguages: string[];
  voiceSettings: VoiceSettings;
  theme: Theme;
  autoDetect: boolean;
  saveHistory: boolean;
}): Promise<UserProfile> {
  try {
    // Check if profile exists
    const existingProfile = await getUserProfile(data.userId);
    
    if (existingProfile) {
      // Update existing profile
      const response = await cosmic.objects.updateOne(existingProfile.id, {
        metadata: {
          email: data.email,
          preferred_languages: data.preferredLanguages,
          voice_settings: data.voiceSettings,
          theme: data.theme,
          auto_detect: data.autoDetect,
          save_history: data.saveHistory
        }
      });
      
      return response.object as UserProfile;
    } else {
      // Create new profile
      const response = await cosmic.objects.insertOne({
        title: `User Profile - ${data.email}`,
        slug: data.userId,
        type: 'users',
        metadata: {
          email: data.email,
          preferred_languages: data.preferredLanguages,
          voice_settings: data.voiceSettings,
          theme: data.theme,
          auto_detect: data.autoDetect,
          save_history: data.saveHistory
        }
      });
      
      return response.object as UserProfile;
    }
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw new Error('Failed to save user profile');
  }
}

// Delete translation from history
export async function deleteTranslation(translationId: string): Promise<void> {
  try {
    await cosmic.objects.deleteOne(translationId);
  } catch (error) {
    console.error('Error deleting translation:', error);
    throw new Error('Failed to delete translation');
  }
}

// Save conversation session
export async function saveConversationSession(data: {
  participants: { user_1_language: string; user_2_language: string };
  messages: any[];
  status: 'active' | 'completed';
  duration?: number;
}): Promise<ConversationSession> {
  try {
    const response = await cosmic.objects.insertOne({
      title: `Conversation: ${data.participants.user_1_language} ↔ ${data.participants.user_2_language}`,
      type: 'conversations',
      metadata: {
        participants: data.participants,
        messages: data.messages,
        session_duration: data.duration || 0,
        status: data.status
      }
    });
    
    return response.object as ConversationSession;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw new Error('Failed to save conversation');
  }
}