
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PotteryRecord, StageType } from '@/types';
import PotteryForm from '@/components/PotteryForm';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const EditPottery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pottery, setPottery] = useState<PotteryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPottery = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch pottery record
        const { data: record, error } = await supabase
          .from('pottery_records')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            toast.error('Pottery record not found');
            navigate('/dashboard');
            return;
          }
          throw error;
        }
        
        // Fetch stages for this pottery
        const { data: stagesData, error: stagesError } = await supabase
          .from('pottery_stages')
          .select('*')
          .eq('pottery_id', id);
        
        if (stagesError) throw stagesError;
        
        // Format stages by type
        const formattedStages = {
          greenware: {},
          bisque: {},
          final: {}
        };
        
        stagesData.forEach(stage => {
          formattedStages[stage.stage_type as StageType] = {
            weight: stage.weight,
            media: stage.media_url,
            dimension: stage.dimension,
            description: stage.description,
            decoration: stage.decoration
          };
        });
        
        setPottery({
          id: record.id,
          title: record.title,
          createdAt: record.created_at,
          updatedAt: record.updated_at,
          userId: record.user_id,
          stages: formattedStages
        });
      } catch (error) {
        console.error('Error fetching pottery record:', error);
        toast.error('Failed to load pottery record');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPottery();
  }, [id, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <h1 className="text-2xl font-bold">Edit Pottery Record</h1>
      </header>
      
      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p>Loading pottery record...</p>
          </div>
        ) : pottery ? (
          <PotteryForm pottery={pottery} isEditing={true} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Pottery record not found
            </p>
          </div>
        )}
      </main>
      
      <Navigation />
    </div>
  );
};

export default EditPottery;
