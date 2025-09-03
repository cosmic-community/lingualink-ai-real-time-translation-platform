import OpenAI from 'openai';
import type { TranslationResponse } from '@/types';

// Lazy initialization to avoid build-time issues
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required. Please add your OpenAI API key to your environment variables.');
  }
  
  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. API key should start with "sk-".');
  }
  
  return new OpenAI({
    apiKey,
    timeout: 30000, // 30 second timeout
    maxRetries: 2,
  });
}

// Translate text using OpenAI
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResponse> {
  try {
    // Validate inputs
    if (!text || text.trim().length === 0) {
      throw new Error('Text to translate cannot be empty');
    }
    
    if (!sourceLanguage || !targetLanguage) {
      throw new Error('Source and target languages are required');
    }
    
    if (sourceLanguage === targetLanguage) {
      return {
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        confidence: 1.0,
        alternatives: []
      };
    }

    // Check text length
    if (text.length > 5000) {
      throw new Error('Text is too long. Please limit to 5000 characters.');
    }

    const openai = getOpenAIClient();
    
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
    Maintain the original meaning, tone, and context. Provide only the translation without any additional commentary:

    "${text}"`;

    console.log('Sending translation request to OpenAI...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'system',
        content: 'You are a professional translator. Provide accurate translations while preserving the original meaning and tone.'
      }, {
        role: 'user', 
        content: prompt 
      }],
      temperature: 0.3,
      max_tokens: Math.min(1000, text.length * 2),
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('No translation received from OpenAI');
    }

    console.log('Translation completed successfully');

    return {
      translatedText,
      sourceLanguage,
      targetLanguage,
      confidence: 0.95,
      alternatives: []
    };
  } catch (error: any) {
    console.error('Translation error:', error);
    
    // Provide specific error messages based on the error type
    if (error.message?.includes('OPENAI_API_KEY')) {
      throw new Error('OpenAI API key is missing or invalid. Please check your environment variables.');
    }
    
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please verify your API key is correct and active.');
    }
    
    if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please wait a moment and try again.');
    }
    
    if (error.status === 503 || error.status === 502) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again in a moment.');
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Translation request timed out. Please try again with shorter text.');
    }

    if (error.code === 'ENOTFOUND' || error.message?.includes('network')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    throw new Error(error.message || 'Translation failed. Please try again.');
  }
}

// Detect language of given text
export async function detectLanguage(text: string): Promise<string> {
  try {
    if (!text || text.trim().length < 3) {
      return 'Unknown';
    }

    const openai = getOpenAIClient();
    
    const prompt = `Identify the language of this text and respond with only the language name in English (e.g., "English", "Spanish", "French", "German", etc.):

    "${text.substring(0, 200)}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'system',
        content: 'You are a language detection expert. Respond only with the language name in English.'
      }, {
        role: 'user', 
        content: prompt 
      }],
      temperature: 0.1,
      max_tokens: 20,
    });

    const detectedLanguage = completion.choices[0]?.message?.content?.trim();
    
    // Validate the response
    if (detectedLanguage && detectedLanguage.length < 50 && !detectedLanguage.includes('\n')) {
      return detectedLanguage;
    }
    
    return 'Unknown';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'Unknown';
  }
}

// Get translation with context and alternatives
export async function translateWithContext(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  context?: string
): Promise<TranslationResponse> {
  try {
    const openai = getOpenAIClient();
    
    let systemPrompt = `You are a professional translator. Provide accurate translations while preserving the original meaning and tone.`;
    
    let userPrompt = `Translate this text from ${sourceLanguage} to ${targetLanguage}`;
    
    if (context) {
      userPrompt += `. Context: ${context}`;
    }
    
    userPrompt += `:\n\n"${text}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: Math.min(1000, text.length * 2),
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('No translation received');
    }

    // Get alternative translations
    try {
      const alternativesPrompt = `Provide 2 alternative translations of "${text}" from ${sourceLanguage} to ${targetLanguage}. 
      List them on separate lines without numbering or bullet points:`;

      const alternativesCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: alternativesPrompt }],
        temperature: 0.5,
        max_tokens: 300,
      });

      const alternatives = alternativesCompletion.choices[0]?.message?.content?.trim()
        .split('\n')
        .filter((alt: string) => alt.trim().length > 0)
        .slice(0, 2) || [];

      return {
        translatedText,
        sourceLanguage,
        targetLanguage,
        confidence: 0.95,
        alternatives
      };
    } catch (altError) {
      // Return main translation even if alternatives fail
      return {
        translatedText,
        sourceLanguage,
        targetLanguage,
        confidence: 0.95,
        alternatives: []
      };
    }
  } catch (error) {
    console.error('Context translation error:', error);
    throw error;
  }
}

// Test API connection
export async function testTranslationAPI(): Promise<{ success: boolean; error?: string }> {
  try {
    const openai = getOpenAIClient();
    
    // Simple test request
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "API test successful"' }],
      temperature: 0,
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    
    if (response) {
      return { success: true };
    } else {
      return { success: false, error: 'No response from API' };
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'API test failed' 
    };
  }
}

// Batch translate multiple texts
export async function batchTranslate(
  texts: string[],
  sourceLanguage: string,
  targetLanguage: string
): Promise<string[]> {
  try {
    const translations = await Promise.all(
      texts.map((text: string) => translateText(text, sourceLanguage, targetLanguage))
    );
    
    return translations.map(t => t.translatedText);
  } catch (error) {
    console.error('Batch translation error:', error);
    throw new Error('Failed to batch translate');
  }
}