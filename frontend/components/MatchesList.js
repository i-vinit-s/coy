import { ArrowUpRight, Heart, MapPin } from 'lucide-react';
import Portrait from './Portrait';

export default function MatchesList({ matches, onDiscover }) {
  if (!matches.length)
    return (
      <section className="flex min-h-120 items-center justify-center flex-col text-center">
        <span className="empty-symbol">
          <Heart size={28} />
        </span>
        <h2 className="text-[23px] tracking-tight mt-6">Something good is on its way.</h2>
        <p className="text-xs text-muted leading-6 mt-3">
          Your mutual connections will appear here.
          <br />
          Keep a little room for possibility.
        </p>
        <button className="primary-button mt-6" onClick={onDiscover}>
          Discover someone <ArrowUpRight size={15} />
        </button>
      </section>
    );
  return (
    <section className="min-h-142.5 mt-9" aria-label="Mutual matches">
      <div className="text-[9px] tracking-[.15em] text-muted mb-5 flex items-center gap-3">
        YOUR CONNECTIONS{' '}
        <span className="px-2 py-1 rounded-full bg-blush text-rose">{matches.length}</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {matches.map((profile) => (
          <article
            key={profile.id}
            className="overflow-hidden rounded-xl border border-line bg-[#fffdfa]"
          >
            <Portrait
              profile={profile}
              className="h-47.5 md:h-57.5 w-full object-cover object-[center_28%]"
            />
            <div className="p-4">
              <h2 className="font-medium text-base flex gap-2 justify-between items-center">
                {profile.name}, {profile.age}
                <Heart size={14} fill="currentColor" className="text-rose shrink-0" />
              </h2>
              <p className="mt-2 text-[10px] text-muted flex items-center gap-1">
                <MapPin size={12} />
                {profile.location}
              </p>
              <p className="text-[9px] text-[#ad8d8c] mt-3">
                Connected{' '}
                {new Date(profile.matchedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
