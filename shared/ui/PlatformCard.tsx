import Link from 'next/link';

type PlatformCardProps = {
  badge: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  bullets: string[];
};

export function PlatformCard({
  badge,
  title,
  description,
  href,
  ctaLabel,
  bullets
}: PlatformCardProps) {
  return (
    <article className="platform-card">
      <div className="platform-card__header">
        <div>
          <span className="platform-card__badge">{badge}</span>
          <h3>{title}</h3>
        </div>
      </div>
      <p className="platform-card__body">{description}</p>
      <ul className="platform-card__list">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <Link className="platform-card__cta" href={href}>
        {ctaLabel}
      </Link>
    </article>
  );
}
