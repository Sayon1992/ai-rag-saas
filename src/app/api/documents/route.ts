import { NextRequest, NextResponse } from 'next/server';
import { documentRepo, chunkRepo, embeddingService } from '@/lib/container';
import { uploadDocument } from '@/application/use-cases/UploadDocument';

import { PDFParse } from 'pdf-parse'

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  try {
    const documents = await documentRepo.findAll();
    return NextResponse.json(documents);
  } catch (err) {
    console.error('[GET /api/documents]', err);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 20 MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const parser = new PDFParse({ data: buffer })
    const { text } = await parser.getText()

    if (!text || text.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 422 });
    }

    const document = await uploadDocument(
      { name: file.name, size: file.size, text },
      { documentRepo, chunkRepo, embeddingService }
    );

    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    console.error('[POST /api/documents]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
