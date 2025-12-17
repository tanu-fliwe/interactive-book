import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { BookManifest } from '@/types/book';

// POST /api/books/[bookId]/manifest - Save complete manifest
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const manifest: BookManifest = await request.json();

    // Validate manifest
    if (manifest.bookId !== bookId) {
      return NextResponse.json(
        { error: 'Book ID mismatch' },
        { status: 400 }
      );
    }

    // Update timestamp
    manifest.updatedAt = new Date().toISOString();

    // Save manifest to Vercel Blob
    const manifestPath = `books/${bookId}/manifest.json`;
    const blob = await put(manifestPath, JSON.stringify(manifest, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Error saving manifest:', error);
    return NextResponse.json(
      { error: 'Failed to save manifest' },
      { status: 500 }
    );
  }
}
