/*  /pages/imprint.tsx  */
import { Helmet } from "react-helmet";

export default function ImprintPage() {
  const year = new Date().getFullYear();

  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl text-black">
      {/* ---------- SEO / social tags ---------- */}
      <Helmet>
        <title>Imprint (“Impressum”) | Rebatrix Beta B2B Battery Marketplace</title>

        <meta
          name="description"
          content="Legal disclosure (Impressum) for Rebatrix – the European B2B marketplace to buy, sell or rent battery-energy-storage systems. Responsible publisher & contact."
        />

        {/* Canonical */}
        <link rel="canonical" href="https://www.rebatrix.com/imprint" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.rebatrix.com/imprint" />
        <meta
          property="og:title"
          content="Imprint | Rebatrix – B2B Battery-Energy-Storage Marketplace"
        />
        <meta
          property="og:description"
          content="Official legal disclosure for Rebatrix Beta, including publisher details and disclaimer."
        />
        <meta property="og:image" content="/logo.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Imprint | Rebatrix" />
        <meta
          name="twitter:description"
          content="Legal disclosure (Impressum) for Rebatrix Beta."
        />
        <meta name="twitter:image" content="/logo.png" />

        {/* JSON-LD – organization schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Rebatrix (Beta Project)",
            url: "https://www.rebatrix.com",
            logo: "https://www.rebatrix.com/logo.png",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Perlacher Str. 122C",
              postalCode: "81539",
              addressLocality: "Munich",
              addressCountry: "DE",
            },
            contactPoint: {
              "@type": "ContactPoint",
              email: "vaibhavghildiyal1990@gmail.com",
              contactType: "customer support",
            },
          })}
        </script>
      </Helmet>

      {/* ---------- page body ---------- */}
      <h1 className="text-3xl font-bold mb-6">Imprint (Impressum)</h1>

      <p className="mb-4">According to § 5 TMG (German Telemedia Act):</p>

      <section className="mb-6">
        <p className="font-semibold">Responsible for the content:</p>
        <p>Vaibhav Ghildiyal</p>
        <p>Perlacher Str. 122C</p>
        <p>81539 Munich, Germany</p>
        <p>
          Email:&nbsp;
          <a
            href="mailto:vaibhavghildiyal1990@gmail.com"
            className="underline"
          >
            vaibhavghildiyal1990@gmail.com
          </a>
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Disclaimer</h2>
        <p className="mb-2">
          This platform is a <strong>non-commercial beta project</strong> for
          testing and evaluation only. It does not yet operate as a registered
          business.
        </p>
        <p className="mb-2">
          All content is provided without guarantee of completeness,
          correctness, or timeliness.
        </p>
        <p>
          The operator assumes no liability for external links; responsibility
          lies solely with their providers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Copyright</h2>
        <p>© {year} Vaibhav Ghildiyal. All rights reserved.</p>
      </section>
    </main>
  );
}
