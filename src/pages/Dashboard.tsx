
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PotteryRecord } from '@/types';
import { mockPotteryRecords } from '@/utils/mockData';
import PotteryCard from '@/components/PotteryCard';
import SearchBar from '@/components/SearchBar';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [potteryRecords, setPotteryRecords] = useState<PotteryRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PotteryRecord[]>([]);
  
  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
    
    // Load pottery records from localStorage or use mock data if none exist
    const storedRecords = localStorage.getItem('potteryRecords');
    if (storedRecords) {
      setPotteryRecords(JSON.parse(storedRecords));
      setFilteredRecords(JSON.parse(storedRecords));
    } else {
      // Initialize with mock data for demo purposes
      localStorage.setItem('potteryRecords', JSON.stringify(mockPotteryRecords));
      setPotteryRecords(mockPotteryRecords);
      setFilteredRecords(mockPotteryRecords);
    }
  }, [navigate]);
  
  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredRecords(potteryRecords);
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
    
    setFilteredRecords(results);
  };
  
  const handleDelete = (id: string) => {
    setPotteryRecords((prevRecords) => 
      prevRecords.filter((record) => record.id !== id)
    );
    setFilteredRecords((prevRecords) => 
      prevRecords.filter((record) => record.id !== id)
    );
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <h1 className="text-2xl font-bold mb-4">My Pottery Chronicle</h1>
        <SearchBar onSearch={handleSearch} />
      </header>
      
      <main className="flex-1 p-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-4">No pottery records found</h2>
            <p className="text-muted-foreground mb-6">
              Start documenting your pottery journey by creating your first record.
            </p>
            <Button 
              onClick={() => navigate('/create')} 
              className="flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Create New Record
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((record) => (
              <PotteryCard 
                key={record.id} 
                pottery={record} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
      
      <Navigation />
    </div>
  );
};

export default Dashboard;
