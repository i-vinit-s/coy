import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Heart, LoaderCircle, RefreshCw, X } from 'lucide-react';
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
    <section className="deck" aria-label="Discover profiles" aria-busy={loading || busy}>
      <div className="deck-caption">
        <span>Discover</span>
        <span>{!loading && !error && profiles.length + ' to discover'}</span>
      </div>
      {loading ? (
        <div className="state-panel">
          <LoaderCircle size={32} className="spinner" aria-hidden="true" />
          <h2>Loading profiles…</h2>
          <p>Just a moment.</p>
        </div>
      ) : error ? (
        <div className="state-panel">
          <span className="state-icon">
            <RefreshCw size={28} aria-hidden="true" />
          </span>
          <h2>Couldn’t load profiles.</h2>
          <p>{error}</p>
          <button className="btn btn-small" onClick={onRetry}>
            Try again <ArrowRight size={18} />
          </button>
        </div>
      ) : profile ? (
        <>
          <div className="card-stack">
            <div className="card-back" aria-hidden="true" />
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
          <div className="swipe-controls">
            <button
              className="btn btn-pass"
              aria-label={'Pass on ' + profile.name}
              onClick={() => onDecision('pass')}
              disabled={busy}
            >
              <X size={23} strokeWidth={2} />
              Pass
            </button>
            <button
              className="btn"
              aria-label={'Like ' + profile.name}
              onClick={() => onDecision('like')}
              disabled={busy}
            >
              <Heart size={22} fill="currentColor" />
              Like
            </button>
          </div>
          <p className="swipe-hint">
            {busy ? 'Saving your decision…' : 'Swipe left to pass. Right to like.'}
          </p>
        </>
      ) : (
        <div className="state-panel">
          <span className="state-icon">
            <Check size={30} aria-hidden="true" />
          </span>
          <h2>You’re all caught up.</h2>
          <p>You’ve seen every profile for now. Your connections are saved in Matches.</p>
          <button className="btn btn-small" onClick={onMatches}>
            See your matches <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
