'use client';

import { useState } from 'react';
import {
  BookPage,
  InteractivePageConfig,
  InteractivePageType,
  Rectangle,
} from '@/types/book';
import OverlayEditor from './OverlayEditor';

interface InteractivePageEditorProps {
  pages: BookPage[];
  interactivePages: Record<string, InteractivePageConfig>;
  onInteractivePagesChange: (
    interactivePages: Record<string, InteractivePageConfig>
  ) => void;
}

export default function InteractivePageEditor({
  pages,
  interactivePages,
  onInteractivePagesChange,
}: InteractivePageEditorProps) {
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const [showOverlayEditor, setShowOverlayEditor] = useState(false);

  const interactiveTypes: { value: InteractivePageType; label: string }[] = [
    { value: 'skills-match', label: 'Skills Match (Phaser)' },
    { value: 'reflections', label: 'Reflections (Form)' },
    { value: 'vocab-flip', label: 'Vocab Flip' },
  ];

  const isPageInteractive = (pageIndex: number): boolean => {
    return pageIndex.toString() in interactivePages;
  };

  const getPageConfig = (pageIndex: number): InteractivePageConfig | undefined => {
    return interactivePages[pageIndex.toString()];
  };

  const toggleInteractive = (pageIndex: number) => {
    const key = pageIndex.toString();
    const updated = { ...interactivePages };

    if (key in updated) {
      delete updated[key];
    } else {
      updated[key] = {
        type: 'skills-match',
        rect: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
      };
    }

    onInteractivePagesChange(updated);
  };

  const updatePageType = (pageIndex: number, type: InteractivePageType) => {
    const key = pageIndex.toString();
    const updated = { ...interactivePages };

    if (key in updated) {
      updated[key] = { ...updated[key], type };
      onInteractivePagesChange(updated);
    }
  };

  const updatePageRect = (pageIndex: number, rect: Rectangle) => {
    const key = pageIndex.toString();
    const updated = { ...interactivePages };

    if (key in updated) {
      updated[key] = { ...updated[key], rect };
      onInteractivePagesChange(updated);
    }
  };

  const handleEditOverlay = (pageIndex: number) => {
    setSelectedPageIndex(pageIndex);
    setShowOverlayEditor(true);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Interactive Pages
      </h3>
      <p className="text-sm text-slate-600 mb-6">
        Mark pages as interactive and configure overlay rectangles for activities.
      </p>

      <div className="space-y-4">
        {pages.map((page) => (
          <div
            key={page.index}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-4">
              {/* Page Thumbnail */}
              <div className="w-20 h-28 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                <img
                  src={page.url}
                  alt={`Page ${page.index}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Page Controls */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`interactive-${page.index}`}
                    checked={isPageInteractive(page.index)}
                    onChange={() => toggleInteractive(page.index)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`interactive-${page.index}`}
                    className="font-medium text-slate-900"
                  >
                    Page {page.index} - Interactive
                  </label>
                </div>

                {isPageInteractive(page.index) && (
                  <div className="space-y-3 pl-7">
                    {/* Type Selector */}
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Activity Type:
                      </label>
                      <select
                        value={getPageConfig(page.index)?.type || 'skills-match'}
                        onChange={(e) =>
                          updatePageType(
                            page.index,
                            e.target.value as InteractivePageType
                          )
                        }
                        className="w-full max-w-xs px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {interactiveTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Overlay Rectangle */}
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Overlay Rectangle (normalized 0-1):
                      </label>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        {getPageConfig(page.index)?.rect && (
                          <>
                            <span>
                              x: {getPageConfig(page.index)!.rect.x.toFixed(2)}
                            </span>
                            <span>
                              y: {getPageConfig(page.index)!.rect.y.toFixed(2)}
                            </span>
                            <span>
                              w: {getPageConfig(page.index)!.rect.w.toFixed(2)}
                            </span>
                            <span>
                              h: {getPageConfig(page.index)!.rect.h.toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditOverlay(page.index)}
                        className="mt-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Edit Overlay Rectangle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overlay Editor Modal */}
      {showOverlayEditor && selectedPageIndex !== null && (
        <OverlayEditor
          page={pages.find((p) => p.index === selectedPageIndex)!}
          rect={getPageConfig(selectedPageIndex)!.rect}
          onSave={(rect) => {
            updatePageRect(selectedPageIndex, rect);
            setShowOverlayEditor(false);
            setSelectedPageIndex(null);
          }}
          onCancel={() => {
            setShowOverlayEditor(false);
            setSelectedPageIndex(null);
          }}
        />
      )}
    </div>
  );
}
