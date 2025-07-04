import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface WorkoutTemplate {
  id: string;
  name: string;
  program_data: {
    exercises: Array<{
      name: string;
      sets: number;
      muscleGroup?: string;
    }>;
  };
  description?: string;
}

interface WorkoutTemplateProps {
  onSelectTemplate: (template: WorkoutTemplate) => void;
  className?: string;
}

const WorkoutTemplateSelector = ({ onSelectTemplate, className }: WorkoutTemplateProps) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load workout templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      onSelectTemplate(template);
      setSelectedTemplate('');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('training_programs')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  if (!user || templates.length === 0) {
    return null;
  }

  return (
    <Card className={`bg-gray-900/40 backdrop-blur-sm border-gray-700/50 ${className}`}>
      <CardContent className="p-4 space-y-4">
        <h3 className="text-white font-semibold flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Select Workout Template
        </h3>
        
        <div className="flex gap-2">
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white flex-1">
              <SelectValue placeholder="Choose a saved template..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id} className="text-white">
                  <div className="flex items-center justify-between w-full">
                    <span>{template.name}</span>
                    <Badge className="ml-2 bg-orange-500/20 text-orange-400 text-xs">
                      {template.program_data?.exercises?.length || 0} exercises
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleSelectTemplate}
            disabled={!selectedTemplate}
            size="sm"
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/40 whitespace-nowrap"
          >
            Load Template
          </Button>
        </div>

        {selectedTemplate && (
          <div className="space-y-2">
            {(() => {
              const template = templates.find(t => t.id === selectedTemplate);
              return template ? (
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{template.name}</h4>
                    <Button
                      onClick={() => deleteTemplate(template.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {template.description && (
                    <p className="text-gray-400 text-sm mb-2">{template.description}</p>
                  )}
                  <div className="space-y-1">
                    {template.program_data?.exercises?.map((exercise, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{exercise.name}</span>
                        <span className="text-gray-500">{exercise.sets} sets</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutTemplateSelector;