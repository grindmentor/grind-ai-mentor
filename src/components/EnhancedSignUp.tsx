import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Calendar } from 'lucide-react';

interface EnhancedSignUpProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export const EnhancedSignUp: React.FC<EnhancedSignUpProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateAge = (birthdate: string) => {
    if (!birthdate) return false;
    
    const today = new Date();
    const birth = new Date(birthdate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    
    return age >= 18;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (birthday && !validateAge(birthday)) {
      toast.error('You must be 18 years or older to register');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            display_name: displayName,
            birthday: birthday
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data) {
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-white">Create an account</CardTitle>
        <CardDescription className="text-gray-400">
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-orange-200">
            <User className="w-4 h-4 mr-2 inline-block" />
            Name
          </Label>
          <Input
            id="name"
            placeholder="Display Name"
            type="text"
            className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-orange-200">
            <Mail className="w-4 h-4 mr-2 inline-block" />
            Email
          </Label>
          <Input
            id="email"
            placeholder="Email"
            type="email"
            className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="birthday" className="text-orange-200">
            <Calendar className="w-4 h-4 mr-2 inline-block" />
            Birthday
          </Label>
          <Input
            id="birthday"
            type="date"
            className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-orange-200">
            <Lock className="w-4 h-4 mr-2 inline-block" />
            Password
          </Label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="confirm-password" className="text-orange-200">
            <Lock className="w-4 h-4 mr-2 inline-block" />
            Confirm Password
          </Label>
          <Input
            id="confirm-password"
            placeholder="Confirm Password"
            type="password"
            className="bg-orange-800/50 border-orange-500/30 text-white placeholder:text-orange-300/50"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        
        <Button disabled={isLoading} onClick={handleSubmit} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 mr-2 rounded-full animate-spin border-2 border-solid border-white border-t-transparent" />
              Creating...
            </div>
          ) : (
            'Create account'
          )}
        </Button>
      </CardContent>
      
      <div className="px-6 py-4 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Button variant="link" onClick={onSwitchToSignIn} className="text-orange-400 hover:text-orange-300">
          Sign in
        </Button>
      </div>
    </Card>
  );
};
