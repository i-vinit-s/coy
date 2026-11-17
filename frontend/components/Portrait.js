'use client';
import { useState } from 'react';

export default function Portrait({ profile, className = '', priority = false }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        role="img"
        aria-label={`${profile.name}'s placeholder portrait`}
        className={`portrait-fallback ${className}`}
      >
        <span>{profile.name[0]}</span>
      </div>
    );
  return (
    <img
      src={profile.photoUrl}
      alt={`${profile.name}'s mock profile portrait`}
      className={className}
      draggable={false}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
    />
  );
}
