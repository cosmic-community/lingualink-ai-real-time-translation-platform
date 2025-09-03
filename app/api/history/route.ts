import { NextRequest, NextResponse } from 'next/server';
import { getTranslationHistory, deleteTranslation } from '@/lib/cosmic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const translations = await getTranslationHistory(userId || undefined);
    return NextResponse.json({ translations });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translation history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const translationId = searchParams.get('id');

    if (!translationId) {
      return NextResponse.json(
        { error: 'Translation ID is required' },
        { status: 400 }
      );
    }

    await deleteTranslation(translationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete translation API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete translation' },
      { status: 500 }
    );
  }
}