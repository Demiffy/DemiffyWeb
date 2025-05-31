// KSBC-TOS.tsx
import React from "react";
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  RefreshCcw,
  Info,
  Mail,
  ShieldBan,
} from "lucide-react";
import { motion } from "framer-motion";

type TosSection = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

const tosSections: TosSection[] = [
  {
    icon: <CheckCircle2 className="w-9 h-9 text-blue-400" />,
    title: "Use of the Service",
    desc: "You may use the Service to check your school timetable, grades, absences, and related data. You are responsible for your own login credentials and their security.",
  },
  {
    icon: <UserCheck className="w-9 h-9 text-emerald-400" />,
    title: "Account Security",
    desc: "You are responsible for maintaining the confidentiality of your account. If you suspect unauthorized use, notify us immediately.",
  },
  {
    icon: <ShieldAlert className="w-9 h-9 text-yellow-400" />,
    title: "Data Handling",
    desc: "The Service does not store your login credentials in plain text. All tokens and sensitive data are fully encrypted and stored securely.",
  },
  {
    icon: <Info className="w-9 h-9 text-sky-400" />,
    title: "No Guarantee of Uptime",
    desc: "We strive to keep the Service available but make no guarantees about uptime, data accuracy, or reliability. Use is at your own risk.",
  },
  {
    icon: <ExternalLink className="w-9 h-9 text-indigo-400" />,
    title: "Third-Party Systems",
    desc: "This Service interacts with external school system SIS Kyberna. We are not responsible for their availability, accuracy, or content.",
  },
  {
    icon: <ShieldBan className="w-9 h-9 text-rose-400" />,
    title: "Prohibited Uses",
    desc: "Do not attempt to misuse the Service, disrupt functionality, or attempt to gain unauthorized access to accounts or data.",
  },
  {
    icon: <FileText className="w-9 h-9 text-purple-400" />,
    title: "Termination",
    desc: "We may restrict or terminate your access to the Service at any time, especially if misuse or abuse is detected (such as excessive requests, brute-forcing, etc.).",
  },
  {
    icon: <RefreshCcw className="w-9 h-9 text-cyan-400" />,
    title: "Modifications",
    desc: "We may update these terms at any time. Continued use means you accept any changes.",
  },
  {
    icon: <Mail className="w-9 h-9 text-orange-400" />,
    title: "Contact",
    desc: "If you have questions, contact the administrator via the Demiffy.com website.",
  },
];

const sectionAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
};

const KSBCTOS: React.FC = () => (
  <div className="min-h-screen w-full bg-gradient-to-br from-[#141312] to-[#0D0C0B] py-12">
    <div className="w-full max-w-[90rem] mx-auto px-8">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-6xl font-black text-center mb-4 tracking-tight bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent"
      >
        Terms of Service
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-lg md:text-2xl text-center text-white/85 mb-12 max-w-3xl mx-auto"
      >
        Welcome to Demiffy.com and the KybernaChecker app. By using this website and mobile application (collectively, the “Service”), you agree to the following terms:
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-16">
        {tosSections.map(({ icon, title, desc }, i: number) => (
          <motion.div
            key={i}
            variants={sectionAnim}
            initial="hidden"
            animate="visible"
            custom={i}
            className="flex items-start gap-5"
          >
            <div className="flex-shrink-0 mt-1">{icon}</div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-accent-color leading-tight">{title}</h2>
              <p className="text-base md:text-lg text-white/90">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="mt-16 text-sm text-gray-400 text-center">
        Last updated: {new Date().toLocaleDateString("cs-CZ")}
      </p>
    </div>
  </div>
);

export default KSBCTOS;
