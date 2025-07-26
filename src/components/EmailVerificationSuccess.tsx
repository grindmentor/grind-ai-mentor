import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";

interface EmailVerificationSuccessProps {
  userEmail: string;
  onContinue: () => void;
}

export const EmailVerificationSuccess = ({ userEmail, onContinue }: EmailVerificationSuccessProps) => {
  return (
    <Card className="bg-card border-border max-w-md mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-foreground text-2xl">Check Your Email</CardTitle>
        <CardDescription className="text-muted-foreground">
          We've sent you a verification link to get started
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Email confirmation notice */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <Mail className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
            <div className="space-y-3">
              <h3 className="text-blue-400 text-lg font-semibold">
                Verification Email Sent
              </h3>
              <p className="text-blue-300 text-sm leading-relaxed">
                We've sent a verification link to <strong className="text-blue-200">{userEmail}</strong>
              </p>
              
              <div className="space-y-2 text-blue-300 text-sm">
                <p className="font-medium">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the "Confirm Email" button in the email</li>
                  <li>You'll be automatically signed in to Myotopia</li>
                </ol>
              </div>
              
              <div className="bg-blue-600/20 border border-blue-400/30 rounded p-3 mt-4">
                <p className="text-blue-200 text-xs font-medium">
                  ⚡ Tip: Keep this page open while you check your email
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <Button 
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 transition-all hover:scale-105"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>I've Clicked the Email Link</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Button>

        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            Didn't receive the email? It may take a few minutes to arrive.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};