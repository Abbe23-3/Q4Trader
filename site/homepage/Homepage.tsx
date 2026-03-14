import { PlatformCard } from '@/shared/ui/PlatformCard';
import { platformRoutes } from '@/shared/utils/routes';

export function Homepage() {
  return (
    <main className="homepage">
      <div className="site-shell">
        <section className="homepage__hero">
          <article className="homepage__intro">
            <p className="homepage__eyebrow">Unified Research Stack</p>
            <h1>One site, two professional research workspaces.</h1>
            <p className="homepage__lede">
              Q4Trader remains available as the live valuation workflow. QuantLab is added as a
              separate platform shell, ready for future quant engine and API work without disturbing
              the existing application.
            </p>
          </article>

          <aside className="homepage__panel">
            <p className="homepage__eyebrow">Architecture</p>
            <h2>Current deployment shape</h2>
            <ul className="homepage__checklist">
              <li>Next.js App Router with TypeScript</li>
              <li>Dedicated app boundaries under `apps/`</li>
              <li>Shared navigation and homepage under `site/` and `shared/`</li>
              <li>Vercel-compatible routing with no custom server required</li>
            </ul>
          </aside>
        </section>

        <section className="homepage__grid" aria-label="Platform switcher">
          <PlatformCard
            badge="Existing App"
            title="Q4Trader"
            description="The current report-driven valuation workflow, migrated into the new architecture and exposed on its own route."
            href={platformRoutes.q4trader}
            ctaLabel="Open Q4Trader"
            bullets={[
              'Preserves the current valuation logic and UI flow',
              'Lives under apps/q4trader/frontend and apps/q4trader/logic',
              'Accessible directly at /q4trader'
            ]}
          />
          <PlatformCard
            badge="New Module"
            title="QuantLab"
            description="A clean platform entry point for upcoming quantitative research features, with frontend, quant engine, and API boundaries created now."
            href={platformRoutes.quantlab}
            ctaLabel="Open QuantLab"
            bullets={[
              'Frontend route scaffolded at /quantlab',
              'Quant engine and API folders prepared for future work',
              'No models or analytics logic implemented yet'
            ]}
          />
        </section>
      </div>
    </main>
  );
}
