/*  /pages/privacy.tsx  */
import { Helmet } from "react-helmet";

export default function Privacy() {
  return (
    <main className="container mx-auto p-6 max-w-3xl text-black">
      <Helmet>
        <title>Privacy Policy | Rebatrix Beta B2B Battery Marketplace</title>
        <meta
          name="description"
          content="Learn how Rebatrix Beta collects, uses and protects your personal data & cookies while you explore our B2B battery-energy-storage marketplace."
        />
        <link rel="canonical" href="https://www.rebatrix.com/privacy" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.rebatrix.com/privacy" />
        <meta property="og:title" content="Privacy Policy | Rebatrix Beta" />
        <meta
          property="og:description"
          content="Details of data protection practices for Rebatrix Beta, including GDPR information."
        />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Privacy Policy | Rebatrix" />
        <meta
          name="twitter:description"
          content="How we handle your personal data at Rebatrix Beta."
        />
        <meta name="twitter:image" content="/logo.png" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

      <p className="italic mb-4">
        Short beta-version notice: no production data processing; servers are
        located in the EU. Full GDPR-compliant policy will follow before
        commercial launch.
      </p>

      <h2 className="text-xl font-semibold mb-2">1. Data we process</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Email & password (hashed) for login</li>
        <li>Profile details you voluntarily add</li>
        <li>Usage analytics (only after cookie consent)</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">2. Why we process it</h2>
      <p className="mb-4">
        To let you sign in, list batteries, and improve the platform during the
        beta phase.
      </p>

      <h2 className="text-xl font-semibold mb-2">3. Your rights</h2>
      <p className="mb-4">
        You can request data access or deletion anytime at the email above.
      </p>

      <h2 className="text-xl font-semibold mb-2">4. Contact</h2>
      <p>
        Questions? Email{" "}
        <a
          href="mailto:vaibhavghildiyal1990@gmail.com"
          className="underline"
        >
          vaibhavghildiyal1990@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
