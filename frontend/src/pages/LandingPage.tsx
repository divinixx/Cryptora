import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Shield, EyeOff, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BackgroundRipple } from '@/components/ui/background-ripple';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try to login first
      try {
        await login(alias, password);
        navigate(`/${alias}`);
      } catch (loginError: any) {
        // If login fails, auto-register the user
        if (loginError.message.includes('not found') || loginError.message.includes('Invalid')) {
          await register(alias, password);
          toast({
            title: 'Welcome!',
            description: 'Your secure notepad has been created.',
          });
          navigate(`/${alias}`);
        } else {
          throw loginError;
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <BackgroundRipple className="opacity-50" duration={200} />
      <nav className="border-b border-border backdrop-blur-sm bg-background/80 relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Cryptora</h1>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Your Notes,
              <br />
              <span className="text-primary">Truly Private</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              End-to-end encrypted notepad with zero-knowledge architecture.
              Your password never leaves your device.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2">
                <Shield className="w-10 h-10 text-primary" />
                <h3 className="font-semibold text-sm">Zero-Knowledge</h3>
                <p className="text-xs text-muted-foreground">
                  Password never stored
                </p>
              </div>
              <div className="space-y-2">
                <Lock className="w-10 h-10 text-primary" />
                <h3 className="font-semibold text-sm">AES-256-GCM</h3>
                <p className="text-xs text-muted-foreground">
                  Military-grade encryption
                </p>
              </div>
              <div className="space-y-2">
                <EyeOff className="w-10 h-10 text-primary" />
                <h3 className="font-semibold text-sm">Private by Design</h3>
                <p className="text-xs text-muted-foreground">
                  We can't read your notes
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Start Writing Securely</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your alias and password to begin
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Alias</label>
                  <Input
                    type="text"
                    placeholder="choose-your-alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                    disabled={loading}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    This encrypts your notes. Keep it safe - we can't recover it.
                  </p>
                </div>

                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? 'Loading...' : 'Access Notepad'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  New user? Just enter your details and we'll create your secure notepad automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 backdrop-blur-sm bg-background/80 relative z-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Cryptora © 2025 - Open Source Encrypted Notepad</p>
        </div>
      </footer>
    </div>
  );
};
