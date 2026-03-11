import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ id: existingUser.id, name: existingUser.name, email: existingUser.email });
    const user = await db.user.create({
      data: { email, name, password: password || 'guest', role: 'user' },
      select: { id: true, name: true, email: true }
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, avatar, bio } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id },
      data: { 
        name, 
        avatar, 
        bio 
      },
      select: { id: true, name: true, email: true, avatar: true, bio: true, role: true }
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, avatar: true, bio: true, role: true }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
