'use client';

import { useState, useRef } from 'react';
import { BookPage, UploadProgress } from '@/types/book';

interface PageUploaderProps {
  bookId: string;
  pages: BookPage[];
  onPagesChange: (pages: BookPage[]) => void;
}

export default function PageUploader({
  bookId,
  pages,
  onPagesChange,
}: PageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractPageNumber = (filename: string): number | null => {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg)$/i, '');

    // Try to match patterns like: 7, 07, 007, page-7, page_7, etc.
    const patterns = [
      /^(\d+)$/, // Just numbers
      /^0*(\d+)$/, // Numbers with leading zeros
      /page[-_]?(\d+)/i, // page-7 or page_7
      /(\d+)[-_]?page/i, // 7-page or 7_page
    ];

    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        validFiles.push(file);
      } else {
        alert(`Skipping ${file.name}: Only PNG and JPG files are allowed`);
      }
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    // Initialize progress tracking
    const progress: UploadProgress[] = validFiles.map((file) => ({
      filename: file.name,
      progress: 0,
      status: 'pending',
    }));
    setUploadProgress(progress);

    try {
      // Upload files
      const formData = new FormData();
      validFiles.forEach((file) => formData.append('files', file));

      const response = await fetch(`/api/books/${bookId}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Create new pages from uploads
        const newPages: BookPage[] = data.uploads.map(
          (upload: { filename: string; url: string }, idx: number) => {
            const detectedIndex = extractPageNumber(upload.filename);
            const index = detectedIndex ?? pages.length + idx + 1;
            return {
              index,
              url: upload.url,
              filename: upload.filename,
            };
          }
        );

        // Merge with existing pages and sort
        const allPages = [...pages, ...newPages].sort((a, b) => a.index - b.index);
        onPagesChange(allPages);

        // Update progress
        setUploadProgress(
          progress.map((p) => ({ ...p, status: 'success', progress: 100 }))
        );

        // Clear progress after delay
        setTimeout(() => setUploadProgress([]), 2000);
      } else {
        alert(data.error || 'Upload failed');
        setUploadProgress(
          progress.map((p) => ({
            ...p,
            status: 'error',
            error: data.error,
          }))
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
      setUploadProgress(
        progress.map((p) => ({ ...p, status: 'error', error: 'Upload failed' }))
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Upload Pages</h3>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="mt-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            Click to upload
          </button>
          <span className="text-slate-600"> or drag and drop</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">PNG or JPG files only</p>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadProgress.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {item.filename}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        item.status === 'success'
                          ? 'bg-green-500'
                          : item.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {item.status === 'success'
                      ? 'Done'
                      : item.status === 'error'
                      ? 'Failed'
                      : 'Uploading...'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages.length > 0 && (
        <div className="mt-4 text-sm text-slate-600">
          {pages.length} page{pages.length !== 1 ? 's' : ''} uploaded
        </div>
      )}
    </div>
  );
}
