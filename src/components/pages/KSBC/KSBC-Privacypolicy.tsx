import React from "react";
import { ShieldCheck, Lock, User, Database, Mail, XCircle } from "lucide-react";
import { motion } from "framer-motion";

type Section = {
  icon: React.ReactNode;
  title: React.ReactNode;
  items: string[];
  iconColor?: string;
};

const sections: Section[] = [
  {
    icon: <User className="w-9 h-9 text-blue-400" />,
    title: "What Data We Collect",
    items: [
      "Username and password (only for login; never stored in plain text)",
      "Session token (generated and encrypted after login)",
      "Timetable, grades, and absence data from your school's SIS (temporarily cached, deleted after session expires)",
      "Basic technical info (IP address, device type) for security and rate-limiting",
    ],
  },
  {
    icon: <Lock className="w-9 h-9 text-emerald-400" />,
    title: "How We Store Your Data",
    items: [
      "All sensitive information is fully encrypted using modern cryptography. No plain-text passwords are stored.",
      "Data is kept only as long as needed for functionality. Expired sessions are deleted automatically.",
    ],
  },
  {
    icon: <Database className="w-9 h-9 text-yellow-400" />,
    title: "How We Use Your Data",
    items: [
      "To log you in and display your timetable, grades, absences, and school announcements.",
      "To notify you of important updates and changes.",
      "For basic analytics and technical troubleshooting (e.g., app health status, error tracking).",
    ],
  },
  {
    icon: <XCircle className="w-9 h-9 text-rose-400" />,
    title: (
      <span>
        What We Do <span className="underline">Not</span> Do
      </span>
    ),
    items: [
      "We do not sell or share your personal information with third parties.",
      "We do not use your data for advertising or marketing.",
      "We do not store your passwords in a way that we or anyone else can read.",
    ],
  },
  {
    icon: <ShieldCheck className="w-9 h-9 text-sky-400" />,
    title: "Security",
    items: [
      "All sensitive operations are encrypted and protected. If you do not trust the app, you are encouraged not to use it.",
      "Users may exit at any time. The disclaimer is shown at first launch and can be reviewed in the app.",
    ],
  },
  {
    icon: <Mail className="w-9 h-9 text-orange-400" />,
    title: "Contact",
    items: [
      "For privacy questions, contact the administrator via Demiffy.com.",
    ],
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

const KSBCPP: React.FC = () => (
  <div className="min-h-screen w-full bg-gradient-to-br from-[#141312] to-[#0D0C0B] py-12">
    <div className="w-full max-w-[90rem] mx-auto px-8">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-6xl font-black text-center mb-4 tracking-tight bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent"
      >
        Privacy Policy
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-lg md:text-2xl text-center text-white/85 mb-12 max-w-3xl mx-auto"
      >
        This Privacy Policy explains how Demiffy.com and the KybernaChecker app handle your data.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-16">
        {sections.map(({ icon, title, items }, i: number) => (
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
              <ul className="list-disc pl-6 space-y-1 text-base md:text-lg text-white/90">
                {items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
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

export default KSBCPP;
