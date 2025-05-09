<!-- /pages/imprint.tsx -->
export default function ImprintPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl text-black">
      <h1 className="text-3xl font-bold mb-6">Imprint</h1>

      <p className="mb-4">
        According to § 5 TMG (German Telemedia Act):
      </p>

      <div className="mb-6">
        <p><strong>Responsible for the content of this website:</strong></p>
        <p>Vaibhav Ghildiyal</p>
        <p>Perlacher Str. 122C</p>
        <p>81539 Munich</p>
        <p>Germany</p>
        <p>Email: vaibhavghildiyal1990@gmail.com</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Disclaimer</h2>
        <p className="mb-2">
          This platform is a <strong>non-commercial beta project</strong> for testing and evaluation purposes only. It does not yet operate as a registered business.
        </p>
        <p className="mb-2">
          All content on this website is provided without guarantee of completeness, correctness, or timeliness.
        </p>
        <p className="mb-2">
          The operator assumes no liability for the content of external links. The responsibility for the content of linked pages lies solely with their operators.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Copyright</h2>
        <p>
          © {new Date().getFullYear()} Vaibhav Ghildiyal. All rights reserved.
        </p>
      </div>
    </div>
  );
}
