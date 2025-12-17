"use client";

import React, { useMemo, useRef } from "react";
import dynamic from "next/dynamic";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

type OverlayRect = { x: number; y: number; w: number; h: number };

function Page({
  pageNumber,
  overlay,
  children,
}: {
  pageNumber: number;
  overlay?: { rect: OverlayRect; node: React.ReactNode };
  children?: React.ReactNode;
}) {
  return (
    <div className="relative h-full w-full bg-white">
      {/* Page "image" placeholder (later replace with <img src="/books/grade3/pages/001.png" ... /> ) */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100" />

      {/* Page header */}
      <div className="relative p-6">
        <div className="text-xs font-semibold text-slate-500">FiWe Demo Book</div>
        <div className="mt-2 text-2xl font-extrabold text-slate-900">
          Page {pageNumber}
        </div>
        <div className="mt-2 max-w-md text-sm text-slate-700">
          This is a placeholder page background. Next step is swapping this with your real
          exported page PNG.
        </div>
      </div>

      {/* Overlay zone (for game on activity pages) */}
      {overlay && (
        <div
          className="absolute rounded-xl border-2 border-dashed border-slate-400 bg-white/70 backdrop-blur"
          style={{
            left: `${overlay.rect.x * 100}%`,
            top: `${overlay.rect.y * 100}%`,
            width: `${overlay.rect.w * 100}%`,
            height: `${overlay.rect.h * 100}%`,
          }}
        >
          {overlay.node}
        </div>
      )}

      {children}
    </div>
  );
}

const PhaserOverlay = dynamic(() => import("./PhaserOverlayDemo"), { ssr: false });

export default function FlipbookDemo() {
  const bookRef = useRef<any>(null);

  const pages = useMemo(() => {
    // Example: 4-page demo, with page 2 as an "activity"
    return [
      { n: 1, isActivity: false },
      { n: 2, isActivity: true },
      { n: 3, isActivity: false },
      { n: 4, isActivity: false },
    ];
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Interactive Book — Demo Flipbook</h1>
            <p className="mt-1 text-sm text-slate-300">
              Flip pages. Page 2 shows a Phaser “game overlay” box (activity page).
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
              onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
            >
              ◀ Prev
            </button>
            <button
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
              onClick={() => bookRef.current?.pageFlip()?.flipNext()}
            >
              Next ▶
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="rounded-2xl bg-white p-3 shadow-2xl">
            <HTMLFlipBook
              ref={bookRef}
              width={520}
              height={680}
              size="stretch"
              minWidth={320}
              maxWidth={900}
              minHeight={420}
              maxHeight={1100}
              maxShadowOpacity={0.2}
              showCover={true}
              mobileScrollSupport={true}
              className="text-black"
            >
              {pages.map((p) => (
                <div key={p.n} className="h-full w-full overflow-hidden rounded-xl">
                  <Page
                    pageNumber={p.n}
                    overlay={
                      p.isActivity
                        ? {
                            rect: { x: 0.08, y: 0.35, w: 0.84, h: 0.45 },
                            node: (
                              <div className="h-full w-full p-3">
                                <div className="mb-2 text-xs font-extrabold text-slate-700">
                                  Activity Overlay (Phaser)
                                </div>
                                <div className="h-[calc(100%-20px)] w-full overflow-hidden rounded-lg bg-white">
                                  <PhaserOverlay />
                                </div>
                              </div>
                            ),
                          }
                        : undefined
                    }
                  />
                </div>
              ))}
            </HTMLFlipBook>
          </div>
        </div>
      </div>
    </div>
  );
}
