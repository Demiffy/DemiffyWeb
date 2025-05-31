const TermsOfService = () => (
  <div className="min-h-screen text-white bg-primary-color flex flex-col items-center justify-center px-4">
    <div className="max-w-2xl w-full">
      <h1 className="text-4xl font-bold mb-4 text-center">Terms of Service</h1>
      <p className="text-lg mb-4 text-center">
        By using this app, you agree to these terms.
      </p>
      <div className="bg-black/40 rounded-2xl p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-2">Usage</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>This app is provided as-is, with no guarantees of availability or accuracy.</li>
          <li>You are responsible for keeping your login credentials safe.</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-2">Data</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>We use your SIS credentials only to access your school information, never for any other purpose.</li>
          <li>Your data is encrypted and never sold or shared.</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-2">Liability</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>We are not responsible for issues resulting from the use or misuse of this app.</li>
        </ul>
        <p className="text-sm text-center text-gray-400 mt-6">
          Last updated: 2025-05-31
        </p>
      </div>
    </div>
  </div>
);

export default TermsOfService;
