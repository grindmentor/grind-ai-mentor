import React from 'react';
import { AlertTriangle, Shield, Heart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LegalDisclaimersProps {
  context?: 'fitness' | 'nutrition' | 'medical' | 'general';
  compact?: boolean;
}

export const LegalDisclaimers: React.FC<LegalDisclaimersProps> = ({ 
  context = 'general', 
  compact = false 
}) => {
  const getContextualDisclaimer = () => {
    switch (context) {
      case 'fitness':
        return {
          icon: <Heart className="w-4 h-4" />,
          title: "Fitness Guidance Disclaimer",
          content: "This AI-generated fitness guidance is for informational purposes only and should not replace professional medical advice. Consult with a healthcare provider before starting any exercise program. Individual results may vary based on personal factors including age, fitness level, and health conditions."
        };
      
      case 'nutrition':
        return {
          icon: <Shield className="w-4 h-4" />,
          title: "Nutritional Information Notice",
          content: "Nutritional recommendations are estimates based on general guidelines and should not replace personalized dietary advice from a registered dietitian or healthcare provider. Always consider your individual dietary needs, allergies, and medical conditions."
        };
      
      case 'medical':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          title: "Medical Disclaimer",
          content: "This app is not a medical device and does not provide medical diagnosis, treatment, or advice. All health-related information is for educational purposes only. Always consult qualified healthcare professionals for medical concerns."
        };
      
      default:
        return {
          icon: <Shield className="w-4 h-4" />,
          title: "General Disclaimer",
          content: "Information provided by Myotopia is for educational and informational purposes only. Results are not guaranteed and may vary by individual. This service does not replace professional advice from qualified experts."
        };
    }
  };

  const disclaimer = getContextualDisclaimer();

  if (compact) {
    return (
      <div className="text-xs text-gray-500 bg-gray-900/50 rounded p-2 border border-gray-800/50">
        <p className="flex items-start gap-1">
          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>
            Results are estimates and not medical advice. Consult professionals for personalized guidance.
          </span>
        </p>
      </div>
    );
  }

  return (
    <Alert className="bg-yellow-500/10 border-yellow-500/30 text-yellow-200">
      <div className="flex items-start gap-2">
        <div className="text-yellow-400 mt-0.5">
          {disclaimer.icon}
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-yellow-300 text-sm">
            {disclaimer.title}
          </h4>
          <AlertDescription className="text-yellow-200/90 text-xs leading-relaxed">
            {disclaimer.content}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export const CompactDisclaimer: React.FC = () => (
  <LegalDisclaimers compact />
);

export const FitnessDisclaimer: React.FC = () => (
  <LegalDisclaimers context="fitness" />
);

export const NutritionDisclaimer: React.FC = () => (
  <LegalDisclaimers context="nutrition" />
);

export const MedicalDisclaimer: React.FC = () => (
  <LegalDisclaimers context="medical" />
);