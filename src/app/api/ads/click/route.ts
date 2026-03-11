import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Track ad click
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 });
    }

    const ad = await db.ad.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}
