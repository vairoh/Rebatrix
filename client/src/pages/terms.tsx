/*  /pages/terms.tsx  */
import { Helmet } from "react-helmet";

export default function Terms() {
  return (
    <main className="container mx-auto p-6 max-w-3xl text-black">
      <Helmet>
        <title>Beta Terms of Service | Rebatrix B2B Battery Marketplace</title>
        <meta
          name="description"
          content="Read the beta Terms of Service for Rebatrix, Europe’s B2B marketplace for battery-energy-storage systems. No real-money transactions yet."
        />
        <link rel="canonical" href="https://www.rebatrix.com/terms" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.rebatrix.com/terms" />
        <meta property="og:title" content="Terms of Service | Rebatrix Beta" />
        <meta
          property="og:description"
          content="Legal terms governing the use of the Rebatrix Beta marketplace platform."
        />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms of Service | Rebatrix" />
        <meta
          name="twitter:description"
          content="Official beta Terms for using Rebatrix."
        />
        <meta name="twitter:image" content="/logo.png" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Beta Terms of Service</h1>

      <p className="mb-4 italic">
        This platform is provided “as-is” for evaluation purposes only. Commercial
        transactions are not yet supported.
      </p>

      <h2 className="text-xl font-semibold mb-2">1. Scope</h2>
      <p className="mb-4">
        By accessing Rebatrix Beta you accept these Terms.
      </p>

      <h2 className="text-xl font-semibold mb-2">2. Use of the Service</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>No real-money transactions or legally binding offers.</li>
        <li>Do not upload unlawful, infringing or personal data of others.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">3. Liability</h2>
      <p className="mb-4">
        We are liable only for intent and gross negligence. Data loss and downtime
        may occur.
      </p>

      <h2 className="text-xl font-semibold mb-2">4. Governing Law</h2>
      <p>
        German law applies. Place of jurisdiction is Munich, Germany.
      </p>
    </main>
  );
}
