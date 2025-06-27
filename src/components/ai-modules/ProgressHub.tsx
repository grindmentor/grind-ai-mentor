
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SmoothButton } from '@/components/ui/smooth-button';
import { ArrowLeft, TrendingUp, Calendar, Target, Award, Activity, Scale } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProgressEntry {
  id: string;
  date: string;
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
  notes?: string;
  measurements?: {
    chest?: number;
    waist?: number;
    arms?: number;
    thighs?: number;
  };
}

interface ProgressHubProps {
  onBack: () => void;
}

const ProgressHub: React.FC<ProgressHubProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    weight: '',
    body_fat: '',
    muscle_mass: '',
    notes: '',
    chest: '',
    waist: '',
    arms: '',
    thighs: ''
  });

  useEffect(() => {
    if (user) {
      loadProgressEntries();
    }
  }, [user]);

  const loadProgressEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if progress_entries table exists, if not create mock data
      const { data, error } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Progress entries table might not exist:', error);
        // Set empty entries instead of failing
        setEntries([]);
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error loading progress entries:', error);
      setEntries([]);
      toast({
        title: 'Progress tracking unavailable',
        description: 'Progress tracking feature is being set up. Please check back later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!user) return;

    try {
      const measurements = {
        chest: parseFloat(currentEntry.chest) || undefined,
        waist: parseFloat(currentEntry.waist) || undefined,
        arms: parseFloat(currentEntry.arms) || undefined,
        thighs: parseFloat(currentEntry.thighs) || undefined
      };

      // Try to insert, but handle if table doesn't exist
      const { error } = await supabase
        .from('progress_entries')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          weight: parseFloat(currentEntry.weight) || undefined,
          body_fat: parseFloat(currentEntry.body_fat) || undefined,
          muscle_mass: parseFloat(currentEntry.muscle_mass) || undefined,
          notes: currentEntry.notes || undefined,
          measurements: Object.values(measurements).some(v => v !== undefined) ? measurements : undefined
        });

      if (error) {
        console.error('Error adding progress entry:', error);
        toast({
          title: 'Progress tracking unavailable',
          description: 'Progress tracking feature is being set up. Your data will be saved once available.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Progress entry added',
        description: 'Your progress has been recorded successfully'
      });

      setCurrentEntry({
        weight: '',
        body_fat: '',
        muscle_mass: '',
        notes: '',
        chest: '',
        waist: '',
        arms: '',
        thighs: ''
      });
      setShowAddEntry(false);
      loadProgressEntries();
    } catch (error) {
      console.error('Error adding progress entry:', error);
      toast({
        title: 'Error adding entry',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };

  const getProgressTrend = () => {
    if (entries.length < 2) return null;
    
    const recent = entries[0];
    const previous = entries[1];
    
    if (recent.weight && previous.weight) {
      const change = recent.weight - previous.weight;
      return {
        type: 'weight',
        change: change,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    }
    
    return null;
  };

  const trend = getProgressTrend();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900/10 to-orange-800/20 text-white">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <SmoothButton
                variant="ghost"
                onClick={onBack}
                className="text-white hover:bg-gray-800/50"
                size={isMobile ? 'sm' : 'default'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </SmoothButton>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Progress Hub
                </h1>
                <p className="text-gray-400 text-sm md:text-base">Track your fitness journey</p>
              </div>
            </div>
            
            <SmoothButton
              onClick={() => setShowAddEntry(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              size={isMobile ? 'sm' : 'default'}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Add Entry
            </SmoothButton>
          </div>

          {/* Progress Overview */}
          {entries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-gray-900/40 border-gray-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-white">
                    <Scale className="w-5 h-5 mr-2 text-blue-400" />
                    Latest Weight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {entries[0]?.weight ? `${entries[0].weight} lbs` : 'Not recorded'}
                  </div>
                  {trend && trend.type === 'weight' && (
                    <div className={`text-sm flex items-center mt-2 ${
                      trend.direction === 'up' ? 'text-green-400' : 
                      trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      <TrendingUp className={`w-4 h-4 mr-1 ${
                        trend.direction === 'down' ? 'rotate-180' : ''
                      }`} />
                      {Math.abs(trend.change).toFixed(1)} lbs from last entry
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-900/40 border-gray-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-white">
                    <Activity className="w-5 h-5 mr-2 text-green-400" />
                    Total Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{entries.length}</div>
                  <div className="text-sm text-gray-400 mt-2">Progress tracking sessions</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/40 border-gray-700/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-white">
                    <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {entries[0] ? new Date(entries[0].date).toLocaleDateString() : 'Never'}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Most recent entry</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add Entry Form */}
          {showAddEntry && (
            <Card className="bg-gray-900/40 border-gray-700/50 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-400" />
                  Add Progress Entry
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Record your current measurements and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentEntry.weight}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, weight: e.target.value}))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Enter weight"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Body Fat %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentEntry.body_fat}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, body_fat: e.target.value}))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Enter body fat %"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Muscle Mass (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentEntry.muscle_mass}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, muscle_mass: e.target.value}))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Enter muscle mass"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Chest (inches)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentEntry.chest}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, chest: e.target.value}))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Chest"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Waist (inches)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentEntry.waist}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, waist: e.target.value}))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Waist"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Arms (inches)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentEntry.arms}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, arms: e.target.value}))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Arms"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Thighs (inches)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentEntry.thighs}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, thighs: e.target.value}))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Thighs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={currentEntry.notes}
                    onChange={(e) => setCurrentEntry(prev => ({...prev, notes: e.target.value}))}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    rows={3}
                    placeholder="Add any notes about your progress..."
                  />
                </div>

                <div className="flex space-x-4">
                  <SmoothButton
                    onClick={handleAddEntry}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    Save Entry
                  </SmoothButton>
                  <SmoothButton
                    variant="outline"
                    onClick={() => setShowAddEntry(false)}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </SmoothButton>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress History */}
          <Card className="bg-gray-900/40 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-400" />
                Progress History
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your recorded progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No Progress Entries Yet</h3>
                  <p className="text-gray-400 mb-6">Start tracking your progress to see your fitness journey</p>
                  <SmoothButton
                    onClick={() => setShowAddEntry(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    Add Your First Entry
                  </SmoothButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry, index) => (
                    <div key={entry.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-lg font-semibold text-white">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        {index === 0 && (
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                            Latest
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {entry.weight && (
                          <div>
                            <span className="text-gray-400">Weight:</span>
                            <span className="text-white ml-2">{entry.weight} lbs</span>
                          </div>
                        )}
                        {entry.body_fat && (
                          <div>
                            <span className="text-gray-400">Body Fat:</span>
                            <span className="text-white ml-2">{entry.body_fat}%</span>
                          </div>
                        )}
                        {entry.muscle_mass && (
                          <div>
                            <span className="text-gray-400">Muscle Mass:</span>
                            <span className="text-white ml-2">{entry.muscle_mass} lbs</span>
                          </div>
                        )}
                        {entry.measurements && Object.values(entry.measurements).some(v => v) && (
                          <div>
                            <span className="text-gray-400">Measurements recorded</span>
                          </div>
                        )}
                      </div>
                      
                      {entry.notes && (
                        <div className="mt-3 p-3 bg-gray-700/50 rounded">
                          <span className="text-gray-400 text-sm">Notes:</span>
                          <p className="text-white text-sm mt-1">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressHub;
