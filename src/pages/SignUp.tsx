
import { useState } from 'react';
import { EnhancedSignUp } from '@/components/EnhancedSignUp';
import { EmailVerificationSuccess } from '@/components/EmailVerificationSuccess';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function SignUp() {
  const navigate = useNavigate();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSignUpSuccess = (email: string) => {
    setUserEmail(email);
    setShowEmailVerification(true);
    toast.success('Account created! Please check your email to complete verification.');
  };

  const handleSwitchToSignIn = () => {
    navigate('/signin');
  };

  const handleEmailVerificationContinue = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md animate-scale-in">
        {showEmailVerification ? (
          <EmailVerificationSuccess 
            userEmail={userEmail}
            onContinue={handleEmailVerificationContinue}
          />
        ) : (
          <EnhancedSignUp 
            onSuccess={handleSignUpSuccess}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        )}
      </div>
    </div>
  );
}
