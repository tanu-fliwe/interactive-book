'use client';

import { useState, useEffect } from 'react';

interface ReflectionsOverlayProps {
  bookId: string;
  pageIndex: number;
}

export default function ReflectionsOverlay({
  bookId,
  pageIndex,
}: ReflectionsOverlayProps) {
  const [reflection, setReflection] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved reflection from localStorage
    const key = `reflection_${bookId}_${pageIndex}`;
    const savedReflection = localStorage.getItem(key);
    if (savedReflection) {
      setReflection(savedReflection);
    }
  }, [bookId, pageIndex]);

  const handleSave = () => {
    const key = `reflection_${bookId}_${pageIndex}`;
    localStorage.setItem(key, reflection);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden backdrop-blur-sm bg-white/90 shadow-xl p-6 flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 mb-3">
        Reflection
      </h3>
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Write your reflection here..."
        className="flex-1 p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <button
        onClick={handleSave}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {saved ? 'Saved!' : 'Save Reflection'}
      </button>
    </div>
  );
}
