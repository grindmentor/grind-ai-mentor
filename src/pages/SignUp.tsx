
import { useState } from 'react';
import { EnhancedSignUp } from '@/components/EnhancedSignUp';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function SignUp() {
  const navigate = useNavigate();

  const handleSignUpSuccess = () => {
    toast.success('Account created successfully! Please check your email to confirm your account.');
    navigate('/signin');
  };

  const handleSwitchToSignIn = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <EnhancedSignUp 
          onSuccess={handleSignUpSuccess}
          onSwitchToSignIn={handleSwitchToSignIn}
        />
      </div>
    </div>
  );
}
