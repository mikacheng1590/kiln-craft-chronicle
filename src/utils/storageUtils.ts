
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const uploadMedia = async (file: File, userId: string, fileName: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${fileName}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('pottery-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('Failed to upload media');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('pottery-media')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    toast.error('Failed to upload media');
    return null;
  }
};

// New function to upload multiple media files
export const uploadMultipleMedia = async (files: File[], userId: string, baseFileName: string): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    // Create unique file name by adding an index
    const uniqueFileName = `${baseFileName}-${index}`;
    return uploadMedia(file, userId, uniqueFileName);
  });
  
  try {
    const results = await Promise.all(uploadPromises);
    // Filter out null values (failed uploads)
    return results.filter(url => url !== null) as string[];
  } catch (error) {
    console.error('Error in uploadMultipleMedia:', error);
    return [];
  }
};
