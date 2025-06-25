
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefillValue?: string | number;
  type?: string;
  placeholder?: string;
  className?: string;
  showPrefillSuggestion?: boolean;
  onPrefillAccept?: () => void;
}

export const SmartInput: React.FC<SmartInputProps> = ({
  label,
  value,
  onChange,
  prefillValue,
  type = 'text',
  placeholder,
  className,
  showPrefillSuggestion = true,
  onPrefillAccept
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    // Show suggestion if we have a prefill value and current value is empty
    if (prefillValue && !value && showPrefillSuggestion) {
      setShowSuggestion(true);
    } else {
      setShowSuggestion(false);
    }
  }, [prefillValue, value, showPrefillSuggestion]);

  const handleAcceptPrefill = () => {
    if (prefillValue) {
      onChange(String(prefillValue));
      setShowSuggestion(false);
      onPrefillAccept?.();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-white">{label}</Label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("bg-gray-800 border-gray-700 text-white", className)}
        />
        {showSuggestion && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                Use saved: <span className="text-orange-400 font-medium">{prefillValue}</span>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAcceptPrefill}
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 h-6 px-2"
              >
                <Check className="w-3 h-3 mr-1" />
                Use
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
