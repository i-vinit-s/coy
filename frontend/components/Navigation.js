import { Heart } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'discover', label: 'Discover' },
  { id: 'matches', label: 'Matches' },
];

export default function Navigation({ tab, onChange, matchCount }) {
  return (
    <header className="site-header">
      <a href="/" className="logo" aria-label="Coy">
        <img src="/coy-wordmark.svg" alt="" width="76" height="28" />
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={tab === id ? 'btn btn-small' : 'nav-link'}
          >
            {id === 'matches' && <Heart size={17} aria-hidden="true" />}
            {label}
            {id === 'matches' && matchCount > 0 && (
              <span className="nav-count">
                {matchCount}
                <span className="sr-only"> mutual matches</span>
              </span>
            )}
          </button>
        ))}
      </nav>
    </header>
  );
}
