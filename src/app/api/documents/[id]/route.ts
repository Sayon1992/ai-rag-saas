import { NextRequest, NextResponse } from 'next/server';
import { documentRepo } from '@/lib/container';

export const runtime = 'nodejs';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await documentRepo.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    await documentRepo.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE /api/documents/[id]]', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
