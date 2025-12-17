'use client';

import { useState } from 'react';
import { BookPage } from '@/types/book';

interface PageOrdererProps {
  pages: BookPage[];
  onPagesChange: (pages: BookPage[]) => void;
}

export default function PageOrderer({ pages, onPagesChange }: PageOrdererProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleIndexChange = (currentIndex: number, newIndex: number) => {
    const updatedPages = [...pages];
    updatedPages[currentIndex] = { ...updatedPages[currentIndex], index: newIndex };
    onPagesChange(updatedPages.sort((a, b) => a.index - b.index));
  };

  const handleAutoIndex = () => {
    const updatedPages = pages.map((page, idx) => ({
      ...page,
      index: idx + 1,
    }));
    onPagesChange(updatedPages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updatedPages = [...pages];
    const [draggedPage] = updatedPages.splice(draggedIndex, 1);
    updatedPages.splice(dropIndex, 0, draggedPage);

    // Re-index all pages
    const reindexed = updatedPages.map((page, idx) => ({
      ...page,
      index: idx + 1,
    }));

    onPagesChange(reindexed);
    setDraggedIndex(null);
  };

  const handleDelete = (index: number) => {
    if (!confirm('Remove this page?')) return;
    const updatedPages = pages.filter((_, idx) => idx !== index);
    // Re-index remaining pages
    const reindexed = updatedPages.map((page, idx) => ({
      ...page,
      index: idx + 1,
    }));
    onPagesChange(reindexed);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Page Order</h3>
        <button
          onClick={handleAutoIndex}
          className="px-3 py-1.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
        >
          Auto-Index (1..{pages.length})
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pages.map((page, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            className={`relative bg-white border border-slate-200 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow ${
              draggedIndex === idx ? 'opacity-50' : ''
            }`}
          >
            {/* Drag Handle */}
            <div className="absolute top-2 left-2 text-slate-400">
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
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(idx)}
              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-600 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Page Thumbnail */}
            <div className="aspect-[3/4] bg-slate-100 rounded overflow-hidden mb-2">
              <img
                src={page.url}
                alt={`Page ${page.index}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Page Index Input */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600">Page:</label>
              <input
                type="number"
                min="1"
                value={page.index}
                onChange={(e) =>
                  handleIndexChange(idx, parseInt(e.target.value) || 1)
                }
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filename */}
            {page.filename && (
              <p className="mt-1 text-xs text-slate-500 truncate" title={page.filename}>
                {page.filename}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
