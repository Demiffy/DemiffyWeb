import { ShieldCheck, Lock, User, Database, Mail, XCircle } from "lucide-react";

const sections = [
  {
    icon: <User className="w-6 h-6 text-primary" />,
    title: "What Data We Collect",
    items: [
      "Username and password (only for login; never stored in plain text)",
      "Session token (generated and encrypted after login)",
      "Timetable, grades, and absence data from your school’s SIS (temporarily cached, deleted after session expires)",
      "Basic technical info (IP address, device type) for security and rate-limiting"
    ]
  },
  {
    icon: <Lock className="w-6 h-6 text-primary" />,
    title: "How We Store Your Data",
    items: [
      "All sensitive information is fully encrypted using modern cryptography. No plain-text passwords are stored.",
      "Data is kept only as long as needed for functionality. Expired sessions are deleted automatically."
    ]
  },
  {
    icon: <Database className="w-6 h-6 text-primary" />,
    title: "How We Use Your Data",
    items: [
      "To log you in and display your timetable, grades, absences, and school announcements.",
      "To notify you of important updates and changes.",
      "For basic analytics and technical troubleshooting (e.g., app health status, error tracking)."
    ]
  },
  {
    icon: <XCircle className="w-6 h-6 text-primary" />,
    title: <span>What We Do <span className="underline">Not</span> Do</span>,
    items: [
      "We do not sell or share your personal information with third parties.",
      "We do not use your data for advertising or marketing.",
      "We do not store your passwords in a way that we or anyone else can read."
    ]
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: "Security",
    items: [
      "All sensitive operations are encrypted and protected. If you do not trust the app, you are encouraged not to use it.",
      "Users may exit at any time. The disclaimer is shown at first launch and can be reviewed in the app."
    ]
  },
  {
    icon: <Mail className="w-6 h-6 text-primary" />,
    title: "Contact",
    items: [
      "For privacy questions, contact the administrator via Demiffy.com."
    ]
  }
];

const KSBCPP = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#141414] to-[#212121] p-6">
    <div className="w-full max-w-3xl">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-black text-center mb-6 tracking-tight bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-base md:text-lg text-center text-white/90 mb-8">
          This Privacy Policy explains how Demiffy.com and the KybernaChecker app handle your data.
        </p>
        <div className="space-y-8">
          {sections.map(({ icon, title, items }, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 flex items-start pt-1">{icon}</div>
              <div>
                <h2 className="text-xl font-semibold mb-1">{title}</h2>
                <ul className="list-disc pl-6 space-y-1 text-base text-white/90">
                  {items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-gray-400 text-center">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>
      </div>
    </div>
  </div>
);

export default KSBCPP;
