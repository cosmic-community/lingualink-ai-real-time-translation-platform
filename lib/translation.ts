import OpenAI from 'openai';
import type { TranslationResponse } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Translate text using OpenAI
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResponse> {
  try {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
    Provide only the translation, maintaining the original tone and context:

    "${text}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() || '';

    return {
      translatedText,
      sourceLanguage,
      targetLanguage,
      confidence: 0.95, // OpenAI generally has high confidence
      alternatives: [] // Could be implemented with multiple completions
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text');
  }
}

// Detect language of given text
export async function detectLanguage(text: string): Promise<string> {
  try {
    const prompt = `Detect the language of the following text and respond with only the language name in English:

    "${text}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 50,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Unknown';
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

    const translatedText = completion.choices[0]?.message?.content?.trim() || '';

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
      .filter((alt: string) => alt.trim().length > 0) || [];

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
      texts.map((t: string) => translateText(t, sourceLanguage, targetLanguage))
    );
    
    return translations.map(t => t.translatedText);
  } catch (error) {
    console.error('Batch translation error:', error);
    throw new Error('Failed to batch translate');
  }
}