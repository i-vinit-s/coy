import { AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  LoaderCircle,
  Sparkles,
  X,
} from 'lucide-react';
import ProfileCard from './ProfileCard';

export default function SwipeDeck({
  profiles,
  loading,
  busy,
  error,
  onDecision,
  onRetry,
  onMatches,
  direction,
}) {
  const profile = profiles[0];
  return (
    <section className="min-w-0" aria-label="Discover profiles" aria-busy={loading || busy}>
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="flex items-center gap-1.5 text-[8px] tracking-[.12em] text-[#8e7676] font-semibold">
          <Sparkles size={13} /> YOUR NEXT POSSIBILITY
        </span>
        <span className="text-[9px] text-muted">
          {!loading && !error && `${profiles.length} to discover`}
        </span>
      </div>
      {loading ? (
        <div className="deck-empty">
          <LoaderCircle size={28} className="animate-spin text-rose" />
          <h2>Finding possibilities…</h2>
          <p>Your next connection could be right here.</p>
        </div>
      ) : error ? (
        <div className="deck-empty">
          <span className="empty-symbol">
            <Sparkles size={28} />
          </span>
          <h2>A little pause.</h2>
          <p>{error}</p>
          <button className="primary-button mt-5" onClick={onRetry}>
            Try again <ArrowRight size={15} />
          </button>
        </div>
      ) : profile ? (
        <>
          <div className="relative mx-1.5">
            <div className="absolute inset-0 translate-y-2 rotate-2 rounded-[20px] bg-[#e9ded8]" />
            <AnimatePresence mode="wait">
              <ProfileCard
                key={profile.id}
                profile={profile}
                busy={busy}
                direction={direction}
                onDecision={onDecision}
              />
            </AnimatePresence>
          </div>
          <div className="flex justify-center items-center gap-6 mt-7">
            <button
              className="decision-button border border-[#e5dad5] bg-[#fffdfa] text-[#8b7c78]"
              aria-label={`Pass on ${profile.name}`}
              onClick={() => onDecision('pass')}
              disabled={busy}
            >
              <X size={28} strokeWidth={1.5} />
            </button>
            <span className="text-[10px] text-muted">
              {busy ? 'Saving your decision…' : 'Go with your feeling.'}
            </span>
            <button
              className="decision-button bg-rose text-white shadow-[0_5px_15px_#b6435525]"
              aria-label={`Like ${profile.name}`}
              onClick={() => onDecision('like')}
              disabled={busy}
            >
              <Heart size={26} fill="currentColor" strokeWidth={1.4} />
            </button>
          </div>
          <div className="mt-4 flex justify-center items-center gap-1.5 text-[9px] text-muted">
            <ArrowLeft size={11} /> Pass{' '}
            <span className="mx-2 text-[7px] tracking-[.15em] text-[#b0a39e]">SWIPE OR TAP</span>{' '}
            Like <ArrowRight size={11} />
          </div>
        </>
      ) : (
        <div className="deck-empty">
          <span className="empty-symbol">
            <Check size={29} />
          </span>
          <h2>You’re all caught up.</h2>
          <p>
            You’ve met every possibility for now.
            <br />
            Good connections are worth the wait.
          </p>
          <button onClick={onMatches} className="primary-button mt-5">
            See your matches <ArrowUpRight size={15} />
          </button>
        </div>
      )}
    </section>
  );
}
