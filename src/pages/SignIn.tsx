
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/onboarding");
    }
  }, [user, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password reset email sent! Check your inbox for instructions.");
        setIsForgotPassword(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("User already registered")) {
            setError("An account with this email already exists. Try signing in instead.");
            setIsSignUp(false);
          } else {
            setError(error.message);
          }
        } else {
          setAwaitingConfirmation(true);
          setMessage("Account created! Please check your email and click the confirmation link to activate your account.");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please check your credentials or confirm your email if you just signed up.");
          } else if (error.message.includes("Email not confirmed")) {
            setError("Please check your email and click the confirmation link before signing in.");
            setAwaitingConfirmation(true);
          } else {
            setError(error.message);
          }
        }
        // Navigation happens automatically through useEffect when user state changes
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSignUp(false);
    setIsForgotPassword(false);
    setAwaitingConfirmation(false);
    setError("");
    setMessage("");
  };

  const getTitle = () => {
    if (awaitingConfirmation) return "Check Your Email";
    if (isForgotPassword) return "Reset Password";
    if (isSignUp) return "Create Account";
    return "Welcome Back";
  };

  const getDescription = () => {
    if (awaitingConfirmation) return "We've sent you a confirmation email";
    if (isForgotPassword) return "Enter your email to receive reset instructions";
    if (isSignUp) return "Start your science-backed fitness journey";
    return "Sign in to continue your progress";
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">GM</span>
          </div>
          <span className="text-2xl font-bold">GrindMentor</span>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-white">{getTitle()}</CardTitle>
            <CardDescription className="text-gray-400">{getDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            {awaitingConfirmation ? (
              <div className="space-y-4">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-300 mb-6">
                    We've sent a confirmation link to <strong className="text-white">{email}</strong>. 
                    Click the link in your email to activate your account, then return here to sign in.
                  </p>
                  <Button 
                    onClick={resetForm}
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded border border-red-500/20">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded border border-green-500/20">
                    {message}
                  </div>
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
                    className="bg-gray-800 border-gray-700 text-white"
                    disabled={isLoading}
                  />
                </div>
                
                {!isForgotPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="bg-gray-800 border-gray-700 text-white"
                      disabled={isLoading}
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : (
                    isForgotPassword ? "Send Reset Email" : 
                    isSignUp ? "Create Account" : "Sign In"
                  )}
                </Button>
              </form>
            )}
            
            {!awaitingConfirmation && (
              <>
                <div className="mt-6 text-center space-y-3">
                  {!isForgotPassword && (
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError("");
                        setMessage("");
                      }}
                      className="text-orange-400 hover:text-orange-300 text-sm block"
                      disabled={isLoading}
                    >
                      {isSignUp 
                        ? "Already have an account? Sign in" 
                        : "Don't have an account? Sign up"
                      }
                    </button>
                  )}
                  
                  {!isSignUp && (
                    <button
                      onClick={() => {
                        setIsForgotPassword(!isForgotPassword);
                        setError("");
                        setMessage("");
                      }}
                      className="text-gray-400 hover:text-white text-sm block"
                      disabled={isLoading}
                    >
                      {isForgotPassword ? "Back to sign in" : "Forgot your password?"}
                    </button>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <Link to="/" className="text-gray-400 hover:text-white text-sm">
                    ← Back to home
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
