import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DecryptedFolder } from '@/lib/types';

interface FolderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
  folder?: DecryptedFolder | null;
}

const COLORS = [
  { name: 'default', class: 'bg-primary' },
  { name: 'red', class: 'bg-red-500' },
  { name: 'orange', class: 'bg-orange-500' },
  { name: 'yellow', class: 'bg-yellow-500' },
  { name: 'green', class: 'bg-green-500' },
  { name: 'blue', class: 'bg-blue-500' },
  { name: 'purple', class: 'bg-purple-500' },
  { name: 'pink', class: 'bg-pink-500' },
];

export const FolderDialog = ({ open, onClose, onSave, folder }: FolderDialogProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('default');

  useEffect(() => {
    if (folder) {
      setName(folder.decrypted_name);
      setColor(folder.color || 'default');
    } else {
      setName('');
      setColor('default');
    }
  }, [folder, open]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), color);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            {folder ? 'Edit Folder' : 'New Folder'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Folder Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Folder"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    c.class,
                    color === c.name
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-white scale-110'
                      : 'hover:scale-105'
                  )}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {folder ? 'Save Changes' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
