
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Edit3 } from 'lucide-react';

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size: string;
  isCustom?: boolean;
}

interface SmartFoodLogEntryProps {
  entry: FoodEntry;
  onUpdate: (updatedEntry: FoodEntry) => void;
  onRemove: (entryId: string) => void;
}

const SmartFoodLogEntry: React.FC<SmartFoodLogEntryProps> = ({
  entry,
  onUpdate,
  onRemove
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(entry);

  const handleSave = () => {
    onUpdate(editedEntry);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEntry(entry);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <Label className="text-gray-300">Food Name</Label>
              <Input
                value={editedEntry.food_name}
                onChange={(e) => setEditedEntry({ ...editedEntry, food_name: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-gray-300">Portion</Label>
                <Input
                  value={editedEntry.portion_size}
                  onChange={(e) => setEditedEntry({ ...editedEntry, portion_size: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Calories</Label>
                <Input
                  type="number"
                  value={editedEntry.calories}
                  onChange={(e) => setEditedEntry({ ...editedEntry, calories: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-gray-300">Protein (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editedEntry.protein}
                  onChange={(e) => setEditedEntry({ ...editedEntry, protein: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Carbs (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editedEntry.carbs}
                  onChange={(e) => setEditedEntry({ ...editedEntry, carbs: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Fat (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editedEntry.fat}
                  onChange={(e) => setEditedEntry({ ...editedEntry, fat: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Save
              </Button>
              <Button
                onClick={handleCancel}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-white">{entry.food_name}</h4>
              {entry.isCustom && (
                <span className="text-blue-400 text-sm">✏️</span>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-2">{entry.portion_size}</p>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Calories:</span>
                <span className="text-orange-400 font-medium ml-1">{entry.calories}</span>
              </div>
              <div>
                <span className="text-gray-400">Protein:</span>
                <span className="text-green-400 font-medium ml-1">{entry.protein}g</span>
              </div>
              <div>
                <span className="text-gray-400">Carbs:</span>
                <span className="text-yellow-400 font-medium ml-1">{entry.carbs}g</span>
              </div>
              <div>
                <span className="text-gray-400">Fat:</span>
                <span className="text-purple-400 font-medium ml-1">{entry.fat}g</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-1 ml-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 h-8 w-8"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(entry.id)}
              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartFoodLogEntry;
