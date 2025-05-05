
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { StageType, PotteryMedia } from "@/types";

export const uploadMedia = async (file: File, potteryId: string, stageType: StageType, index: number): Promise<string | null> => {
  try {
    // First verify if the user owns this pottery record
    const { data: potteryData, error: potteryError } = await supabase
      .from('pottery_records')
      .select('id, user_id')
      .eq('id', potteryId)
      .single();
    
    if (potteryError || !potteryData) {
      console.error('Error verifying pottery ownership:', potteryError);
      toast.error('Failed to verify pottery ownership');
      return null;
    }
    
    const fileExt = file.name.split('.').pop();
    const uniqueId = uuidv4().split('-')[0];
    // Store at root level with pottery ID and stage type in filename
    const filePath = `${potteryId}-${stageType}-${uniqueId}.${fileExt}`;

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

    // Insert record into pottery_media table
    const { error: dbError } = await supabase
      .from('pottery_media')
      .insert({
        pottery_id: potteryId,
        stage_type: stageType,
        media_url: publicUrl,
        media_type: file.type.startsWith('image/') ? 'image' : 'video',
        sort_order: index
      });

    if (dbError) {
      console.error('Error saving media record:', dbError);
      toast.error('Failed to save media record: ' + dbError.message);
      return null;
    }

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    toast.error('Failed to upload media');
    return null;
  }
};

// Upload multiple media files
export const uploadMultipleMedia = async (files: File[], potteryId: string, stageType: StageType): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    return uploadMedia(file, potteryId, stageType, index);
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

// Fetch media for a pottery record by stage
export const fetchPotteryMedia = async (potteryId: string, stageType?: StageType): Promise<PotteryMedia[]> => {
  try {
    let query = supabase
      .from('pottery_media')
      .select('*')
      .eq('pottery_id', potteryId)
      .order('sort_order', { ascending: true });
    
    if (stageType) {
      query = query.eq('stage_type', stageType);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching media:', error);
      return [];
    }
    
    return data as PotteryMedia[];
  } catch (error) {
    console.error('Error in fetchPotteryMedia:', error);
    return [];
  }
};

// Delete media
export const deleteMedia = async (mediaUrl: string, potteryId: string): Promise<boolean> => {
  try {
    // Extract file path from the URL
    const urlParts = mediaUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('pottery-media')
      .remove([filename]);
    
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      return false;
    }
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('pottery_media')
      .delete()
      .eq('media_url', mediaUrl);
    
    if (dbError) {
      console.error('Error deleting media record:', dbError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteMedia:', error);
    return false;
  }
};
