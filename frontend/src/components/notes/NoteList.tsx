import { FileText } from 'lucide-react';
import type { Note } from '@/lib/types';

interface NoteListProps {
  notes: Note[];
  selectedNoteId?: number;
  onSelectNote: (noteId: number) => void;
  decryptedTitles: Map<number, string>;
}

export const NoteList = ({ notes, selectedNoteId, onSelectNote, decryptedTitles }: NoteListProps) => {
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (notes.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No notes yet. Create your first note!
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {notes.map((note) => (
        <button
          key={note.id}
          onClick={() => onSelectNote(note.id)}
          className={`w-full p-3 rounded-lg text-left transition-colors ${
            selectedNoteId === note.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary'
          }`}
        >
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {decryptedTitles.get(note.id) || 'Untitled'}
              </p>
              <p className="text-xs opacity-70">
                {formatDateTime(note.updated_at || note.created_at)}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
