
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedSignUp } from "@/components/EnhancedSignUp";
import { SoundButton } from "@/components/SoundButton";
import { playSuccessSound, playErrorSound, playClickSound } from "@/utils/soundEffects";
import { Mail, Lock, ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { signIn, resetPassword, user, isNewUser, canResendEmail } = useAuth();

  useEffect(() => {
    if (user) {
      // Redirect users to app - the app will handle email verification
      navigate("/app");
    }
  }, [user, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      playErrorSound();
      return;
    }

    setError("");
    setMessage("");
    setIsLoading(true);
    playClickSound();

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
        playErrorSound();
      } else {
        setMessage("Password reset email sent! Check your inbox for instructions.");
        setResetEmailSent(true);
        playSuccessSound();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    playClickSound();

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please verify your email address before signing in. Check your inbox for the verification link.");
        } else {
          setError(error.message);
        }
        playErrorSound();
      } else {
        playSuccessSound();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSignUp(false);
    setIsForgotPassword(false);
    setAwaitingConfirmation(false);
    setResetEmailSent(false);
    setError("");
    setMessage("");
    playClickSound();
  };

  // Show enhanced signup
  if (isSignUp) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white text-sm">GM</span>
            </div>
            <span className="text-2xl font-bold">GrindMentor</span>
          </div>
          
          <EnhancedSignUp 
            onSuccess={() => setAwaitingConfirmation(true)}
            onSwitchToSignIn={() => setIsSignUp(false)}
          />
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (awaitingConfirmation) return "Check Your Email";
    if (isForgotPassword) {
      return resetEmailSent ? "Reset Link Sent" : "Reset Password";
    }
    return "Welcome Back";
  };

  const getDescription = () => {
    if (awaitingConfirmation) return "We've sent you a confirmation email";
    if (isForgotPassword) {
      return resetEmailSent 
        ? "Check your email for password reset instructions"
        : "Enter your email to receive reset instructions";
    }
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
                    <Mail className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-gray-300 mb-6">
                    We've sent a confirmation link to <strong className="text-white">{email}</strong>. 
                    Click the link in your email to activate your account, then return here to sign in.
                  </p>
                  <SoundButton 
                    onClick={resetForm}
                    variant="outline"
                    className="border-gray-700 text-gray-900 bg-white hover:bg-gray-100 hover:text-black"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </SoundButton>
                </div>
              </div>
            ) : resetEmailSent ? (
              <div className="space-y-4">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-gray-300 mb-6">
                    Password reset instructions have been sent to <strong className="text-white">{email}</strong>.
                    Check your inbox and follow the link to reset your password.
                  </p>
                  <SoundButton 
                    onClick={resetForm}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    Back to Sign In
                  </SoundButton>
                </div>
              </div>
            ) : (
              <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded border border-red-500/20 animate-fade-in">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded border border-green-500/20 animate-fade-in">
                    {message}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="bg-gray-800 border-gray-700 text-white pl-10 focus:border-orange-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {!isForgotPassword && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="bg-gray-800 border-gray-700 text-white pl-10 focus:border-orange-500 transition-colors"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
                
                <SoundButton 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all hover:scale-105"
                  disabled={isLoading || (isForgotPassword && !canResendEmail)}
                  soundType="success"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Please wait...</span>
                    </div>
                  ) : (
                    isForgotPassword ? 
                      (canResendEmail ? "Send Reset Email" : "Wait before resending") 
                      : "Sign In"
                  )}
                </SoundButton>
              </form>
            )}
            
            {!awaitingConfirmation && !resetEmailSent && (
              <>
                <div className="mt-6 text-center space-y-3">
                  {!isForgotPassword && (
                    <button
                      onClick={() => {
                        setIsSignUp(true);
                        playClickSound();
                      }}
                      className="text-orange-400 hover:text-orange-300 text-sm block transition-colors"
                      disabled={isLoading}
                    >
                      Don't have an account? Sign up
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsForgotPassword(!isForgotPassword);
                      setResetEmailSent(false);
                      setError("");
                      setMessage("");
                      playClickSound();
                    }}
                    className="text-gray-400 hover:text-white text-sm block transition-colors"
                    disabled={isLoading}
                  >
                    {isForgotPassword ? "Back to sign in" : "Forgot your password?"}
                  </button>
                </div>
                
                <div className="mt-4 text-center">
                  <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
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
