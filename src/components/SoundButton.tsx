
import { Button } from "@/components/ui/button";
import { SoundEffects } from "@/utils/soundEffects";
import { forwardRef } from "react";

interface SoundButtonProps extends React.ComponentProps<typeof Button> {
  playSound?: boolean;
  soundType?: 'click' | 'success' | 'error';
}

export const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ onClick, playSound = true, soundType = 'click', ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (playSound) {
        switch (soundType) {
          case 'success':
            SoundEffects.playSuccess();
            break;
          case 'error':
            SoundEffects.playError();
            break;
          default:
            SoundEffects.playClick();
        }
      }
      
      if (onClick) {
        onClick(event);
      }
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

SoundButton.displayName = "SoundButton";
