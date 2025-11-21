
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { logger } from '@/utils/logger';
import { cn } from '@/lib/utils';

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.debug('[SIGNIN DEBUG] Form submitted');
    setLoading(true);
    setError('');

    try {
      logger.debug('[SIGNIN DEBUG] Calling signIn...');
      const { error } = await signIn(email, password);
      logger.debug('[SIGNIN DEBUG] signIn returned, error:', error);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and click the verification link before signing in.');
        } else {
          setError(error.message);
        }
      }
      // Navigation handled by AuthContext
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      logger.error('[SIGNIN DEBUG] Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6 transition-transform hover:scale-105 duration-200">
            <Logo size="lg" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Sign in to continue your fitness journey</p>
        </div>

        <Card className="bg-card/50 border-border backdrop-blur-sm shadow-elevated transition-all duration-300 hover:shadow-glow-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-foreground text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-destructive/20 border-destructive/50 text-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className={cn(
                    "bg-input border-border text-foreground placeholder:text-muted-foreground",
                    "transition-all duration-200",
                    "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    className={cn(
                      "bg-input border-border text-foreground placeholder:text-muted-foreground pr-10",
                      "transition-all duration-200",
                      "focus:ring-2 focus:ring-primary/50 focus:border-primary",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
                  "text-primary-foreground font-semibold shadow-glow-primary",
                  "transition-all duration-200 min-h-[48px]",
                  "disabled:opacity-70 disabled:cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-primary hover:text-primary/90 font-medium transition-colors underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/"
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-all duration-200 hover:gap-3 gap-2 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
