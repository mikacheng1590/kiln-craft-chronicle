
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PotteryRecord, StageType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Weight, Image } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { cn } from '@/lib/utils';

const ViewPottery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pottery, setPottery] = useState<PotteryRecord | null>(null);
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
      const storedRecords = localStorage.getItem('potteryRecords');
      if (storedRecords) {
        const records: PotteryRecord[] = JSON.parse(storedRecords);
        const foundPottery = records.find(record => record.id === id);
        if (foundPottery) {
          setPottery(foundPottery);
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [id, navigate]);
  
  if (!isAuthenticated || !pottery) {
    return null;
  }

  const { title, stages, createdAt, updatedAt } = pottery;
  const createdDate = new Date(createdAt).toLocaleDateString();
  const updatedDate = new Date(updatedAt).toLocaleDateString();

  const stageLabels: Record<StageType, string> = {
    greenware: 'Greenware',
    bisque: 'Bisque',
    final: 'Final Product',
  };

  const stageClasses: Record<StageType, string> = {
    greenware: 'stage-greenware',
    bisque: 'stage-bisque',
    final: 'stage-final',
  };

  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold truncate">{title}</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/edit/${id}`)}
          >
            Edit
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>Created: {createdDate}</span>
          {createdAt !== updatedAt && (
            <>
              <span>•</span>
              <span>Updated: {updatedDate}</span>
            </>
          )}
        </div>
      </header>
      
      <main className="flex-1 p-4">
        <Tabs defaultValue="greenware" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="greenware">Greenware</TabsTrigger>
            <TabsTrigger value="bisque">Bisque</TabsTrigger>
            <TabsTrigger value="final">Final</TabsTrigger>
          </TabsList>
          
          {(Object.keys(stages) as StageType[]).map((stageType) => {
            const stageData = stages[stageType];
            const hasData = Object.values(stageData || {}).some(Boolean);
            
            return (
              <TabsContent key={stageType} value={stageType} className="mt-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className={cn("stage-badge", stageClasses[stageType])}>
                        {stageLabels[stageType]}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hasData ? (
                      <>
                        {stageData.media && (
                          <div className="rounded-md overflow-hidden border mb-4">
                            <img 
                              src={stageData.media} 
                              alt={`${title} - ${stageLabels[stageType]}`} 
                              className="max-h-80 w-auto mx-auto"
                            />
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          {stageData.weight && (
                            <div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Weight size={16} /> Weight
                              </p>
                              <p>{stageData.weight}g</p>
                            </div>
                          )}
                          
                          {stageData.dimension && (
                            <div>
                              <p className="text-sm text-muted-foreground">Dimensions</p>
                              <p>{stageData.dimension}</p>
                            </div>
                          )}
                        </div>
                        
                        {stageData.description && (
                          <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="whitespace-pre-wrap">{stageData.description}</p>
                          </div>
                        )}
                        
                        {stageData.decoration && (
                          <div>
                            <p className="text-sm text-muted-foreground">Decoration</p>
                            <p>{stageData.decoration}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-muted-foreground">
                          No data for {stageLabels[stageType]} stage yet
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => navigate(`/edit/${id}`)}
                        >
                          Add {stageLabels[stageType]} Details
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
      
      <Navigation />
    </div>
  );
};

export default ViewPottery;
