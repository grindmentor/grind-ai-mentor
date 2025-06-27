
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SharedExercise {
  id: string;
  name: string;
  description?: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string;
  difficulty_level?: string;
  category: string;
  sets?: number;
  reps?: number;
  weight?: number;
  rest_seconds?: number;
}

interface ExerciseShareContextType {
  sharedExercises: SharedExercise[];
  addSharedExercise: (exercise: SharedExercise) => void;
  clearSharedExercises: () => void;
  removeSharedExercise: (exerciseId: string) => void;
}

const ExerciseShareContext = createContext<ExerciseShareContextType | undefined>(undefined);

export const useExerciseShare = () => {
  const context = useContext(ExerciseShareContext);
  if (!context) {
    throw new Error('useExerciseShare must be used within an ExerciseShareProvider');
  }
  return context;
};

interface ExerciseShareProviderProps {
  children: ReactNode;
}

export const ExerciseShareProvider: React.FC<ExerciseShareProviderProps> = ({ children }) => {
  const [sharedExercises, setSharedExercises] = useState<SharedExercise[]>([]);

  const addSharedExercise = (exercise: SharedExercise) => {
    setSharedExercises(prev => {
      // Avoid duplicates
      const exists = prev.some(ex => ex.id === exercise.id);
      if (exists) return prev;
      return [...prev, exercise];
    });
  };

  const clearSharedExercises = () => {
    setSharedExercises([]);
  };

  const removeSharedExercise = (exerciseId: string) => {
    setSharedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  return (
    <ExerciseShareContext.Provider value={{
      sharedExercises,
      addSharedExercise,
      clearSharedExercises,
      removeSharedExercise
    }}>
      {children}
    </ExerciseShareContext.Provider>
  );
};
