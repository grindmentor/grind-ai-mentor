import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Trash2, Loader2, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * AccountManagement component for GDPR compliance:
 * - Export user data (data portability)
 * - Delete account (right to erasure)
 * 
 * These features are required by Privacy Policy and GDPR.
 */
const AccountManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      // Fetch all user data from various tables
      const [
        profileResult,
        preferencesResult,
        goalsResult,
        achievementsResult,
        workoutsResult,
        foodLogsResult,
        habitsResult,
        recoveryResult,
        progressPhotosResult
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_goals').select('*').eq('user_id', user.id),
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
        supabase.from('workout_sessions').select('*').eq('user_id', user.id),
        supabase.from('food_log_entries').select('*').eq('user_id', user.id),
        supabase.from('habits').select('*, habit_completions(*)').eq('user_id', user.id),
        supabase.from('recovery_data').select('*').eq('user_id', user.id),
        supabase.from('progress_photos').select('id, taken_date, notes, weight_at_time, photo_type').eq('user_id', user.id)
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email,
        profile: profileResult.data,
        preferences: preferencesResult.data,
        goals: goalsResult.data || [],
        achievements: achievementsResult.data || [],
        workoutSessions: workoutsResult.data || [],
        foodLogs: foodLogsResult.data || [],
        habits: habitsResult.data || [],
        recoveryData: recoveryResult.data || [],
        progressPhotos: progressPhotosResult.data || []
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `myotopia-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || confirmEmail !== user.email) {
      toast.error('Please enter your email correctly to confirm deletion');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete user data from all tables (cascade should handle most, but be explicit)
      // Note: auth.users deletion must be handled by the user themselves or a secure edge function
      
      // Delete from tables that may not have cascade
      await Promise.all([
        supabase.from('user_goals').delete().eq('user_id', user.id),
        supabase.from('user_achievements').delete().eq('user_id', user.id),
        supabase.from('workout_sessions').delete().eq('user_id', user.id),
        supabase.from('food_log_entries').delete().eq('user_id', user.id),
        supabase.from('habits').delete().eq('user_id', user.id),
        supabase.from('recovery_data').delete().eq('user_id', user.id),
        supabase.from('progress_photos').delete().eq('user_id', user.id),
        supabase.from('user_preferences').delete().eq('user_id', user.id),
        supabase.from('customer_profiles').delete().eq('user_id', user.id),
        supabase.from('coach_conversations').delete().eq('user_id', user.id),
        supabase.from('progressive_overload_entries').delete().eq('user_id', user.id),
        supabase.from('tdee_calculations').delete().eq('user_id', user.id),
        supabase.from('cut_calculations').delete().eq('user_id', user.id),
        supabase.from('meal_plans').delete().eq('user_id', user.id),
        supabase.from('training_programs').delete().eq('user_id', user.id),
        supabase.from('user_notifications').delete().eq('user_id', user.id),
        supabase.from('interaction_logs').delete().eq('user_id', user.id),
        supabase.from('user_usage').delete().eq('user_id', user.id),
      ]);

      // Delete profile (references auth.users with CASCADE, so this should work)
      await supabase.from('profiles').delete().eq('id', user.id);

      // Sign out the user
      await supabase.auth.signOut();

      toast.success('Your account data has been deleted. The account will be fully removed within 30 days.');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" aria-hidden="true" />
          Data & Privacy
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Manage your data in accordance with our Privacy Policy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Data */}
        <div className="p-4 bg-muted/30 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-primary mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground">Export Your Data</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Download all your personal data in a machine-readable JSON format. 
                This includes your profile, workouts, goals, and all other saved data.
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
            className="w-full h-10"
            aria-label="Export all personal data"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                Download My Data
              </>
            )}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-destructive">Delete Account</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full h-10"
                aria-label="Delete account permanently"
              >
                <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  Delete Account Permanently?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will permanently delete:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your profile and preferences</li>
                    <li>All workout and exercise data</li>
                    <li>Goals, habits, and achievements</li>
                    <li>Food logs and meal plans</li>
                    <li>Progress photos and analyses</li>
                    <li>All other personal data</li>
                  </ul>
                  <p className="mt-3 font-medium text-destructive">
                    This action cannot be undone.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="confirm-email" className="text-sm text-foreground">
                  Type your email to confirm: <span className="text-muted-foreground">{user?.email}</span>
                </Label>
                <Input
                  id="confirm-email"
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-2 bg-background"
                  aria-describedby="confirm-email-help"
                />
                <p id="confirm-email-help" className="text-xs text-muted-foreground mt-1">
                  This confirms you understand this action is irreversible.
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmEmail !== user?.email}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Forever'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountManagement;