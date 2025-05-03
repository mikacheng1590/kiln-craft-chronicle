
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PotteryRecord } from '@/types';
import PotteryCard from '@/components/PotteryCard';
import SearchBar from '@/components/SearchBar';
import Navigation from '@/components/Navigation';

const Search = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [potteryRecords, setPotteryRecords] = useState<PotteryRecord[]>([]);
  const [searchResults, setSearchResults] = useState<PotteryRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
    
    // Load pottery records from localStorage
    const storedRecords = localStorage.getItem('potteryRecords');
    if (storedRecords) {
      setPotteryRecords(JSON.parse(storedRecords));
    }
  }, [navigate]);
  
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
  
  const handleDelete = (id: string) => {
    setPotteryRecords((prevRecords) => 
      prevRecords.filter((record) => record.id !== id)
    );
    setSearchResults((prevRecords) => 
      prevRecords.filter((record) => record.id !== id)
    );
    
    // Update localStorage
    const storedRecords = JSON.parse(localStorage.getItem('potteryRecords') || '[]');
    const updatedRecords = storedRecords.filter((record: PotteryRecord) => record.id !== id);
    localStorage.setItem('potteryRecords', JSON.stringify(updatedRecords));
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <h1 className="text-2xl font-bold mb-4">Search Pottery</h1>
        <SearchBar onSearch={handleSearch} placeholder="Search titles, descriptions, decorations..." />
      </header>
      
      <main className="flex-1 p-4">
        {hasSearched ? (
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
