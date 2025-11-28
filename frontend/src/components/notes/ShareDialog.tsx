import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Share2, Copy, Check, Link2, Eye, Clock, Loader2, Link2Off } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { notesApi } from '@/lib/api';
import type { SharedNoteResponse } from '@/lib/types';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
  noteTitle: string;
  alias: string;
  password: string;
}

export const ShareDialog = ({
  isOpen,
  onClose,
  noteId,
  noteTitle,
  alias,
  password,
}: ShareDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<SharedNoteResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const { toast } = useToast();

  // Check if note is already shared when dialog opens
  useEffect(() => {
    const checkShareStatus = async () => {
      if (!isOpen) return;
      
      setCheckingStatus(true);
      try {
        const data = await notesApi.getShareStatus(alias, noteId, password);
        setShareData(data);
      } catch (err) {
        // Note is not shared yet
        setShareData(null);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkShareStatus();
  }, [isOpen, noteId, alias, password]);

  const handleShare = async () => {
    setLoading(true);
    try {
      const data = await notesApi.shareNote(alias, noteId, password);
      // Replace backend URL with frontend URL for sharing
      const frontendShareUrl = `${window.location.origin}/shared/${data.share_token}`;
      setShareData({ ...data, share_url: frontendShareUrl });
      toast({
        title: 'Note shared!',
        description: 'Anyone with the link can view this note.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to share',
        description: err.response?.data?.detail || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    setLoading(true);
    try {
      await notesApi.unshareNote(alias, noteId, password);
      setShareData(null);
      toast({
        title: 'Sharing disabled',
        description: 'The shared link no longer works.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to unshare',
        description: err.response?.data?.detail || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareData) return;
    
    // Use frontend URL for sharing
    const frontendShareUrl = `${window.location.origin}/shared/${shareData.share_token}`;
    
    try {
      await navigator.clipboard.writeText(frontendShareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with anyone.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Note
          </DialogTitle>
          <DialogDescription>
            {noteTitle || 'Untitled Note'}
          </DialogDescription>
        </DialogHeader>

        {checkingStatus ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : shareData ? (
          <div className="space-y-4">
            {/* Share Link */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Link2 className="w-4 h-4 text-primary" />
                Shareable Link
              </Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/shared/${shareData.share_token}`}
                  readOnly
                  className="bg-muted/50"
                />
                <Button onClick={handleCopyLink} size="icon" variant="outline">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{shareData.view_count}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {shareData.expires_at ? formatDate(shareData.expires_at) : 'Never'}
                  </p>
                  <p className="text-xs text-muted-foreground">Expires</p>
                </div>
              </div>
            </div>

            {/* Unshare Button */}
            <Button
              onClick={handleUnshare}
              variant="destructive"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Link2Off className="w-4 h-4 mr-2" />
              )}
              Disable Sharing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                Create a shareable link for this note. Anyone with the link can view 
                the note's content (read-only).
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                The original note stays encrypted and secure
              </p>
            </div>

            <Button onClick={handleShare} className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              Create Share Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
