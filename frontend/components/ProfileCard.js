'use client';
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  useIsPresent,
  animate,
} from 'framer-motion';
import { MapPin } from 'lucide-react';
import Portrait from './Portrait';

export default function ProfileCard({ profile, busy, onDecision }) {
  const isPresent = useIsPresent();
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 2, 12]);
  const likeOpacity = useTransform(x, [15, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -15], [1, 0]);

  return (
    <motion.article
      className="profile-card"
      data-testid={isPresent ? 'profile-card' : 'exiting-profile-card'}
      aria-label={profile.name + ', ' + profile.age}
      aria-hidden={!isPresent}
      style={{
        x,
        rotate: reduced ? 0 : rotate,
        zIndex: isPresent ? 1 : 2,
        pointerEvents: isPresent ? 'auto' : 'none',
      }}
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      variants={{
        exit: (direction) => ({
          x: reduced || direction === 'restore' ? 0 : direction === 'like' ? 480 : -480,
          opacity: 0,
        }),
      }}
      exit="exit"
      transition={{ duration: reduced ? 0 : 0.24 }}
      drag={busy || !isPresent ? false : 'x'}
      dragMomentum={false}
      onDragEnd={(_event, info) => {
        if (
          !busy &&
          Math.abs(info.offset.x) >= 85 &&
          Math.abs(info.offset.x) > Math.abs(info.offset.y)
        ) {
          if (onDecision(info.offset.x > 0 ? 'like' : 'pass')) return;
        }
        animate(x, 0, { duration: reduced ? 0 : 0.18 });
      }}
    >
      <div className="profile-photo">
        <Portrait profile={profile} priority className="profile-image" />
        <motion.div
          className="swipe-stamp stamp-like"
          style={{ opacity: likeOpacity }}
          aria-hidden="true"
        >
          LIKE
        </motion.div>
        <motion.div
          className="swipe-stamp stamp-pass"
          style={{ opacity: passOpacity }}
          aria-hidden="true"
        >
          PASS
        </motion.div>
      </div>
      <div className="profile-details">
        <div className="profile-name-row">
          <h2>
            {profile.name}
            <span>, {profile.age}</span>
          </h2>
        </div>
        <p className="profile-location">
          <MapPin size={16} aria-hidden="true" />
          {profile.location}
          {profile.college && (
            <>
              <span>·</span>
              {profile.college}
            </>
          )}
        </p>
        <p className="profile-bio">{profile.bio}</p>
        <div className="interests">
          {profile.interests.map((interest) => (
            <span key={interest}>{interest}</span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
