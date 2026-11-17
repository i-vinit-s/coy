import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Heart, LoaderCircle, RefreshCw, X } from 'lucide-react';
import ProfileCard from './ProfileCard';

export default function SwipeDeck({
  profiles,
  loading,
  busy,
  animating,
  pendingCount = 0,
  error,
  onDecision,
  onRetry,
  onMatches,
  direction,
  onExitComplete,
}) {
  const profile = profiles[0];
  useEffect(() => {
    for (const next of profiles.slice(1, 3)) {
      const image = new Image();
      image.src = next.photoUrl;
    }
  }, [profiles]);

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
      ) : profile || animating ? (
        <>
          <div className="card-stack">
            <div className="card-back" aria-hidden="true" />
            <AnimatePresence custom={direction} onExitComplete={onExitComplete} initial={false}>
              {profile && (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  busy={busy}
                  onDecision={onDecision}
                />
              )}
            </AnimatePresence>
          </div>
          <div className="swipe-controls">
            <button
              className="btn btn-pass"
              aria-label={profile ? 'Pass on ' + profile.name : 'Pass'}
              onClick={() => onDecision('pass')}
              disabled={busy || !profile}
            >
              <X size={23} strokeWidth={2} />
              Pass
            </button>
            <button
              className="btn"
              aria-label={profile ? 'Like ' + profile.name : 'Like'}
              onClick={() => onDecision('like')}
              disabled={busy || !profile}
            >
              <Heart size={22} fill="currentColor" />
              Like
            </button>
          </div>
          <p className="swipe-hint">
            {pendingCount
              ? 'Saving ' + pendingCount + (pendingCount === 1 ? ' choice…' : ' choices…')
              : 'Swipe left to pass. Right to like.'}
          </p>
        </>
      ) : pendingCount ? (
        <div className="state-panel" role="status">
          <LoaderCircle size={32} className="spinner" aria-hidden="true" />
          <h2>Saving your last choice…</h2>
          <p>Your matches will update once it’s confirmed.</p>
        </div>
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
