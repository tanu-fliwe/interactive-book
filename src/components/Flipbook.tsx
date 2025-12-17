'use client';

import { useRef, forwardRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { BookManifest, InteractivePageConfig } from '@/types/book';

// Dynamically import HTMLFlipBook with SSR disabled
const HTMLFlipBook = dynamic(
  async () => (await import('react-pageflip')).default,
  { ssr: false }
);

const FlipBook: any = HTMLFlipBook;

// Dynamically import overlays
const SkillsMatchGame = dynamic(
  () => import('@/components/overlays/SkillsMatchGame'),
  { ssr: false }
);
const ReflectionsOverlay = dynamic(
  () => import('@/components/overlays/ReflectionsOverlay'),
  { ssr: false }
);
const VocabOverlay = dynamic(
  () => import('@/components/overlays/VocabOverlay'),
  { ssr: false }
);

interface FlipbookProps {
  manifest: BookManifest;
}

// Page component
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function Page({ children }, ref) {
    return (
      <div
        ref={ref}
        className="relative bg-white shadow-2xl"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>
    );
  }
);

export default function Flipbook({ manifest }: FlipbookProps) {
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const getInteractiveConfig = (
    pageIndex: number
  ): InteractivePageConfig | undefined => {
    return manifest.interactivePages?.[pageIndex.toString()];
  };

  const renderOverlay = (pageIndex: number, config: InteractivePageConfig) => {
    const { type, rect } = config;

    // Convert normalized rect to percentage
    const style = {
      position: 'absolute' as const,
      left: `${rect.x * 100}%`,
      top: `${rect.y * 100}%`,
      width: `${rect.w * 100}%`,
      height: `${rect.h * 100}%`,
    };

    switch (type) {
      case 'skills-match':
        return (
          <div style={style}>
            <SkillsMatchGame />
          </div>
        );
      case 'reflections':
        return (
          <div style={style}>
            <ReflectionsOverlay bookId={manifest.bookId} pageIndex={pageIndex} />
          </div>
        );
      case 'vocab-flip':
        return (
          <div style={style}>
            <VocabOverlay bookId={manifest.bookId} pageIndex={pageIndex} />
          </div>
        );
      default:
        return null;
    }
  };

  const handleFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <FlipBook
          // @ts-ignore
          ref={bookRef}
          width={520}
          height={680}
          minWidth={320}
          minHeight={420}
          maxWidth={900}
          maxHeight={1100}
          size="stretch"
          maxShadowOpacity={0.2}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={handleFlip}
          className="flipbook"
        >
          {manifest.pages.map((page) => {
            const interactiveConfig = getInteractiveConfig(page.index);
            const isInteractive = !!interactiveConfig;

            return (
              <Page key={page.index}>
                {/* Page Image */}
                <img
                  src={page.url}
                  alt={`Page ${page.index}`}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />

                {/* Interactive Overlay */}
                {isInteractive && renderOverlay(page.index, interactiveConfig)}
              </Page>
            );
          })}
        </FlipBook>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          disabled={currentPage === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Previous
        </button>
        <span className="text-white font-medium">
          Page {currentPage + 1} of {manifest.pages.length}
        </span>
        <button
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
          disabled={currentPage >= manifest.pages.length - 1}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
