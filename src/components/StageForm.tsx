
import { useState } from 'react';
import { StageData, StageType } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Weight, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageFormProps {
  type: StageType;
  stageData: StageData;
  onChange: (type: StageType, data: StageData) => void;
}

const StageForm = ({ type, stageData, onChange }: StageFormProps) => {
  const [data, setData] = useState<StageData>(stageData || {});
  
  const handleChange = (field: keyof StageData, value: string | number | File) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    onChange(type, updatedData);
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
            <Image size={16} /> Photo or Video
          </Label>
          <Input
            id={`${type}-media`}
            type="file"
            accept="image/*,video/*"
            className="cursor-pointer"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleChange('media', e.target.files[0]);
              }
            }}
          />
          {data.media && (
            <div className="mt-2 rounded-md overflow-hidden border">
              {typeof data.media === 'string' ? (
                <img src={data.media} alt="Stage media" className="max-h-40 w-auto mx-auto" />
              ) : (
                <div className="bg-muted p-2 text-sm">File selected: {(data.media as File).name}</div>
              )}
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
