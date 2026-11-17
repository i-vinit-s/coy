'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { getFeed, getMatches, sendSwipe } from '../lib/api';
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
  const [swipeError, setSwipeError] = useState('');
  const [busy, setBusy] = useState(false);
  const [direction, setDirection] = useState('like');
  const [match, setMatch] = useState(null);
  const [notice, setNotice] = useState('');
  const locked = useRef(false);
  const loadVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true);
    setLoadError('');
    setSwipeError('');
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
  }, []);

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
      if (document.visibilityState === 'visible' && !locked.current && !match) refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh, match]);

  async function decide(action) {
    const profile = profiles[0];
    if (!profile || locked.current || loading || match || loadError) return;
    locked.current = true;
    setBusy(true);
    setSwipeError('');
    setDirection(action);
    try {
      const result = await sendSwipe(profile.id, action);
      setProfiles((current) => current.filter((p) => p.id !== profile.id));
      if (result.matched) {
        setMatches((current) => [result.match, ...current.filter((p) => p.id !== result.match.id)]);
        setMatch(result.match);
      } else
        setNotice(
          action === 'like'
            ? 'Like sent. Your secret is safe.'
            : 'Passed. On to a new possibility.',
        );
      // Keep controls locked until the card's exit animation finishes.
      await new Promise((resolve) => setTimeout(resolve, 260));
    } catch (error) {
      if (error.status === 409) {
        await refresh();
        setNotice('Your latest decisions are up to date.');
      } else setSwipeError(error.message);
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-paper">
      <Navigation tab={tab} onChange={setTab} matchCount={matches.length} />
      <div className="md:ml-[236px] pb-[78px] md:pb-0">
        <header className="h-[68px] md:h-[82px] border-b border-line px-6 md:px-11 flex gap-6 items-center">
          <a href="/" aria-label="Coy" className="brand brand-mobile md:hidden">
            coy<span>♥</span>
          </a>
          <span className="hidden md:block text-[9px] tracking-[.2em] text-muted">
            YOUR NEXT CHAPTER
          </span>
          <div className="ml-auto flex items-center gap-1.5 text-[9px] md:text-[11px] text-muted">
            <ShieldCheck size={14} className="text-[#aa8584]" /> Private until it’s mutual
          </div>
          <span className="avatar size-8 hidden md:grid text-[11px]">Y</span>
        </header>
        <main className="main-content" aria-label={tab === 'home' ? 'Home' : undefined}>
          {tab !== 'home' && (
            <>
              <section className="mb-8 md:mb-9">
                <p className="eyebrow">
                  <span className="size-1 rounded-full bg-rose" /> MADE FOR A LITTLE SERENDIPITY
                </p>
                <h1 className="text-[28px] md:text-[35px] tracking-[-1.4px] leading-tight font-medium mt-3 mb-3">
                  {tab === 'discover' ? 'Meet someone. Feel something' : 'The feeling is mutual'}
                  <span className="text-rose">.</span>
                </h1>
                <p className="text-[11px] md:text-xs text-muted leading-5">
                  {tab === 'discover'
                    ? 'A new face. A shared interest. Maybe a little spark.'
                    : 'A little courage brought you both here. See who you connected with.'}
                </p>
              </section>
              {swipeError && (
                <div role="alert" className="error-banner mb-6">
                  <p>{swipeError} Your card is still here.</p>
                  <button
                    className="flex shrink-0 gap-1 items-center underline"
                    onClick={refresh}
                    disabled={busy}
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
              )}
              {tab === 'discover' ? (
                <div className="discovery-layout">
                  <SwipeDeck
                    profiles={profiles}
                    loading={loading}
                    busy={busy || !!match}
                    error={loadError}
                    onDecision={decide}
                    onRetry={refresh}
                    onMatches={() => setTab('matches')}
                    direction={direction}
                  />
                  <DiscoveryNotes />
                </div>
              ) : loading || loadError ? (
                <div className="max-w-[390px] mx-auto">
                  <SwipeDeck
                    profiles={[]}
                    loading={loading}
                    busy={false}
                    error={loadError}
                    onRetry={refresh}
                  />
                </div>
              ) : (
                <MatchesList matches={matches} onDiscover={() => setTab('discover')} />
              )}
              <footer className="mt-8 border-t border-line py-5 flex justify-between text-[9px] text-[#ab9f99]">
                <span className="text-[7px] tracking-[.18em]">A LITTLE COURAGE. A LITTLE COY.</span>
                <span className="hidden sm:block">Thoughtful connections, always.</span>
              </footer>
            </>
          )}
        </main>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {notice}
      </div>
      {notice && (
        <div className="toast" aria-hidden="true">
          <ShieldCheck size={15} />
          {notice}
        </div>
      )}
      <MatchModal
        match={match}
        onClose={() => setMatch(null)}
        onMatches={() => {
          setMatch(null);
          setTab('matches');
        }}
      />
    </div>
  );
}
