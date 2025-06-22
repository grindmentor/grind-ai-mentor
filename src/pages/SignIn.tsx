
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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

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
          setMessage("Please check your email and click the confirmation link before signing in.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError("Invalid email or password. Please check your credentials or confirm your email if you just signed up.");
          } else if (error.message.includes("Email not confirmed")) {
            setError("Please check your email and click the confirmation link before signing in.");
          } else {
            setError(error.message);
          }
        } else {
          navigate("/app");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-white">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isSignUp 
                ? "Start your science-backed fitness journey" 
                : "Sign in to continue your progress"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setMessage("");
                }}
                className="text-orange-400 hover:text-orange-300 text-sm"
                disabled={isLoading}
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/" className="text-gray-400 hover:text-white text-sm">
                ← Back to home
              </Link>
            </div>

            {!isSignUp && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  If you just signed up, please check your email for a confirmation link before signing in.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
