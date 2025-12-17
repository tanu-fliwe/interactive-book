import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';
import { BookManifest, BookMetadata } from '@/types/book';

// GET /api/books - List all books
export async function GET() {
  try {
    const { blobs } = await list({
      prefix: 'books/',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Filter for manifest.json files
    const manifestBlobs = blobs.filter((blob) =>
      blob.pathname.endsWith('/manifest.json')
    );

    // Fetch all manifests
    const books: BookMetadata[] = await Promise.all(
      manifestBlobs.map(async (blob) => {
        const response = await fetch(blob.url);
        const manifest: BookManifest = await response.json();
        return {
          bookId: manifest.bookId,
          title: manifest.title,
          grade: manifest.grade,
          lessonName: manifest.lessonName,
          pageCount: manifest.pageCount,
          createdAt: manifest.createdAt,
          updatedAt: manifest.updatedAt,
        };
      })
    );

    // Sort by updatedAt (most recent first)
    books.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error listing books:', error);
    return NextResponse.json(
      { error: 'Failed to list books' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create/update book metadata
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, title, grade, lessonName } = body;

    if (!bookId || !title || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if book already exists
    const manifestPath = `books/${bookId}/manifest.json`;
    let existingManifest: BookManifest | null = null;

    try {
      const { blobs } = await list({
        prefix: manifestPath,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      if (blobs.length > 0) {
        const response = await fetch(blobs[0].url);
        existingManifest = await response.json();
      }
    } catch (err) {
      // Book doesn't exist yet
    }

    // Create or update manifest
    const now = new Date().toISOString();
    const manifest: BookManifest = {
      bookId,
      title,
      grade,
      lessonName,
      pageCount: existingManifest?.pageCount || 0,
      createdAt: existingManifest?.createdAt || now,
      updatedAt: now,
      pages: existingManifest?.pages || [],
      interactivePages: existingManifest?.interactivePages || {},
    };

    // Save manifest to Vercel Blob
    const blob = await put(manifestPath, JSON.stringify(manifest, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ success: true, manifest, url: blob.url });
  } catch (error) {
    console.error('Error creating/updating book:', error);
    return NextResponse.json(
      { error: 'Failed to create/update book' },
      { status: 500 }
    );
  }
}
