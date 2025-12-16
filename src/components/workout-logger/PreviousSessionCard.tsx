import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { WorkoutSession } from './types';
import { getRIRFromRPE, getRIRColor } from './rirHelpers';

interface PreviousSessionCardProps {
  session: WorkoutSession;
  weightUnit: string;
  onLoadSession: (session: WorkoutSession) => void;
  onSaveAsTemplate: (session: WorkoutSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const PreviousSessionCard = React.memo(({
  session,
  weightUnit,
  onLoadSession,
  onSaveAsTemplate,
  onDeleteSession
}: PreviousSessionCardProps) => {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-base truncate">{session.workout_name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(session.session_date).toLocaleDateString()} • {session.duration_minutes} min
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {session.exercises_data?.length || 0} exercises
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={() => onLoadSession(session)}
            size="sm"
            className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 h-8 text-xs rounded-lg"
          >
            Reuse
          </Button>
          <Button
            onClick={() => onSaveAsTemplate(session)}
            size="sm"
            variant="outline"
            className="border-border/50 text-muted-foreground hover:bg-muted/30 h-8 text-xs rounded-lg"
          >
            Save Template
          </Button>
          <Button
            onClick={() => onDeleteSession(session.id)}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {session.exercises_data?.map((exercise: any, idx: number) => (
          <div key={idx} className="mb-3 last:mb-0">
            <h4 className="text-sm font-medium text-foreground mb-2">{exercise.name}</h4>
            <div className="space-y-1">
              {exercise.sets?.map((set: any, setIdx: number) => (
                <div key={setIdx} className="flex items-center justify-between text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/30">
                  <span>Set {setIdx + 1}</span>
                  <span>{set.weight}{weightUnit} × {set.reps} reps</span>
                  {set.rpe && (
                    <Badge className={`${getRIRColor(getRIRFromRPE(set.rpe))} text-xs px-2 py-0.5 rounded-md`}>
                      {getRIRFromRPE(set.rpe)} RIR
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {session.notes && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-xs text-muted-foreground">{session.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
});

PreviousSessionCard.displayName = 'PreviousSessionCard';

export default PreviousSessionCard;
