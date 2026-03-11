import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all ads or filter by position
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const activeOnly = searchParams.get('active') === 'true';
    const id = searchParams.get('id');

    // Fetch single ad by ID
    if (id) {
      const ad = await db.ad.findUnique({ where: { id } });
      if (!ad) {
        return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
      }
      return NextResponse.json({ ad });
    }

    // Build where clause
    const where: any = {};
    if (position) where.position = position;
    if (activeOnly) {
      where.active = true;
      const now = new Date();
      where.OR = [
        { startDate: null, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: null },
        { startDate: { lte: now }, endDate: { gte: now } },
      ];
    }

    const ads = await db.ad.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    // Track impressions for active ads
    if (activeOnly && ads.length > 0) {
      await Promise.all(
        ads.map(ad => 
          db.ad.update({
            where: { id: ad.id },
            data: { impressions: { increment: 1 } }
          })
        )
      );
    }

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}

// POST - Create new ad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, position, content, imageUrl, linkUrl, linkText, active, priority, startDate, endDate } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const ad = await db.ad.create({
      data: {
        title,
        type: type || 'banner',
        position: position || 'sidebar',
        content,
        imageUrl,
        linkUrl,
        linkText,
        active: active ?? true,
        priority: priority ?? 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
  }
}

// PUT - Update ad
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 });
    }

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const ad = await db.ad.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ad });
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
  }
}

// DELETE - Remove ad
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 });
    }

    await db.ad.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
  }
}
