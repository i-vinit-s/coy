import { Compass, Heart, House, ArrowUpRight } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'matches', label: 'Matches', icon: Heart },
];

export default function Navigation({ tab, onChange, matchCount }) {
  return (
    <aside className="sidebar">
      <a href="/" className="brand hidden md:block" aria-label="Coy">
        coy<span>♥</span>
      </a>
      <p className="hidden md:block text-xs leading-6 text-muted mt-5 mb-12 px-4">
        A little curiosity.
        <br />A real connection.
      </p>
      <nav
        aria-label="Main navigation"
        className="flex md:flex-col justify-around md:justify-start gap-1.5"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={`nav-item ${tab === id ? 'active' : ''}`}
          >
            <Icon size={21} strokeWidth={1.7} />
            <span>{label}</span>
            {id === 'matches' && matchCount > 0 && (
              <span className="nav-count">
                {matchCount}
                <span className="sr-only"> mutual matches</span>
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="hidden md:block mt-auto rounded-xl bg-[#f6f0eb] p-5 mb-7">
        <Heart size={18} className="text-rose mb-4" strokeWidth={1.6} />
        <h2 className="text-xs font-semibold mb-2">Good things take two.</h2>
        <p className="text-[11px] leading-5 text-muted">
          Your likes stay between us until the feeling is mutual.
        </p>
        <p className="mt-4 text-[10px] text-rose flex gap-1 items-center">
          That’s the Coy promise <ArrowUpRight size={13} />
        </p>
      </div>
      <div className="hidden md:flex items-center gap-3 border-t border-line pt-5 px-1">
        <span className="avatar grid size-9">Y</span>
        <div>
          <p className="text-xs font-semibold">You</p>
          <p className="text-[10px] text-muted mt-1">Your next chapter awaits</p>
        </div>
        <span className="size-1.5 rounded-full bg-[#90a28a] ml-auto" />
      </div>
    </aside>
  );
}
