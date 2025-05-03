
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { PotteryRecord, StageData, StageType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StageForm from './StageForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { uploadMedia } from '@/utils/storageUtils';

interface PotteryFormProps {
  pottery?: PotteryRecord;
  isEditing?: boolean;
}

const PotteryForm = ({ pottery, isEditing = false }: PotteryFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState(pottery?.title || '');
  const [stages, setStages] = useState({
    greenware: pottery?.stages.greenware || {},
    bisque: pottery?.stages.bisque || {},
    final: pottery?.stages.final || {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStageChange = (stageType: StageType, data: StageData) => {
    setStages(prev => ({
      ...prev,
      [stageType]: data
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for your pottery');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to save pottery records');
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const potteryId = pottery?.id || uuidv4();
      
      // Process any file uploads and get public URLs
      const updatedStages = { ...stages };
      
      for (const stageType of ['greenware', 'bisque', 'final'] as StageType[]) {
        const stageData = stages[stageType];
        
        // Check if media is a File object and upload it
        if (stageData.media instanceof File) {
          const mediaUrl = await uploadMedia(stageData.media, user.id, `${potteryId}-${stageType}`);
          if (mediaUrl) {
            updatedStages[stageType] = {
              ...stageData,
              media: mediaUrl
            };
          }
        }
      }

      // Save pottery record to Supabase
      if (isEditing && pottery) {
        // Update existing pottery record
        const { error: recordError } = await supabase
          .from('pottery_records')
          .update({
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', potteryId);

        if (recordError) {
          throw recordError;
        }
      } else {
        // Insert new pottery record
        const { error: recordError } = await supabase
          .from('pottery_records')
          .insert({
            id: potteryId,
            user_id: user.id,
            title
          });

        if (recordError) {
          throw recordError;
        }
      }

      // Update or insert each stage
      for (const stageType of ['greenware', 'bisque', 'final'] as StageType[]) {
        const stageData = updatedStages[stageType];
        
        // Skip if no data for this stage
        if (Object.keys(stageData).length === 0) continue;
        
        // Check if stage already exists
        const { data: existingStage } = await supabase
          .from('pottery_stages')
          .select('id')
          .eq('pottery_id', potteryId)
          .eq('stage_type', stageType)
          .single();
        
        // Prepare stage data for database
        const dbStageData = {
          weight: stageData.weight || null,
          media_url: typeof stageData.media === 'string' ? stageData.media : null,
          dimension: stageData.dimension || null,
          description: stageData.description || null,
          decoration: stageData.decoration || null,
          updated_at: new Date().toISOString()
        };
        
        if (existingStage) {
          // Update existing stage
          const { error: stageError } = await supabase
            .from('pottery_stages')
            .update(dbStageData)
            .eq('id', existingStage.id);
          
          if (stageError) {
            throw stageError;
          }
        } else if (Object.values(stageData).some(value => value !== undefined && value !== '')) {
          // Insert new stage if there's actual data
          const { error: stageError } = await supabase
            .from('pottery_stages')
            .insert({
              pottery_id: potteryId,
              stage_type: stageType,
              ...dbStageData
            });
          
          if (stageError) {
            throw stageError;
          }
        }
      }
      
      toast.success(isEditing ? 'Pottery record updated successfully' : 'Pottery record created successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving pottery record:', error);
      toast.error('Failed to save pottery record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-lg font-medium">Pottery Title</Label>
        <Input
          id="title"
          placeholder="e.g. Blue Coffee Mug"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg"
          required
        />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Stages</h2>
        <p className="text-muted-foreground text-sm">
          Fill in details for any or all stages of your pottery process.
        </p>
        
        <StageForm 
          type="greenware" 
          stageData={stages.greenware}
          onChange={handleStageChange}
        />
        
        <StageForm 
          type="bisque" 
          stageData={stages.bisque}
          onChange={handleStageChange}
        />
        
        <StageForm 
          type="final" 
          stageData={stages.final}
          onChange={handleStageChange}
        />
      </div>
      
      <div className="pt-4 pb-16">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Pottery Record' : 'Create Pottery Record')}
        </Button>
      </div>
    </form>
  );
};

export default PotteryForm;
