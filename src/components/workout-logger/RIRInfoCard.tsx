import React from 'react';
import { Info } from 'lucide-react';

const RIRInfoCard = React.memo(() => {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="text-foreground font-semibold mb-2 text-sm">About RIR (Reps in Reserve)</h3>
          <p className="text-muted-foreground text-xs mb-3 leading-relaxed">
            RIR indicates how many more reps you could have performed. It's a more intuitive way to track effort than RPE.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-destructive">• 0 RIR: Absolute failure</div>
            <div className="text-orange-400">• 1 RIR: Very close to failure</div>
            <div className="text-yellow-400">• 2 RIR: Hard, 2 reps left</div>
            <div className="text-primary">• 3+ RIR: Moderate effort</div>
          </div>
        </div>
      </div>
    </div>
  );
});

RIRInfoCard.displayName = 'RIRInfoCard';

export default RIRInfoCard;
