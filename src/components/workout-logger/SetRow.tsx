import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { WorkoutSet } from './types';
import { getRIRFromRPE, convertRIRtoRPE } from './rirHelpers';

interface SetRowProps {
  set: WorkoutSet;
  setIndex: number;
  weightUnit: string;
  onUpdateSet: (field: keyof WorkoutSet, value: string | number) => void;
  onRemoveSet: () => void;
}

const SetRow = React.memo(({ 
  set, 
  setIndex, 
  weightUnit, 
  onUpdateSet, 
  onRemoveSet 
}: SetRowProps) => {
  const setNumber = setIndex + 1;
  const rirValue = getRIRFromRPE(set.rpe);
  
  return (
    <div 
      className="bg-muted/30 rounded-xl p-3 border border-border/30"
      role="group"
      aria-label={`Set ${setNumber}`}
    >
      <div className="grid grid-cols-5 gap-2 items-center">
        {/* Set Number */}
        <div className="text-center">
          <span className="text-xs text-muted-foreground block mb-1" aria-hidden="true">Set</span>
          <span className="text-foreground font-medium text-sm">{setNumber}</span>
        </div>
        
        {/* Weight Input */}
        <div>
          <Label 
            htmlFor={`weight-${setIndex}`}
            className="text-xs text-muted-foreground block mb-1"
          >
            {weightUnit}
          </Label>
          <Input
            id={`weight-${setIndex}`}
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={set.weight}
            onChange={(e) => onUpdateSet('weight', e.target.value)}
            className="bg-background/50 border-border/50 text-foreground h-10 text-sm rounded-lg"
            aria-label={`Weight in ${weightUnit} for set ${setNumber}`}
            min="0"
            step="0.5"
          />
        </div>
        
        {/* Reps Input */}
        <div>
          <Label 
            htmlFor={`reps-${setIndex}`}
            className="text-xs text-muted-foreground block mb-1"
          >
            Reps
          </Label>
          <Input
            id={`reps-${setIndex}`}
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={set.reps}
            onChange={(e) => onUpdateSet('reps', e.target.value)}
            className="bg-background/50 border-border/50 text-foreground h-10 text-sm rounded-lg"
            aria-label={`Repetitions for set ${setNumber}`}
            min="0"
            step="1"
          />
        </div>
        
        {/* RIR Select */}
        <div>
          <Label 
            htmlFor={`rir-${setIndex}`}
            className="text-xs text-muted-foreground block mb-1"
          >
            RIR
          </Label>
          <Select
            value={rirValue.toString()}
            onValueChange={(value) => {
              const rir = parseInt(value, 10);
              const rpe = convertRIRtoRPE(rir);
              onUpdateSet('rpe', rpe);
            }}
          >
            <SelectTrigger 
              id={`rir-${setIndex}`}
              className="bg-background/50 border-border/50 text-foreground h-10 text-xs rounded-lg"
              aria-label={`Reps in reserve for set ${setNumber}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border rounded-xl z-50">
              <SelectItem value="0" className="text-destructive">0 (Failure)</SelectItem>
              <SelectItem value="1" className="text-orange-400">1</SelectItem>
              <SelectItem value="2" className="text-yellow-400">2</SelectItem>
              <SelectItem value="3" className="text-primary">3</SelectItem>
              <SelectItem value="4" className="text-green-400">4</SelectItem>
              <SelectItem value="5" className="text-muted-foreground">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Delete Button - 44px touch target */}
        <div className="flex justify-center">
          <Button
            onClick={onRemoveSet}
            size="icon"
            variant="ghost"
            className="h-11 w-11 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
            aria-label={`Remove set ${setNumber}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

SetRow.displayName = 'SetRow';

export default SetRow;
