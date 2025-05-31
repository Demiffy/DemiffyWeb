import { FileText, ShieldAlert, CheckCircle2, ExternalLink, UserCheck, RefreshCcw, Info, Mail, ShieldBan } from "lucide-react";

const tosSections = [
  {
    icon: <CheckCircle2 className="w-6 h-6 text-primary" />,
    title: "Use of the Service",
    desc: "You may use the Service to check your school timetable, grades, absences, and related data. You are responsible for your own login credentials and their security."
  },
  {
    icon: <UserCheck className="w-6 h-6 text-primary" />,
    title: "Account Security",
    desc: "You are responsible for maintaining the confidentiality of your account. If you suspect unauthorized use, notify us immediately."
  },
  {
    icon: <ShieldAlert className="w-6 h-6 text-primary" />,
    title: "Data Handling",
    desc: "The Service does not store your login credentials in plain text. All tokens and sensitive data are fully encrypted and stored securely."
  },
  {
    icon: <Info className="w-6 h-6 text-primary" />,
    title: "No Guarantee of Uptime",
    desc: "We strive to keep the Service available but make no guarantees about uptime, data accuracy, or reliability. Use is at your own risk."
  },
  {
    icon: <ExternalLink className="w-6 h-6 text-primary" />,
    title: "Third-Party Systems",
    desc: "This Service interacts with external school systems (e.g., SIS). We are not responsible for their availability, accuracy, or content."
  },
  {
    icon: <ShieldBan className="w-6 h-6 text-primary" />,
    title: "Prohibited Uses",
    desc: "Do not attempt to misuse the Service, disrupt functionality, or attempt to gain unauthorized access to accounts or data."
  },
  {
    icon: <FileText className="w-6 h-6 text-primary" />,
    title: "Termination",
    desc: "We may restrict or terminate your access to the Service at any time, especially if misuse or abuse is detected (such as excessive requests, brute-forcing, etc.)."
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-primary" />,
    title: "Modifications",
    desc: "We may update these terms at any time. Continued use means you accept any changes."
  },
  {
    icon: <Mail className="w-6 h-6 text-primary" />,
    title: "Contact",
    desc: "If you have questions, contact the administrator via the Demiffy.com website."
  }
];

const KSBCTOS = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#141414] to-[#212121] p-6">
    <div className="w-full max-w-3xl">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl shadow-xl p-8">
        <h1 className="text-4xl font-black text-center mb-6 tracking-tight bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-base md:text-lg text-center text-white/90 mb-8">
          Welcome to Demiffy.com and the KybernaChecker app. By using this website and mobile application (collectively, the “Service”), you agree to the following terms:
        </p>
        <div className="space-y-8">
          {tosSections.map(({ icon, title, desc }, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 flex items-start pt-1">{icon}</div>
              <div>
                <h2 className="text-xl font-semibold mb-1">{title}</h2>
                <p className="text-base text-white/90">{desc}</p>
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

export default KSBCTOS;
