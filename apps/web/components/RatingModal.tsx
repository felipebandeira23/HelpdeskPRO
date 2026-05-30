'use client';

import { useState } from 'react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export function RatingModal({ isOpen, onClose, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Avalie o Atendimento</h3>
          <p className="text-slate-400 text-sm">
            Como você avalia a resolução deste ticket?
          </p>
        </div>
        
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="text-4xl focus:outline-none transition-transform hover:scale-110"
            >
              <span className={star <= (hovered || rating) ? 'text-yellow-400' : 'text-slate-600'}>
                ★
              </span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Deixe um comentário (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="O que achou do atendimento?"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium text-sm"
          >
            Pular
          </button>
          <button
            onClick={() => {
              onSubmit(rating, comment);
              onClose();
            }}
            disabled={rating === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-blue-500/20"
          >
            Enviar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
}
