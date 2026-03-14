'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { platformRoutes } from '@/shared/utils/routes';

const links = [
  { href: platformRoutes.home, label: 'Homepage' },
  { href: platformRoutes.q4trader, label: 'Q4Trader' },
  { href: platformRoutes.quantlab, label: 'QuantLab' }
];

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <header className="site-nav">
      <div className="site-shell site-nav__inner">
        <Link className="site-nav__brand" href={platformRoutes.home}>
          <span className="site-nav__mark">Q</span>
          <span>Research Platforms</span>
        </Link>
        <nav className="site-nav__links" aria-label="Platform navigation">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                className="site-nav__link"
                data-active={isActive}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
