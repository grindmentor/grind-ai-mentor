import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealisticMuscleMap } from '@/components/ui/realistic-muscle-map';
import { HexagonProgress } from '@/components/ui/hexagon-progress';
import { Camera, Upload, Zap, TrendingUp, Target, Activity, Eye, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AppShell } from '@/components/ui/app-shell';

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
  const { uploadPhoto, isUploading, uploadProgress } = usePhotoUpload();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PhysiqueAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const analyzePhysique = async () => {
    if (!selectedFile || !user) return;

    setIsAnalyzing(true);
    
    try {
      // Upload photo to storage first
      const photoUrl = await uploadPhoto(selectedFile, {
        bucket: 'physique-photos',
        maxSizeMB: 50,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
      });

      if (!photoUrl) {
        setIsAnalyzing(false);
        return;
      }

      // Call AI analysis function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-physique', {
        body: { 
          imageUrl: photoUrl,
          userId: user.id 
        }
      });

      // Handle error response from edge function
      if (analysisError) {
        throw new Error(analysisError.message || 'Analysis failed');
      }
      
      // Check for error in response data (403, 429, etc.)
      if (analysisData?.error) {
        toast.error(analysisData.error);
        setIsAnalyzing(false);
        return;
      }

      // Validate analysis data
      if (!analysisData?.analysis) {
        throw new Error('Invalid analysis response');
      }

      const result = analysisData.analysis;

      // Store analysis in database
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          file_url: photoUrl,
          file_name: selectedFile.name,
          analysis_result: JSON.stringify(result),
          photo_type: 'physique_analysis',
          taken_date: new Date().toISOString().split('T')[0]
        });

      if (dbError) throw dbError;

      // Map the response to our component's expected format
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
      console.error('Analysis error:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze physique. Please try again.';
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hexagonMetrics = analysis ? [
    { label: 'Development', value: analysis.muscle_development, color: '#3B82F6' },
    { label: 'Symmetry', value: analysis.symmetry, color: '#10B981' },
    { label: 'Definition', value: analysis.definition, color: '#F59E0B' },
    { label: 'Mass', value: analysis.mass, color: '#EF4444' },
    { label: 'Conditioning', value: analysis.conditioning, color: '#8B5CF6' },
    { label: 'Overall', value: analysis.overall_score, color: '#06B6D4' }
  ] : [];

  return (
    <AppShell title="Physique AI" showBackButton>
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/10 to-blue-900/20 p-4 space-y-6">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Physique AI
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Advanced AI-powered physique analysis using computer vision to assess muscle development, 
            symmetry, and provide personalized recommendations.
          </p>
        </motion.div>

        {/* Upload Section */}
        {!analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Upload Your Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-purple-500" />
                        <div>
                          <p className="font-medium">Click to upload photo</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG up to 10MB
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    {selectedFile && (
                    <Button 
                      onClick={analyzePhysique}
                      disabled={isAnalyzing || isUploading}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    >
                      {isUploading ? (
                        <>
                          <Zap className="h-4 w-4 mr-2 animate-pulse" />
                          Uploading {uploadProgress}%...
                        </>
                      ) : isAnalyzing ? (
                        <>
                          <Zap className="h-4 w-4 mr-2 animate-pulse" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analyze Physique
                        </>
                      )}
                    </Button>
                    )}
                  </div>
                  
                  {previewUrl && (
                    <div className="space-y-2">
                      <p className="font-medium">Preview</p>
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-64 object-cover rounded-lg border border-purple-500/20"
                      />
                    </div>
                  )}
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Tips for Best Results:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use good lighting with even shadows</li>
                    <li>• Stand in relaxed pose facing camera</li>
                    <li>• Wear minimal, form-fitting clothing</li>
                    <li>• Keep background simple and uncluttered</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="body-map">Body Map</TabsTrigger>
                <TabsTrigger value="recommendations">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Overall Score */}
                  <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Overall Physique Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-4">
                        <div className="text-4xl font-bold text-purple-400">
                          {analysis.overall_score}/100
                        </div>
                        <Progress value={analysis.overall_score} className="h-3" />
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                          {analysis.overall_score >= 80 ? 'Excellent' : 
                           analysis.overall_score >= 60 ? 'Good' : 
                           analysis.overall_score >= 40 ? 'Average' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hexagon Chart */}
                  <Card className="bg-card/50 backdrop-blur border-blue-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Detailed Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {hexagonMetrics.map((metric, index) => (
                          <HexagonProgress 
                            key={metric.label}
                            score={metric.value} 
                            size="medium" 
                            label={metric.label}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Individual Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {hexagonMetrics.slice(0, 5).map((metric, index) => (
                    <Card key={metric.label} className="bg-card/30 backdrop-blur">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold" style={{ color: metric.color }}>
                          {metric.value}
                        </div>
                        <div className="text-sm text-muted-foreground">{metric.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="body-map" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Muscle Development Map
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'front' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('front')}
                      >
                        Front View
                      </Button>
                      <Button
                        variant={viewMode === 'back' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('back')}
                      >
                        Back View
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RealisticMuscleMap 
                      muscleGroups={analysis.muscle_groups.map(group => ({
                        name: group.name,
                        score: group.score,
                        progressTrend: group.progress_trend
                      }))}
                      viewMode={viewMode}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <Card className="bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/50 border-l-4 border-purple-500">
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  setAnalysis(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                variant="outline"
                className="border-purple-500/30 hover:bg-purple-500/10"
              >
                Analyze New Photo
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
};

export default PhysiqueAI;