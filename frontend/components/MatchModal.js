'use client';
import { useEffect, useRef } from 'react';
import { ArrowUpRight, Heart, ShieldCheck } from 'lucide-react';
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
      aria-labelledby="match-title"
      aria-describedby="match-description"
      className="match-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="p-7 sm:p-9 text-center">
        <p className="text-[8px] font-semibold tracking-[.16em] text-rose">
          A LITTLE SPARK, A SHARED FEELING
        </p>
        <div className="flex items-center justify-center my-8 relative">
          <div className="match-avatar bg-[#ead7cd] text-[#a58278] text-4xl font-serif -mr-2 -rotate-6">
            Y
          </div>
          <span className="absolute z-10 size-10 grid place-items-center rounded-full bg-rose border-4 border-[#fffaf6] text-white">
            <Heart size={20} fill="currentColor" />
          </span>
          <Portrait
            profile={match}
            className="match-avatar object-cover object-[center_25%] rotate-6"
          />
        </div>
        <h2
          id="match-title"
          className="text-[48px] font-serif italic text-rose leading-none tracking-[-2px]"
        >
          It’s a match!
        </h2>
        <p id="match-description" className="mt-5 text-xs leading-6 text-muted">
          You and {match.name} liked each other.
          <br />
          Looks like the curiosity goes both ways.
        </p>
        <p className="flex justify-center items-center gap-1.5 text-[9px] text-[#aa8f8b] mt-5 mb-7">
          <ShieldCheck size={13} /> Only revealed because it’s mutual
        </p>
        <button autoFocus className="primary-button w-full" onClick={onClose}>
          Keep discovering <ArrowUpRight size={15} />
        </button>
        <button
          className="text-[11px] text-[#9c7c79] mt-3 py-3 px-4 rounded-md"
          onClick={onMatches}
        >
          See your matches
        </button>
      </div>
    </dialog>
  );
}
