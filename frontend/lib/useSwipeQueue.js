'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getFeed, getMatches, sendSwipe } from './api';

export default function useSwipeQueue({
  profiles,
  setProfiles,
  setMatches,
  onMatch,
  setNotice,
  canSwipe,
}) {
  const [animating, setAnimating] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [direction, setDirection] = useState('like');
  const [error, setError] = useState('');
  const [failedSwipe, setFailedSwipe] = useState(null);
  const queue = useRef([]);
  const processing = useRef(false);
  const recovery = useRef(false);
  const animation = useRef(null);

  const finishAnimation = useCallback(() => {
    const current = animation.current;
    animation.current = null;
    setAnimating(false);
    current?.resolve();
  }, []);

  useEffect(() => () => animation.current?.resolve(), []);

  const hasPending = useCallback(
    () => queue.current.length > 0 || recovery.current || animation.current !== null,
    [],
  );

  function restore(jobs) {
    setDirection('restore');
    setProfiles((current) => {
      const restoredIds = new Set(jobs.map((job) => job.profile.id));
      return [
        ...jobs.map((job) => job.profile),
        ...current.filter((profile) => !restoredIds.has(profile.id)),
      ];
    });
  }

  async function drain() {
    if (processing.current) return;
    processing.current = true;
    try {
      while (queue.current.length) {
        const job = queue.current[0];
        try {
          const result = await sendSwipe(job.profile.id, job.action);
          queue.current.shift();
          setPendingCount(queue.current.length);
          if (result.matched) {
            setMatches((current) => [
              result.match,
              ...current.filter((profile) => profile.id !== result.match.id),
            ]);
            onMatch(result.match);
          } else {
            setNotice(job.action === 'like' ? 'Like saved.' : 'Passed.');
          }
        } catch (failure) {
          recovery.current = true;
          setRecovering(true);
          // Let the current card leave before returning unsaved cards.
          await animation.current?.done;
          const unsaved = queue.current.splice(0);
          setPendingCount(0);

          if (failure.status === 409) {
            try {
              const [feed, matches] = await Promise.all([getFeed(), getMatches()]);
              setDirection('restore');
              setProfiles(feed);
              setMatches(matches);
              setNotice('Your feed is up to date.');
              if (unsaved.length > 1) setError('Your other unsaved choices have been restored.');
            } catch {
              restore(unsaved.slice(1));
              setError('That choice was already saved. Refresh to sync your feed.');
            }
          } else {
            restore(unsaved);
            setFailedSwipe(unsaved[0]);
            const restored =
              unsaved.length === 1
                ? 'Your card is back.'
                : 'Your last ' + unsaved.length + ' unsaved cards are back.';
            setError(failure.message + ' ' + restored);
          }
          recovery.current = false;
          setRecovering(false);
          break;
        }
      }
    } finally {
      processing.current = false;
    }
  }

  function decide(action) {
    const profile = profiles[0];
    if (
      !profile ||
      !canSwipe() ||
      animation.current ||
      recovery.current ||
      queue.current.some((job) => job.profile.id === profile.id)
    )
      return false;

    let resolve;
    const done = new Promise((finish) => {
      resolve = finish;
    });
    animation.current = { done, resolve };
    setAnimating(true);
    setDirection(action);
    setError('');
    setFailedSwipe(null);
    queue.current.push({ profile, action });
    setPendingCount(queue.current.length);
    setProfiles((current) => current.filter((item) => item.id !== profile.id));
    void drain();
    return true;
  }

  function retry() {
    if (failedSwipe?.profile.id === profiles[0]?.id) decide(failedSwipe.action);
  }

  const clearError = useCallback(() => {
    setError('');
    setFailedSwipe(null);
  }, []);

  return {
    decide,
    retry,
    clearError,
    hasPending,
    finishAnimation,
    animating,
    recovering,
    pendingCount,
    direction,
    error,
    failedSwipe,
  };
}
