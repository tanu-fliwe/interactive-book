import { NextRequest, NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';
import { BookManifest } from '@/types/book';

// GET /api/books/[bookId] - Get book manifest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const manifestPath = `books/${bookId}/manifest.json`;

    const { blobs } = await list({
      prefix: manifestPath,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (blobs.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const response = await fetch(blobs[0].url);
    const manifest: BookManifest = await response.json();

    return NextResponse.json({ manifest });
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[bookId] - Delete book and all its pages
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const bookPrefix = `books/${bookId}/`;

    // List all blobs for this book
    const { blobs } = await list({
      prefix: bookPrefix,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Delete all blobs
    await Promise.all(
      blobs.map((blob) =>
        del(blob.url, { token: process.env.BLOB_READ_WRITE_TOKEN })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
