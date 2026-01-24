import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealisticMuscleMap } from '@/components/ui/realistic-muscle-map';
import { Upload, TrendingUp, Brain, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MobileHeader } from '@/components/MobileHeader';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { cn } from '@/lib/utils';
import { compressImage, HIGH_QUALITY_OPTIONS } from '@/utils/imageCompression';
interface PhysiqueAnalysis {
  muscle_development: number;
  symmetry: number;
  definition: number;
  mass: number;
  conditioning: number;
  overall_score: number;
  muscle_groups: Array<{
    name: string;
    score: number;
    progress_trend: 'up' | 'down' | 'stable';
  }>;
  recommendations: string[];
  analysis_date: string;
}

const PhysiqueAI = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhysiqueAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRefresh = async () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
  };

  // Convert file to high-quality base64 with compression
  const fileToBase64 = async (file: File): Promise<string> => {
    // Apply high-quality compression for better analysis
    const compressedFile = await compressImage(file, {
      ...HIGH_QUALITY_OPTIONS,
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.92,
    });
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  };

  const analyzePhysique = async () => {
    if (!selectedFile || !user) return;

    setIsAnalyzing(true);
    
    try {
      // Convert to high-quality base64 (no upload needed - send directly to AI)
      console.log('[PhysiqueAI] Compressing image...');
      const base64Image = await fileToBase64(selectedFile);
      console.log('[PhysiqueAI] Image compressed, size:', Math.round(base64Image.length / 1024), 'KB');

      // Get user profile for context
      const { data: profile } = await supabase
        .from('profiles')
        .select('height, weight, body_fat_percentage, goal')
        .eq('id', user.id)
        .maybeSingle();

      console.log('[PhysiqueAI] Calling analyze-physique...');
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-physique', {
        body: { 
          image: base64Image,
          height: profile?.height,
          weight: profile?.weight,
          bodyFat: profile?.body_fat_percentage,
          goals: profile?.goal
        }
      });

      if (analysisError) {
        console.error('[PhysiqueAI] Function error:', analysisError);
        throw new Error(analysisError.message || 'Analysis failed');
      }
      
      if (analysisData?.error) {
        toast.error(analysisData.error);
        setIsAnalyzing(false);
        return;
      }

      if (!analysisData?.analysis) {
        throw new Error('Invalid analysis response');
      }

      const result = analysisData.analysis;
      console.log('[PhysiqueAI] Analysis received:', result.confidence);

      // Save to progress_photos for history
      await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          analysis_result: JSON.stringify(result),
          photo_type: 'physique_analysis',
          taken_date: new Date().toISOString().split('T')[0]
        });

      setAnalysis({
        muscle_development: result.attributes?.muscle_development || 50,
        symmetry: result.attributes?.symmetry || 50,
        definition: result.attributes?.definition || 50,
        mass: result.attributes?.mass || 50,
        conditioning: result.attributes?.conditioning || 50,
        overall_score: result.overall_score || 50,
        muscle_groups: Object.entries(result.muscle_groups || {}).map(([name, score]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          score: score as number,
          progress_trend: 'stable' as const
        })),
        recommendations: result.recommendations || [],
        analysis_date: result.analysis_date || new Date().toISOString()
      });
      
      toast.success('Physique analysis completed!');
      
    } catch (error) {
      console.error('[PhysiqueAI] Analysis error:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze physique. Please try again.';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Score meter component
  const ScoreMeter = ({ label, score, color }: { label: string; score: number; color: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-bold", color)}>{score}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className={cn("h-full rounded-full", color.replace('text-', 'bg-'))}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Let MobileHeader handle returnTo navigation automatically */}
      <MobileHeader 
        title="Physique AI" 
      />

      <PullToRefresh onRefresh={handleRefresh} skeletonVariant="card">
        <div className="px-4 pb-28">
          {/* Hero Section */}
          <motion.div 
            className="text-center py-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-14 h-14 mx-auto bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-3 border border-rose-500/20" aria-hidden="true">
              <Brain className="w-7 h-7 text-rose-400" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">AI Physique Analysis</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Get detailed feedback on your physique development
            </p>
          </motion.div>

          {/* Upload Section */}
          {!analysis && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-card/50 rounded-2xl border border-border/50 p-4">
                <div className="border-2 border-dashed border-rose-500/30 rounded-xl p-6 text-center hover:border-rose-500/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                    aria-label="Upload photo for analysis"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer space-y-3">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full max-h-64 object-contain rounded-lg mx-auto"
                      />
                    ) : (
                      <>
                        <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center" aria-hidden="true">
                          <Upload className="w-8 h-8 text-rose-400" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Tap to upload photo</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, HEIC up to 25MB
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
                
                {selectedFile && (
                  <Button 
                    onClick={analyzePhysique}
                    disabled={isAnalyzing}
                    className="w-full mt-4 h-14 min-h-[48px] rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-base font-semibold focus-visible:ring-2 focus-visible:ring-rose-500/50 focus-visible:ring-offset-2"
                    aria-label="Analyze physique"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" aria-hidden="true" />
                        Analyze Physique
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {/* Tips */}
              <div className="bg-card/50 rounded-xl border border-border/50 p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Tips for Best Results</h3>
                <div className="space-y-2">
                  {[
                    'Use good, even lighting',
                    'Stand in a relaxed pose',
                    'Wear minimal clothing',
                    'Keep background simple'
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" aria-hidden="true" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="w-full bg-muted/50 p-1 rounded-xl h-11">
                  <TabsTrigger value="overview" className="flex-1 rounded-lg text-xs h-9">Overview</TabsTrigger>
                  <TabsTrigger value="body-map" className="flex-1 rounded-lg text-xs h-9">Body Map</TabsTrigger>
                  <TabsTrigger value="insights" className="flex-1 rounded-lg text-xs h-9">Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Overall Score */}
                  <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-2xl border border-rose-500/20 p-5">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-rose-400 mb-1">
                        {analysis.overall_score}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Overall Score</p>
                      <Badge 
                        className={cn(
                          "px-3 py-1",
                          analysis.overall_score >= 80 ? 'bg-green-500/15 text-green-400' : 
                          analysis.overall_score >= 60 ? 'bg-amber-500/15 text-amber-400' : 
                          'bg-rose-500/15 text-rose-400'
                        )}
                      >
                        {analysis.overall_score >= 80 ? 'Excellent' : 
                         analysis.overall_score >= 60 ? 'Good' : 
                         analysis.overall_score >= 40 ? 'Average' : 'Needs Work'}
                      </Badge>
                    </div>
                  </div>

                  {/* Detailed Metrics */}
                  <div className="bg-card/50 rounded-2xl border border-border/50 p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Detailed Metrics</h3>
                    <ScoreMeter label="Muscle Development" score={analysis.muscle_development} color="text-blue-400" />
                    <ScoreMeter label="Symmetry" score={analysis.symmetry} color="text-green-400" />
                    <ScoreMeter label="Definition" score={analysis.definition} color="text-amber-400" />
                    <ScoreMeter label="Mass" score={analysis.mass} color="text-rose-400" />
                    <ScoreMeter label="Conditioning" score={analysis.conditioning} color="text-purple-400" />
                  </div>
                </TabsContent>

                <TabsContent value="body-map" className="space-y-4">
                  <div className="bg-card/50 rounded-2xl border border-border/50 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-foreground">Muscle Map</h3>
                      <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
                        <Button
                          variant={viewMode === 'front' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('front')}
                          aria-pressed={viewMode === 'front'}
                          className="h-8 min-h-[32px] text-xs rounded-md focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                          Front
                        </Button>
                        <Button
                          variant={viewMode === 'back' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('back')}
                          aria-pressed={viewMode === 'back'}
                          className="h-8 min-h-[32px] text-xs rounded-md focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                    <RealisticMuscleMap 
                      muscleGroups={analysis.muscle_groups.map(group => ({
                        name: group.name,
                        score: group.score,
                        progressTrend: group.progress_trend
                      }))}
                      viewMode={viewMode}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-3">
                  <div className="bg-card/50 rounded-2xl border border-border/50 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-rose-400" aria-hidden="true" />
                      <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.recommendations.length > 0 ? (
                        analysis.recommendations.map((rec, index) => (
                          <motion.div 
                            key={index} 
                            className="p-3 rounded-xl bg-muted/30 border-l-2 border-rose-500"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <p className="text-sm text-foreground">{rec}</p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-muted-foreground">No specific recommendations yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={() => {
                  setAnalysis(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                variant="outline"
                className="w-full h-12 min-h-[48px] rounded-xl border-rose-500/30 hover:bg-rose-500/10 focus-visible:ring-2 focus-visible:ring-rose-500/50 focus-visible:ring-offset-2"
                aria-label="Analyze a new photo"
              >
                Analyze New Photo
              </Button>
            </motion.div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
};

export default PhysiqueAI;
