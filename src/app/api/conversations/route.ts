import { NextResponse } from 'next/server';
import { conversationRepo } from '@/lib/container';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const conversations = await conversationRepo.findAll();
    return NextResponse.json(conversations);
  } catch (err) {
    console.error('[GET /api/conversations]', err);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const conversation = await conversationRepo.create();
    return NextResponse.json(conversation, { status: 201 });
  } catch (err) {
    console.error('[POST /api/conversations]', err);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
