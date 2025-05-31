const PrivacyPolicy = () => (
  <div className="min-h-screen text-white bg-primary-color flex flex-col items-center justify-center px-4">
    <div className="max-w-2xl w-full">
      <h1 className="text-4xl font-bold mb-4 text-center">Privacy Policy</h1>
      <p className="text-lg mb-4 text-center">
        Your privacy is important to us. This policy explains how we handle and protect your data.
      </p>
      <div className="bg-black/40 rounded-2xl p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-2">What Data We Collect</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Your SIS username and password (encrypted)</li>
          <li>Information about your timetable, grades, and absences</li>
          <li>Minimal device information for security</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-2">How We Use Your Data</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>To access and display your school information within the app</li>
          <li>To notify you about changes (e.g. grades, timetable updates)</li>
          <li>Never for advertising, selling, or sharing with third parties</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>You can request deletion of your account and all related data</li>
          <li>We never store your password in plaintext</li>
          <li>Contact us at <a href="mailto:info@demiffy.com" className="underline text-blue-300">info@demiffy.com</a> for privacy questions</li>
        </ul>
        <p className="text-sm text-center text-gray-400 mt-6">
          Last updated: 2025-05-31
        </p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
