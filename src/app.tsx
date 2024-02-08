import { useState } from "react";
import logo from "./assets/logo-notes.svg";
import { NewNoteCard } from "./components/new-note-card";
import { NoteCard } from "./components/note-card";

export interface Note {
  id: string;
  createdAt: Date;
  content: string;
}

export function App() {
  const [notes, setNotes] = useState<Note[] | []>(() => {
    const notesOnLocalStorage = localStorage.getItem("notes");
    if (notesOnLocalStorage) {
      return JSON.parse(notesOnLocalStorage);
    }
    return [];
  });

  function onCreateNote(content: string) {
    const newNote = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      content,
    };

    const allNotes = [newNote, ...notes];
    setNotes(allNotes);
    localStorage.setItem("notes", JSON.stringify(allNotes));
  }

  function onDeleteNote(noteId: string) {
    const newNotesArray = notes.filter((note) => note.id !== noteId);

    setNotes(newNotesArray);
    localStorage.setItem("notes", JSON.stringify(newNotesArray));
  }

  return (
    <div className="max-w-6xl mx-auto my-12 space-y-6">
      <img src={logo} alt="Notes app Logo" />
      <form className="w-full">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Busque em suas notas..."
          className="w-full bg-transparent text-3xl font-semibold tracking-tight placeholder:text-slate-500 outline-none"
        />
      </form>
      <div className="h-px bg-slate-700"></div>

      <div className="grid grid-cols-3 gap-6 auto-rows-[250px]">
        <NewNoteCard onCreateNote={onCreateNote} />
        {notes.length > 0 && notes.map((note) => <NoteCard key={note.id} note={note} onDeleteNote={onDeleteNote} />)}
      </div>
    </div>
  );
}
