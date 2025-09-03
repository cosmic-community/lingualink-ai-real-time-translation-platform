import { NextRequest, NextResponse } from 'next/server';
import { translateText, detectLanguage } from '@/lib/translation';
import { validateTranslationInput } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { text, sourceLanguage, targetLanguage, autoDetect } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

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

    // Check if OPENAI_API_KEY is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Translation service is not configured. Please set up the OpenAI API key.',
          code: 'MISSING_API_KEY'
        },
        { status: 500 }
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
    try {
      const result = await translateText(text, actualSourceLang, targetLanguage);

      return NextResponse.json({
        success: true,
        translatedText: result.translatedText,
        sourceLanguage: actualSourceLang,
        targetLanguage: result.targetLanguage,
        confidence: result.confidence,
        alternatives: result.alternatives || [],
        detectedLanguage: actualSourceLang !== sourceLanguage ? actualSourceLang : undefined
      });

    } catch (translationError: any) {
      console.error('Translation failed:', translationError);
      
      // Return specific error messages
      return NextResponse.json(
        { 
          error: translationError.message || 'Translation failed. Please try again.',
          code: 'TRANSLATION_ERROR'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    
    return NextResponse.json({
      status: 'ok',
      configured: hasApiKey,
      message: hasApiKey 
        ? 'Translation service is ready' 
        : 'Translation service needs configuration'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        configured: false,
        message: 'Service unavailable'
      },
      { status: 500 }
    );
  }
}