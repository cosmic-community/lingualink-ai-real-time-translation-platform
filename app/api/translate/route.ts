import { NextRequest, NextResponse } from 'next/server';
import { translateText, detectLanguage } from '@/lib/translation';
import { validateTranslationInput } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, sourceLanguage, targetLanguage, autoDetect } = body;

    // Validate input
    const validation = validateTranslationInput(text);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    if (!sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Source and target languages are required' },
        { status: 400 }
      );
    }

    let actualSourceLang = sourceLanguage;

    // Auto-detect language if requested
    if (autoDetect && text.length > 10) {
      try {
        const detectedLang = await detectLanguage(text);
        if (detectedLang && detectedLang !== 'Unknown') {
          actualSourceLang = detectedLang;
        }
      } catch (error) {
        console.error('Language detection failed:', error);
        // Continue with provided source language
      }
    }

    // Perform translation
    const result = await translateText(text, actualSourceLang, targetLanguage);

    return NextResponse.json({
      translatedText: result.translatedText,
      sourceLanguage: actualSourceLang,
      targetLanguage: result.targetLanguage,
      confidence: result.confidence,
      alternatives: result.alternatives,
      detectedLanguage: actualSourceLang !== sourceLanguage ? actualSourceLang : undefined
    });

  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}