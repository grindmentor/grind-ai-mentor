
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  userEmail: string;
}

const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ children, userEmail }) => {
  const { user, resendConfirmationEmail, canResendEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  // If email is confirmed, render children
  if (user?.email_confirmed_at) {
    return <>{children}</>;
  }

  const handleResendEmail = async () => {
    if (!canResendEmail || isResending) return;

    setIsResending(true);
    try {
      const { error } = await resendConfirmationEmail(userEmail);
      
      if (error) {
        toast({
          title: "Failed to resend email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox and click the verification link.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckEmail = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-white">Verify Your Email</CardTitle>
          <CardDescription className="text-gray-400">
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              {userEmail}
            </Badge>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              Please check your inbox and click the verification link to continue using GrindMentor.
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleCheckEmail}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                I've Verified My Email
              </Button>

              <Button
                onClick={handleResendEmail}
                disabled={!canResendEmail || isResending}
                variant="outline"
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>

            {!canResendEmail && (
              <p className="text-xs text-orange-400 text-center">
                Please wait a moment before requesting another verification email
              </p>
            )}
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Didn't receive the email? Check your spam folder or try resending.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationGuard;
