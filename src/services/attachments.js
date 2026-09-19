import { supabase, isSupabaseConfigured } from './supabase';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Validates a file before upload.
 */
export function validateAttachment(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds maximum size of 10MB (${Math.round(file.size / 1024 / 1024 * 10) / 10}MB).`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png|gif|webp|svg|txt|md|docx?|zip)$/i)) {
    return {
      valid: false,
      error: 'File format not supported. Allowed formats: Images, PDFs, text, Word docs, and archives.',
    };
  }

  return { valid: true };
}

/**
 * Uploads an attachment to Supabase Storage, or converts to base64 data URL if offline/guest.
 */
export async function uploadTaskAttachment(file, taskId, userId = null) {
  const validation = validateAttachment(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileId = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId || 'guest'}/${taskId}/${fileId}_${safeName}`;

  // If Supabase is connected and user is logged in, attempt cloud upload
  if (isSupabaseConfigured && userId && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .upload(path, file, { cacheControl: '3600', upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(path);

        return {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          storagePath: path,
          url: publicUrlData?.publicUrl || '',
          createdAt: Date.now(),
        };
      }
    } catch (err) {
      console.warn('Toki: Supabase storage upload failed, falling back to local storage:', err);
    }
  }

  // Fallback: convert file to local data URL for offline/guest persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        storagePath: 'local',
        url: reader.result,
        createdAt: Date.now(),
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file locally.'));
    reader.readAsDataURL(file);
  });
}
