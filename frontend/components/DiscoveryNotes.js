import { Compass, Heart, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: Compass,
    title: 'Look through profiles',
    text: 'See their interests, read their bio, and decide if you want to connect.',
    color: 'lilac',
  },
  {
    icon: Heart,
    title: 'Like or pass',
    text: 'Swipe right to like, left to pass. You can use the buttons too.',
    color: 'peach',
  },
  {
    icon: ShieldCheck,
    title: 'Match when it’s mutual',
    text: 'You’ll both see the connection only after you’ve liked each other.',
    color: 'pink',
  },
];

export default function DiscoveryNotes() {
  return (
    <section className="how-section" id="how" aria-labelledby="how-title">
      <h2 id="how-title">How discovery works</h2>
      <ol className="steps">
        {steps.map(({ icon: Icon, title, text, color }, index) => (
          <li className={'step step-' + color} key={title}>
            <div className="step-head">
              <span className="step-number">{index + 1}</span>
              <Icon size={27} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
