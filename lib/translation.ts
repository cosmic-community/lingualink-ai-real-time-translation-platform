import OpenAI from 'openai';
import type { TranslationResponse } from '@/types';

// Lazy initialization to avoid build-time issues
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required. Please add your OpenAI API key to your environment variables.');
  }
  
  return new OpenAI({
    apiKey,
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

    const openai = getOpenAIClient();
    
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
    Provide only the translation, maintaining the original tone and context:

    "${text}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('No translation received from OpenAI');
    }

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
      throw new Error('OpenAI API key is missing. Please configure your API key in environment variables.');
    }
    
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key configuration.');
    }
    
    if (error.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
    }
    
    if (error.status === 503) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to translate text. Please try again.');
  }
}

// Detect language of given text
export async function detectLanguage(text: string): Promise<string> {
  try {
    if (!text || text.trim().length < 3) {
      return 'Unknown';
    }

    const openai = getOpenAIClient();
    
    const prompt = `Detect the language of the following text and respond with only the language name in English (e.g., "English", "Spanish", "French"):

    "${text}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 50,
    });

    const detectedLanguage = completion.choices[0]?.message?.content?.trim();
    return detectedLanguage || 'Unknown';
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
    
    let prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. `;
    
    if (context) {
      prompt += `Context: ${context}. `;
    }
    
    prompt += `Provide the best translation maintaining the original tone and meaning:

    "${text}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('No translation received');
    }

    // Get alternative translations
    const alternativesPrompt = `Provide 2-3 alternative translations of "${text}" from ${sourceLanguage} to ${targetLanguage}. 
    List them separated by newlines, without numbering:`;

    const alternativesCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: alternativesPrompt }],
      temperature: 0.5,
      max_tokens: 500,
    });

    const alternatives = alternativesCompletion.choices[0]?.message?.content?.trim()
      .split('\n')
      .filter((alt: string) => alt.trim().length > 0)
      .slice(0, 3) || [];

    return {
      translatedText,
      sourceLanguage,
      targetLanguage,
      confidence: 0.95,
      alternatives
    };
  } catch (error) {
    console.error('Context translation error:', error);
    throw new Error('Failed to translate with context');
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