import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Shield, EyeOff, ArrowRight, Terminal, Code2, Zap, Github } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BackgroundRipple } from '@/components/ui/background-ripple';
import { EncryptedText } from '@/components/ui/encrypted-text';
import { CodeBlock } from '@/components/ui/code-block';
import { motion } from 'framer-motion';

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
      <BackgroundRipple className="opacity-30" duration={200} />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/50 relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Lock className="w-7 h-7 text-primary" />
              <div className="absolute inset-0 blur-lg bg-primary/50" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Cryptora
            </h1>
          </div>
          <a 
            href="https://github.com/divinixx/Cryptora" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="hidden sm:inline">Star on GitHub</span>
          </a>
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-20 md:py-32">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center space-y-8 mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Zero-Knowledge Architecture</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <EncryptedText text="Encrypted" className="block text-primary" duration={1500} />
              <span className="block mt-2">Note Taking</span>
              <span className="block text-muted-foreground text-4xl md:text-5xl mt-4">
                For Developers Who Value Privacy
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Military-grade AES-256-GCM encryption. Your password never leaves your device. 
              Built with React, FastAPI, and end-to-end encryption at its core.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg shadow-2xl shadow-primary/50"
                  onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Terminal className="w-5 h-5 mr-2" />
                  Start Encrypting
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 px-8 text-lg backdrop-blur-xl"
                  asChild
                >
                  <a href="https://github.com/divinixx/Cryptora" target="_blank" rel="noopener noreferrer">
                    <Code2 className="w-5 h-5 mr-2" />
                    View Source
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-20"
          >
            {[
              { icon: Shield, title: 'Zero-Knowledge', desc: 'Your encryption key never touches our servers. We literally cannot access your notes.' },
              { icon: Lock, title: 'AES-256-GCM', desc: 'Military-grade authenticated encryption with galois counter mode.' },
              { icon: EyeOff, title: 'Private by Default', desc: 'No tracking, no analytics, no data collection. Your privacy is not negotiable.' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.1, duration: 0.6 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                <div className="relative p-8 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Code Example */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-8">
              <EncryptedText text="Simple. Secure. Fast." duration={1200} />
            </h2>
            <CodeBlock 
              code={`# Create encrypted note
POST /api/{alias}/notes
Authorization: Password-Based-Key

{
  "title": "My Secret Note",
  "content": "This is encrypted on the client side"
}

# Returns encrypted data
{
  "encrypted_title": "gAAAAB...",
  "encrypted_content": "gAAAAB...",
  "content_hash": "sha256..."
}`}
              language="http"
            />
          </motion.div>

          {/* Auth Section */}
          <motion.div
            id="auth-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-xl opacity-30 animate-pulse" />
              <div className="relative backdrop-blur-2xl bg-card/70 border border-border/50 rounded-3xl p-10 shadow-2xl">
                <div className="space-y-6">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 mb-4">
                      <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">
                      <EncryptedText text="Launch Cryptora" duration={1000} />
                    </h2>
                    <p className="text-muted-foreground">
                      Choose an alias and master password
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primary" />
                        Alias
                      </label>
                      <Input
                        type="text"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        required
                        disabled={loading}
                        className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        Master Password
                      </label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={4}
                        disabled={loading}
                        className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors"
                      />
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>This key encrypts all your notes. We cannot recover it if lost.</span>
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-13 text-base shadow-2xl shadow-primary/30 relative overflow-hidden group" 
                      disabled={loading}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {loading ? 'Encrypting...' : 'Access Secure Notepad'}
                        {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-20 transition-opacity" />
                    </Button>
                  </form>

                  <div className="text-center pt-4 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      New user? Your secure notepad will be created automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-border/30 py-8 backdrop-blur-xl bg-background/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Cryptora © 2025 - Built with ❤️ for developers who value privacy
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://github.com/divinixx/Cryptora" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Open Source
              </a>
              <span>•</span>
              <span>AES-256-GCM</span>
              <span>•</span>
              <span>Zero-Knowledge</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
