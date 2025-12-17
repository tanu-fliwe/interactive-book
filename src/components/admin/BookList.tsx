'use client';

import { BookMetadata } from '@/types/book';

interface BookListProps {
  books: BookMetadata[];
  selectedBookId: string | null;
  onSelect: (bookId: string) => void;
  onDelete: (bookId: string) => void;
}

export default function BookList({
  books,
  selectedBookId,
  onSelect,
  onDelete,
}: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        No books yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200">
      {books.map((book) => (
        <div
          key={book.bookId}
          className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
            selectedBookId === book.bookId ? 'bg-blue-50' : ''
          }`}
          onClick={() => onSelect(book.bookId)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 truncate">
                {book.title}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="px-2 py-0.5 bg-slate-100 rounded">
                  Grade {book.grade}
                </span>
                <span>{book.pageCount} pages</span>
              </div>
              {book.lessonName && (
                <p className="mt-1 text-xs text-slate-600 truncate">
                  {book.lessonName}
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(book.bookId);
              }}
              className="ml-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
              title="Delete book"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
