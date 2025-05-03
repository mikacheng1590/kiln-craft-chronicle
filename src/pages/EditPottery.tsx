
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PotteryRecord } from '@/types';
import PotteryForm from '@/components/PotteryForm';
import Navigation from '@/components/Navigation';
import { toast } from 'sonner';

const EditPottery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pottery, setPottery] = useState<PotteryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
    
    // Load pottery record
    if (id) {
      try {
        const storedRecords = localStorage.getItem('potteryRecords');
        if (storedRecords) {
          const records: PotteryRecord[] = JSON.parse(storedRecords);
          const foundPottery = records.find(record => record.id === id);
          if (foundPottery) {
            setPottery(foundPottery);
          } else {
            toast.error('Pottery record not found');
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load pottery record');
      } finally {
        setIsLoading(false);
      }
    }
  }, [id, navigate]);
  
  if (!isAuthenticated) {
    return null; // Will redirect to login in useEffect
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-4 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <h1 className="text-2xl font-bold">Edit Pottery Record</h1>
      </header>
      
      <main className="flex-1 p-4">
        {pottery ? (
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
