import { Compass, Heart, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: Compass,
    title: 'Find your kind of person',
    text: 'Discover a face, a story, a shared little thing.',
  },
  {
    icon: Heart,
    title: 'Let your curiosity lead',
    text: 'Like someone? Swipe right. No pressure, ever.',
  },
  {
    icon: ShieldCheck,
    title: 'Two yeses. One beginning.',
    text: 'You’ll only know when you both feel it.',
  },
];
export default function DiscoveryNotes() {
  return (
    <aside className="hidden xl:block pt-10 max-w-67.5">
      <p className="text-[8px] tracking-[.18em] text-[#ab9690]">01 / A LITTLE HELLO</p>
      <h2 className="text-[28px] leading-[1.4] tracking-[-1px] font-medium mt-4 mb-3">
        Big connections.
        <br />
        Small beginnings<span className="text-rose">.</span>
      </h2>
      <p className="text-[11px] leading-5 text-muted max-w-58.75">
        Sometimes all it takes is a face that makes you pause.
      </p>
      <div
        aria-hidden="true"
        className="font-serif text-[85px] leading-none text-[#c1858a] -rotate-12 ml-4 my-5"
      >
        ♡
      </div>
      <div className="space-y-6">
        {steps.map(({ icon: Icon, title, text }) => (
          <div className="flex gap-3" key={title}>
            <span className="size-8 shrink-0 grid place-items-center bg-[#f3e9e4] rounded-lg text-[#ac7d7c]">
              <Icon size={16} strokeWidth={1.6} />
            </span>
            <div>
              <h3 className="text-[11px] font-semibold mb-1.5">{title}</h3>
              <p className="text-[10px] leading-4 text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-line mt-7 pt-5 text-[#a58a86]">
        <ShieldCheck size={15} className="shrink-0 mt-0.5" />
        <p className="text-[9px] leading-5">
          No public likes. No awkward reveals.
          <br />
          <span className="text-[#88716e]">Just a connection, when it’s mutual.</span>
        </p>
      </div>
    </aside>
  );
}
