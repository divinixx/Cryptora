import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, LogOut, FileText } from 'lucide-react';
import { NoteList } from '@/components/notes/NoteList';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { NoteViewer } from '@/components/notes/NoteViewer';
import type { Note, DecryptedNote } from '@/lib/types';

export const DashboardPage = () => {
  const { user, password, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [decryptedTitles, setDecryptedTitles] = useState<Map<number, string>>(new Map());
  const [selectedNote, setSelectedNote] = useState<DecryptedNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    loadNotes();
  }, [isAuthenticated]);

  const loadNotes = async () => {
    if (!user || !password) return;
    try {
      const data = await notesApi.getUserWithNotes(user.alias);
      setNotes(data.notes);
      
      // Decrypt all titles for sidebar
      const titles = new Map<number, string>();
      for (const note of data.notes) {
        try {
          const decrypted = await notesApi.getNote(user.alias, note.id, password);
          titles.set(note.id, decrypted.decrypted_title || 'Untitled');
        } catch (error) {
          titles.set(note.id, 'Untitled');
        }
      }
      setDecryptedTitles(titles);
    } catch (error) {
      console.error('Failed to load notes', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNote = async (noteId: number) => {
    if (!user || !password) return;
    try {
      const note = await notesApi.getNote(user.alias, noteId, password);
      setSelectedNote(note);
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to load note', error);
    }
  };

  const handleCreateNote = async (title: string, content: string) => {
    if (!user || !password) return;
    try {
      await notesApi.createNote(user.alias, password, { title, content });
      await loadNotes();
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create note', error);
    }
  };

  const handleUpdateNote = async (noteId: number, title: string, content: string) => {
    if (!user || !password) return;
    try {
      await notesApi.updateNote(user.alias, noteId, password, { title, content });
      await loadNotes();
      if (selectedNote) {
        handleSelectNote(noteId);
      }
    } catch (error) {
      console.error('Failed to update note', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!user || !password) return;
    try {
      await notesApi.deleteNote(user.alias, noteId, password);
      await loadNotes();
      setSelectedNote(null);
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-semibold">{user?.alias}'s Notes</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          <Button
            onClick={() => {
              setIsCreating(true);
              setSelectedNote(null);
            }}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <NoteList
            notes={notes}
            selectedNoteId={selectedNote?.id}
            onSelectNote={handleSelectNote}
            decryptedTitles={decryptedTitles}
          />
        </ScrollArea>
      </div>

      <div className="flex-1 bg-background/50">
        {isCreating ? (
          <NoteEditor onSave={handleCreateNote} onCancel={() => setIsCreating(false)} />
        ) : selectedNote ? (
          <NoteViewer
            note={selectedNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 p-8 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-white">No note selected</p>
                <p className="text-muted-foreground">Select a note from the sidebar or create a new one</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
