import { motion, LayoutGroup } from "framer-motion";
import { Navigation, Plane, Camera, RefreshCcw, Plus, FilterX, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useSpottersLog } from "../../../hooks/useSpottersLog";

const badgeColors = ["from-emerald-400 to-lime-400", "from-sky-400 to-indigo-400", "from-amber-400 to-rose-400"];
const AirplanesLog = () => {
  const { entries, isLoading, error, refresh, addEntry, removeEntry } = useSpottersLog("airplanes");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    title: "",
    location: "",
    date: "",
    note: "",
    image: "",
    tags: "",
  });

  const availableTags = useMemo(() => {
    const all = entries.flatMap((entry) => entry.tags);
    return [...new Set(all)].sort();
  }, [entries]);

  const decoratedEntries = useMemo(() => {
    return entries.map((entry, index) => {
      const matches = !selectedTags.length || selectedTags.every((tag) => entry.tags.includes(tag));
      return { entry, matches, index };
    });
  }, [entries, selectedTags]);

  const filteredEntries = useMemo(() => {
    const next = [...decoratedEntries];
    next.sort((a, b) => {
      if (a.matches === b.matches) return a.index - b.index;
      return a.matches ? -1 : 1;
    });
    return next;
  }, [decoratedEntries]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const clearFilters = () => setSelectedTags([]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.title.trim()) return;
    setIsSubmitting(true);
    await addEntry({
      title: formState.title.trim(),
      location: formState.location.trim(),
      date: formState.date.trim(),
      note: formState.note.trim(),
      image: formState.image.trim() || undefined,
      tags: formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    setFormState({ title: "", location: "", date: "", note: "", image: "", tags: "" });
    setIsSubmitting(false);
    setShowForm(false);
  };

  const handleRemove = async (id: string | undefined) => {
    if (!id) return;
    setDeletingId(id);
    await removeEntry(id);
    setDeletingId(null);
  };

  const skeletonCards = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={`plane-skeleton-${idx}`}
          className="flex h-full flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-5 shadow-xl ring-1 ring-white/5 backdrop-blur"
        >
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/5" />
          <div className="h-32 w-full animate-pulse rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-white/5" />
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      )),
    [],
  );

  return (
    <main className="flex-1 w-full">
      <section className="relative flex flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),transparent_60%)]" aria-hidden="true" />
        <div className="relative max-w-4xl space-y-4">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-accent"
          >
            <Plane className="h-4 w-4 text-accent" />
            Spotter's Log
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold text-white sm:text-5xl"
          >
            Airplanes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-gray-300 sm:text-lg"
          >
            Field notes from flight lines, airshows, and random airport fences. Update the log anytime by editing
            <span className="mx-1 font-mono text-sm text-gray-200">public/data/spotters-log.json</span>
            and redeploying on Vercel.
          </motion.p>
        </div>
      </section>

      <section className="w-full px-6 pb-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-2xl border border-white/5 bg-white/5/40 p-4 text-left text-xs text-gray-300">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="md:max-w-xl text-sm text-gray-200">
              Data loads directly from <code className="font-mono text-[11px] text-accent">/planesdata</code>. Use the panel to add a new sighting or refresh the feed.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-accent transition hover:border-accent/60"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isUnlocked) {
                    setShowForm((prev) => !prev);
                  } else {
                    setShowForm(true);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-accent"
              >
                <Plus className="h-3.5 w-3.5" />
                {isUnlocked ? (showForm ? "Close" : "Add Entry") : "Unlock Form"}
              </button>
            </div>
          </div>

          {showForm && !isUnlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white"
            >
              <p className="text-gray-300">Enter the log password to unlock the form.</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (passwordInput === import.meta.env.VITE_SPOTTERS_LOG_PASSWORD) {
                      setIsUnlocked(true);
                    }
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-accent/40 bg-accent/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
                >
                  Unlock
                </button>
              </div>
              <p className="text-xs text-gray-500">Need the password? Ping Demi.</p>
            </motion.div>
          )}

          {showForm && isUnlocked && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-3 text-sm text-white sm:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <label className="flex flex-col gap-1">
                Title
                <input
                  name="title"
                  value={formState.title}
                  onChange={handleInputChange}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                Location
                <input
                  name="location"
                  value={formState.location}
                  onChange={handleInputChange}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                Date
                <input
                  name="date"
                  value={formState.date}
                  onChange={handleInputChange}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent"
                  required
                />
              </label>
              <label className="flex flex-col gap-1">
                Image URL
                <input
                  name="image"
                  value={formState.image}
                  onChange={handleInputChange}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent"
                  placeholder="https://..."
                />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                Note
                <textarea
                  name="note"
                  value={formState.note}
                  onChange={handleInputChange}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent"
                  rows={3}
                  required
                />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                Tags (comma separated)
                <input
                  name="tags"
                  value={formState.tags}
                  onChange={handleInputChange}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent"
                  placeholder="Afterburner, NATO Days"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-accent/40 bg-accent/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-accent disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Submit Entry"}
              </button>
            </motion.form>
          )}
        </div>

        {error && (
          <div className="mx-auto mt-6 w-full max-w-5xl rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            Failed to load the remote log, showing the fallback list. ({error})
          </div>
        )}

        <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <LayoutGroup>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading ? (
                skeletonCards
              ) : entries.length ? (
                filteredEntries.map(({ entry, matches }) => (
                  <motion.article
                    key={`${entry.title}-${entry.date}`}
                    layout
                    animate={{
                      opacity: matches ? 1 : 0.25,
                      scale: matches ? 1 : 0.97,
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 32 }}
                    className="group relative flex h-full flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-5 shadow-xl ring-1 ring-white/5 backdrop-blur"
                  >
                    {entry.id && (
                      <button
                        type="button"
                        onClick={() => handleRemove(entry.id)}
                        className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/30 p-1 text-gray-300 transition hover:text-white"
                        disabled={deletingId === entry.id}
                        title="Remove entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <h2 className="text-xl font-semibold text-white">{entry.title}</h2>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-accent/80">
                      <span className="inline-flex items-center gap-2 text-accent">
                        <Navigation className="h-4 w-4" />
                        {entry.location}
                      </span>
                      <span className="ml-3 text-gray-400">{entry.date}</span>
                    </div>
                    {entry.image && (
                      <div className="overflow-hidden rounded-xl border border-white/10">
                        <img
                          src={entry.image}
                          alt={entry.title}
                          className="h-32 w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-300 sm:text-base">{entry.note}</p>

                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      {entry.tags.map((tag, tagIndex) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${badgeColors[tagIndex % badgeColors.length]} px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary`}
                        >
                          <Camera className="h-3.5 w-3.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="col-span-full rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-gray-300">
                  No entries yet. Add one to the log to get started.
                </div>
              )}
            </div>
          </LayoutGroup>
          </div>

          <aside className="lg:w-64 lg:flex-shrink-0">
            <div className="sticky top-28 flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-left text-sm text-gray-200 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-accent/80">Filters</span>
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!selectedTags.length}
                  className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.35em] text-gray-400 transition hover:text-white disabled:opacity-40"
                >
                  <FilterX className="h-3 w-3" />
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest transition ${
                        active ? "border-accent bg-accent/20 text-white" : "border-white/10 bg-white/5 text-gray-300 hover:border-accent/60"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {!availableTags.length && <p className="text-xs text-gray-400">Tags will appear once entries load.</p>}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default AirplanesLog;
