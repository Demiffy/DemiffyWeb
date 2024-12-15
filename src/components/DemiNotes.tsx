import React, { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  remove,
  update,
} from "firebase/database";
import { FaPlus, FaFolder, FaTrash, FaSearch, FaGripVertical } from "react-icons/fa";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "demiffycom.firebaseapp.com",
  databaseURL:
    "https://demiffycom-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "demiffycom",
  storageBucket: "demiffycom.appspot.com",
  messagingSenderId: "423608998435",
  appId: "1:423608998435:web:1ee3cc6b9408777fbdaf96",
  measurementId: "G-9DVS3F5QST",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

const COLORS = [
  "bg-yellow-200",
  "bg-green-200",
  "bg-blue-200",
  "bg-red-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-teal-200",
];

const STATUS_OPTIONS = ["To Do", "In Progress", "Finished"];

interface Folder {
  id: string;
  name: string;
  timestamp: string;
  order: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  status: string;
  dueDate?: string;
  timestamp: string;
}

const SortableFolder = ({
  folder,
  onDelete,
  onSelectFolder,
  selectedFolderId,
}: {
  folder: Folder;
  onDelete: (id: string) => void;
  onSelectFolder: (id: string) => void;
  selectedFolderId: string | null;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: folder.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 rounded cursor-pointer mb-2 
        ${isDragging ? "bg-gray-600" : selectedFolderId === folder.id ? "bg-blue-500" : "bg-gray-700"} 
        hover:bg-gray-600 transition`}
    >
      {/* Drag Handle */}
      <span
        {...attributes}
        {...listeners}
        className="flex items-center mr-2 cursor-grab"
      >
        <FaGripVertical />
      </span>

      {/* Folder Name */}
      <span
        className="flex items-center flex-grow"
        onClick={() => onSelectFolder(folder.id)}
      >
        <FaFolder className="mr-2" />
        {folder.name}
      </span>

      {/* Delete Button */}
      <FaTrash
        className="hover:text-red-500 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(folder.id);
        }}
      />
    </li>
  );
};

const SortableNoteComponent = ({
  note,
  onDelete,
  onUpdateStatus,
}: {
  note: Note;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: note.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${note.color} p-4 rounded-md h-auto flex flex-col shadow-md`}
    >
      {/* Drag Handle */}
      <span
        {...attributes}
        {...listeners}
        className="absolute top-3 left-3 cursor-grab"
      >
        <FaGripVertical />
      </span>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(note.id)}
        className="absolute top-3 right-3 p-2 bg-transparent hover:bg-slate-700 text-white rounded-full"
        style={{ zIndex: 50 }}
      >
        <FaTrash className="h-4 w-4" />
      </button>

      {/* Note Content */}
      <h3 className="font-bold text-lg mt-6">{note.title}</h3>
      <p className="text-sm mt-2 text-gray-800 flex-grow">{note.content}</p>
      <div className="mt-2">
        <select
          value={note.status}
          onChange={(e) => onUpdateStatus(note.id, e.target.value)}
          className="w-full p-1 rounded bg-gray-700 text-white"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {note.dueDate && (
          <p className="text-xs mt-1 text-gray-500">Due: {note.dueDate}</p>
        )}
      </div>
    </div>
  );
};

const DemiNotes: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newFolder, setNewFolder] = useState<string>("");
  const [newNote, setNewNote] = useState<Partial<Note>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchFolders = () => {
    const foldersRef = ref(db, "folders");
    onValue(foldersRef, (snapshot) => {
      const data = snapshot.val();
      const foldersList = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({
            id,
            ...value,
          }))
        : [];
      foldersList.sort((a: Folder, b: Folder) => a.order - b.order);
      setFolders(foldersList);
      if (!selectedFolderId && foldersList.length > 0) {
        setSelectedFolderId(foldersList[0].id);
      }
    });
  };

  const fetchNotes = (folderId: string) => {
    const notesRef = ref(db, `notes/${folderId}`);
    onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      const notesList = data
        ? Object.entries(data).map(([id, value]: [string, any]) => ({
            id,
            ...value,
          }))
        : [];
      setNotes(notesList);
    });
  };

  // Add a new folder
  const handleAddFolder = async () => {
    if (!newFolder.trim()) return;
    const foldersRef = ref(db, "folders");
    const newFolderRef = push(foldersRef);
    const currentFolders = folders.length;
    const folderData = {
      name: newFolder.trim(),
      timestamp: new Date().toISOString(),
      order: currentFolders,
    };
    await set(newFolderRef, folderData);
    setNewFolder("");
    setIsAddingFolder(false);
  };

  // Delete a folder
  const handleDeleteFolder = async (folderId: string) => {
    const folderRef = ref(db, `folders/${folderId}`);
    const notesRef = ref(db, `notes/${folderId}`);
    await remove(folderRef);
    await remove(notesRef);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
  };

  // Add a new note
  const handleAddNote = () => {
    if (!selectedFolderId) return;
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setNewNote({
      title: "",
      content: "",
      color: randomColor,
      status: "To Do",
      dueDate: "",
    });
  };

  // Save the new note
  const handleSaveNewNote = async () => {
    if (
      !newNote.title?.trim() ||
      !newNote.content?.trim() ||
      !selectedFolderId
    )
      return;

    const notesRef = ref(db, `notes/${selectedFolderId}`);
    const newNoteRef = push(notesRef);

    const noteData = {
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      color: newNote.color || "bg-gray-200",
      status: newNote.status || "To Do",
      dueDate: newNote.dueDate || "",
      timestamp: new Date().toISOString(),
    };

    await set(newNoteRef, noteData);
    setNewNote({});
  };

  // Delete a note
  const handleDeleteNote = async (id: string) => {
    if (!selectedFolderId) return;
    const noteRef = ref(db, `notes/${selectedFolderId}/${id}`);
    await remove(noteRef);
  };

  // Update note status
  const handleUpdateStatus = async (id: string, status: string) => {
    if (!selectedFolderId) return;
    const noteRef = ref(db, `notes/${selectedFolderId}/${id}`);
    await update(noteRef, { status });
  };

  // Handle drag and drop for notes
  const handleDragEndNotes = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = notes.findIndex((note) => note.id === active.id);
    const newIndex = notes.findIndex((note) => note.id === over.id);

    const reorderedNotes = arrayMove(notes, oldIndex, newIndex);
    setNotes(reorderedNotes);
    setActiveId(null);
  };

  // Handle drag and drop for folders
  const handleDragEndFolders = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = folders.findIndex((folder) => folder.id === active.id);
    const newIndex = folders.findIndex((folder) => folder.id === over.id);

    const reorderedFolders = arrayMove(folders, oldIndex, newIndex);
    setFolders(reorderedFolders);
    setActiveId(null);

    // Update the 'order' field in Firebase for each folder
    reorderedFolders.forEach((folder, index) => {
      const folderRef = ref(db, `folders/${folder.id}`);
      update(folderRef, { order: index });
    });
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolderId) {
      fetchNotes(selectedFolderId);
    }
  }, [selectedFolderId]);

  // Filtered folders based on search query
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">

      {/* Main Content */}
      <div className="flex flex-grow">
        {/* Sidebar - Folders */}
        <aside className="w-64 bg-gray-800 text-white p-4">
          {/* Header with Add Folder Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <FaFolder className="mr-2" />
              Folders
            </h2>
            <button
              onClick={() => setIsAddingFolder(true)}
              className="flex items-center bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition"
            >
              <FaPlus className="mr-1" />
              Add
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-gray-700 p-2 rounded mb-4">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search folders..."
              className="bg-gray-700 text-white focus:outline-none w-full"
            />
          </div>

          {/* Drag and Drop Context for Folders */}
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={(event) =>
              setActiveId(event.active.id as string)
            }
            onDragEnd={handleDragEndFolders}
          >
            <SortableContext
              items={filteredFolders.map((folder) => folder.id)}
              strategy={rectSortingStrategy}
            >
              <ul>
                {filteredFolders.length > 0 ? (
                  filteredFolders.map((folder) => (
                    <SortableFolder
                      key={folder.id}
                      folder={folder}
                      onDelete={handleDeleteFolder}
                      onSelectFolder={setSelectedFolderId}
                      selectedFolderId={selectedFolderId}
                    />
                  ))
                ) : (
                  <li className="text-gray-400">No folders found.</li>
                )}
              </ul>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <li className="flex items-center justify-between p-2 rounded bg-gray-700">
                  <span className="flex items-center">
                    <FaFolder className="mr-2" />
                    {folders.find((f) => f.id === activeId)?.name}
                  </span>
                  <FaTrash className="text-red-500" />
                </li>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Add Folder Modal */}
          {isAddingFolder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-md w-80">
                <h3 className="text-lg font-semibold mb-4">Add New Folder</h3>
                <input
                  type="text"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  placeholder="Folder Name"
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setIsAddingFolder(false);
                      setNewFolder("");
                    }}
                    className="px-4 py-2 mr-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFolder}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Notes Area */}
        <main className="flex-grow p-6">
          {selectedFolderId ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">
                  {folders.find((f) => f.id === selectedFolderId)?.name}
                </h2>
                <button
                  onClick={handleAddNote}
                  className="flex items-center bg-green-500 px-3 py-1 rounded hover:bg-green-600 transition"
                >
                  <FaPlus className="mr-2" />
                  Add Note
                </button>
              </div>

              <DndContext
                collisionDetection={closestCenter}
                onDragStart={(event) =>
                  setActiveId(event.active.id as string)
                }
                onDragEnd={handleDragEndNotes}
              >
                <SortableContext
                  items={notes.map((note) => note.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Render existing notes */}
                    {notes.map((note) => (
                      <SortableNoteComponent
                        key={note.id}
                        note={note}
                        onDelete={handleDeleteNote}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    ))}

                    {/* Add Note Form */}
                    {newNote.title === undefined ? null : (
                      <div className="bg-zinc-900 p-4 rounded-md shadow-md flex flex-col">
                        <input
                          type="text"
                          placeholder="Title"
                          value={newNote.title}
                          onChange={(e) =>
                            setNewNote((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full mb-2 p-2 border border-gray-300 rounded"
                        />
                        <textarea
                          placeholder="Content"
                          value={newNote.content}
                          onChange={(e) =>
                            setNewNote((prev) => ({
                              ...prev,
                              content: e.target.value,
                            }))
                          }
                          className="w-full mb-2 p-2 border border-gray-300 rounded flex-grow"
                        ></textarea>
                        <select
                          value={newNote.status}
                          onChange={(e) =>
                            setNewNote((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                          className="w-full mb-2 p-2 border border-gray-300 rounded"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={newNote.dueDate || ""}
                          onChange={(e) =>
                            setNewNote((prev) => ({
                              ...prev,
                              dueDate: e.target.value,
                            }))
                          }
                          className="w-full mb-2 p-2 border border-gray-300 rounded"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => setNewNote({})}
                            className="px-3 py-1 mr-2 bg-gray-500 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveNewNote}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeId && notes.find((note) => note.id === activeId) ? (
                    <div
                      className={`relative ${
                        notes.find((note) => note.id === activeId)?.color
                      } p-4 rounded-md shadow-md h-auto flex flex-col`}
                    >
                      <h3 className="font-bold text-lg">
                        {notes.find((note) => note.id === activeId)?.title}
                      </h3>
                      <p className="text-sm mt-2 text-gray-800 flex-grow">
                        {notes.find((note) => note.id === activeId)?.content}
                      </p>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No folder selected.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DemiNotes;