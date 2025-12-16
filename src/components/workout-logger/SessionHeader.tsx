import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock } from 'lucide-react';

interface SessionHeaderProps {
  workoutName: string;
  workoutNotes: string;
  startTime: number;
  onWorkoutNameChange: (name: string) => void;
  onWorkoutNotesChange: (notes: string) => void;
}

const SessionHeader = React.memo(({
  workoutName,
  workoutNotes,
  startTime,
  onWorkoutNameChange,
  onWorkoutNotesChange
}: SessionHeaderProps) => {
  // Live duration update every 30 seconds
  const [durationMinutes, setDurationMinutes] = useState(() => 
    Math.floor((Date.now() - startTime) / (1000 * 60))
  );

  useEffect(() => {
    // Update immediately
    setDurationMinutes(Math.floor((Date.now() - startTime) / (1000 * 60)));
    
    // Then update every 30 seconds
    const interval = setInterval(() => {
      setDurationMinutes(Math.floor((Date.now() - startTime) / (1000 * 60)));
    }, 30000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label 
            htmlFor="workout-name" 
            className="text-foreground mb-2 block text-sm font-medium"
          >
            Workout Name
          </Label>
          <Input
            id="workout-name"
            placeholder="e.g., Push Day, Leg Day"
            value={workoutName}
            onChange={(e) => onWorkoutNameChange(e.target.value)}
            className="bg-background/50 border-border/50 text-foreground rounded-xl h-11"
            autoComplete="off"
            aria-describedby="workout-name-hint"
          />
          <span id="workout-name-hint" className="sr-only">
            Enter a name for your workout session
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground" role="timer" aria-live="polite">
          <Clock className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm">
            Duration: {durationMinutes} min
          </span>
        </div>
      </div>
      
      <div>
        <Label 
          htmlFor="workout-notes" 
          className="text-foreground mb-2 block text-sm font-medium"
        >
          Notes (Optional)
        </Label>
        <Textarea
          id="workout-notes"
          placeholder="How did the workout feel? Any observations?"
          value={workoutNotes}
          onChange={(e) => onWorkoutNotesChange(e.target.value)}
          className="bg-background/50 border-border/50 text-foreground rounded-xl resize-none"
          rows={2}
          aria-describedby="workout-notes-hint"
        />
        <span id="workout-notes-hint" className="sr-only">
          Add optional notes about your workout
        </span>
      </div>
    </div>
  );
});

SessionHeader.displayName = 'SessionHeader';

export default SessionHeader;
