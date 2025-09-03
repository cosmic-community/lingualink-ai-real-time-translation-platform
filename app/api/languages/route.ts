import { NextResponse } from 'next/server';
import { getLanguages } from '@/lib/cosmic';

export async function GET() {
  try {
    const languages = await getLanguages();
    return NextResponse.json({ languages });
  } catch (error) {
    console.error('Languages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}