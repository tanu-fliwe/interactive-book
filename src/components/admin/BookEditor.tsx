'use client';

import { useState, useEffect } from 'react';
import {
  BookManifest,
  BookPage,
  GradeLevel,
  InteractivePageConfig,
  InteractivePageType,
} from '@/types/book';
import PageUploader from './PageUploader';
import PageOrderer from './PageOrderer';
import InteractivePageEditor from './InteractivePageEditor';

interface BookEditorProps {
  book: BookManifest | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function BookEditor({ book, onSave, onCancel }: BookEditorProps) {
  const [bookId, setBookId] = useState('');
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('3');
  const [lessonName, setLessonName] = useState('');
  const [pages, setPages] = useState<BookPage[]>([]);
  const [interactivePages, setInteractivePages] = useState<
    Record<string, InteractivePageConfig>
  >({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'metadata' | 'pages' | 'interactive'>(
    'metadata'
  );

  useEffect(() => {
    if (book) {
      setBookId(book.bookId);
      setTitle(book.title);
      setGrade(book.grade);
      setLessonName(book.lessonName || '');
      setPages(book.pages || []);
      setInteractivePages(book.interactivePages || {});
      setActiveTab('pages');
    } else {
      // Reset for new book
      setBookId('');
      setTitle('');
      setGrade('3');
      setLessonName('');
      setPages([]);
      setInteractivePages({});
      setActiveTab('metadata');
    }
  }, [book]);

  const handleSaveMetadata = async () => {
    if (!bookId || !title) {
      alert('Please fill in Book ID and Title');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, title, grade, lessonName }),
      });

      if (response.ok) {
        setActiveTab('pages');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save book');
      }
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveComplete = async () => {
    if (!bookId) return;

    setSaving(true);
    try {
      const manifest: BookManifest = {
        bookId,
        title,
        grade,
        lessonName,
        pageCount: pages.length,
        createdAt: book?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pages,
        interactivePages,
      };

      const response = await fetch(`/api/books/${bookId}/manifest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest),
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save manifest');
      }
    } catch (error) {
      console.error('Error saving manifest:', error);
      alert('Failed to save manifest');
    } finally {
      setSaving(false);
    }
  };

  const grades: GradeLevel[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-6 pt-4 pb-0">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('metadata')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'metadata'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Book Info
            </button>
            <button
              onClick={() => setActiveTab('pages')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pages'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              disabled={!bookId}
            >
              Pages ({pages.length})
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'interactive'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              disabled={pages.length === 0}
            >
              Interactive Pages
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'metadata' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {book ? 'Edit Book' : 'Create New Book'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Book ID *
                </label>
                <input
                  type="text"
                  value={bookId}
                  onChange={(e) => setBookId(e.target.value)}
                  disabled={!!book}
                  placeholder="e.g., grade3_lesson1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Used in URLs. Cannot be changed after creation.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Grade 3 - Lesson 1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Grade *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {grades.map((g) => (
                    <option key={g} value={g}>
                      {g === 'K' ? 'Kindergarten' : `Grade ${g}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lesson Name (optional)
                </label>
                <input
                  type="text"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  placeholder="e.g., Introduction to Fractions"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveMetadata}
                disabled={saving || !bookId || !title}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : book ? 'Save Changes' : 'Create Book'}
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pages' && bookId && (
          <div>
            <PageUploader
              bookId={bookId}
              pages={pages}
              onPagesChange={setPages}
            />

            {pages.length > 0 && (
              <div className="mt-8">
                <PageOrderer pages={pages} onPagesChange={setPages} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'interactive' && pages.length > 0 && (
          <InteractivePageEditor
            pages={pages}
            interactivePages={interactivePages}
            onInteractivePagesChange={setInteractivePages}
          />
        )}
      </div>

      {/* Footer */}
      {bookId && (
        <div className="bg-white border-t border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              {pages.length} pages •{' '}
              {Object.keys(interactivePages).length} interactive
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handleSaveComplete}
                disabled={saving || pages.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
