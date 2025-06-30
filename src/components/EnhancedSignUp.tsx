
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SoundButton } from "@/components/SoundButton";
import { playSuccessSound, playErrorSound, playClickSound } from "@/utils/soundEffects";
import { Shield, Heart, Zap, Check } from "lucide-react";

interface EnhancedSignUpProps {
  onSuccess: () => void;
  onSwitchToSignIn: () => void;
}

export const EnhancedSignUp = ({ onSuccess, onSwitchToSignIn }: EnhancedSignUpProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return false;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    
    if (!agreedToTerms || !agreedToPrivacy) {
      setError("You must agree to our Terms of Service and Privacy Policy");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      playErrorSound();
      return;
    }

    setError("");
    setIsLoading(true);
    playClickSound();

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes("User already registered")) {
          setError("An account with this email already exists. Try signing in instead.");
          setTimeout(() => onSwitchToSignIn(), 2000);
        } else {
          setError(error.message);
        }
        playErrorSound();
      } else {
        playSuccessSound();
        onSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 max-w-md mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-white text-2xl">Join GrindMentor</CardTitle>
        <CardDescription className="text-gray-400">
          Start your science-backed fitness journey today
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded border border-red-500/20 animate-fade-in">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 transition-colors"
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
                placeholder="Create a strong password"
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 transition-colors"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Enhanced Terms and Privacy Agreement */}
          <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => {
                  setAgreedToTerms(checked as boolean);
                  playClickSound();
                }}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="terms" className="text-white text-sm leading-relaxed cursor-pointer">
                  I agree to the <a href="/terms" className="text-orange-400 hover:text-orange-300 underline" target="_blank">Terms of Service</a>
                </Label>
                <p className="text-gray-400 text-xs">
                  By agreeing, you accept our terms for using GrindMentor's fitness services.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy"
                checked={agreedToPrivacy}
                onCheckedChange={(checked) => {
                  setAgreedToPrivacy(checked as boolean);
                  playClickSound();
                }}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="privacy" className="text-white text-sm leading-relaxed cursor-pointer">
                  I agree to the <a href="/privacy" className="text-orange-400 hover:text-orange-300 underline" target="_blank">Privacy Policy</a>
                </Label>
                <p className="text-gray-400 text-xs">
                  We protect your data and will never share it without your consent.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketing"
                checked={marketingConsent}
                onCheckedChange={(checked) => {
                  setMarketingConsent(checked as boolean);
                  playClickSound();
                }}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="marketing" className="text-white text-sm leading-relaxed cursor-pointer">
                  Send me fitness tips and updates (optional)
                </Label>
                <p className="text-gray-400 text-xs">
                  Get science-backed fitness insights and feature updates.
                </p>
              </div>
            </div>
          </div>

          {/* Important Disclaimer */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-400 text-sm font-medium mb-1">Important Medical Disclaimer</p>
                <p className="text-blue-300 text-xs leading-relaxed">
                  GrindMentor provides general fitness information only. Always consult qualified healthcare professionals before starting any fitness or nutrition program. Not intended as medical advice.
                </p>
              </div>
            </div>
          </div>
          
          <SoundButton 
            type="submit" 
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-3 transition-all hover:scale-105"
            disabled={isLoading || !agreedToTerms || !agreedToPrivacy}
            soundType="success"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Start My Fitness Journey</span>
              </div>
            )}
          </SoundButton>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              playClickSound();
              onSwitchToSignIn();
            }}
            className="text-orange-400 hover:text-orange-300 text-sm transition-colors"
            disabled={isLoading}
          >
            Already have an account? Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
