import { NextRequest, NextResponse } from 'next/server';
import { translateText, detectLanguage, testTranslationAPI } from '@/lib/translation';
import { validateTranslationInput } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // Parse request body with better error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Invalid JSON in request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body. Please check your request format.' },
        { status: 400 }
      );
    }

    const { text, sourceLanguage, targetLanguage, autoDetect } = body;

    // Validate required fields
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Source and target languages are required' },
        { status: 400 }
      );
    }

    // Validate input text
    const validation = validateTranslationInput(text);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is missing');
      return NextResponse.json(
        { 
          error: 'Translation service is not configured. Please set up the OpenAI API key in your environment variables.',
          code: 'MISSING_API_KEY',
          details: 'Add OPENAI_API_KEY to your .env file'
        },
        { status: 500 }
      );
    }

    // Validate API key format
    if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
      console.error('Invalid OpenAI API key format');
      return NextResponse.json(
        { 
          error: 'Invalid OpenAI API key format. Please check your API key.',
          code: 'INVALID_API_KEY'
        },
        { status: 500 }
      );
    }

    let actualSourceLang = sourceLanguage;

    // Auto-detect language if requested
    if (autoDetect && text.length > 10) {
      try {
        console.log('Attempting to detect language...');
        const detectedLang = await detectLanguage(text);
        console.log('Detected language:', detectedLang);
        
        if (detectedLang && detectedLang !== 'Unknown' && detectedLang !== sourceLanguage) {
          actualSourceLang = detectedLang;
        }
      } catch (error) {
        console.error('Language detection failed:', error);
        // Continue with provided source language
      }
    }

    // Perform translation
    try {
      console.log(`Translating from ${actualSourceLang} to ${targetLanguage}...`);
      const result = await translateText(text, actualSourceLang, targetLanguage);
      console.log('Translation successful');

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
      
      // Return specific error messages with more details
      return NextResponse.json(
        { 
          error: translationError.message || 'Translation failed. Please try again.',
          code: 'TRANSLATION_ERROR',
          details: translationError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Health check endpoint with API key validation
export async function GET() {
  try {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    const isValidApiKey = hasApiKey && process.env.OPENAI_API_KEY.startsWith('sk-');
    
    if (!hasApiKey) {
      return NextResponse.json({
        status: 'error',
        configured: false,
        message: 'OpenAI API key is missing. Please add OPENAI_API_KEY to your environment variables.'
      });
    }

    if (!isValidApiKey) {
      return NextResponse.json({
        status: 'error',
        configured: false,
        message: 'OpenAI API key format is invalid. Please check your API key.'
      });
    }

    // Test the API connection
    try {
      console.log('Testing OpenAI API connection...');
      const testResult = await testTranslationAPI();
      
      if (testResult.success) {
        return NextResponse.json({
          status: 'ok',
          configured: true,
          message: 'Translation service is ready and API key is valid'
        });
      } else {
        return NextResponse.json({
          status: 'error',
          configured: false,
          message: `API test failed: ${testResult.error}`
        }, { status: 500 });
      }
    } catch (testError: any) {
      console.error('API test error:', testError);
      return NextResponse.json({
        status: 'error',
        configured: false,
        message: `API connection test failed: ${testError.message}`
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Health check error:', error);
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