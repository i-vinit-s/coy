'use client';
import { useEffect, useRef } from 'react';
import { ArrowRight, Heart, X } from 'lucide-react';
import Portrait from './Portrait';

export default function MatchModal({ match, onClose, onMatches }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!match) return;
    const element = dialog.current;
    const focusedBefore = document.activeElement;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (focusedBefore?.isConnected) focusedBefore.focus();
      else document.querySelector('[aria-current="page"]')?.focus();
    };
  }, [match]);

  if (!match) return null;
  return (
    <dialog
      ref={dialog}
      className="match-dialog"
      aria-labelledby="match-title"
      aria-describedby="match-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button className="dialog-close" aria-label="Close match" onClick={onClose}>
        <X size={21} />
      </button>
      <div className="match-content">
        <div className="pair">
          <div className="pair-avatar avatar-you">You</div>
          <span className="pair-heart">
            <Heart size={21} fill="currentColor" aria-hidden="true" />
          </span>
          <Portrait profile={match} className="pair-avatar avatar-them" />
        </div>
        <h2 id="match-title">It’s a match!</h2>
        <p id="match-description">You and {match.name} liked each other.</p>
        <button autoFocus className="btn btn-green" onClick={onMatches}>
          See your matches <ArrowRight size={18} />
        </button>
        <button className="text-button" onClick={onClose}>
          Keep discovering
        </button>
      </div>
    </dialog>
  );
}
