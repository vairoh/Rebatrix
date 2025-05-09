export default function Privacy() {
  return (
    <main className="container mx-auto p-6 max-w-3xl text-black">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

      <p className="mb-4">
        Last update: ⚠️ {new Date().toISOString().substring(0,10)}
      </p>

      <h2 className="text-xl font-semibold mb-2">1. Controller</h2>
      <p className="mb-4">
        The controller within the meaning of the GDPR is the person named in the
        <a href="/imprint" className="underline mx-1">Imprint</a>.
      </p>

      <h2 className="text-xl font-semibold mb-2">2. Data we process</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Server log files (IP address, timestamp, user-agent).</li>
        <li>Form data you actively submit (e.g. sign-up, contact).</li>
        <li>⚠️ Analytics only if enabled after consent.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">3. Purpose & legal basis</h2>
      <p className="mb-4">
        We process data to provide and secure this beta service (Art. 6 (1) f GDPR).
      </p>

      <h2 className="text-xl font-semibold mb-2">4. Cookies & tracking</h2>
      <p className="mb-4">
        Only technically necessary cookies are set. Analytics cookies are set
        only after explicit opt-in (see <a href="/cookies" className="underline">Cookie Policy</a>).
      </p>

      <h2 className="text-xl font-semibold mb-2">5. Your rights</h2>
      <p className="mb-4">
        You have the right to access, rectify or erase your personal data and to
        lodge a complaint with a supervisory authority.
      </p>
    </main>
  );
}
