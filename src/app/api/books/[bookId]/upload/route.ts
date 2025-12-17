import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// POST /api/books/[bookId]/upload - Upload page images
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate file types
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}` },
          { status: 400 }
        );
      }
    }

    // Upload files to Vercel Blob
    const uploads = await Promise.all(
      files.map(async (file) => {
        const path = `books/${bookId}/pages/${file.name}`;
        const blob = await put(path, file, {
          access: 'public',
          contentType: file.type,
        });
        return {
          filename: file.name,
          url: blob.url,
          size: file.size,
        };
      })
    );

    return NextResponse.json({ success: true, uploads });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
