
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Move } from 'lucide-react';
import { MobileHeader } from '@/components/MobileHeader';

interface StretchingGuideProps {
  onBack: () => void;
}

const StretchingGuide: React.FC<StretchingGuideProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/50 to-pink-900/30">
      <MobileHeader title="Stretching Guide" onBack={onBack} />
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-pink-900/20 to-rose-900/30 backdrop-blur-sm border-pink-500/30">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500/30 to-rose-500/40 rounded-xl flex items-center justify-center border border-pink-500/30">
                <Move className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Stretching Guide</CardTitle>
                <CardDescription className="text-pink-200/80">
                  Comprehensive mobility and flexibility routines for better recovery
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-white mb-4">Improve Your Flexibility</h3>
              <p className="text-pink-200/80 mb-6">
                Follow guided stretching routines to enhance mobility and recovery.
              </p>
              <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white">
                Start Stretching Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StretchingGuide;
