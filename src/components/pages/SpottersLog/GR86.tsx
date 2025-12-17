import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Bookmark, Car, Droplets, ExternalLink, Wrench, Zap } from "lucide-react";

const mods = [
  {
    name: "Result Japan Rear Wing",
    desc: "Subtle ducktail-style rear wing to finish the GR86 profile.",
    price: "$1,000",
    link: "https://www.86worx.com/result-japan-rear-wing.html",
    linkAlt: "https://myjapandirect.com/product/result-japan-rear-wing-for-toyota-gr86-zn8-subaru-brz-zd8-2022/",
    img: "https://www.86worx.com/media/catalog/product/cache/88bd6db9eb4c909e119a1ea69767524a/f/i/fivfvmbvqaee3np.jpg",
    icon: Zap,
    featured: true,
  },
  {
    name: "TRD Aero Stabilizing Cover",
    desc: "The GR Aero Stabilizing Cover fills the gap between rear glass and trunk to smooth airflow and improve spoiler aero.",
    price: "$300",
    link: "https://www.86worx.com/gr86-2022/exterior/trd-aero-stabilizing-cover.html",
    img: "https://www.86worx.com/media/catalog/product/cache/88bd6db9eb4c909e119a1ea69767524a/t/r/trd_gr86_aero_stabilizing_cover_thumb.jpg",
    icon: Droplets,
  },
  {
    name: "Axis Parts Fuel Cap Cover",
    desc: "Axis-Parts fuel cap cover; a small touch seen when fueling and a reminder for the correct gas type.",
    price: "$55",
    link: "https://www.86worx.com/gr86-2022/engine/axis-parts-fuel-cap-cover.html",
    img: "https://www.86worx.com/media/catalog/product/cache/88bd6db9eb4c909e119a1ea69767524a/b/1/b137-030_thumb.jpg",
    icon: Wrench,
  },
];

const galleryItems = [
  {
    title: "Winter ski rack setup",
    href: "https://www.reddit.com/media?url=https%3A%2F%2Fpreview.redd.it%2Fwinter-ski-rack-v0-uw657fobqzfe1.jpg%3Fwidth%3D640%26crop%3Dsmart%26auto%3Dwebp%26s%3D7051bb5387f99cc9d2ba13ceb6fc7537b6f721b6",
    img: "https://preview.redd.it/winter-ski-rack-v0-uw657fobqzfe1.jpg?width=640&crop=smart&auto=webp&s=7051bb5387f99cc9d2ba13ceb6fc7537b6f721b6",
    desc: "Clean winter look with a ski rack mounted.",
  },
  {
    title: "TOM'S Exhaust System",
    href: "https://www.86worx.com/tom-s-exhaust-system.html",
    img: "https://www.86worx.com/media/catalog/product/cache/88bd6db9eb4c909e119a1ea69767524a/b/3/b34-053_thumb.jpg",
    desc: "TOM'S exhaust option for the GR86/BRZ.",
  },
];

const specs = [
  ["Engine", "FA24 2.387L H4 (NA)"],
  ["Transmission", "6-speed MT (Torsen LSD)"],
  ["Max Output", "173 kW (235 PS) @ 7,000 rpm"],
  ["Max Torque", "250 Nm (25.5 kgf-m) @ 3,700 rpm"],
  ["Fuel System", "D-4S (DI + port)"],
  ["Fuel Efficiency (WLTC)", "11.8 km/L (MT)"],
  ["Length / Width / Height", "4,265 / 1,775 / 1,310 mm*"],
  ["Wheelbase", "2,575 mm"],
  ["Track (F/R)", "1,520 / 1,550 mm"],
  ["Ground Clearance", "130 mm"],
  ["Curb Weight", "~1,270 kg (MT Premium)"],
  ["Seating", "4"],
  ["Suspension", "MacPherson Strut (F) / Double Wishbone (R)"],
  ["Brakes", "Ventilated discs (F/R)"],
  ["Driveline", "Rear-wheel drive"],
  ["Tires", "215/40R18 (Premium)"],
  ["Fuel Tank", "50 L"],
];

type Tab = "main" | "gallery" | "specs";

export default function GR86Page() {
  const [activeTab, setActiveTab] = useState<Tab>("main");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const renderBody = () => {
    if (activeTab === "gallery") {
      return (
        <div className="space-y-6" style={{ contentVisibility: "auto" }}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="relative block overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg transition hover:border-accent/50"
                style={{ contain: "layout paint" }}
              >
                <div className="relative h-56 w-full">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-gray-300">{item.desc}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "specs") {
      return (
        <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]" style={{ contentVisibility: "auto" }}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4">
              <Car className="h-5 w-5 text-accent" />
              <h3 className="text-xl font-semibold text-white">Full Spec Sheet</h3>
            </div>
            <dl className="grid grid-cols-1 gap-4 text-left text-sm text-gray-200 sm:grid-cols-2">
              {specs.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
                  <dt className="text-[11px] uppercase tracking-[0.35em] text-gray-400">{label}</dt>
                  <dd className="text-base text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400">Drive</p>
              <p className="text-base text-white">Rear-wheel drive | 6MT with Torsen LSD</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400">Chassis</p>
              <p className="text-base text-white">MacPherson Strut (F) / Double Wishbone (R)</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400">Running Gear</p>
              <p className="text-base text-white">215/40R18 tires | Ventilated discs (F/R)</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/30 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.35em] text-gray-400">Fuel / Capacity</p>
              <p className="text-base text-white">D-4S | 50 L tank | 11.8 km/L WLTC (MT)</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-6" style={{ contentVisibility: "auto" }}>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-accent" />
              <h2 className="text-2xl font-bold text-white">Build Queue</h2>
            </div>
            <span className="text-sm text-gray-500">{mods.length} items planned</span>
          </div>

          {(() => {
            const [featured, ...rest] = mods;
              return (
                <div className="space-y-5">
                <motion.article
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
                  className="relative overflow-hidden rounded-3xl border border-white/8 bg-black/30 shadow-lg"
                  style={{ contain: "layout paint" }}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-64 w-full overflow-hidden md:w-1/3 md:h-auto">
                      <img
                        src={featured.img}
                        alt={featured.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white">
                        High Priority
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-4 p-6 md:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{featured.name}</h3>
                          <p className="text-sm text-gray-400">Exterior</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-mono font-bold text-white">{featured.price}</p>
                          <p className="text-xs text-gray-500">Estimated</p>
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        Rear Wing (Spoiler) made by Result Japan for the 2022+ GR86 (ZN8) & BRZ (ZD8). It gives a nice 90's
                        Japanese racing look to the back of the car. This product is made of FRP (Black Gel Coat) and is meant
                        to be painted, not installed as-is. The FRP + Carbon Fiber version is FRP sides with a carbon flat section.
                      </p>
                      <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={featured.link}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-accent"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Product <ArrowUpRight className="h-4 w-4" />
                          </a>
                          {"linkAlt" in featured && featured.linkAlt ? (
                            <a
                              href={featured.linkAlt}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-accent"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Alt Link <ArrowUpRight className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="ml-auto rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                          aria-label="Save"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>

                  <div className="grid gap-5 lg:grid-cols-3">
                    {rest.map(({ name, desc, price, link, img, icon: Icon }) => (
                      <motion.article
                        key={name}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
                        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-black/25 shadow-md"
                        style={{ contain: "layout paint" }}
                      >
                        <div className="relative h-44 w-full overflow-hidden">
                          <img
                            src={img}
                            alt={name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                        <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white">
                          Planned
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-5 text-left">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold text-white">{name}</h3>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-gray-200">
                            {price}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 flex-1">{desc}</p>
                        <div className="flex items-center justify-between text-sm text-accent">
                          <a
                            href={link}
                            className="inline-flex items-center gap-2 font-semibold underline-offset-4 transition hover:text-white hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Details <ExternalLink className="h-4 w-4" />
                          </a>
                          <Icon className="h-4 w-4 text-gray-300" />
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

      </>
    );
  };

  return (
    <main className="flex-1 w-full bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.08),transparent_45%)]">
      <section className="relative w-full px-6 pb-16 pt-14">
        <div className="mx-auto w-full max-w-6xl space-y-10">
          <div className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <img
                    src="/GR86.svg"
                    alt="GR86"
                    className="h-14 w-auto sm:h-16"
                    loading="lazy"
                    decoding="async"
                  />
                  <p className="max-w-2xl text-lg text-gray-300">
                    A good-looking sports car that&apos;s surprisingly practical for daily use.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "main", label: "Main Build" },
                  { id: "gallery", label: "Gallery" },
                  { id: "specs", label: "Spec Sheet" },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as Tab)}
                      aria-pressed={active}
                      className={[
                        "rounded-lg px-4 py-2 text-sm font-bold transition",
                        active
                          ? "bg-white text-black hover:bg-gray-200"
                          : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
              {[
                { label: "Engine", value: "FA24 Boxer" },
                { label: "Power", value: "235 PS" },
                { label: "Weight", value: "1,270 kg" },
                { label: "Color", value: "Track bRed" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[11px] uppercase tracking-[0.32em] text-gray-400">{stat.label}</p>
                  <p className="text-lg font-mono text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.25 }}
            >
              {renderBody()}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
