import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import PaymentSetup from "@/components/PaymentSetup";

const App = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted", { name, email, message });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 p-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-sm">GM</span>
          </div>
          <span className="text-xl font-bold">GrindMentor</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-4">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            Meal Plans
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            Workouts
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            Progress
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            Settings
          </Button>
        </nav>

        {/* Upgrade Card */}
        <div className="mt-auto">
          <PaymentSetup onUpgrade={() => setShowPaymentModal(true)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Send us a message, and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Payment Successful!</h3>
            <p className="text-gray-400 mb-6">
              Welcome to Premium! You now have access to all features.
            </p>
            <Button
              onClick={() => setShowPaymentModal(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
