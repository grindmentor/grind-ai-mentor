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
  return (
    <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
      <div className="grid grid-cols-5 gap-2 items-center">
        <div className="text-center">
          <span className="text-xs text-muted-foreground block mb-1">Set</span>
          <span className="text-foreground font-medium text-sm">{setIndex + 1}</span>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground block mb-1">{weightUnit}</Label>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={set.weight || ''}
            onChange={(e) => onUpdateSet('weight', e.target.value)}
            className="bg-background/50 border-border/50 text-foreground h-9 text-sm rounded-lg"
            onBlur={(e) => e.target.blur()}
          />
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground block mb-1">Reps</Label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={set.reps || ''}
            onChange={(e) => onUpdateSet('reps', e.target.value)}
            className="bg-background/50 border-border/50 text-foreground h-9 text-sm rounded-lg"
            onBlur={(e) => e.target.blur()}
          />
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground block mb-1">RIR</Label>
          <Select
            value={getRIRFromRPE(set.rpe ?? null).toString()}
            onValueChange={(value) => {
              const rir = parseInt(value);
              const rpe = convertRIRtoRPE(rir);
              onUpdateSet('rpe', rpe);
            }}
          >
            <SelectTrigger className="bg-background/50 border-border/50 text-foreground h-9 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border rounded-xl z-50">
              <SelectItem value="0" className="text-destructive">0</SelectItem>
              <SelectItem value="1" className="text-orange-400">1</SelectItem>
              <SelectItem value="2" className="text-yellow-400">2</SelectItem>
              <SelectItem value="3" className="text-primary">3</SelectItem>
              <SelectItem value="4" className="text-green-400">4</SelectItem>
              <SelectItem value="5" className="text-muted-foreground">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-center">
          <Button
            onClick={onRemoveSet}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
});

SetRow.displayName = 'SetRow';

export default SetRow;
