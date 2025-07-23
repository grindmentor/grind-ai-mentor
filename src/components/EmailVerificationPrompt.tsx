
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface EmailVerificationPromptProps {
  userEmail: string;
  onContinue: () => void;
}

const EmailVerificationPrompt = ({ userEmail, onContinue }: EmailVerificationPromptProps) => {
  const { resendConfirmationEmail, canResendEmail, authPending } = useAuth();
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!canResendEmail && countdown === 0) {
      setCountdown(60);
    }
  }, [canResendEmail, countdown]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    setResendMessage("");
    setResendError("");

    const { error } = await resendConfirmationEmail(userEmail);
    
    if (error) {
      setResendError(error.message);
    } else {
      setResendMessage("Verification email sent! Check your inbox.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">M</span>
          </div>
          <span className="text-2xl font-bold">Myotopia</span>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Verify Your Email</CardTitle>
            <CardDescription className="text-muted-foreground">
              Check your inbox to activate your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-orange-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Almost there!
              </h3>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We've sent a verification email to{" "}
                <strong className="text-foreground">{userEmail}</strong>
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg mb-6 border border-border">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-foreground mb-2">
                      <strong>Next steps:</strong>
                    </p>
                    <ol className="text-sm text-muted-foreground space-y-1">
                      <li>1. Check your email inbox</li>
                      <li>2. Click the verification link</li>
                      <li>3. Return here to start using Myotopia</li>
                    </ol>
                  </div>
                </div>
              </div>

              {resendMessage && (
                <div className="text-green-400 text-sm mb-4 bg-green-500/10 p-3 rounded border border-green-500/20">
                  {resendMessage}
                </div>
              )}
              
              {resendError && (
                <div className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded border border-red-500/20 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{resendError}</span>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={authPending || !canResendEmail || countdown > 0}
                  variant="outline"
                  className="w-full border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {authPending ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    "Resend verification email"
                  )}
                </Button>

                <Button
                  onClick={onContinue}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  I've verified my email
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-6">
                Can't find the email? Check your spam folder or try resending.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPrompt;
