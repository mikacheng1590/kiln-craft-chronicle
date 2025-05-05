
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PotteryRecord, StageType } from '@/types';
import PotteryCard from '@/components/PotteryCard';
import SearchBar from '@/components/SearchBar';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Search = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [potteryRecords, setPotteryRecords] = useState<PotteryRecord[]>([]);
  const [searchResults, setSearchResults] = useState<PotteryRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPotteryRecords = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch pottery records
        const { data: records, error } = await supabase
          .from('pottery_records')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // For each record, fetch its stages
        const recordsWithStages = await Promise.all(
          records.map(async (record) => {
            const { data: stagesData, error: stagesError } = await supabase
              .from('pottery_stages')
              .select('*')
              .eq('pottery_id', record.id);
            
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
                dimension: stage.dimension,
                description: stage.description,
                decoration: stage.decoration
              };
            });
            
            return {
              id: record.id,
              title: record.title,
              createdAt: record.created_at,
              updatedAt: record.updated_at,
              userId: record.user_id,
              stages: formattedStages
            };
          })
        );
        
        setPotteryRecords(recordsWithStages);
      } catch (error) {
        console.error('Error fetching pottery records:', error);
        toast.error('Failed to load pottery records');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPotteryRecords();
  }, [user]);
  
  const handleSearch = (searchTerm: string) => {
    setHasSearched(true);
    
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    const results = potteryRecords.filter((record) => {
      // Search in title
      if (record.title.toLowerCase().includes(lowerCaseSearch)) return true;
      
      // Search in stages descriptions and decorations
      const stageValues = Object.values(record.stages).flatMap((stage) => [
        stage.description,
        stage.decoration,
        stage.dimension,
      ]);
      
      return stageValues.some(
        (value) => value && value.toLowerCase().includes(lowerCaseSearch)
      );
    });
    
    setSearchResults(results);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pottery_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPotteryRecords((prev) => prev.filter((record) => record.id !== id));
      setSearchResults((prev) => prev.filter((record) => record.id !== id));
      toast.success('Pottery record deleted successfully');
    } catch (error) {
      console.error('Error deleting pottery record:', error);
      toast.error('Failed to delete pottery record');
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <h1 className="text-2xl font-bold mb-4">Search Pottery</h1>
        <SearchBar onSearch={handleSearch} placeholder="Search titles, descriptions, decorations..." />
      </header>
      
      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading your pottery records...</p>
          </div>
        ) : hasSearched ? (
          searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((record) => (
                <PotteryCard 
                  key={record.id} 
                  pottery={record} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">No results found</h2>
              <p className="text-muted-foreground">
                Try different search terms or check your spelling
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2">Search for pottery</h2>
            <p className="text-muted-foreground">
              Enter keywords to find your pottery records
            </p>
          </div>
        )}
      </main>
      
      <Navigation />
    </div>
  );
};

export default Search;
