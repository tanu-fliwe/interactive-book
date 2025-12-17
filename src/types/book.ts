/**
 * Book Builder Types
 * TypeScript definitions for book manifests and metadata
 */

export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

export type InteractivePageType = 'skills-match' | 'reflections' | 'vocab-flip';

export interface Rectangle {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  w: number; // 0-1 normalized
  h: number; // 0-1 normalized
}

export interface BookPage {
  index: number;
  url: string;
  filename?: string;
}

export interface InteractivePageConfig {
  type: InteractivePageType;
  rect: Rectangle;
}

export interface BookManifest {
  bookId: string;
  title: string;
  grade: GradeLevel;
  lessonName?: string;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
  pages: BookPage[];
  interactivePages?: Record<string, InteractivePageConfig>; // key is page index
}

export interface BookMetadata {
  bookId: string;
  title: string;
  grade: GradeLevel;
  lessonName?: string;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}
