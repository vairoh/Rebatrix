/*  /pages/cookies.tsx  */
import { Helmet } from "react-helmet";

export default function Cookies() {
  return (
    <main className="container mx-auto p-6 max-w-3xl text-black">
      <Helmet>
        <title>Cookie Policy | Rebatrix Beta B2B Battery Marketplace</title>
        <meta
          name="description"
          content="See which cookies Rebatrix Beta uses (session & analytics) and how you can manage or delete them in your browser."
        />
        <link rel="canonical" href="https://www.rebatrix.com/cookies" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.rebatrix.com/cookies" />
        <meta property="og:title" content="Cookie Policy | Rebatrix Beta" />
        <meta
          property="og:description"
          content="Details on essential and analytics cookies used by Rebatrix Beta."
        />
        <meta property="og:image" content="/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cookie Policy | Rebatrix" />
        <meta
          name="twitter:description"
          content="Understand how cookies work on the Rebatrix platform."
        />
        <meta name="twitter:image" content="/logo.png" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>

      <h2 className="text-xl font-semibold mb-2">Essential cookies</h2>
      <p className="mb-4">
        We use one session cookie (“rebatrix_session”) to maintain your login. It
        expires when you close your browser.
      </p>

      <h2 className="text-xl font-semibold mb-2">Analytics cookies</h2>
      <p className="mb-4">
        Analytics cookies are loaded only after you click “Accept all” in the cookie
        banner.
      </p>

      <h2 className="text-xl font-semibold mb-2">Managing cookies</h2>
      <p>You can delete cookies anytime in your browser settings.</p>
    </main>
  );
}
