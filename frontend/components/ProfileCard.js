'use client';
import { motion, useMotionValue, useTransform, useReducedMotion, animate } from 'framer-motion';
import { MapPin } from 'lucide-react';
import Portrait from './Portrait';

export default function ProfileCard({ profile, busy, onDecision, direction }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-10, 0, 10]);
  const likeOpacity = useTransform(x, [15, 110], [0, 1]);
  const passOpacity = useTransform(x, [-110, -15], [1, 0]);
  return (
    <motion.article
      className="profile-card"
      data-testid="profile-card"
      aria-label={`${profile.name}, ${profile.age}`}
      style={{ x, rotate: reduced ? 0 : rotate }}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        x: reduced ? 0 : direction === 'like' ? 480 : -480,
        opacity: 0,
        rotate: reduced ? 0 : direction === 'like' ? 14 : -14,
      }}
      transition={{ duration: reduced ? 0 : 0.24 }}
      drag={busy ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      dragMomentum={false}
      onDragEnd={(_event, info) => {
        if (
          !busy &&
          Math.abs(info.offset.x) >= 85 &&
          Math.abs(info.offset.x) > Math.abs(info.offset.y)
        )
          onDecision(info.offset.x > 0 ? 'like' : 'pass');
        animate(x, 0, { duration: reduced ? 0 : 0.18 });
      }}
    >
      <Portrait profile={profile} priority className="profile-image" />
      <div className="profile-shade" />
      <div className="absolute top-5 left-5 rounded-md bg-[#fffcf5]/90 px-2.5 py-2 text-[7px] tracking-[.13em] font-semibold text-[#655b51] flex gap-1.5 items-center">
        <span className="size-1 rounded-full bg-[#b59d78]" /> OPEN TO A CONNECTION
      </div>
      <motion.div
        className="swipe-stamp left-6 text-[#dcffe2] -rotate-12"
        style={{ opacity: likeOpacity }}
        aria-hidden="true"
      >
        LIKE
      </motion.div>
      <motion.div
        className="swipe-stamp right-6 text-[#ffd2d8] rotate-12"
        style={{ opacity: passOpacity }}
        aria-hidden="true"
      >
        PASS
      </motion.div>
      <div className="absolute inset-x-6 bottom-6 text-white">
        <h2 className="text-[30px] font-semibold tracking-[-1px] leading-tight">
          {profile.name}
          <span className="font-normal">, {profile.age}</span>
        </h2>
        <div className="mt-2 flex items-center flex-wrap gap-1 text-[10px] text-white/85">
          <MapPin size={13} strokeWidth={1.6} />
          {profile.location}
          {profile.college && (
            <>
              <span className="mx-1">·</span>
              {profile.college}
            </>
          )}
        </div>
        <p className="mt-4 mb-4 text-[11px] leading-[1.85] max-w-75 text-white/90">{profile.bio}</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[9px]"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}
