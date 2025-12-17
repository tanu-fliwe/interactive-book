'use client';

import { useState } from 'react';

interface VocabOverlayProps {
  bookId: string;
  pageIndex: number;
}

interface VocabCard {
  word: string;
  definition: string;
}

// Sample vocabulary - in production this would come from the manifest or API
const sampleVocab: VocabCard[] = [
  { word: 'Fraction', definition: 'A part of a whole number' },
  { word: 'Numerator', definition: 'The top number in a fraction' },
  { word: 'Denominator', definition: 'The bottom number in a fraction' },
];

export default function VocabOverlay({ bookId, pageIndex }: VocabOverlayProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  const handleFlip = () => {
    setShowDefinition(!showDefinition);
  };

  const handleNext = () => {
    setShowDefinition(false);
    setCurrentCard((prev) => (prev + 1) % sampleVocab.length);
  };

  const handlePrev = () => {
    setShowDefinition(false);
    setCurrentCard((prev) => (prev - 1 + sampleVocab.length) % sampleVocab.length);
  };

  const card = sampleVocab[currentCard];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden backdrop-blur-sm bg-white/90 shadow-xl p-6 flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 mb-3">Vocabulary</h3>

      {/* Flip Card */}
      <div
        onClick={handleFlip}
        className="flex-1 flex items-center justify-center cursor-pointer bg-blue-50 border-2 border-blue-300 rounded-lg p-6 transition-all hover:border-blue-400"
      >
        <div className="text-center">
          {showDefinition ? (
            <div>
              <p className="text-sm text-blue-600 font-medium mb-2">
                Definition:
              </p>
              <p className="text-lg text-slate-900">{card.definition}</p>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-blue-900">{card.word}</p>
              <p className="text-xs text-slate-500 mt-2">Click to flip</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
        >
          Previous
        </button>
        <span className="text-sm text-slate-600">
          {currentCard + 1} / {sampleVocab.length}
        </span>
        <button
          onClick={handleNext}
          className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
