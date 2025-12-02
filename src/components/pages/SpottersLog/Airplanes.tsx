import { motion, LayoutGroup } from "framer-motion";
import { Navigation, Plane, Camera, RefreshCcw, FilterX, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSpottersLog } from "../../../hooks/useSpottersLog";

const tagColors = ["from-emerald-400 to-lime-400", "from-sky-400 to-indigo-400", "from-amber-400 to-rose-400"];

const emptyEntry = {
  title: "",
  location: "",
  date: "",
  note: "",
  image: "",
  tags: "",
};

type EntryForm = typeof emptyEntry;

const AirplanesLog = () => {
  const { entries, isLoading, error, refresh, addEntry, updateEntry, removeEntry } = useSpottersLog("airplanes");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [addForm, setAddForm] = useState<EntryForm>(emptyEntry);
  const [editForm, setEditForm] = useState<EntryForm & { id: string }>({ id: "", ...emptyEntry });
  const [removeId, setRemoveId] = useState("");
  const [isSavingAdd, setIsSavingAdd] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const sharedFields: Array<keyof EntryForm> = ["title", "location", "date", "image"];

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

  const handleAddChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!addForm.title.trim()) return;
    setIsSavingAdd(true);
    await addEntry({
      title: addForm.title.trim(),
      location: addForm.location.trim(),
      date: addForm.date.trim(),
      note: addForm.note.trim(),
      image: addForm.image.trim() || undefined,
      tags: addForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    setAddForm(emptyEntry);
    setIsSavingAdd(false);
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editForm.id.trim()) return;
    setIsSavingEdit(true);
    await updateEntry(editForm.id.trim(), {
      title: editForm.title.trim(),
      location: editForm.location.trim(),
      date: editForm.date.trim(),
      note: editForm.note.trim(),
      image: editForm.image.trim() || undefined,
      tags: editForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    setEditForm({ id: "", ...emptyEntry });
    setIsSavingEdit(false);
  };

  const submitRemove = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!removeId.trim()) return;
    setIsRemoving(true);
    await removeEntry(removeId.trim());
    setRemoveId("");
    setIsRemoving(false);
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
        {error && (
          <div className="mx-auto mb-6 w-full max-w-5xl rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            Failed to load the remote log: {error}
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
                      className="group flex h-full flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-5 shadow-xl ring-1 ring-white/5 backdrop-blur"
                    >
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
                            className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${tagColors[tagIndex % tagColors.length]} px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary`}
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
                    No entries yet. Add one below to get started.
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
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent transition hover:border-accent/60"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refresh Feed
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="w-full px-6 pb-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <motion.button
            type="button"
            onClick={() => setAdminOpen((prev) => !prev)}
            className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-left text-sm font-semibold uppercase tracking-[0.35em] text-gray-200"
            whileHover={{ scale: 1.01 }}
          >
            Airplane Log Admin
            <ChevronDown className={`h-4 w-4 transition-transform ${adminOpen ? "rotate-180" : ""}`} />
          </motion.button>

          {adminOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-white shadow-2xl"
            >
              {!adminUnlocked ? (
                <div className="space-y-3">
                  <p className="text-gray-300">Enter the admin password to unlock add/edit/remove controls.</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(event) => setAdminPassword(event.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-accent"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (adminPassword === import.meta.env.VITE_SPOTTERS_LOG_PASSWORD) {
                          setAdminUnlocked(true);
                        }
                      }}
                      className="rounded-2xl border border-accent/40 bg-accent/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em]"
                    >
                      Unlock
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Need access? Ping Demi.</p>
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                  <form className="space-y-3" onSubmit={submitAdd}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Add Entry</h3>
                    <div className="grid gap-3">
                      {sharedFields.map((field) => (
                        <label key={field} className="flex flex-col gap-1">
                          {field === "image" ? "Image URL" : field.charAt(0).toUpperCase() + field.slice(1)}
                          <input
                            name={field}
                            value={addForm[field]}
                            onChange={handleAddChange}
                            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-accent"
                            placeholder={field === "image" ? "https://..." : undefined}
                            required={field !== "image"}
                          />
                        </label>
                      ))}
                      <label className="flex flex-col gap-1">
                        Note
                        <textarea
                          name="note"
                          value={addForm.note}
                          onChange={handleAddChange}
                          rows={3}
                          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-accent"
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Tags (comma separated)
                        <input
                          name="tags"
                          value={addForm.tags}
                          onChange={handleAddChange}
                          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-accent"
                          placeholder="Afterburner, NATO Days"
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingAdd}
                      className="w-full rounded-2xl border border-accent/40 bg-accent/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition hover:border-accent disabled:opacity-50"
                    >
                      {isSavingAdd ? "Saving..." : "Submit Entry"}
                    </button>
                  </form>

                  <form className="space-y-3" onSubmit={submitEdit}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Edit Entry (PUT)</h3>
                    <label className="flex flex-col gap-1">
                      Entry ID
                      <input
                        name="id"
                        value={editForm.id}
                        onChange={handleEditChange}
                        className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-accent"
                        placeholder="ID from API response"
                        required
                      />
                    </label>
                    <div className="grid gap-3">
                      {sharedFields.map((field) => (
                        <label key={field} className="flex flex-col gap-1">
                          {field === "image" ? "Image URL" : field.charAt(0).toUpperCase() + field.slice(1)}
                          <input
                            name={field}
                            value={editForm[field]}
                            onChange={handleEditChange}
                            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-accent"
                            placeholder={field === "image" ? "https://..." : undefined}
                            required={field !== "image"}
                          />
                        </label>
                      ))}
                      <label className="flex flex-col gap-1">
                        Note
                        <textarea
                          name="note"
                          value={editForm.note}
                          onChange={handleEditChange}
                          rows={3}
                          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-accent"
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        Tags (comma separated)
                        <input
                          name="tags"
                          value={editForm.tags}
                          onChange={handleEditChange}
                          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-accent"
                          placeholder="Afterburner, NATO Days"
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="w-full rounded-2xl border border-accent/40 bg-accent/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition hover:border-accent disabled:opacity-50"
                    >
                      {isSavingEdit ? "Updating..." : "Save Changes"}
                    </button>
                  </form>

                  <form className="space-y-3 lg:col-span-2" onSubmit={submitRemove}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">Remove Entry</h3>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        value={removeId}
                        onChange={(event) => setRemoveId(event.target.value)}
                        className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-accent"
                        placeholder="Entry ID"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isRemoving}
                        className="rounded-2xl border border-rose-400/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-100 transition hover:border-rose-400 disabled:opacity-50"
                      >
                        {isRemoving ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
};

export default AirplanesLog;
