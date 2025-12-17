'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookMetadata, BookManifest, GradeLevel } from '@/types/book';
import BookList from '@/components/admin/BookList';
import BookEditor from '@/components/admin/BookEditor';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}`);
      const data = await response.json();
      setSelectedBook(data.manifest);
      setCreating(false);
    } catch (error) {
      console.error('Error loading book:', error);
    }
  };

  const handleCreateNew = () => {
    setSelectedBook(null);
    setCreating(true);
  };

  const handleSave = async () => {
    await loadBooks();
    setCreating(false);
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
      await loadBooks();
      if (selectedBook?.bookId === bookId) {
        setSelectedBook(null);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            FiWe Book Builder
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Book List */}
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-4">
            <button
              onClick={handleCreateNew}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Create New Book
            </button>
          </div>

          {loading ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : (
            <BookList
              books={books}
              selectedBookId={selectedBook?.bookId || null}
              onSelect={handleSelectBook}
              onDelete={handleDelete}
            />
          )}
        </aside>

        {/* Main Content - Book Editor */}
        <main className="flex-1 overflow-y-auto">
          {creating || selectedBook ? (
            <BookEditor
              book={selectedBook}
              onSave={handleSave}
              onCancel={() => {
                setCreating(false);
                setSelectedBook(null);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">
                  No book selected
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Select a book from the list or create a new one
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
