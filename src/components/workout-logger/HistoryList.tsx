import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import PreviousSessionCard from './PreviousSessionCard';
import { WorkoutSession } from './types';

interface HistoryListProps {
  sessions: WorkoutSession[];
  isLoading: boolean;
  weightUnit: string;
  onLoadSession: (session: WorkoutSession) => void;
  onSaveAsTemplate: (session: WorkoutSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

const HistoryList = React.memo(({
  sessions,
  isLoading,
  weightUnit,
  onLoadSession,
  onSaveAsTemplate,
  onDeleteSession
}: HistoryListProps) => {
  return (
    <section className="space-y-4" aria-label="Workout history">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Previous Sessions</h2>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
          {sessions.length} logged
        </Badge>
      </div>

      {isLoading ? (
        <div className="p-8 flex justify-center" role="status" aria-label="Loading workout history">
          <LoadingSpinner size="lg" text="Loading workout history..." />
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-card/30 border border-border/30 rounded-2xl p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" aria-hidden="true" />
          <h3 className="text-base font-medium text-foreground mb-2">No Previous Sessions</h3>
          <p className="text-muted-foreground text-sm">
            Start logging workouts to see your training history here.
          </p>
        </div>
      ) : (
        <div className="space-y-3" role="feed" aria-label="Previous workout sessions">
          {sessions.map((session) => (
            <PreviousSessionCard
              key={session.id}
              session={session}
              weightUnit={weightUnit}
              onLoadSession={onLoadSession}
              onSaveAsTemplate={onSaveAsTemplate}
              onDeleteSession={onDeleteSession}
            />
          ))}
        </div>
      )}
    </section>
  );
});

HistoryList.displayName = 'HistoryList';

export default HistoryList;
