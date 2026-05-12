import { NextRequest, NextResponse } from 'next/server';
import { conversationRepo, messageRepo } from '@/lib/container';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [conversation, messages] = await Promise.all([
      conversationRepo.findById(id),
      messageRepo.findByConversationId(id),
    ]);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation, messages });
  } catch (err) {
    console.error('[GET /api/conversations/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await conversationRepo.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE /api/conversations/[id]]', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
