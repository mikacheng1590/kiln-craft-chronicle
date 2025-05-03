
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { PotteryRecord, StageData, StageType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StageForm from './StageForm';
import { toast } from 'sonner';

interface PotteryFormProps {
  pottery?: PotteryRecord;
  isEditing?: boolean;
}

const PotteryForm = ({ pottery, isEditing = false }: PotteryFormProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(pottery?.title || '');
  const [stages, setStages] = useState({
    greenware: pottery?.stages.greenware || {},
    bisque: pottery?.stages.bisque || {},
    final: pottery?.stages.final || {},
  });

  const handleStageChange = (stageType: StageType, data: StageData) => {
    setStages(prev => ({
      ...prev,
      [stageType]: data
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title for your pottery');
      return;
    }
    
    // In a real app, we'd call the API to save the pottery record
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        toast.error('You must be logged in to save pottery records');
        navigate('/login');
        return;
      }
      
      const userData = JSON.parse(user);
      
      const potteryRecord: PotteryRecord = {
        id: pottery?.id || uuidv4(),
        title,
        createdAt: pottery?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: userData.id,
        stages,
      };
      
      // In a real app, this would be an API call
      // For now, we'll simulate by storing in localStorage
      const existingRecords = JSON.parse(localStorage.getItem('potteryRecords') || '[]');
      
      if (isEditing) {
        const updatedRecords = existingRecords.map((record: PotteryRecord) => 
          record.id === potteryRecord.id ? potteryRecord : record
        );
        localStorage.setItem('potteryRecords', JSON.stringify(updatedRecords));
        toast.success('Pottery record updated successfully');
      } else {
        existingRecords.push(potteryRecord);
        localStorage.setItem('potteryRecords', JSON.stringify(existingRecords));
        toast.success('Pottery record created successfully');
      }
      
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save pottery record');
      console.error(error);
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
        <Button type="submit" className="w-full">
          {isEditing ? 'Update Pottery Record' : 'Create Pottery Record'}
        </Button>
      </div>
    </form>
  );
};

export default PotteryForm;
