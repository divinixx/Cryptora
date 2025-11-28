import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sharedApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Lock, Eye, Calendar, ArrowLeft, Copy, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BackgroundRipple } from '@/components/ui/background-ripple';
import { motion } from 'framer-motion';
import type { SharedNotePublicView } from '@/lib/types';

export const SharedNotePage = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [note, setNote] = useState<SharedNotePublicView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNote = async () => {
      if (!shareToken) return;
      
      try {
        const data = await sharedApi.viewSharedNote(shareToken);
        setNote(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Note not found or has expired');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [shareToken]);

  const handleCopy = async () => {
    if (!note) return;
    
    try {
      await navigator.clipboard.writeText(note.content);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Note content copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading shared note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <BackgroundRipple className="opacity-20" duration={200} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center space-y-6 p-8 rounded-2xl border border-red-500/30 bg-red-500/5 max-w-md mx-4"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Note Not Found</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Cryptora
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundRipple className="opacity-20" duration={200} />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Navbar */}
      <nav className="border-b border-border/20 backdrop-blur-2xl bg-background/40 relative z-10 sticky top-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Cryptora" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white">Cryptora</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{note?.view_count} views</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Lock className="w-4 h-4" />
              <span>Shared Note (Read Only)</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {note?.title || 'Untitled Note'}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Shared on {formatDate(note?.created_at || '')}</span>
              </div>
            </div>
          </div>

          {/* Note Content */}
          <div className="relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Notepad lines effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="border-b border-white/20" style={{ height: '32px' }} />
              ))}
            </div>
            
            <div className="relative z-10 p-8">
              <pre className="whitespace-pre-wrap font-sans text-base text-white leading-relaxed">
                {note?.content}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button onClick={handleCopy} variant="outline">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Content'}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 border border-primary/20 px-4 py-2 rounded-lg">
              <Lock className="w-4 h-4 text-primary" />
              <span>This note was encrypted and shared securely via Cryptora</span>
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-block p-6 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm">
              <p className="text-muted-foreground mb-4">
                Want to create your own encrypted notes?
              </p>
              <Button asChild size="lg">
                <Link to="/">
                  Get Started with Cryptora
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};
