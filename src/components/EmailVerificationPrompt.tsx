
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface EmailVerificationPromptProps {
  userEmail: string;
  onContinue: () => void;
}

const EmailVerificationPrompt = ({ userEmail, onContinue }: EmailVerificationPromptProps) => {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { resendConfirmationEmail, canResendEmail, signOut } = useAuth();

  const handleResendEmail = async () => {
    setIsResending(true);
    setError("");
    setMessage("");

    try {
      const { error } = await resendConfirmationEmail(userEmail);
      
      if (error) {
        setError(error.message);
      } else {
        setMessage("Verification email sent! Please check your inbox.");
      }
    } catch (err) {
      setError("Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
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
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-white">Verify Your Email</CardTitle>
            <CardDescription className="text-gray-400">
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded border border-red-500/20 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            
            {message && (
              <div className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded border border-green-500/20 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}

            <div className="text-center space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-white text-sm font-medium mb-1">Email sent to:</p>
                <p className="text-orange-400 text-sm break-all">{userEmail}</p>
              </div>

              <div className="text-gray-300 text-sm space-y-2">
                <p><strong>Next steps:</strong></p>
                <ol className="text-left space-y-1 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here and refresh the page</li>
                </ol>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || !canResendEmail}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      {canResendEmail ? "Resend Verification Email" : "Wait before resending"}
                    </>
                  )}
                </Button>

                <Button
                  onClick={onContinue}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  I've Verified My Email
                </Button>

                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  Sign Out & Try Different Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPrompt;
