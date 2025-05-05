
import { useState, useEffect } from 'react';
import { StageData, StageType, PotteryMedia } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Weight, Image, X, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { fetchPotteryMedia, deleteMedia } from '@/utils/storageUtils';

interface StageFormProps {
  type: StageType;
  stageData: StageData;
  onChange: (type: StageType, data: StageData) => void;
  potteryId?: string; // Add pottery ID for editing existing records
}

const StageForm = ({ type, stageData, onChange, potteryId }: StageFormProps) => {
  const [data, setData] = useState<StageData>({
    weight: stageData?.weight,
    media: stageData?.media || [],
    dimension: stageData?.dimension,
    description: stageData?.description,
    decoration: stageData?.decoration
  });
  
  // Keep track of files selected by the user for preview
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [existingMedia, setExistingMedia] = useState<PotteryMedia[]>([]);
  
  // Fetch existing media when editing a pottery record
  useEffect(() => {
    const loadExistingMedia = async () => {
      if (potteryId) {
        console.log(`Fetching media for pottery ID: ${potteryId}, stage: ${type}`);
        const media = await fetchPotteryMedia(potteryId, type);
        console.log(`Fetched media:`, media);
        
        setExistingMedia(media);
        
        if (media.length > 0) {
          // Update local state with fetched media URLs
          const mediaUrls = media.map(m => m.media_url);
          
          setData(prev => ({
            ...prev,
            media: mediaUrls
          }));
          
          // Update parent component
          onChange(type, {
            ...data,
            media: mediaUrls
          });
        }
      }
    };
    
    loadExistingMedia();
  }, [potteryId, type]);
  
  const handleChange = (field: keyof StageData, value: string | number | File | File[]) => {
    const updatedData = { ...data };
    
    // Handle File objects separately
    if (field === 'media') {
      if (Array.isArray(value)) {
        // Handle multiple files
        const newMediaFiles = [...mediaFiles, ...value];
        setMediaFiles(newMediaFiles);
        
        // Create temporary URLs for preview
        const mediaPreviews = newMediaFiles.map(file => URL.createObjectURL(file));
        
        // If there are existing string URLs, keep them
        const existingUrls = Array.isArray(data.media) 
          ? data.media.filter(item => typeof item === 'string')
          : [];
        
        updatedData.media = [...existingUrls, ...newMediaFiles];
      } else if (value instanceof File) {
        // Handle single file
        const newMediaFiles = [...mediaFiles, value];
        setMediaFiles(newMediaFiles);
        
        // Create temporary URLs for preview
        const mediaPreviews = newMediaFiles.map(file => URL.createObjectURL(file));
        
        // If there are existing string URLs, keep them
        const existingUrls = Array.isArray(data.media) 
          ? data.media.filter(item => typeof item === 'string')
          : [];
        
        updatedData.media = [...existingUrls, ...newMediaFiles];
      }
    } else if (field === 'weight' && typeof value === 'number') {
      updatedData.weight = value;
    } else if (typeof value === 'string') {
      // Handle string values based on the field type
      if (field === 'dimension') updatedData.dimension = value;
      if (field === 'description') updatedData.description = value;
      if (field === 'decoration') updatedData.decoration = value;
    }
    
    setData(updatedData);
    onChange(type, updatedData);
  };

  const removeMedia = async (index: number) => {
    if (!data.media) return;
    
    const updatedMedia = [...data.media];
    const mediaItem = updatedMedia[index];
    
    // If it's an uploaded media URL, delete it from storage and DB
    if (typeof mediaItem === 'string' && potteryId) {
      setIsDeleting({...isDeleting, [mediaItem]: true});
      
      try {
        const success = await deleteMedia(mediaItem, potteryId);
        
        if (!success) {
          toast.error('Failed to delete media file');
          setIsDeleting({...isDeleting, [mediaItem]: false});
          return;
        }
        
        toast.success('Media deleted successfully');
      } catch (error) {
        console.error('Error deleting media:', error);
        toast.error('Failed to delete media file');
        setIsDeleting({...isDeleting, [mediaItem]: false});
        return;
      }
    }
    
    // Remove from local arrays
    updatedMedia.splice(index, 1);
    
    // Also remove from mediaFiles if it's a File object
    const updatedMediaFiles = [...mediaFiles];
    if (index < mediaFiles.length) {
      updatedMediaFiles.splice(index, 1);
      setMediaFiles(updatedMediaFiles);
    }
    
    // Remove from existingMedia if applicable
    if (typeof mediaItem === 'string') {
      setExistingMedia(existingMedia.filter(m => m.media_url !== mediaItem));
    }
    
    setData(prev => ({ ...prev, media: updatedMedia }));
    onChange(type, { ...data, media: updatedMedia });
    
    if (typeof mediaItem === 'string') {
      setIsDeleting({...isDeleting, [mediaItem]: false});
    }
  };

  // Helper function to check if a URL is a video
  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext)) ||
           url.includes('video') || existingMedia.some(m => m.media_url === url && m.media_type === 'video');
  };

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

  // Count current media items
  const currentMediaCount = Array.isArray(data.media) ? data.media.length : 0;
  const canAddMoreMedia = currentMediaCount < 16;

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className={cn("stage-badge", stageClasses[type])}>
            {stageLabels[type]}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
          
        <div className="space-y-2">
          <Label htmlFor={`${type}-dimension`}>Dimensions</Label>
          <Textarea
            id={`${type}-dimension`}
            placeholder="e.g. 10cm x 8cm"
            value={data.dimension || ''}
            onChange={(e) => handleChange('dimension', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-weight`} className="flex items-center gap-1">
            <Weight size={16} /> Weight (lbs)
          </Label>
          <Input
            id={`${type}-weight`}
            type="number"
            placeholder="Weight in lbs"
            value={data.weight || ''}
            onChange={(e) => handleChange('weight', Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-media`} className="flex items-center gap-1">
            <Image size={16} /> Photos or Videos ({currentMediaCount}/16)
          </Label>
          {canAddMoreMedia ? (
            <div className="flex flex-col gap-2">
              <Input
                id={`${type}-media`}
                type="file"
                accept="image/*,video/*"
                className="cursor-pointer"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    // Convert FileList to array and limit to remaining slots
                    const remainingSlots = 16 - currentMediaCount;
                    const filesToAdd = Array.from(e.target.files).slice(0, remainingSlots);
                    
                    if (currentMediaCount + filesToAdd.length > 16) {
                      toast.warning(`You can only upload up to 16 media files per stage. Only the first ${remainingSlots} files will be added.`);
                    }
                    
                    handleChange('media', filesToAdd);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                You can upload up to 16 photos or videos per stage
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Maximum of 16 media files reached</p>
          )}
          
          {data.media && Array.isArray(data.media) && data.media.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {data.media.map((item, index) => (
                <div key={index} className="relative border rounded-md overflow-hidden group">
                  {typeof item === 'string' ? (
                    <div className="relative">
                      {isVideoUrl(item) ? (
                        <video 
                          src={item} 
                          className="w-full h-32 object-cover"
                          controls
                        />
                      ) : (
                        <img src={item} alt={`Media ${index + 1}`} className="w-full h-32 object-cover" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeMedia(index)}
                          disabled={isDeleting[item]}
                        >
                          {isDeleting[item] ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Trash size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : item instanceof File && item.type.startsWith('image/') ? (
                    <div className="relative">
                      <img 
                        src={URL.createObjectURL(item)} 
                        alt={`Media ${index + 1}`} 
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeMedia(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  ) : item instanceof File && item.type.startsWith('video/') ? (
                    <div className="relative">
                      <video 
                        src={URL.createObjectURL(item)} 
                        className="w-full h-32 object-cover"
                        controls
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeMedia(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-muted flex items-center justify-center text-sm">
                      {item instanceof File ? item.name : 'File'}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMedia(index)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-description`}>Description</Label>
          <Textarea
            id={`${type}-description`}
            placeholder="Describe this stage / any notes..."
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-decoration`}>Decoration</Label>
          <Textarea
            id={`${type}-decoration`}
            placeholder={type === 'greenware' ? "Underglaze, handle, slip, etc." : type === 'bisque' ? "Glazes, underglaze, etc." : "Decoration, etc."}
            value={data.decoration || ''}
            onChange={(e) => handleChange('decoration', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StageForm;
