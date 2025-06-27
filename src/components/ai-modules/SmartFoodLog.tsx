
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, Upload, Utensils, Sparkles, MessageSquare, Send, X, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/ui/page-transition";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileOptimized, TouchButton } from "@/components/ui/mobile-optimized";
import { SmoothTransition } from "@/components/ui/smooth-transition";
import { AITypingIndicator } from "@/components/ui/ai-typing-indicator";

interface SmartFoodLogProps {
  onBack: () => void;
  onFoodLogged?: (data: any) => void;
}

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  image_url?: string;
}

const SmartFoodLog: React.FC<SmartFoodLogProps> = ({ onBack, onFoodLogged }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [manualEntry, setManualEntry] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: ''
  });
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !user) {
      toast({
        title: "No image selected",
        description: "Please select an image to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('analyze-food-image', {
          body: {
            image: base64Image,
            userId: user.id
          }
        });

        if (error) throw error;

        if (data && data.analysis) {
          const analysisData = data.analysis;
          const newEntry: FoodEntry = {
            id: Date.now().toString(),
            name: analysisData.name || 'Unknown Food',
            calories: analysisData.calories || 0,
            protein: analysisData.protein || 0,
            carbs: analysisData.carbs || 0,
            fat: analysisData.fat || 0,
            notes: analysisData.notes || '',
            image_url: imagePreview
          };

          setFoodEntries(prev => [...prev, newEntry]);
          
          toast({
            title: "Food analyzed! 🍽️",
            description: `Added ${newEntry.name} with ${newEntry.calories} calories`,
          });

          // Clear image
          setSelectedImage(null);
          setImagePreview('');
          
          if (onFoodLogged) {
            onFoodLogged(newEntry);
          }
        }
      };
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis failed",
        description: "Could not analyze the image. Please try again or enter manually.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addManualEntry = () => {
    if (!manualEntry.name.trim()) {
      toast({
        title: "Food name required",
        description: "Please enter a food name",
        variant: "destructive"
      });
      return;
    }

    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      name: manualEntry.name,
      calories: parseInt(manualEntry.calories) || 0,
      protein: parseFloat(manualEntry.protein) || 0,
      carbs: parseFloat(manualEntry.carbs) || 0,
      fat: parseFloat(manualEntry.fat) || 0,
      notes: manualEntry.notes
    };

    setFoodEntries(prev => [...prev, newEntry]);
    
    // Reset form
    setManualEntry({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      notes: ''
    });

    toast({
      title: "Food logged! 📝",
      description: `Added ${newEntry.name} to your food log`,
    });

    if (onFoodLogged) {
      onFoodLogged(newEntry);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { type: 'user', message: userMessage }]);
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('fitness-ai', {
        body: {
          message: userMessage,
          context: 'nutrition_coach'
        }
      });

      if (error) throw error;

      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        message: data.response || "I'm here to help with nutrition questions!"
      }]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatMessages(prev => [...prev, { 
        type: 'ai', 
        message: "Sorry, I'm having trouble responding right now. Please try again."
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <MobileOptimized className="min-h-screen bg-gradient-to-br from-black via-green-900/10 to-emerald-800/20 text-white">
      {/* Mobile-optimized Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <TouchButton
              onClick={onBack}
              className="text-white hover:bg-green-500/20 backdrop-blur-sm hover:text-green-400 transition-all duration-200 font-medium flex items-center space-x-2 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </TouchButton>
            
            <h1 className="text-lg font-semibold text-center flex-1 px-4 truncate">
              Smart Food Log
            </h1>
            
            <TouchButton
              onClick={() => setShowAIChat(!showAIChat)}
              className="border border-green-500/30 text-green-400 hover:bg-green-500/20 px-3 py-2 rounded-lg font-medium transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4" />
            </TouchButton>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Image Upload Section */}
        <SmoothTransition show={true} type="slideUp">
          <Card className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 backdrop-blur-sm border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-lg">
                <Camera className="w-5 h-5 mr-2 text-green-400" />
                Analyze Food Image
              </CardTitle>
              <CardDescription className="text-green-200/70">
                Take or upload a photo for instant nutritional analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                capture="environment"
              />
              
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      className="w-full h-48 sm:h-64 object-cover rounded-xl border border-green-500/30"
                    />
                    <TouchButton
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 p-2 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </TouchButton>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <TouchButton
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 h-12 text-base font-medium"
                    >
                      {isAnalyzing ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze Food
                        </>
                      )}
                    </TouchButton>
                    
                    <TouchButton
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-green-500/30 text-green-400 hover:bg-green-500/20 h-12 px-6"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Replace
                    </TouchButton>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TouchButton
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30 h-20 flex flex-col items-center justify-center space-y-2 rounded-xl"
                  >
                    <Camera className="w-8 h-8" />
                    <span className="text-sm font-medium">Take Photo</span>
                  </TouchButton>
                  
                  <TouchButton
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 h-20 flex flex-col items-center justify-center space-y-2 rounded-xl"
                  >
                    <Upload className="w-8 h-8" />
                    <span className="text-sm font-medium">Upload Image</span>
                  </TouchButton>
                </div>
              )}

              {isAnalyzing && (
                <AITypingIndicator 
                  isVisible={true} 
                  message="Analyzing nutritional content..." 
                  variant="shimmer"
                />
              )}
            </CardContent>
          </Card>
        </SmoothTransition>

        {/* Manual Entry Section */}
        <SmoothTransition show={true} type="slideUp">
          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-600/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-lg">
                <Utensils className="w-5 h-5 mr-2 text-green-400" />
                Manual Entry
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter food details manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Food name"
                  value={manualEntry.name}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600/50 text-white focus:border-green-400 h-12"
                />
                <Input
                  type="number"
                  placeholder="Calories"
                  value={manualEntry.calories}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, calories: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600/50 text-white focus:border-green-400 h-12"
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Protein (g)"
                  value={manualEntry.protein}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, protein: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600/50 text-white focus:border-green-400 h-12"
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Carbs (g)"
                  value={manualEntry.carbs}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, carbs: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600/50 text-white focus:border-green-400 h-12"
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Fat (g)"
                  value={manualEntry.fat}
                  onChange={(e) => setManualEntry(prev => ({ ...prev, fat: e.target.value }))}
                  className="bg-gray-800/50 border-gray-600/50 text-white focus:border-green-400 h-12"
                />
              </div>
              
              <Textarea
                placeholder="Notes (optional)"
                value={manualEntry.notes}
                onChange={(e) => setManualEntry(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-gray-800/50 border-gray-600/50 text-white focus:border-green-400 resize-none"
                rows={2}
              />
              
              <TouchButton
                onClick={addManualEntry}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-12 text-base font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Food Entry
              </TouchButton>
            </CardContent>
          </Card>
        </SmoothTransition>

        {/* Food Entries List */}
        {foodEntries.length > 0 && (
          <SmoothTransition show={true} type="slideUp">
            <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-600/50">
              <CardHeader>
                <CardTitle className="text-white">Today's Food Log</CardTitle>
                <CardDescription className="text-gray-400">
                  {foodEntries.length} entries • {foodEntries.reduce((sum, entry) => sum + entry.calories, 0)} total calories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {foodEntries.map((entry) => (
                    <div key={entry.id} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold">{entry.name}</h3>
                        <span className="text-green-400 font-medium">{entry.calories} cal</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span>🥩 {entry.protein}g protein</span>
                        <span>🍞 {entry.carbs}g carbs</span>
                        <span>🥑 {entry.fat}g fat</span>
                      </div>
                      {entry.notes && (
                        <p className="text-gray-300 text-sm mt-2">{entry.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SmoothTransition>
        )}
      </div>

      {/* AI Chat Sidebar */}
      <SmoothTransition show={showAIChat} type="slide">
        <div className="fixed top-0 right-0 h-full w-full sm:w-80 bg-gray-900/95 backdrop-blur-md border-l border-gray-800 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-green-400" />
              Nutrition AI
            </h2>
            <TouchButton 
              onClick={() => setShowAIChat(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </TouchButton>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((message, index) => (
              <SmoothTransition key={index} show={true} type="slideUp">
                <div className={`p-3 rounded-xl max-w-[85%] ${
                  message.type === 'user' 
                    ? 'bg-green-600/30 text-white ml-auto' 
                    : 'bg-gray-800/50 text-gray-100'
                }`}>
                  <p className="text-sm leading-relaxed">{message.message}</p>
                </div>
              </SmoothTransition>
            ))}
            
            <AITypingIndicator 
              isVisible={chatLoading} 
              message="Nutrition AI is thinking..." 
              variant="shimmer"
            />
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Ask about nutrition..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 h-12 rounded-xl"
              />
              <TouchButton
                onClick={sendChatMessage}
                className="bg-green-600 hover:bg-green-700 p-3 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </TouchButton>
            </div>
          </div>
        </div>
      </SmoothTransition>
    </MobileOptimized>
  );
};

export default SmartFoodLog;
