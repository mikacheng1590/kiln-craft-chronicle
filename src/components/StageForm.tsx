
import { useState } from 'react';
import { StageData, StageType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Weight, Image, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface StageFormProps {
  type: StageType;
  stageData: StageData;
  onChange: (type: StageType, data: StageData) => void;
}

const StageForm = ({ type, stageData, onChange }: StageFormProps) => {
  const [data, setData] = useState<StageData>({
    weight: stageData?.weight,
    media: stageData?.media || [],
    dimension: stageData?.dimension,
    description: stageData?.description,
    decoration: stageData?.decoration
  });
  
  // Keep track of files selected by the user for preview
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  
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

  const removeMedia = (index: number) => {
    if (!data.media) return;
    
    const updatedMedia = [...data.media];
    updatedMedia.splice(index, 1);
    
    // Also remove from mediaFiles if it's a File object
    const updatedMediaFiles = [...mediaFiles];
    if (index < mediaFiles.length) {
      updatedMediaFiles.splice(index, 1);
      setMediaFiles(updatedMediaFiles);
    }
    
    setData(prev => ({ ...prev, media: updatedMedia }));
    onChange(type, { ...data, media: updatedMedia });
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${type}-weight`} className="flex items-center gap-1">
              <Weight size={16} /> Weight (g)
            </Label>
            <Input
              id={`${type}-weight`}
              type="number"
              placeholder="Weight in grams"
              value={data.weight || ''}
              onChange={(e) => handleChange('weight', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${type}-dimension`}>Dimensions</Label>
            <Input
              id={`${type}-dimension`}
              placeholder="e.g. 10cm x 8cm"
              value={data.dimension || ''}
              onChange={(e) => handleChange('dimension', e.target.value)}
            />
          </div>
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
                    <img src={item} alt={`Media ${index + 1}`} className="w-full h-32 object-cover" />
                  ) : item instanceof File && item.type.startsWith('image/') ? (
                    <img 
                      src={URL.createObjectURL(item)} 
                      alt={`Media ${index + 1}`} 
                      className="w-full h-32 object-cover"
                    />
                  ) : item instanceof File && item.type.startsWith('video/') ? (
                    <video 
                      src={URL.createObjectURL(item)} 
                      className="w-full h-32 object-cover"
                      controls={false}
                    />
                  ) : (
                    <div className="w-full h-32 bg-muted flex items-center justify-center text-sm">
                      {item instanceof File ? item.name : 'File'}
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMedia(index)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-description`}>Description</Label>
          <Textarea
            id={`${type}-description`}
            placeholder="Describe this stage..."
            value={data.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-decoration`}>Decoration</Label>
          <Input
            id={`${type}-decoration`}
            placeholder={type === 'greenware' ? "underglaze, handle, slip, etc." : "glazes, underglaze, etc."}
            value={data.decoration || ''}
            onChange={(e) => handleChange('decoration', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StageForm;
