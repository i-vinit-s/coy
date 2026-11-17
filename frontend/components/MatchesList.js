import { ArrowRight, Heart, MapPin } from 'lucide-react';
import Portrait from './Portrait';

export default function MatchesList({ matches, onDiscover }) {
  if (!matches.length)
    return (
      <section className="matches-empty state-panel">
        <span className="state-icon">
          <Heart size={30} aria-hidden="true" />
        </span>
        <h2>No matches yet.</h2>
        <p>When you and someone else both like each other, you’ll see them here.</p>
        <button className="btn btn-small" onClick={onDiscover}>
          Discover someone <ArrowRight size={18} />
        </button>
      </section>
    );

  return (
    <section className="matches-section" aria-label="Mutual matches">
      <p className="matches-count">
        {matches.length + (matches.length === 1 ? ' connection' : ' connections')}
      </p>
      <div className="matches-grid">
        {matches.map((profile) => (
          <article className="connection-card" key={profile.id}>
            <Portrait profile={profile} className="connection-photo" />
            <div className="connection-info">
              <div className="connection-name">
                <h2>
                  {profile.name}, {profile.age}
                </h2>
                <span className="connection-heart">
                  <Heart size={19} fill="currentColor" aria-hidden="true" />
                </span>
              </div>
              <p className="connection-location">
                <MapPin size={15} aria-hidden="true" />
                {profile.location}
              </p>
              <p className="connection-date">
                Matched{' '}
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
