'use client';

import { useState, useRef, useEffect } from 'react';
import { BookPage, Rectangle } from '@/types/book';

interface OverlayEditorProps {
  page: BookPage;
  rect: Rectangle;
  onSave: (rect: Rectangle) => void;
  onCancel: () => void;
}

type ResizeHandle =
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'move'
  | null;

export default function OverlayEditor({
  page,
  rect: initialRect,
  onSave,
  onCancel,
}: OverlayEditorProps) {
  const [rect, setRect] = useState<Rectangle>(initialRect);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    handle: ResizeHandle
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - containerRect.left) / containerRect.width;
      const y = (e.clientY - containerRect.top) / containerRect.height;
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragHandle || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - containerRect.left) / containerRect.width;
    const y = (e.clientY - containerRect.top) / containerRect.height;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    let newRect = { ...rect };

    if (dragHandle === 'move') {
      // Move the rectangle
      newRect.x = Math.max(0, Math.min(1 - rect.w, rect.x + dx));
      newRect.y = Math.max(0, Math.min(1 - rect.h, rect.y + dy));
    } else {
      // Resize based on handle
      if (dragHandle.includes('n')) {
        const newY = Math.max(0, rect.y + dy);
        const newH = rect.h + (rect.y - newY);
        if (newH > 0.05) {
          newRect.y = newY;
          newRect.h = newH;
        }
      }
      if (dragHandle.includes('s')) {
        newRect.h = Math.max(0.05, Math.min(1 - rect.y, rect.h + dy));
      }
      if (dragHandle.includes('w')) {
        const newX = Math.max(0, rect.x + dx);
        const newW = rect.w + (rect.x - newX);
        if (newW > 0.05) {
          newRect.x = newX;
          newRect.w = newW;
        }
      }
      if (dragHandle.includes('e')) {
        newRect.w = Math.max(0.05, Math.min(1 - rect.x, rect.w + dx));
      }
    }

    setRect(newRect);
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragHandle(null);
  };

  const handleSave = () => {
    onSave(rect);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Edit Overlay Rectangle - Page {page.index}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Drag to move, resize from corners and edges
          </p>
        </div>

        {/* Editor */}
        <div className="flex-1 p-6 overflow-auto">
          <div
            ref={containerRef}
            className="relative mx-auto bg-slate-100 rounded-lg overflow-hidden"
            style={{ maxWidth: '800px', aspectRatio: '3/4' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Page Image */}
            <img
              src={page.url}
              alt={`Page ${page.index}`}
              className="w-full h-full object-contain select-none"
              draggable={false}
            />

            {/* Overlay Rectangle */}
            {containerSize.width > 0 && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move"
                style={{
                  left: `${rect.x * 100}%`,
                  top: `${rect.y * 100}%`,
                  width: `${rect.w * 100}%`,
                  height: `${rect.h * 100}%`,
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* Corner Handles */}
                <div
                  className="absolute w-3 h-3 bg-blue-600 rounded-full cursor-nw-resize -top-1.5 -left-1.5"
                  onMouseDown={(e) => handleMouseDown(e, 'nw')}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-600 rounded-full cursor-ne-resize -top-1.5 -right-1.5"
                  onMouseDown={(e) => handleMouseDown(e, 'ne')}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-600 rounded-full cursor-sw-resize -bottom-1.5 -left-1.5"
                  onMouseDown={(e) => handleMouseDown(e, 'sw')}
                />
                <div
                  className="absolute w-3 h-3 bg-blue-600 rounded-full cursor-se-resize -bottom-1.5 -right-1.5"
                  onMouseDown={(e) => handleMouseDown(e, 'se')}
                />

                {/* Edge Handles */}
                <div
                  className="absolute w-full h-1 cursor-n-resize -top-0.5 left-0"
                  onMouseDown={(e) => handleMouseDown(e, 'n')}
                />
                <div
                  className="absolute w-full h-1 cursor-s-resize -bottom-0.5 left-0"
                  onMouseDown={(e) => handleMouseDown(e, 's')}
                />
                <div
                  className="absolute w-1 h-full cursor-w-resize -left-0.5 top-0"
                  onMouseDown={(e) => handleMouseDown(e, 'w')}
                />
                <div
                  className="absolute w-1 h-full cursor-e-resize -right-0.5 top-0"
                  onMouseDown={(e) => handleMouseDown(e, 'e')}
                />

                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    Overlay Area
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rectangle Info */}
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-600">X:</span>{' '}
                <span className="font-mono">{rect.x.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-slate-600">Y:</span>{' '}
                <span className="font-mono">{rect.y.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-slate-600">Width:</span>{' '}
                <span className="font-mono">{rect.w.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-slate-600">Height:</span>{' '}
                <span className="font-mono">{rect.h.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Rectangle
          </button>
        </div>
      </div>
    </div>
  );
}
