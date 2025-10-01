
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowLeft, Copy, Check } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { toast } from 'sonner';

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorDetails(null);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        const debugInfo = {
          timestamp: new Date().toISOString(),
          errorMessage: error.message,
          errorName: error.name,
          errorCode: (error as any).code,
          errorStatus: (error as any).status,
          fullError: JSON.stringify(error, null, 2),
          userEmail: email
        };
        setErrorDetails(debugInfo);
        
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
      const debugInfo = {
        timestamp: new Date().toISOString(),
        errorMessage: err instanceof Error ? err.message : String(err),
        errorName: err instanceof Error ? err.name : 'Unknown',
        errorStack: err instanceof Error ? err.stack : undefined,
        fullError: JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
        userEmail: email
      };
      setErrorDetails(debugInfo);
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyDebugInfo = () => {
    if (errorDetails) {
      const debugText = `Myotopia Sign In Error Report
========================================
${Object.entries(errorDetails).map(([key, value]) => `${key}: ${value}`).join('\n')}
========================================`;
      
      navigator.clipboard.writeText(debugText);
      setCopied(true);
      toast.success('Debug info copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <Logo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue your fitness journey</p>
        </div>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-red-900/20 border-red-800 text-red-400">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <AlertTitle className="text-red-400 font-semibold mb-2">
                        Sign In Error
                      </AlertTitle>
                      <AlertDescription className="text-red-300 mb-3">
                        {error}
                      </AlertDescription>
                      {errorDetails && (
                        <div className="mt-3 p-3 bg-black/40 rounded border border-red-800/50">
                          <p className="text-xs text-red-300 font-mono mb-2">Debug Information:</p>
                          <div className="text-xs text-red-200 font-mono space-y-1 max-h-32 overflow-y-auto">
                            {Object.entries(errorDetails).map(([key, value]) => (
                              <div key={key} className="break-all">
                                <span className="text-red-400">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {errorDetails && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={copyDebugInfo}
                        className="shrink-0 h-8 w-8 p-0 hover:bg-red-800/20"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-red-300" />
                        )}
                      </Button>
                    )}
                  </div>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/"
                className="inline-flex items-center text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
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
