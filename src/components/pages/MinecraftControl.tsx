import { useState } from "react";
import { motion } from "framer-motion";
import { Power, Server, ShieldOff } from "lucide-react";

type StatusTone = "success" | "error";

const API_BASE = "https://mc.demiffy.com";
const AUTH_TOKEN = "Demi";

const actionCopy = {
  start: {
    title: "Start Server",
    description: "Send a command to wake up the server",
    icon: Power,
    accentClass: "from-emerald-500/60 to-green-400/40",
  },
  stop: {
    title: "Stop Server",
    description: "Shut down safely without losing progress",
    icon: ShieldOff,
    accentClass: "from-rose-500/60 to-orange-400/40",
  },
} as const;

const MinecraftControl = () => {
  const [pendingAction, setPendingAction] = useState<keyof typeof actionCopy | null>(null);
  const [status, setStatus] = useState<{ message: string; tone: StatusTone } | null>(null);

  const sendCommand = async (action: keyof typeof actionCopy) => {
    setPendingAction(action);
    setStatus(null);

    try {
      const response = await fetch(`${API_BASE}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });

      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");
      const body = isJson ? await response.json() : null;

      if (!response.ok) {
        const errorMessage =
          (body && (body.status || body.message)) ||
          `Unable to ${action} the server right now.`;
        throw new Error(errorMessage);
      }

      const successMessage = (body && (body.status || body.message)) || "Command sent.";
      setStatus({ message: successMessage, tone: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setStatus({ message, tone: "error" });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center gap-12 px-4 py-16 min-h-screen text-white">
      <section className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.22),transparent_25%)]"
          aria-hidden="true"
        />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg">
              <Server className="h-7 w-7 text-accent" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent/80">
                Minecraft
              </p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Server Control</h1>
              <p className="text-sm text-gray-300 sm:text-base">
                Only for faggots
              </p>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-gray-200">
            Protected
          </div>
        </motion.div>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-2">
          {(Object.keys(actionCopy) as Array<keyof typeof actionCopy>).map((actionKey) => {
            const action = actionCopy[actionKey];
            const Icon = action.icon;
            const isPending = pendingAction === actionKey;

            return (
              <button
                key={actionKey}
                type="button"
                onClick={() => sendCommand(actionKey)}
                disabled={isPending}
                className={[
                  "group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-lg transition",
                  "hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/60",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                ].join(" ")}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${action.accentClass} opacity-60 blur-2xl transition duration-300 group-hover:opacity-80`}
                  aria-hidden="true"
                />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-200">
                      {action.title}
                    </span>
                    <p className="text-sm text-gray-300">{action.description}</p>
                  </div>
                </div>
                <div className="relative mt-3 flex items-center justify-between text-sm font-semibold text-gray-100">
                  <span>{isPending ? "Working..." : "Tap to send command"}</span>
                  <span
                    className="rounded-full bg-black/30 px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase"
                    aria-hidden="true"
                  >
                    {actionKey}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="relative mt-8 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-300">
              Commands are sent to <span className="font-semibold text-white">{API_BASE}</span> with a
              built-in bearer token.
            </p>
            {pendingAction && (
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-gray-200">
                {pendingAction}...
              </div>
            )}
          </div>
          {status && (
            <div
              className={[
                "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold",
                status.tone === "success"
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                  : "border-rose-400/40 bg-rose-500/10 text-rose-100",
              ].join(" ")}
              role="status"
              aria-live="polite"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  status.tone === "success" ? "bg-emerald-400" : "bg-rose-400"
                }`}
              />
              {status.message}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default MinecraftControl;
