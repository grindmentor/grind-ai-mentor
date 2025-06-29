
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FoodPhotoLoggerProps {
  onAnalysisComplete?: (results: any) => void;
}

export const FoodPhotoLogger: React.FC<FoodPhotoLoggerProps> = ({ onAnalysisComplete }) => {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const analyzePhoto = async () => {
    if (!selectedPhoto || !user) return;

    setIsAnalyzing(true);
    try {
      // Create FormData for photo upload
      const formData = new FormData();
      formData.append('photo', selectedPhoto);

      // Call Supabase edge function for photo analysis
      const { data, error } = await supabase.functions.invoke('analyze-photo', {
        body: formData,
      });

      if (error) throw error;

      // Mock analysis results for now
      const mockResults = {
        foods: [
          { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
          { name: 'White Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
          { name: 'Steamed Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 }
        ],
        confidence: 0.85
      };

      toast.success('Photo analyzed successfully!');
      
      if (onAnalysisComplete) {
        onAnalysisComplete(mockResults);
      }

      // Reset state
      setSelectedPhoto(null);
      setPreviewUrl('');
      
    } catch (error) {
      console.error('Photo analysis error:', error);
      toast.error('Failed to analyze photo. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/30 backdrop-blur-sm border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Camera className="w-5 h-5 mr-2 text-orange-400" />
          Food Photo Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-orange-200 mb-2">
              Upload Food Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="w-full p-2 bg-orange-800/50 border border-orange-500/30 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-orange-600 file:text-white hover:file:bg-orange-700"
            />
          </div>

          {previewUrl && (
            <div className="space-y-3">
              <img
                src={previewUrl}
                alt="Food preview"
                className="w-full h-48 object-cover rounded-lg border border-orange-500/30"
              />
              <div className="text-sm text-orange-300">
                📸 {selectedPhoto?.name} ({(selectedPhoto?.size || 0 / 1024 / 1024).toFixed(2)} MB)
              </div>
            </div>
          )}

          {selectedPhoto && (
            <Button
              onClick={analyzePhoto}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Photo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Analyze Food Items
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodPhotoLogger;
