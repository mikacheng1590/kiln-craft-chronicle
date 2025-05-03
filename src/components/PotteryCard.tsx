
import { useNavigate } from 'react-router-dom';
import { PotteryRecord } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PotteryCardProps {
  pottery: PotteryRecord;
  onDelete: (id: string) => void;
}

const PotteryCard = ({ pottery, onDelete }: PotteryCardProps) => {
  const navigate = useNavigate();
  const { id, title, stages, createdAt } = pottery;
  
  // Get the most complete stage (the one with the most filled fields)
  const getCompletedStages = () => {
    const stageCompletion = Object.entries(stages).map(([stageType, data]) => {
      const completionCount = Object.values(data || {}).filter(Boolean).length;
      return { type: stageType, count: completionCount };
    });
    return stageCompletion.filter(stage => stage.count > 0).map(stage => stage.type);
  };
  
  const completedStages = getCompletedStages();
  
  // Get the featured image (first available image from final, then bisque, then greenware)
  const getFeaturedImage = (): string | null => {
    // Try to get the first image from the final stage
    if (Array.isArray(stages.final?.media) && stages.final.media.length > 0) {
      const firstMedia = stages.final.media[0];
      if (typeof firstMedia === 'string') return firstMedia;
    }
    
    // Then try bisque stage
    if (Array.isArray(stages.bisque?.media) && stages.bisque.media.length > 0) {
      const firstMedia = stages.bisque.media[0];
      if (typeof firstMedia === 'string') return firstMedia;
    }
    
    // Then try greenware stage
    if (Array.isArray(stages.greenware?.media) && stages.greenware.media.length > 0) {
      const firstMedia = stages.greenware.media[0];
      if (typeof firstMedia === 'string') return firstMedia;
    }
    
    return null;
  };
  
  const featuredImage = getFeaturedImage();
  const createdDate = new Date(createdAt).toLocaleDateString();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this pottery record?')) {
      onDelete(id);
    }
  };

  return (
    <Card 
      className="pottery-card h-full flex flex-col cursor-pointer"
      onClick={() => navigate(`/pottery/${id}`)}
    >
      {featuredImage && (
        <div className="aspect-square w-full overflow-hidden">
          <img 
            src={featuredImage} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{createdDate}</p>
      </CardHeader>
      
      <CardContent className="flex flex-wrap gap-2 mb-auto">
        {completedStages.map((stageType) => (
          <Badge 
            key={stageType} 
            variant="outline" 
            className={cn(
              "stage-badge",
              stageType === 'greenware' && "stage-greenware",
              stageType === 'bisque' && "stage-bisque",
              stageType === 'final' && "stage-final",
            )}
          >
            {stageType === 'greenware' && 'Greenware'}
            {stageType === 'bisque' && 'Bisque'}
            {stageType === 'final' && 'Final Product'}
          </Badge>
        ))}
        {completedStages.length === 0 && (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            No stages completed
          </Badge>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 border-t">
        <div className="flex justify-between w-full" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit/${id}`);
            }}
          >
            <Edit size={16} className="mr-1" /> Edit
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            <Trash2 size={16} className="mr-1" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PotteryCard;
