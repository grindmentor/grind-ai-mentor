
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  difficulty_level: string;
  category: string;
  is_custom?: boolean;
}

interface ExerciseShareContextType {
  sharedExercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  clearExercises: () => void;
  removeExercise: (exerciseId: string) => void;
}

const ExerciseShareContext = createContext<ExerciseShareContextType | undefined>(undefined);

interface ExerciseShareProviderProps {
  children: ReactNode;
}

export const ExerciseShareProvider: React.FC<ExerciseShareProviderProps> = ({ children }) => {
  const [sharedExercises, setSharedExercises] = useState<Exercise[]>([]);

  const addExercise = (exercise: Exercise) => {
    setSharedExercises(prev => {
      // Avoid duplicates
      if (prev.some(ex => ex.id === exercise.id)) {
        return prev;
      }
      return [...prev, exercise];
    });
  };

  const clearExercises = () => {
    setSharedExercises([]);
  };

  const removeExercise = (exerciseId: string) => {
    setSharedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  return (
    <ExerciseShareContext.Provider value={{
      sharedExercises,
      addExercise,
      clearExercises,
      removeExercise
    }}>
      {children}
    </ExerciseShareContext.Provider>
  );
};

export const useExerciseShare = () => {
  const context = useContext(ExerciseShareContext);
  if (context === undefined) {
    throw new Error('useExerciseShare must be used within an ExerciseShareProvider');
  }
  return context;
};
