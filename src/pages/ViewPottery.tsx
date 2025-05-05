import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PotteryRecord, StageType, PotteryMedia } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Weight, Image } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { fetchPotteryMedia } from '@/utils/storageUtils';

const ViewPottery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pottery, setPottery] = useState<PotteryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaByStage, setMediaByStage] = useState<Record<StageType, PotteryMedia[]>>({
    greenware: [],
    bisque: [],
    final: []
  });
  
  useEffect(() => {
    const fetchPottery = async () => {
      if (!id || !user) return;
      
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
            dimension: stage.dimension,
            description: stage.description,
            decoration: stage.decoration
          };
        });
        
        // Fetch media from the pottery_media table
        const allMedia = await fetchPotteryMedia(id);
        console.log('Fetched media for view:', allMedia);
        
        // Organize media by stage type
        const mediaMap = {
          greenware: allMedia.filter(m => m.stage_type === 'greenware'),
          bisque: allMedia.filter(m => m.stage_type === 'bisque'),
          final: allMedia.filter(m => m.stage_type === 'final')
        };
        
        setMediaByStage(mediaMap);
        
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
  }, [id, navigate, user]);

  if (isLoading) {
    return null;
  }

  if (!pottery) {
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

  // Helper function to check if a URL is likely to be a video
  const isVideoUrl = (url: string): boolean => {
    // Check by extension
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    const isVideoExt = videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
    
    // Check by media type in our mediaByStage data
    const stageTypes: StageType[] = ['greenware', 'bisque', 'final'];
    let isVideoType = false;
    
    for (const stageType of stageTypes) {
      const mediaItem = mediaByStage[stageType].find(m => m.media_url === url);
      if (mediaItem && mediaItem.media_type === 'video') {
        isVideoType = true;
        break;
      }
    }
    
    // Check by URL content
    const containsVideoHint = url.includes('video');
    
    return isVideoExt || isVideoType || containsVideoHint;
  };

  // Helper function to get media URLs array for a stage
  const getMediaUrls = (stageType: StageType): string[] => {
    // Get from the pottery_media table
    if (mediaByStage[stageType].length > 0) {
      return mediaByStage[stageType].map(m => m.media_url);
    }
    
    return [];
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
            const mediaUrls = getMediaUrls(stageType);
            
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
                        {mediaUrls.length > 0 && (
                          <div className="rounded-md overflow-hidden mb-4">
                            <Carousel className="w-full">
                              <CarouselContent>
                                {mediaUrls.map((url, idx) => (
                                  <CarouselItem key={idx}>
                                    <div className="p-1">
                                      {isVideoUrl(url) ? (
                                        <video 
                                          src={url} 
                                          controls 
                                          className="rounded-md max-h-80 w-auto mx-auto object-contain"
                                        />
                                      ) : (
                                        <img 
                                          src={url} 
                                          alt={`${title} - ${stageLabels[stageType]} (${idx + 1}/${mediaUrls.length})`}
                                          className="rounded-md max-h-80 w-auto mx-auto object-contain"
                                        />
                                      )}
                                    </div>
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              {mediaUrls.length > 1 && (
                                <>
                                  <CarouselPrevious />
                                  <CarouselNext />
                                </>
                              )}
                            </Carousel>
                            <div className="text-center text-sm text-muted-foreground mt-1">
                              {mediaUrls.length} {mediaUrls.length === 1 ? 'media file' : 'media files'}
                            </div>
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
