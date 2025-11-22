import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Lock, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { DecryptedNote } from '@/lib/types';

interface NoteViewerProps {
  note: DecryptedNote;
  onUpdate: (noteId: number, title: string, content: string) => void;
  onDelete: (noteId: number) => void;
}

export const NoteViewer = ({ note, onUpdate, onDelete }: NoteViewerProps) => {
  const [title, setTitle] = useState(note.decrypted_title || '');
  const [content, setContent] = useState(note.decrypted_content);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Update local state when note changes
  useEffect(() => {
    setTitle(note.decrypted_title || '');
    setContent(note.decrypted_content);
  }, [note.id]);

  // Auto-save after 1 second of inactivity
  useEffect(() => {
    const hasChanges = 
      title !== (note.decrypted_title || '') || 
      content !== note.decrypted_content;
    
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content]);

  const handleSave = async () => {
    if (content.trim() && (title !== (note.decrypted_title || '') || content !== note.decrypted_content)) {
      setIsSaving(true);
      await onUpdate(note.id, title, content);
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Note content copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

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

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <Input
            type="text"
            placeholder="Untitled Note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {isSaving ? 'Saving...' : `Updated ${formatDateTime(note.updated_at || note.created_at)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => onDelete(note.id)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <Textarea
            placeholder="Start writing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] resize-none text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white leading-relaxed"
          />
          <div className="mt-8 p-4 bg-secondary rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>This note is end-to-end encrypted. Changes auto-save after 1 second.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
