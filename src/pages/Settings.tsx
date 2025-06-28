
import { useState } from 'react';
import { ArrowLeft, User, Bell, Shield, Palette, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LowDataToggle } from '@/components/ui/low-data-toggle';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    progressUpdates: false,
    researchUpdates: true,
    marketingEmails: false,
  });

  const [privacy, setPrivacy] = useState({
    shareProgress: false,
    dataCollection: true,
    analytics: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>

          <div className="space-y-8">
            {/* Performance Settings */}
            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold">Performance</h2>
              </div>
              
              <div className="space-y-4">
                <LowDataToggle />
                <p className="text-sm text-gray-400">
                  Enable low data mode to reduce bandwidth usage and improve performance on slower connections.
                </p>
              </div>
            </section>

            {/* Notification Settings */}
            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="workout-reminders" className="text-gray-300">
                    Workout Reminders
                  </Label>
                  <Switch
                    id="workout-reminders"
                    checked={notifications.workoutReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, workoutReminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="progress-updates" className="text-gray-300">
                    Progress Updates
                  </Label>
                  <Switch
                    id="progress-updates"
                    checked={notifications.progressUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, progressUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="research-updates" className="text-gray-300">
                    Latest Research
                  </Label>
                  <Switch
                    id="research-updates"
                    checked={notifications.researchUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, researchUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-emails" className="text-gray-300">
                    Marketing Emails
                  </Label>
                  <Switch
                    id="marketing-emails"
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketingEmails: checked })
                    }
                  />
                </div>
              </div>
            </section>

            {/* Privacy Settings */}
            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold">Privacy & Data</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="share-progress" className="text-gray-300">
                    Share Progress Publicly
                  </Label>
                  <Switch
                    id="share-progress"
                    checked={privacy.shareProgress}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, shareProgress: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="data-collection" className="text-gray-300">
                    Allow Data Collection for Improvements
                  </Label>
                  <Switch
                    id="data-collection"
                    checked={privacy.dataCollection}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, dataCollection: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics" className="text-gray-300">
                    Usage Analytics
                  </Label>
                  <Switch
                    id="analytics"
                    checked={privacy.analytics}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, analytics: checked })
                    }
                  />
                </div>
              </div>
            </section>

            {/* Account Actions */}
            <section className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-semibold">Account</h2>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={() => window.location.href = '/profile'}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800/50"
                >
                  Edit Profile
                </Button>

                <Button
                  onClick={() => window.location.href = '/privacy'}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800/50"
                >
                  Privacy Policy
                </Button>

                <Button
                  onClick={() => window.location.href = '/terms'}
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800/50"
                >
                  Terms of Service
                </Button>

                <Separator className="bg-gray-700/50" />

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      // Handle account deletion
                      console.log('Account deletion requested');
                    }
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
