'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LockKeyhole, RefreshCw, ArrowUpRight, Heart } from 'lucide-react';
import { getFeed, getMatches } from '../lib/api';
import useSwipeQueue from '../lib/useSwipeQueue';
import Navigation from '../components/Navigation';
import SwipeDeck from '../components/SwipeDeck';
import DiscoveryNotes from '../components/DiscoveryNotes';
import MatchesList from '../components/MatchesList';
import MatchModal from '../components/MatchModal';

export default function Page() {
  const [tab, setTab] = useState('discover');
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [match, setMatch] = useState(null);
  const [notice, setNotice] = useState('');
  const matchQueue = useRef([]);
  const loadVersion = useRef(0);

  const confirmMatch = useCallback((profile) => {
    matchQueue.current.push(profile);
    setMatch(matchQueue.current[0]);
  }, []);

  const {
    decide,
    retry,
    clearError,
    hasPending,
    finishAnimation,
    animating,
    recovering,
    pendingCount,
    direction,
    error: swipeError,
    failedSwipe,
  } = useSwipeQueue({
    profiles,
    setProfiles,
    setMatches,
    onMatch: confirmMatch,
    setNotice,
    canSwipe: () => !loading && !loadError && matchQueue.current.length === 0,
  });
  const busy = animating || recovering || !!match;

  const refresh = useCallback(async () => {
    if (hasPending()) return;
    const version = ++loadVersion.current;
    setLoading(true);
    setLoadError('');
    clearError();
    try {
      const [feed, mutual] = await Promise.all([getFeed(), getMatches()]);
      if (version !== loadVersion.current) return;
      setProfiles(feed);
      setMatches(mutual);
    } catch (error) {
      if (version === loadVersion.current) setLoadError(error.message);
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }, [hasPending, clearError]);

  useEffect(() => {
    refresh();
    return () => {
      loadVersion.current++;
    };
  }, [refresh]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  // Sync decisions from other tabs when returning to this one.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !hasPending() && !match) refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh, match, hasPending]);

  function dismissMatch() {
    matchQueue.current.shift();
    setMatch(matchQueue.current[0] || null);
  }

  function changeTab(next) {
    finishAnimation();
    setTab(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  const footer = (
    <footer className="site-footer">
      <div className="footer-inner">
        <img src="/coy-wordmark.svg" alt="Coy" width="64" height="24" />
        <p>Coy Discover</p>
        <a href="https://getcoy.com/" target="_blank" rel="noreferrer">
          About Coy <ArrowUpRight size={16} />
        </a>
      </div>
    </footer>
  );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navigation tab={tab} onChange={changeTab} matchCount={matches.length} />
      <main id="main-content" className="app-main" aria-label={tab === 'home' ? 'Home' : undefined}>
        {tab === 'discover' && (
          <>
            <section className="discovery-hero">
              <div className="hero-copy">
                <span className="sticker">
                  <LockKeyhole size={18} aria-hidden="true" />
                  Your likes stay private
                </span>
                <h1>
                  Find someone
                  <br />
                  you like.
                </h1>
                <p className="lede">
                  Swipe right to like. You’ll only find out when they like you too.
                </p>
                <a href="#how" className="hero-link">
                  How discovery works <ArrowUpRight size={18} />
                </a>
              </div>
              <div className="hero-deck">
                <SwipeDeck
                  profiles={profiles}
                  loading={loading}
                  busy={busy}
                  animating={animating}
                  pendingCount={pendingCount}
                  error={loadError}
                  onDecision={decide}
                  onRetry={refresh}
                  onMatches={() => changeTab('matches')}
                  direction={direction}
                  onExitComplete={finishAnimation}
                />
                {swipeError && (
                  <div role="alert" className="error-banner">
                    <p>{swipeError}</p>
                    <button
                      className="text-button"
                      onClick={failedSwipe ? retry : refresh}
                      disabled={busy}
                    >
                      <RefreshCw size={15} />
                      {failedSwipe ? 'Retry ' + failedSwipe.action : 'Refresh'}
                    </button>
                  </div>
                )}
              </div>
            </section>
            <section className="privacy-band" aria-label="Matching privacy">
              <div className="band-inner">
                <h2>Two likes. One match.</h2>
                <p>We don’t reveal one-sided likes. Ever.</p>
              </div>
            </section>
            <DiscoveryNotes />
            {footer}
          </>
        )}
        {tab === 'matches' && (
          <>
            <section className="matches-heading">
              <span className="sticker">
                <Heart size={18} aria-hidden="true" />
                Only mutual connections
              </span>
              <h1>Your matches.</h1>
              <p className="lede">You liked them. They liked you too.</p>
            </section>
            {loading ? (
              <div className="matches-empty state-panel" role="status">
                <RefreshCw className="spinner" size={30} />
                <h2>Loading matches…</h2>
              </div>
            ) : loadError ? (
              <div className="matches-empty state-panel">
                <h2>Couldn’t load matches.</h2>
                <p>{loadError}</p>
                <button className="btn btn-small" onClick={refresh}>
                  Try again
                </button>
              </div>
            ) : (
              <MatchesList matches={matches} onDiscover={() => changeTab('discover')} />
            )}
            {footer}
          </>
        )}
      </main>
      <p className="sr-only" role="status" aria-live="polite">
        {notice}
      </p>
      {notice && (
        <div className="toast" aria-hidden="true">
          {notice}
        </div>
      )}
      <MatchModal
        match={animating ? null : match}
        onClose={dismissMatch}
        onMatches={() => {
          dismissMatch();
          changeTab('matches');
        }}
      />
    </div>
  );
}
