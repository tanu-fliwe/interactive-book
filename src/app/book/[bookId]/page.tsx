'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookManifest } from '@/types/book';
import Flipbook from '@/components/Flipbook';

export default function BookViewerPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [manifest, setManifest] = useState<BookManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadManifest = async () => {
      try {
        const response = await fetch(`/api/books/${bookId}`);
        if (!response.ok) {
          throw new Error('Book not found');
        }
        const data = await response.json();
        setManifest(data.manifest);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    loadManifest();
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Loading book...</div>
      </div>
    );
  }

  if (error || !manifest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Book Not Found</h1>
          <p className="text-slate-400">{error}</p>
          <a
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white">{manifest.title}</h1>
          {manifest.lessonName && (
            <p className="text-slate-400 mt-2">{manifest.lessonName}</p>
          )}
        </div>
        <Flipbook manifest={manifest} />
      </div>
    </main>
  );
}
